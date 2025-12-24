#!/bin/bash
# ============================================
# AIRSOFT MANAGER - INSTALLATION AUTOMATIQUE
# ============================================
# Script d'installation pour Linux/MacOS
# Version 2.0 - 24 Décembre 2025
# ============================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

print_title() {
    echo ""
    print_color "$CYAN" "========================================"
    print_color "$CYAN" " $1"
    print_color "$CYAN" "========================================"
    echo ""
}

print_success() {
    print_color "$GREEN" "✅ $1"
}

print_error() {
    print_color "$RED" "❌ $1"
}

print_warning() {
    print_color "$YELLOW" "⚠️  $1"
}

print_info() {
    print_color "$WHITE" "$1"
}

check_command() {
    command -v "$1" >/dev/null 2>&1
}

# En-tête
clear
print_color "$CYAN" "╔═══════════════════════════════════════════════════════╗"
print_color "$CYAN" "║                                                       ║"
print_color "$CYAN" "║           🎯 AIRSOFT MANAGER v2.0                     ║"
print_color "$CYAN" "║        Installation Automatique Linux/MacOS          ║"
print_color "$CYAN" "║                                                       ║"
print_color "$CYAN" "╚═══════════════════════════════════════════════════════╝"
echo ""

# Vérification des prérequis
print_title "Étape 1/6 : Vérification des prérequis"

all_ok=true

echo -n "Vérification de Docker..."
if check_command docker; then
    print_success "Installé"
    docker_version=$(docker --version)
    print_color "$WHITE" "  → $docker_version"
else
    print_error "Non installé"
    print_warning "  → Installez Docker : https://docs.docker.com/get-docker/"
    all_ok=false
fi

echo -n "Vérification de Docker Compose..."
if docker compose version >/dev/null 2>&1; then
    print_success "Installé"
    compose_version=$(docker compose version)
    print_color "$WHITE" "  → $compose_version"
else
    print_error "Non installé"
    print_warning "  → Docker Compose fait partie de Docker Desktop"
    all_ok=false
fi

if [ "$all_ok" = false ]; then
    echo ""
    print_error "Des prérequis sont manquants. Installez-les et relancez ce script."
    exit 1
fi

echo ""
print_success "Tous les prérequis sont installés !"
sleep 2

# Questions interactives
print_title "Étape 2/6 : Configuration de votre terrain"

print_warning "📝 Répondez aux questions suivantes pour configurer votre application :"
echo ""

# Nom du terrain
print_info "Nom de votre terrain d'airsoft :"
print_color "$WHITE" "  Exemple : Airsoft Tactical Arena"
read -p "→ " TERRAIN_NAME
if [ -z "$TERRAIN_NAME" ]; then
    TERRAIN_NAME="Mon Terrain d'Airsoft"
fi

echo ""

# Email Gmail
print_info "📧 Configuration Email (Gmail recommandé)"
print_color "$WHITE" "  Les emails servent à envoyer les confirmations d'inscription"
print_color "$WHITE" "  et les rappels automatiques J-2 avant les parties."
echo ""
print_info "Adresse email Gmail :"
read -p "→ " SMTP_USERNAME

echo ""

# Mot de passe application Gmail
print_info "🔑 Mot de passe d'application Gmail"
print_warning "  ⚠️  Pas votre mot de passe Gmail habituel !"
echo ""
print_color "$WHITE" "  Comment obtenir un mot de passe d'application :"
print_color "$WHITE" "  1. Allez sur https://myaccount.google.com/"
print_color "$WHITE" "  2. Cliquez 'Sécurité' → 'Validation en 2 étapes' (activez-la si besoin)"
print_color "$WHITE" "  3. Cliquez 'Mots de passe des applications'"
print_color "$WHITE" "  4. Créez un nouveau mot de passe pour 'Autre application'"
print_color "$WHITE" "  5. Copiez le mot de passe de 16 caractères généré"
echo ""
print_info "Mot de passe d'application Gmail :"
read -s -p "→ " SMTP_PASSWORD
echo ""

echo ""

# Email admin
print_info "Email administrateur (pour recevoir les notifications) :"
print_color "$WHITE" "  Exemple : admin@monterrain.fr"
read -p "→ " ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    ADMIN_EMAIL="$SMTP_USERNAME"
fi

echo ""

# Mot de passe admin
print_info "🔐 Mot de passe administrateur"
print_color "$WHITE" "  Choisissez un mot de passe sécurisé pour l'interface admin"
echo ""
print_info "Mot de passe admin (minimum 6 caractères) :"
read -s -p "→ " ADMIN_PASSWORD
echo ""

echo ""

# Type d'installation
print_title "Étape 3/6 : Type d'installation"
print_info "Choisissez le type d'installation :"
echo ""
print_color "$CYAN" "  1) Installation locale (test sur cet ordinateur)"
print_color "$WHITE" "     → Accessible sur http://localhost:3000"
echo ""
print_color "$CYAN" "  2) Installation production (sur un serveur avec domaine)"
print_color "$WHITE" "     → Nécessite un nom de domaine et Cloudflare"
echo ""

while true; do
    read -p "Votre choix (1 ou 2) : " install_type
    if [ "$install_type" = "1" ] || [ "$install_type" = "2" ]; then
        break
    fi
done

