from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, Dict


class RegistrationCreate(BaseModel):
    """Schéma pour créer une inscription"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    nickname: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    attendance_type: str = Field(..., pattern="^(morning|full_day)$")
    has_association: bool = False
    association_name: Optional[str] = None
    bb_weight_pistol: Optional[str] = None
    bb_weight_rifle: Optional[str] = None
    has_second_rifle: bool = False
    bb_weight_rifle_2: Optional[str] = None


class RegistrationUpdate(BaseModel):
    """Schéma pour mettre à jour une inscription"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    nickname: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    attendance_type: Optional[str] = Field(None, pattern="^(morning|full_day)$")
    has_association: Optional[bool] = None
    association_name: Optional[str] = None
    bb_weight_pistol: Optional[str] = None
    bb_weight_rifle: Optional[str] = None
    has_second_rifle: Optional[bool] = None
    bb_weight_rifle_2: Optional[str] = None


class RegistrationResponse(BaseModel):
    """Schéma pour la réponse d'une inscription"""
    id: int
    game_id: int
    first_name: str
    last_name: str
    nickname: str
    email: str
    phone: str
    attendance_type: str
    has_association: bool
    association_name: Optional[str]
    bb_weight_pistol: Optional[str]
    bb_weight_rifle: Optional[str]
    has_second_rifle: bool
    bb_weight_rifle_2: Optional[str]
    approval_status: str = "pending"  # pending, approved, rejected
    rejection_reason: Optional[str] = None
    confirmed: bool
    was_present: Optional[bool]
    payment_validated: bool
    payment_type_id: Optional[int] = None
    calculated_price: Optional[int] = None  # Prix calculé selon les règles
    nfc_tag_id: Optional[int] = None  # ID du tag NFC attribué
    nfc_tag_number: Optional[str] = None  # Numéro du tag pour affichage
    game_name: Optional[str] = None  # Nom de la partie pour affichage
    game_date: Optional[date] = None  # Date de la partie pour affichage
    created_at: datetime
    
    class Config:
        from_attributes = True


class RegistrationApprovalRequest(BaseModel):
    """Schéma pour approuver une inscription"""
    pass


class RegistrationRejectionRequest(BaseModel):
    """Schéma pour rejeter une inscription"""
    rejection_reason: str = Field(..., min_length=1, max_length=500)


class GameCreate(BaseModel):
    """Schéma pour créer une partie"""
    date: date
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    is_active: bool = True


class GameResponse(BaseModel):
    """Schéma pour la réponse d'une partie"""
    id: int
    date: date
    name: str
    description: Optional[str]
    is_active: bool
    is_closed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schéma pour la requête de connexion"""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Schéma pour la réponse du token"""
    access_token: str
    token_type: str


class ChangePasswordRequest(BaseModel):
    """Schéma pour changer le mot de passe"""
    current_password: str
    new_password: str = Field(..., min_length=6)


class AttendanceUpdate(BaseModel):
    """Schéma pour mettre à jour la présence"""
    was_present: bool


class StatisticsResponse(BaseModel):
    """Schéma pour les statistiques"""
    total_games: int
    total_registrations: int
    total_confirmed: int
    total_present: int
    total_revenue: float  # Revenu total en euros
    average_per_game: float
    morning_only: int
    full_day: int
    top_associations: Dict[str, int]


class GameStatistics(BaseModel):
    """Schéma pour les statistiques d'une partie"""
    game_id: int
    game_name: str
    game_date: date
    total_registrations: int
    confirmed: int
    present: int
    payments_validated: int
    revenue: float
    morning_only: int
    full_day: int
    associations: Dict[str, int]


class SiteSettingsUpdate(BaseModel):
    """Schéma pour mettre à jour les paramètres du site"""
    site_title: Optional[str] = None
    primary_color: Optional[str] = None


class SiteSettingsResponse(BaseModel):
    """Schéma pour la réponse des paramètres du site"""
    id: int
    site_title: str
    primary_color: str
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RulesUpdate(BaseModel):
    """Schéma pour mettre à jour les règles"""
    security: Optional[str] = None
    power_distances: Optional[str] = None
    power_distances_indoor: Optional[str] = None
    power_distances_outdoor: Optional[str] = None
    fair_play: Optional[str] = None
    shooting_rules: Optional[str] = None
    pyrotechnics: Optional[str] = None
    terrain_respect: Optional[str] = None
    safety_stop: Optional[str] = None
    formal_bans: Optional[str] = None
    important_info: Optional[str] = None


