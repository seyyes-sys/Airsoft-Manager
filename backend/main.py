from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
import os
import shutil
from pathlib import Path

from database import engine, Base, get_db
from models import User, Game, Registration, Attendance, SiteSettings, Rules, PaymentType, PartnerAssociation, PricingSettings, NFCTag, RuleVersion, MembershipApplication
from schemas import (
    RegistrationCreate, RegistrationUpdate, RegistrationResponse,
    GameCreate, GameResponse,
    LoginRequest, TokenResponse, ChangePasswordRequest,
    AttendanceUpdate, StatisticsResponse, GameStatistics,
    SiteSettingsUpdate, SiteSettingsResponse,
    RulesUpdate, RulesResponse,
    PaymentTypeCreate, PaymentTypeUpdate, PaymentTypeResponse, SetPaymentTypeRequest,
    PartnerAssociationCreate, PartnerAssociationUpdate, PartnerAssociationResponse,
    PricingSettingsUpdate, PricingSettingsResponse,
    NFCTagCreate, NFCTagUpdate, NFCTagResponse, AssignTagRequest,
    RuleVersionCreate, RuleVersionResponse,
    MembershipApplicationCreate, MembershipApplicationResponse, MembershipApplicationStatusUpdate
)
from auth import create_access_token, verify_token, verify_password, hash_password
from email_service import send_confirmation_email, send_reminder_email
from scheduler import start_scheduler, stop_scheduler

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airsoft Manager API")

# Créer le dossier pour stocker les logos
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
LOGO_PATH = UPLOAD_DIR / "logo.png"

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Admin credentials depuis les variables d'environnement
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