is_production=false
if [ "$install_type" = "2" ]; then
    is_production=true
    
    echo ""
    print_info "Nom de domaine (ex: airsoft.monterrain.fr) :"
    read -p "→ " DOMAIN
    
    echo ""
    print_info "☁️  Token API Cloudflare"
    print_color "$WHITE" "  Nécessaire pour générer automatiquement les certificats SSL"
    echo ""
    print_color "$WHITE" "  Comment obtenir le token :"
    print_color "$WHITE" "  1. Allez sur https://dash.cloudflare.com/profile/api-tokens"
    print_color "$WHITE" "  2. Créez un token avec 'Zone.DNS:Edit'"
    print_color "$WHITE" "  3. Copiez le token"
    echo ""
    print_info "Token Cloudflare :"
    read -s -p "→ " CLOUDFLARE_API_TOKEN
    echo ""
fi

# Génération du fichier .env
print_title "Étape 4/6 : Génération de la configuration"

echo -n "Création du fichier de configuration..."

# Générer une SECRET_KEY sécurisée
SECRET_KEY=$(openssl rand -hex 32)
DB_PASSWORD="airsoft_password_$(date +%s)"

# Déterminer le répertoire du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
COMPOSE_DIR="$SCRIPT_DIR/docker/compose"

# Créer le répertoire si nécessaire
mkdir -p "$COMPOSE_DIR"

# Contenu du fichier .env
ENV_FILE="$COMPOSE_DIR/.env"

cat > "$ENV_FILE" << EOF
#============================================
# AIRSOFT MANAGER - Configuration
# Généré automatiquement le $(date '+%d/%m/%Y %H:%M:%S')
#============================================

#============================================
# BASE DE DONNÉES
#============================================
POSTGRES_USER=airsoft_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=airsoft_db
DATABASE_URL=postgresql://airsoft_user:$DB_PASSWORD@db:5432/airsoft_db

#============================================
# BACKEND API
#============================================
SECRET_KEY=$SECRET_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$ADMIN_PASSWORD

#============================================
# SMTP (GMAIL)
#============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$SMTP_USERNAME
SMTP_PASSWORD=$SMTP_PASSWORD
EMAIL_FROM=$SMTP_USERNAME
ADMIN_EMAIL=$ADMIN_EMAIL

#============================================
# FRONTEND
#============================================
EOF

if [ "$is_production" = true ]; then
    echo "REACT_APP_API_URL=https://$DOMAIN" >> "$ENV_FILE"
else
    echo "REACT_APP_API_URL=http://localhost:8000" >> "$ENV_FILE"
fi

cat >> "$ENV_FILE" << EOF

#============================================
# SITE
#============================================
SITE_NAME=$TERRAIN_NAME
EOF

if [ "$is_production" = true ]; then
    cat >> "$ENV_FILE" << EOF

#============================================
# PRODUCTION (Cloudflare SSL)
#============================================
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN
DOMAIN=$DOMAIN
EOF
fi

print_success ""
print_color "$WHITE" "  → Configuration sauvegardée dans : $ENV_FILE"

# Installation
print_title "Étape 5/6 : Installation et démarrage"

print_warning "🚀 Démarrage de l'application..."
echo ""

cd "$COMPOSE_DIR" || exit 1

if [ "$is_production" = true ]; then
    print_color "$CYAN" "Mode : Production avec SSL"
    docker compose -f docker-compose.prod.yml up -d --build
else
    print_color "$CYAN" "Mode : Développement local"
    docker compose up -d --build
fi

if [ $? -eq 0 ]; then
    echo ""
    print_success "Installation terminée avec succès !"
else
    echo ""
    print_error "Erreur lors de l'installation"
    print_warning "Consultez les logs avec : docker compose logs"
    exit 1
fi

# Résumé final
print_title "Étape 6/6 : Installation terminée !"

print_color "$GREEN" "╔═══════════════════════════════════════════════════════╗"
print_color "$GREEN" "║          ✅ INSTALLATION RÉUSSIE !                    ║"
print_color "$GREEN" "╚═══════════════════════════════════════════════════════╝"
echo ""

print_color "$CYAN" "📌 INFORMATIONS DE CONNEXION"
echo ""

if [ "$is_production" = true ]; then
    echo -n "🌐 Site public         : "
    print_color "$WHITE" "https://$DOMAIN"
    echo -n "🔐 Interface admin     : "
    print_color "$WHITE" "https://$DOMAIN/admin/login"
else
    echo -n "🌐 Site public         : "
    print_color "$WHITE" "http://localhost:3000"
    echo -n "🔐 Interface admin     : "
    print_color "$WHITE" "http://localhost:3000/admin/login"
    echo -n "📊 API Documentation   : "
    print_color "$WHITE" "http://localhost:8000/docs"
fi

echo ""
echo -n "👤 Nom d'utilisateur   : "
print_color "$WHITE" "admin"
echo -n "🔑 Mot de passe        : "
print_color "$WHITE" "(celui que vous avez choisi)"

echo ""
print_warning "⚠️  IMPORTANT : Changez votre mot de passe après la première connexion !"
print_color "$WHITE" "   → Onglet '🔐 Mot de passe' dans l'interface admin"

echo ""
print_color "$CYAN" "📚 COMMANDES UTILES"
echo ""
print_color "$WHITE" "  Voir les logs           : docker compose logs -f"
print_color "$WHITE" "  Redémarrer              : docker compose restart"
print_color "$WHITE" "  Arrêter                 : docker compose stop"
print_color "$WHITE" "  Supprimer complètement  : docker compose down -v"

echo ""
print_color "$CYAN" "📖 Documentation complète : GUIDE_COMPLET.md"
echo ""
