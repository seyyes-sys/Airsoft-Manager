from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    """Modèle pour les utilisateurs (admins)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Game(Base):
    """Modèle pour les parties d'airsoft"""
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_closed = Column(Boolean, default=False)  # Inscriptions clôturées
    reminder_sent = Column(Boolean, default=False)  # Rappel automatique envoyé
    created_at = Column(DateTime, default=datetime.utcnow)
    
    registrations = relationship("Registration", back_populates="game")


class Registration(Base):
    """Modèle pour les inscriptions"""
    __tablename__ = "registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"))
    
    # Informations du joueur
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    nickname = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    
    # Type de présence
    attendance_type = Column(String, nullable=False)  # "morning" ou "full_day"
    
    # Association
    has_association = Column(Boolean, default=False)
    association_name = Column(String, nullable=True)
    
    # Grammage des billes
    bb_weight_pistol = Column(String, nullable=True)  # Grammage PA
    bb_weight_rifle = Column(String, nullable=True)   # Grammage Longue
    has_second_rifle = Column(Boolean, default=False)
    bb_weight_rifle_2 = Column(String, nullable=True) # Grammage Longue 2
    
    # Statut
    confirmed = Column(Boolean, default=False)
    was_present = Column(Boolean, nullable=True)
    payment_validated = Column(Boolean, default=False)  # Paiement validé (legacy)
    payment_type_id = Column(Integer, ForeignKey("payment_types.id"), nullable=True)  # Type de paiement
    nfc_tag_id = Column(Integer, ForeignKey("nfc_tags.id"), nullable=True)  # Tag NFC Lightning attribué
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    game = relationship("Game", back_populates="registrations")
    payment_type = relationship("PaymentType")
    nfc_tag = relationship("NFCTag")


class Attendance(Base):
    """Modèle pour le suivi de présence"""
    __tablename__ = "attendances"
    
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"))
    was_present = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SiteSettings(Base):
    """Modèle pour les paramètres du site"""
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    site_title = Column(String, default="Bienvenue sur le terrain de la LSPA")
    primary_color = Column(String, default="#4CAF50")  # Couleur principale (hex)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Rules(Base):
    """Modèle pour les règles du terrain"""
    __tablename__ = "rules"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Sections des règles
    security = Column(Text, nullable=True)  # 🎯 Sécurité
    power_distances = Column(Text, nullable=True)  # ⚡ Puissances et Distances
    power_distances_indoor = Column(Text, nullable=True)  # Sous-section : Intérieur des bâtiments
    power_distances_outdoor = Column(Text, nullable=True)  # Sous-section : Extérieur
    fair_play = Column(Text, nullable=True)  # 🎮 Fair-Play et Élimination
    shooting_rules = Column(Text, nullable=True)  # 🔫 Règles de Tir
    pyrotechnics = Column(Text, nullable=True)  # 💥 Pyrotechnie et Grenades
    terrain_respect = Column(Text, nullable=True)  # 🌳 Respect du Terrain
    safety_stop = Column(Text, nullable=True)  # 🛑 Sécurité et Arrêt de Jeu
    formal_bans = Column(Text, nullable=True)  # 🚫 Interdictions Formelles
    important_info = Column(Text, nullable=True)  # ⚡ Informations Importantes
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaymentType(Base):
    """Modèle pour les types de paiement"""
    __tablename__ = "payment_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # Ex: "Espèces", "Paypal", "Gratuité"
    generates_cost = Column(Boolean, default=True)  # Si true, compte dans les revenus
    is_active = Column(Boolean, default=True)  # Permet de désactiver sans supprimer
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PartnerAssociation(Base):
    """Modèle pour les associations partenaires (tarif préférentiel)"""
    __tablename__ = "partner_associations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # Nom de l'association
    is_active = Column(Boolean, default=True)  # Permet de désactiver sans supprimer
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PricingSettings(Base):
    """Modèle pour les paramètres de tarification de la PAF"""
    __tablename__ = "pricing_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    partner_association_price = Column(Integer, default=5)  # Tarif pour association partenaire (en €)
    other_association_price = Column(Integer, default=7)    # Tarif pour autre association (en €)
    freelance_price = Column(Integer, default=9)            # Tarif pour freelance (en €)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class NFCTag(Base):
    """Modèle pour les tags NFC Lightning"""
    __tablename__ = "nfc_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    tag_number = Column(String, unique=True, nullable=False)  # Numéro du bracelet (ex: "001", "LT-025")
    is_available = Column(Boolean, default=True)  # True = disponible, False = attribué
    is_active = Column(Boolean, default=True)  # True = actif, False = hors service
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RuleVersion(Base):
    """Modèle pour les versions sauvegardées des règles"""
    __tablename__ = "rule_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String, nullable=False)  # Nom de la version (ex: "Partie Hiver 2025", "Règles de base")
    
    # Snapshot complet de toutes les règles au moment de la sauvegarde
    security = Column(Text, nullable=True)
    power_distances = Column(Text, nullable=True)
    power_distances_indoor = Column(Text, nullable=True)
    power_distances_outdoor = Column(Text, nullable=True)
    fair_play = Column(Text, nullable=True)
    shooting_rules = Column(Text, nullable=True)
    pyrotechnics = Column(Text, nullable=True)
    terrain_respect = Column(Text, nullable=True)
    safety_stop = Column(Text, nullable=True)
    formal_bans = Column(Text, nullable=True)
    important_info = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class MembershipApplication(Base):
    """Modèle pour les candidatures d'adhésion à l'association"""
    __tablename__ = "membership_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    has_played_before = Column(Boolean, default=False)  # A déjà joué chez nous
    airsoft_experience = Column(String, nullable=False)  # Depuis combien de temps il pratique
    motivation = Column(Text, nullable=False)  # Motivation et attentes
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