class RulesResponse(BaseModel):
    """Schéma pour la réponse des règles"""
    id: int
    security: Optional[str]
    power_distances: Optional[str]
    power_distances_indoor: Optional[str]
    power_distances_outdoor: Optional[str]
    fair_play: Optional[str]
    shooting_rules: Optional[str]
    pyrotechnics: Optional[str]
    terrain_respect: Optional[str]
    safety_stop: Optional[str]
    formal_bans: Optional[str]
    important_info: Optional[str]
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==========================================
# PAYMENT TYPES - Types de paiement
# ==========================================

class PaymentTypeCreate(BaseModel):
    """Schéma pour créer un type de paiement"""
    name: str = Field(..., min_length=1, max_length=50)
    generates_cost: bool = True


class PaymentTypeUpdate(BaseModel):
    """Schéma pour mettre à jour un type de paiement"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    generates_cost: Optional[bool] = None
    is_active: Optional[bool] = None


class PaymentTypeResponse(BaseModel):
    """Schéma pour la réponse d'un type de paiement"""
    id: int
    name: str
    generates_cost: bool
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SetPaymentTypeRequest(BaseModel):
    """Schéma pour définir le type de paiement d'une inscription"""
    payment_type_id: Optional[int] = None  # None = retirer le paiement


# ==========================================
# PARTNER ASSOCIATIONS - Associations partenaires
# ==========================================

class PartnerAssociationCreate(BaseModel):
    """Schéma pour créer une association partenaire"""
    name: str = Field(..., min_length=1, max_length=100)


class PartnerAssociationUpdate(BaseModel):
    """Schéma pour mettre à jour une association partenaire"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None


class PartnerAssociationResponse(BaseModel):
    """Schéma pour la réponse d'une association partenaire"""
    id: int
    name: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ==========================================
# PRICING SETTINGS - Paramètres de tarification
# ==========================================

class PricingSettingsUpdate(BaseModel):
    """Schéma pour mettre à jour les tarifs"""
    partner_association_price: Optional[int] = Field(None, ge=0, le=100)
    other_association_price: Optional[int] = Field(None, ge=0, le=100)
    freelance_price: Optional[int] = Field(None, ge=0, le=100)


class PricingSettingsResponse(BaseModel):
    """Schéma pour la réponse des tarifs"""
    id: int
    partner_association_price: int
    other_association_price: int
    freelance_price: int
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ==========================================
# NFC TAGS - Tags Lightning
# ==========================================

class NFCTagCreate(BaseModel):
    """Schéma pour créer un tag NFC"""
    tag_number: str = Field(..., min_length=1, max_length=50)


class NFCTagUpdate(BaseModel):
    """Schéma pour mettre à jour un tag NFC"""
    tag_number: Optional[str] = Field(None, min_length=1, max_length=50)
    is_available: Optional[bool] = None
    is_active: Optional[bool] = None


class NFCTagResponse(BaseModel):
    """Schéma pour la réponse d'un tag NFC"""
    id: int
    tag_number: str
    is_available: bool
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AssignTagRequest(BaseModel):
    """Schéma pour attribuer/retirer un tag NFC à une inscription"""
    nfc_tag_id: Optional[int] = None  # None = retirer le tag


# ==========================================
# RULE VERSIONS - Versions des règles
# ==========================================

class RuleVersionCreate(BaseModel):
    """Schéma pour créer une version des règles"""
    version_name: str = Field(..., min_length=1, max_length=100)
    # Les champs des règles sont copiés depuis Rules actuel (pas besoin de les spécifier ici)


class RuleVersionResponse(BaseModel):
    """Schéma pour la réponse d'une version des règles"""
    id: int
    version_name: str
    security: Optional[str]
    power_distances: Optional[str]
    power_distances_indoor: Optional[str]
    power_distances_outdoor: Optional[str]
    fair_play: Optional[str]
    shooting_rules: Optional[str]
    pyrotechnics: Optional[str]
    terrain_respect: Optional[str]
    safety_stop: Optional[str]
    formal_bans: Optional[str]
    important_info: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==========================================
# MEMBERSHIP APPLICATIONS - Candidatures adhésion
# ==========================================

class MembershipApplicationCreate(BaseModel):
    """Schéma pour créer une candidature d'adhésion"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    address: str = Field(..., min_length=5, max_length=500)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    has_played_before: bool = False
    airsoft_experience: str = Field(..., min_length=1, max_length=200)
    motivation: str = Field(..., min_length=10, max_length=2000)


class MembershipApplicationResponse(BaseModel):
    """Schéma pour la réponse d'une candidature"""
    id: int
    first_name: str
    last_name: str
    address: str
    email: str
    phone: str
    has_played_before: bool
    airsoft_experience: str
    motivation: str
    status: str  # pending, approved, rejected
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MembershipApplicationStatusUpdate(BaseModel):
    """Schéma pour mettre à jour le statut d'une candidature"""
    status: str = Field(..., pattern="^(approved|rejected)$")