@app.on_event("startup")
async def startup_event():
    """Événements au démarrage de l'application"""
    print("=" * 60)
    print("🚀 DÉMARRAGE DE L'APPLICATION")
    print("=" * 60)
    start_scheduler()
    print("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Événements à l'arrêt de l'application"""
    print("🛑 ARRÊT DE L'APPLICATION")
    stop_scheduler()


def get_or_create_admin(db: Session):
    """Récupère ou crée l'utilisateur admin"""
    admin = db.query(User).filter(User.username == ADMIN_USERNAME).first()
    if not admin:
        admin = User(
            username=ADMIN_USERNAME,
            hashed_password=hash_password(ADMIN_PASSWORD),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    return admin


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Vérifie que l'utilisateur est un administrateur"""
    token = credentials.credentials
    username = verify_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non autorisé"
        )
    
    user = db.query(User).filter(User.username == username, User.is_admin == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non autorisé"
        )
    return user


def calculate_registration_price(registration: Registration, db: Session) -> int:
    """
    Calcule le prix d'une inscription selon les règles :
    - Invité (attendance_type = 'invited') : 0€
    - Association partenaire : tarif association partenaire (défaut 5€)
    - Autre association : tarif autre association (défaut 7€)
    - Freelance (pas d'association) : tarif freelance (défaut 9€)
    """
    # Si c'est un invité, le prix est de 0€
    if registration.attendance_type == 'invited':
        return 0
    
    # Récupérer les paramètres de tarification
    pricing_settings = db.query(PricingSettings).first()
    if not pricing_settings:
        # Créer avec valeurs par défaut si n'existe pas
        pricing_settings = PricingSettings()
        db.add(pricing_settings)
        db.commit()
    
    # Si pas d'association, c'est un freelance
    if not registration.has_association or not registration.association_name:
        return pricing_settings.freelance_price
    
    # Vérifier si l'association est partenaire (comparaison insensible à la casse)
    partner = db.query(PartnerAssociation).filter(
        func.lower(PartnerAssociation.name) == func.lower(registration.association_name),
        PartnerAssociation.is_active == True
    ).first()
    
    if partner:
        return pricing_settings.partner_association_price
    else:
        return pricing_settings.other_association_price


@app.get("/")
async def root():
    return {"message": "Airsoft Manager API"}


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authentification administrateur"""
    # S'assurer que l'admin existe
    admin = get_or_create_admin(db)
    
    # Vérifier le nom d'utilisateur
    if login_data.username != admin.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects"
        )
    
    # Vérifier le mot de passe
    if not verify_password(login_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects"
        )
    
    access_token = create_access_token(data={"sub": login_data.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/registrations", response_model=RegistrationResponse)
async def create_registration(
    registration: RegistrationCreate,
    db: Session = Depends(get_db)
):
    """Créer une nouvelle inscription"""
    # Vérifier qu'il existe une partie active ET non clôturée
    active_game = db.query(Game).filter(
        Game.date >= datetime.now().date(),
        Game.is_active == True,
        Game.is_closed == False
    ).order_by(Game.date).first()
    
    if not active_game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucune partie active disponible pour inscription"
        )
    
    # Créer l'inscription
    new_registration = Registration(
        game_id=active_game.id,
        first_name=registration.first_name,
        last_name=registration.last_name,
        nickname=registration.nickname,
        email=registration.email,
        phone=registration.phone,
        attendance_type=registration.attendance_type,
        has_association=registration.has_association,
        association_name=registration.association_name,
        bb_weight_pistol=registration.bb_weight_pistol,
        bb_weight_rifle=registration.bb_weight_rifle,
        has_second_rifle=registration.has_second_rifle,
        bb_weight_rifle_2=registration.bb_weight_rifle_2,
        confirmed=False
    )
    
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    
    # Envoyer l'email de confirmation
    try:
        await send_confirmation_email(
            email=registration.email,
            first_name=registration.first_name,
            game_date=active_game.date,
            registration_id=new_registration.id
        )
    except Exception as e:
        print(f"Erreur envoi email: {e}")
    
    return new_registration


@app.post("/api/registrations/{registration_id}/confirm")
async def confirm_registration(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """Confirmer une inscription"""
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée"
        )
    
    registration.confirmed = True
    db.commit()
    
    return {"message": "Inscription confirmée avec succès"}


@app.get("/api/games", response_model=List[GameResponse])
async def get_games(
    skip: int = 0,
    limit: int = 100,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer la liste des parties (admin)"""
    games = db.query(Game).order_by(Game.date.desc()).offset(skip).limit(limit).all()
    return games


@app.post("/api/games", response_model=GameResponse)
async def create_game(
    game: GameCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Créer une nouvelle partie (admin)"""
    new_game = Game(
        date=game.date,
        name=game.name,
        description=game.description,
        is_active=game.is_active
    )
    
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    
    return new_game


@app.get("/api/games/active", response_model=Optional[GameResponse])
async def get_active_game(db: Session = Depends(get_db)):
    """Récupérer la partie active actuelle (inscriptions ouvertes, date >= aujourd'hui)"""
    game = db.query(Game).filter(
        Game.date >= datetime.now().date(),
        Game.is_active == True,
        Game.is_closed == False
    ).order_by(Game.date).first()
    
    return game


@app.patch("/api/games/{game_id}/toggle-close")
async def toggle_game_close(
    game_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Clôturer ou rouvrir les inscriptions d'une partie (admin)"""
    game = db.query(Game).filter(Game.id == game_id).first()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partie non trouvée"
        )
    
    # Basculer l'état de clôture
    game.is_closed = not game.is_closed
    db.commit()
    db.refresh(game)
    
    status_text = "clôturée" if game.is_closed else "rouverte"
    return {
        "message": f"Inscriptions {status_text} pour la partie '{game.name}'",
        "is_closed": game.is_closed
    }


@app.get("/api/games/{game_id}/registrations", response_model=List[RegistrationResponse])
async def get_game_registrations(
    game_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer les inscriptions d'une partie (admin)"""
    registrations = db.query(Registration).filter(
        Registration.game_id == game_id
    ).all()
    
    # Calculer le prix pour chaque inscription
    result = []
    for reg in registrations:
        # Récupérer le numéro du tag si attribué
        nfc_tag_number = None
        if reg.nfc_tag_id:
            tag = db.query(NFCTag).filter(NFCTag.id == reg.nfc_tag_id).first()
            if tag:
                nfc_tag_number = tag.tag_number
        
        reg_dict = {
            "id": reg.id,
            "game_id": reg.game_id,
            "first_name": reg.first_name,
            "last_name": reg.last_name,
            "nickname": reg.nickname,
            "email": reg.email,
            "phone": reg.phone,
            "attendance_type": reg.attendance_type,
            "has_association": reg.has_association,
            "association_name": reg.association_name,
            "bb_weight_pistol": reg.bb_weight_pistol,
            "bb_weight_rifle": reg.bb_weight_rifle,
            "has_second_rifle": reg.has_second_rifle,
            "bb_weight_rifle_2": reg.bb_weight_rifle_2,
            "confirmed": reg.confirmed,
            "was_present": reg.was_present,
            "payment_validated": reg.payment_validated,
            "payment_type_id": reg.payment_type_id,
            "calculated_price": calculate_registration_price(reg, db),
            "nfc_tag_id": reg.nfc_tag_id,
            "nfc_tag_number": nfc_tag_number,
            "created_at": reg.created_at
        }
        result.append(reg_dict)
    
    return result


@app.patch("/api/registrations/{registration_id}/attendance")
async def update_attendance(
    registration_id: int,
    attendance: AttendanceUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour la présence d'un joueur (admin)"""
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée"
        )
    
    registration.was_present = attendance.was_present
    db.commit()
    
    return {"message": "Présence mise à jour"}


@app.patch("/api/registrations/{registration_id}/payment")
async def update_payment(
    registration_id: int,
    payment_data: dict,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour le statut de paiement (admin)"""
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée"
        )
    
    registration.payment_validated = payment_data.get("payment_validated", False)
    db.commit()
    
    return {"message": "Statut de paiement mis à jour"}


@app.put("/api/registrations/{registration_id}", response_model=RegistrationResponse)
async def update_registration(
    registration_id: int,
    registration_data: RegistrationUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour une inscription (admin)"""
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée"
        )
    
    # Mettre à jour uniquement les champs fournis
    update_data = registration_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(registration, field, value)
    
    db.commit()
    db.refresh(registration)
    
    return registration


@app.delete("/api/registrations/{registration_id}")
async def delete_registration(
    registration_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Supprimer une inscription (admin)"""
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscription non trouvée"
        )
    
    db.delete(registration)
    db.commit()
    
    return {"message": "Inscription supprimée avec succès"}


@app.get("/api/statistics", response_model=StatisticsResponse)
async def get_statistics(
    last_games: int = 10,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques (admin)"""
    # Récupérer les dernières parties
    games = db.query(Game).order_by(Game.date.desc()).limit(last_games).all()
    
    total_registrations = 0
    total_confirmed = 0
    total_present = 0
    total_morning_only = 0
    total_full_day = 0
    total_revenue = 0  # Revenu calculé
    associations = {}
    
    for game in games:
        registrations = db.query(Registration).filter(
            Registration.game_id == game.id
        ).all()
        
        total_registrations += len(registrations)
        total_confirmed += sum(1 for r in registrations if r.confirmed)
        total_present += sum(1 for r in registrations if r.was_present)
        
        # Calculer le revenu en fonction des types de paiement et des prix calculés
        for r in registrations:
            if r.payment_type_id:
                payment_type = db.query(PaymentType).filter(PaymentType.id == r.payment_type_id).first()
                if payment_type and payment_type.generates_cost:
                    # Utiliser le prix calculé pour chaque inscription
                    total_revenue += calculate_registration_price(r, db)
        
        total_morning_only += sum(1 for r in registrations if r.attendance_type == "morning")
        total_full_day += sum(1 for r in registrations if r.attendance_type == "full_day")
        
        for reg in registrations:
            if reg.has_association and reg.association_name:
                associations[reg.association_name] = associations.get(reg.association_name, 0) + 1
    
    return {
        "total_games": len(games),
        "total_registrations": total_registrations,
        "total_confirmed": total_confirmed,
        "total_present": total_present,
        "total_revenue": float(total_revenue),
        "average_per_game": total_registrations / len(games) if games else 0,
        "morning_only": total_morning_only,
        "full_day": total_full_day,
        "top_associations": dict(sorted(associations.items(), key=lambda x: x[1], reverse=True)[:5])
    }


@app.get("/api/statistics/by-game", response_model=List[GameStatistics])
async def get_statistics_by_game(
    limit: int = 10,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques par partie (admin)"""
    games = db.query(Game).order_by(Game.date.desc()).limit(limit).all()
    
    stats = []
    for game in games:
        registrations = db.query(Registration).filter(
            Registration.game_id == game.id
        ).all()
        
        associations = {}
        payments_validated = 0
        revenue = 0
        
        for reg in registrations:
            if reg.has_association and reg.association_name:
                associations[reg.association_name] = associations.get(reg.association_name, 0) + 1
            
            # Calculer le revenu en fonction des types de paiement et des prix calculés
            if reg.payment_type_id:
                payment_type = db.query(PaymentType).filter(PaymentType.id == reg.payment_type_id).first()
                if payment_type and payment_type.generates_cost:
                    payments_validated += 1
                    # Utiliser le prix calculé pour chaque inscription
                    revenue += calculate_registration_price(reg, db)
        
        stats.append({
            "game_id": game.id,
            "game_name": game.name,
            "game_date": game.date,
            "total_registrations": len(registrations),
            "confirmed": sum(1 for r in registrations if r.confirmed),
            "present": sum(1 for r in registrations if r.was_present),
            "payments_validated": payments_validated,
            "revenue": float(revenue),
            "morning_only": sum(1 for r in registrations if r.attendance_type == "morning"),
            "full_day": sum(1 for r in registrations if r.attendance_type == "full_day"),
            "associations": associations
        })
    
    return stats


@app.post("/api/games/{game_id}/send-reminders")
async def send_reminders(
    game_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Envoyer des rappels pour une partie (admin)"""
    game = db.query(Game).filter(Game.id == game_id).first()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partie non trouvée"
        )
    
    registrations = db.query(Registration).filter(
        Registration.game_id == game_id,
        Registration.confirmed == True
    ).all()
    
    sent_count = 0
    for reg in registrations:
        try:
            await send_reminder_email(
                email=reg.email,
                first_name=reg.first_name,
                game_date=game.date
            )
            sent_count += 1
        except Exception as e:
            print(f"Erreur envoi rappel à {reg.email}: {e}")
    
    return {"message": f"{sent_count} rappels envoyés"}


@app.post("/api/send-automatic-reminders")
async def send_automatic_reminders_endpoint(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Déclenche manuellement l'envoi des rappels automatiques pour les parties dans 2 jours
    Utilisé pour les tests ou pour forcer un envoi
    """
    from scheduler import send_automatic_reminders_job
    
    try:
        await send_automatic_reminders_job()
        return {"message": "Traitement des rappels automatiques terminé - Consultez les logs du serveur"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'envoi des rappels: {str(e)}"
        )


@app.post("/api/logo/upload")
async def upload_logo(
    file: UploadFile = File(...),
    admin: str = Depends(get_current_admin)
):
    """Upload un nouveau logo (admin)"""
    # Vérifier le type de fichier
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type de fichier non autorisé. Utilisez PNG, JPG ou SVG."
        )
    
    # Sauvegarder le fichier
    try:
        with open(LOGO_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"message": "Logo uploadé avec succès", "filename": file.filename}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'upload: {str(e)}"
        )


@app.get("/api/logo")
async def get_logo():
    """Récupérer le logo actuel"""
    if LOGO_PATH.exists():
        return FileResponse(LOGO_PATH)
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun logo n'a été uploadé"
        )


@app.delete("/api/logo")
async def delete_logo(admin: str = Depends(get_current_admin)):
    """Supprimer le logo actuel (admin)"""
    if LOGO_PATH.exists():
        LOGO_PATH.unlink()
        return {"message": "Logo supprimé avec succès"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun logo à supprimer"
        )


@app.get("/api/settings", response_model=SiteSettingsResponse)
async def get_site_settings(db: Session = Depends(get_db)):
    """Récupérer les paramètres du site"""
    settings = db.query(SiteSettings).first()
    if not settings:
        # Créer les paramètres par défaut si ils n'existent pas
        settings = SiteSettings(
            site_title="Bienvenue sur le terrain de la LSPA",
            primary_color="#4CAF50"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@app.put("/api/settings", response_model=SiteSettingsResponse)
async def update_site_settings(
    settings_data: SiteSettingsUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour les paramètres du site (admin)"""
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings()
        db.add(settings)
    
    # Mettre à jour uniquement les champs fournis
    update_data = settings_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings


@app.put("/api/admin/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Changer le mot de passe de l'administrateur"""
    # Vérifier l'ancien mot de passe
    if not verify_password(password_data.current_password, current_admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mot de passe actuel incorrect"
        )
    
    # Mettre à jour avec le nouveau mot de passe
    current_admin.hashed_password = hash_password(password_data.new_password)
    db.commit()
    
    return {"message": "Mot de passe mis à jour avec succès"}


@app.get("/api/rules", response_model=RulesResponse)
async def get_rules(db: Session = Depends(get_db)):
    """Récupérer les règles du terrain"""
    rules = db.query(Rules).first()
    if not rules:
        # Créer les règles par défaut si elles n'existent pas
        rules = Rules()
        db.add(rules)
        db.commit()
        db.refresh(rules)
    return rules


@app.put("/api/rules", response_model=RulesResponse)
async def update_rules(
    rules_data: RulesUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour les règles du terrain (admin)"""
    rules = db.query(Rules).first()
    if not rules:
        rules = Rules()
        db.add(rules)
    
    # Mettre à jour uniquement les champs fournis
    update_data = rules_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rules, field, value)
    
    db.commit()
    db.refresh(rules)
    return rules


# ==========================================
# PAYMENT TYPES - Gestion des types de paiement
# ==========================================

@app.get("/api/payment-types", response_model=List[PaymentTypeResponse])
async def get_payment_types(
    db: Session = Depends(get_db)
):
    """Récupérer tous les types de paiement"""
    payment_types = db.query(PaymentType).order_by(PaymentType.name).all()
    return payment_types


@app.post("/api/payment-types", response_model=PaymentTypeResponse)
async def create_payment_type(
    payment_type: PaymentTypeCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Créer un nouveau type de paiement (admin)"""
    # Vérifier si le nom existe déjà
    existing = db.query(PaymentType).filter(PaymentType.name == payment_type.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce type de paiement existe déjà")
    
    new_payment_type = PaymentType(**payment_type.dict())
    db.add(new_payment_type)
    db.commit()
    db.refresh(new_payment_type)
    return new_payment_type


@app.put("/api/payment-types/{payment_type_id}", response_model=PaymentTypeResponse)
async def update_payment_type(
    payment_type_id: int,
    payment_type_data: PaymentTypeUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour un type de paiement (admin)"""
    payment_type = db.query(PaymentType).filter(PaymentType.id == payment_type_id).first()
    if not payment_type:
        raise HTTPException(status_code=404, detail="Type de paiement non trouvé")
    
    # Vérifier le nom unique si modifié
    if payment_type_data.name and payment_type_data.name != payment_type.name:
        existing = db.query(PaymentType).filter(PaymentType.name == payment_type_data.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ce nom existe déjà")
    
    update_data = payment_type_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment_type, field, value)
    
    db.commit()
    db.refresh(payment_type)
    return payment_type


@app.delete("/api/payment-types/{payment_type_id}")
async def delete_payment_type(
    payment_type_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Supprimer un type de paiement (admin)"""
    payment_type = db.query(PaymentType).filter(PaymentType.id == payment_type_id).first()
    if not payment_type:
        raise HTTPException(status_code=404, detail="Type de paiement non trouvé")
    
    # Vérifier s'il est utilisé
    registrations_count = db.query(Registration).filter(
        Registration.payment_type_id == payment_type_id
    ).count()
    
    if registrations_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de supprimer: {registrations_count} inscription(s) utilisent ce type"
        )
    
    db.delete(payment_type)
    db.commit()
    return {"message": "Type de paiement supprimé"}


@app.patch("/api/registrations/{registration_id}/payment-type")
async def set_registration_payment_type(
    registration_id: int,
    payment_data: SetPaymentTypeRequest,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Définir le type de paiement d'une inscription (admin)"""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Inscription non trouvée")
    
    # Vérifier que le type de paiement existe
    if payment_data.payment_type_id is not None:
        payment_type = db.query(PaymentType).filter(
            PaymentType.id == payment_data.payment_type_id
        ).first()
        if not payment_type:
            raise HTTPException(status_code=404, detail="Type de paiement non trouvé")
        if not payment_type.is_active:
            raise HTTPException(status_code=400, detail="Ce type de paiement est désactivé")
    
    registration.payment_type_id = payment_data.payment_type_id
    # Mettre à jour payment_validated pour compatibilité
    registration.payment_validated = payment_data.payment_type_id is not None
    
    db.commit()
    db.refresh(registration)
    return {"message": "Type de paiement mis à jour"}


# ==========================================
# PARTNER ASSOCIATIONS - Associations partenaires
# ==========================================

@app.get("/api/partner-associations", response_model=List[PartnerAssociationResponse])
async def get_partner_associations(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer toutes les associations partenaires (admin)"""
    associations = db.query(PartnerAssociation).order_by(PartnerAssociation.name).all()
    return associations


@app.post("/api/partner-associations", response_model=PartnerAssociationResponse)
async def create_partner_association(
    association: PartnerAssociationCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Créer une nouvelle association partenaire (admin)"""
    # Vérifier si le nom existe déjà
    existing = db.query(PartnerAssociation).filter(
        PartnerAssociation.name == association.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Une association avec ce nom existe déjà")
    
    new_association = PartnerAssociation(**association.dict())
    db.add(new_association)
    db.commit()
    db.refresh(new_association)
    return new_association


@app.put("/api/partner-associations/{association_id}", response_model=PartnerAssociationResponse)
async def update_partner_association(
    association_id: int,
    association: PartnerAssociationUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour une association partenaire (admin)"""
    db_association = db.query(PartnerAssociation).filter(
        PartnerAssociation.id == association_id
    ).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="Association non trouvée")
    
    # Vérifier si le nouveau nom existe déjà
    if association.name and association.name != db_association.name:
        existing = db.query(PartnerAssociation).filter(
            PartnerAssociation.name == association.name
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Une association avec ce nom existe déjà")
    
    # Mettre à jour les champs
    for field, value in association.dict(exclude_unset=True).items():
        setattr(db_association, field, value)
    
    db.commit()
    db.refresh(db_association)
    return db_association


@app.delete("/api/partner-associations/{association_id}")
async def delete_partner_association(
    association_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Supprimer une association partenaire (admin)"""
    association = db.query(PartnerAssociation).filter(
        PartnerAssociation.id == association_id
    ).first()
    if not association:
        raise HTTPException(status_code=404, detail="Association non trouvée")
    
    db.delete(association)
    db.commit()
    return {"message": "Association supprimée"}


# ==========================================
# PRICING SETTINGS - Paramètres de tarification
# ==========================================

@app.get("/api/pricing-settings", response_model=PricingSettingsResponse)
async def get_pricing_settings(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer les paramètres de tarification (admin)"""
    settings = db.query(PricingSettings).first()
    if not settings:
        # Créer les paramètres par défaut si inexistants
        settings = PricingSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@app.put("/api/pricing-settings", response_model=PricingSettingsResponse)
async def update_pricing_settings(
    pricing: PricingSettingsUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour les paramètres de tarification (admin)"""
    settings = db.query(PricingSettings).first()
    if not settings:
        settings = PricingSettings()
        db.add(settings)
    
    # Mettre à jour les champs
    for field, value in pricing.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings


# ==========================================
# NFC TAGS - Tags Lightning
# ==========================================

@app.get("/api/nfc-tags", response_model=List[NFCTagResponse])
async def get_nfc_tags(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer tous les tags NFC (admin)"""
    tags = db.query(NFCTag).order_by(NFCTag.tag_number).all()
    return tags


@app.post("/api/nfc-tags", response_model=NFCTagResponse)
async def create_nfc_tag(
    tag: NFCTagCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Créer un nouveau tag NFC (admin)"""
    # Vérifier si le numéro existe déjà
    existing = db.query(NFCTag).filter(
        NFCTag.tag_number == tag.tag_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un tag avec ce numéro existe déjà")
    
    new_tag = NFCTag(**tag.dict())
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag


@app.put("/api/nfc-tags/{tag_id}", response_model=NFCTagResponse)
async def update_nfc_tag(
    tag_id: int,
    tag: NFCTagUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour un tag NFC (admin)"""
    db_tag = db.query(NFCTag).filter(NFCTag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag non trouvé")
    
    # Vérifier si le nouveau numéro existe déjà
    if tag.tag_number and tag.tag_number != db_tag.tag_number:
        existing = db.query(NFCTag).filter(
            NFCTag.tag_number == tag.tag_number
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Un tag avec ce numéro existe déjà")
    
    # Mettre à jour les champs
    for field, value in tag.dict(exclude_unset=True).items():
        setattr(db_tag, field, value)
    
    db.commit()
    db.refresh(db_tag)
    return db_tag


@app.delete("/api/nfc-tags/{tag_id}")
async def delete_nfc_tag(
    tag_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Supprimer un tag NFC (admin)"""
    tag = db.query(NFCTag).filter(NFCTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouvé")
    
    # Vérifier si le tag est attribué
    registration_count = db.query(Registration).filter(
        Registration.nfc_tag_id == tag_id
    ).count()
    if registration_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de supprimer ce tag car il est attribué à {registration_count} inscription(s)"
        )
    
    db.delete(tag)
    db.commit()
    return {"message": "Tag supprimé"}


@app.patch("/api/registrations/{registration_id}/nfc-tag")
async def assign_nfc_tag(
    registration_id: int,
    tag_data: AssignTagRequest,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Attribuer ou retirer un tag NFC à une inscription (admin)"""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Inscription non trouvée")
    
    # Si on retire le tag
    if tag_data.nfc_tag_id is None:
        if registration.nfc_tag_id:
            # Libérer le tag
            old_tag = db.query(NFCTag).filter(NFCTag.id == registration.nfc_tag_id).first()
            if old_tag:
                old_tag.is_available = True
        registration.nfc_tag_id = None
        db.commit()
        db.refresh(registration)
        return {"message": "Tag retiré"}
    
    # Vérifier que le tag existe
    tag = db.query(NFCTag).filter(NFCTag.id == tag_data.nfc_tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouvé")
    
    if not tag.is_active:
        raise HTTPException(status_code=400, detail="Ce tag est hors service")
    
    if not tag.is_available:
        raise HTTPException(status_code=400, detail="Ce tag est déjà attribué")
    
    # Libérer l'ancien tag si existant
    if registration.nfc_tag_id:
        old_tag = db.query(NFCTag).filter(NFCTag.id == registration.nfc_tag_id).first()
        if old_tag:
            old_tag.is_available = True
    
    # Attribuer le nouveau tag
    tag.is_available = False
    registration.nfc_tag_id = tag_data.nfc_tag_id
    
    db.commit()
    db.refresh(registration)
    return {"message": "Tag attribué"}


# ==========================================
# RULE VERSIONS - Gestion des versions des règles
# ==========================================

@app.get("/api/rule-versions", response_model=List[RuleVersionResponse])
async def get_rule_versions(db: Session = Depends(get_db)):
    """Récupérer toutes les versions sauvegardées (maximum 3)"""
    versions = db.query(RuleVersion).order_by(RuleVersion.created_at.desc()).limit(3).all()
    return versions


@app.post("/api/rule-versions", response_model=RuleVersionResponse)
async def create_rule_version(
    version_data: RuleVersionCreate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Créer une nouvelle version en sauvegardant les règles actuelles (admin)"""
    # Vérifier qu'on ne dépasse pas 3 versions
    version_count = db.query(RuleVersion).count()
    if version_count >= 3:
        raise HTTPException(
            status_code=400, 
            detail="Maximum 3 versions. Supprimez une version existante avant d'en créer une nouvelle."
        )
    
    # Récupérer les règles actuelles
    current_rules = db.query(Rules).first()
    if not current_rules:
        raise HTTPException(status_code=404, detail="Aucune règle à sauvegarder")
    
    # Créer la nouvelle version avec une copie des règles actuelles
    new_version = RuleVersion(
        version_name=version_data.version_name,
        security=current_rules.security,
        power_distances=current_rules.power_distances,
        power_distances_indoor=current_rules.power_distances_indoor,
        power_distances_outdoor=current_rules.power_distances_outdoor,
        fair_play=current_rules.fair_play,
        shooting_rules=current_rules.shooting_rules,
        pyrotechnics=current_rules.pyrotechnics,
        terrain_respect=current_rules.terrain_respect,
        safety_stop=current_rules.safety_stop,
        formal_bans=current_rules.formal_bans,
        important_info=current_rules.important_info
    )
    
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version


@app.post("/api/rule-versions/{version_id}/apply")
async def apply_rule_version(
    version_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Appliquer (restaurer) une version des règles (admin)"""
    version = db.query(RuleVersion).filter(RuleVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version non trouvée")
    
    # Récupérer ou créer les règles actuelles
    current_rules = db.query(Rules).first()
    if not current_rules:
        current_rules = Rules()
        db.add(current_rules)
    
    # Appliquer tous les champs de la version sauvegardée
    current_rules.security = version.security
    current_rules.power_distances = version.power_distances
    current_rules.power_distances_indoor = version.power_distances_indoor
    current_rules.power_distances_outdoor = version.power_distances_outdoor
    current_rules.fair_play = version.fair_play
    current_rules.shooting_rules = version.shooting_rules
    current_rules.pyrotechnics = version.pyrotechnics
    current_rules.terrain_respect = version.terrain_respect
    current_rules.safety_stop = version.safety_stop
    current_rules.formal_bans = version.formal_bans
    current_rules.important_info = version.important_info
    
    db.commit()
    db.refresh(current_rules)
    return {"message": f"Version '{version.version_name}' appliquée avec succès"}


@app.delete("/api/rule-versions/{version_id}")
async def delete_rule_version(
    version_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Supprimer une version des règles (admin)"""
    version = db.query(RuleVersion).filter(RuleVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version non trouvée")
    
    db.delete(version)
    db.commit()
    return {"message": "Version supprimée"}


# ==========================================
# MEMBERSHIP APPLICATIONS - Gestion des candidatures
# ==========================================

@app.post("/api/membership-applications", response_model=MembershipApplicationResponse)
async def create_membership_application(
    application_data: MembershipApplicationCreate,
    db: Session = Depends(get_db)
):
    """Créer une nouvelle candidature d'adhésion (public)"""
    new_application = MembershipApplication(
        first_name=application_data.first_name,
        last_name=application_data.last_name,
        address=application_data.address,
        email=application_data.email,
        phone=application_data.phone,
        has_played_before=application_data.has_played_before,
        airsoft_experience=application_data.airsoft_experience,
        motivation=application_data.motivation,
        status="pending"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application


@app.get("/api/membership-applications", response_model=List[MembershipApplicationResponse])
async def get_membership_applications(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer toutes les candidatures (admin)"""
    applications = db.query(MembershipApplication).order_by(
        MembershipApplication.created_at.desc()
    ).all()
    return applications


@app.get("/api/membership-applications/pending/count")
async def get_pending_applications_count(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Récupérer le nombre de candidatures non traitées (admin)"""
    count = db.query(MembershipApplication).filter(
        MembershipApplication.status == "pending"
    ).count()
    return {"count": count}


@app.patch("/api/membership-applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_data: MembershipApplicationStatusUpdate,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Mettre à jour le statut d'une candidature (admin)"""
    application = db.query(MembershipApplication).filter(
        MembershipApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    application.status = status_data.status
    db.commit()
    db.refresh(application)
    
    status_text = "approuvée" if status_data.status == "approved" else "refusée"
    return {"message": f"Candidature {status_text}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
