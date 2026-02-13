#!/bin/bash
#===============================================================================
# Script de déploiement : Système d'approbation des inscriptions
# Version: 1.0
# Date: Janvier 2026
#
# Ce script déploie la nouvelle fonctionnalité d'approbation des inscriptions
# sur un serveur de production.
#
# IMPORTANT: Exécuter ce script depuis le répertoire racine du projet
#===============================================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/compose/docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}🚀 Déploiement : Système d'approbation des inscriptions${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

#-------------------------------------------------------------------------------
# Étape 0: Vérifications préliminaires
#-------------------------------------------------------------------------------
echo -e "${YELLOW}📋 Étape 0: Vérifications préliminaires...${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "docker/compose/docker-compose.prod.yml" ] && [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet${NC}"
    exit 1
fi

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Erreur: Docker n'est pas installé${NC}"
    exit 1
fi

# Vérifier que docker-compose est disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Erreur: Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Vérifications OK${NC}"
echo ""

#-------------------------------------------------------------------------------
# Étape 1: Backup de la base de données
#-------------------------------------------------------------------------------
echo -e "${YELLOW}💾 Étape 1: Backup de la base de données...${NC}"

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_before_upgrade_$TIMESTAMP.sql"

# Trouver le container de la base de données
DB_CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -1)

if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}❌ Erreur: Container de base de données non trouvé${NC}"
    echo -e "${YELLOW}Assurez-vous que les containers sont en cours d'exécution${NC}"
    exit 1
fi

echo "Container DB trouvé: $DB_CONTAINER"

# Récupérer les credentials depuis les variables d'environnement ou utiliser les valeurs par défaut
DB_USER="${POSTGRES_USER:-airsoft_user}"
DB_NAME="${POSTGRES_DB:-airsoft_db}"

docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup créé: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Erreur: Le backup a échoué${NC}"
    exit 1
fi
echo ""

#-------------------------------------------------------------------------------
# Étape 2: Pull des dernières modifications (si Git)
#-------------------------------------------------------------------------------
echo -e "${YELLOW}📥 Étape 2: Récupération des modifications...${NC}"

if [ -d ".git" ]; then
    echo "Dépôt Git détecté"
    
    # Vérifier s'il y a des modifications locales
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Modifications locales détectées. Sauvegarde...${NC}"
        git stash
    fi
    
    # Pull des modifications
    git pull origin main || git pull origin master
    echo -e "${GREEN}✓ Code mis à jour${NC}"
else
    echo -e "${YELLOW}⚠️  Pas de dépôt Git. Assurez-vous que les fichiers sont à jour.${NC}"
fi
echo ""

#-------------------------------------------------------------------------------
# Étape 3: Arrêt des services (mode maintenance)
#-------------------------------------------------------------------------------
echo -e "${YELLOW}🛑 Étape 3: Arrêt des services...${NC}"

if [ -f "$COMPOSE_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" stop backend frontend
else
    docker-compose stop backend frontend
fi

echo -e "${GREEN}✓ Services arrêtés${NC}"
echo ""

#-------------------------------------------------------------------------------
# Étape 4: Rebuild des images
#-------------------------------------------------------------------------------
echo -e "${YELLOW}🔨 Étape 4: Reconstruction des images...${NC}"

if [ -f "$COMPOSE_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" build --no-cache backend frontend
else
    docker-compose build --no-cache backend frontend
fi

echo -e "${GREEN}✓ Images reconstruites${NC}"
echo ""

#-------------------------------------------------------------------------------
# Étape 5: Exécution de la migration
#-------------------------------------------------------------------------------
echo -e "${YELLOW}🔄 Étape 5: Migration de la base de données...${NC}"

# Démarrer temporairement le backend pour la migration
if [ -f "$COMPOSE_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" up -d backend
else
    docker-compose up -d backend
fi

# Attendre que le container soit prêt
sleep 5

# Trouver le container backend
BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -1)

if [ -z "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}❌ Erreur: Container backend non trouvé${NC}"
    exit 1
fi

# Exécuter la migration
echo "Exécution de la migration..."
docker exec "$BACKEND_CONTAINER" python migrate_approval_status.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration réussie${NC}"
else
    echo -e "${RED}❌ Erreur lors de la migration${NC}"
    echo -e "${YELLOW}Restauration du backup recommandée${NC}"
    exit 1
fi
echo ""

#-------------------------------------------------------------------------------
# Étape 6: Redémarrage complet des services
#-------------------------------------------------------------------------------
echo -e "${YELLOW}🚀 Étape 6: Redémarrage des services...${NC}"

if [ -f "$COMPOSE_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" up -d
else
    docker-compose up -d
fi

echo -e "${GREEN}✓ Services redémarrés${NC}"
echo ""

#-------------------------------------------------------------------------------
# Étape 7: Vérification du déploiement
#-------------------------------------------------------------------------------
echo -e "${YELLOW}🔍 Étape 7: Vérification du déploiement...${NC}"

# Attendre que les services soient prêts
sleep 10

# Vérifier que l'API répond
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "000")

if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ API backend opérationnelle (HTTP $API_RESPONSE)${NC}"
else
    echo -e "${RED}❌ API backend non disponible (HTTP $API_RESPONSE)${NC}"
    echo -e "${YELLOW}Vérifiez les logs: docker logs $BACKEND_CONTAINER${NC}"
fi

# Vérifier le nouveau endpoint
PENDING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/registrations/pending/count -H "Authorization: Bearer test" 2>/dev/null || echo "000")

if [ "$PENDING_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✓ Nouvel endpoint /api/registrations/pending/count accessible (auth requise)${NC}"
else
    echo -e "${YELLOW}⚠️  Endpoint retourne HTTP $PENDING_RESPONSE${NC}"
fi

echo ""

#-------------------------------------------------------------------------------
# Résumé
#-------------------------------------------------------------------------------
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "📋 Résumé:"
echo -e "   - Backup: $BACKUP_FILE"
echo -e "   - Migration: Colonnes approval_status et rejection_reason ajoutées"
echo -e "   - Inscriptions existantes: Marquées comme 'approved'"
echo ""
echo -e "🧪 Pour tester:"
echo -e "   1. Accédez à l'interface admin"
echo -e "   2. Vérifiez le nouvel onglet '⏳ Inscriptions en attente'"
echo -e "   3. Faites une inscription test depuis le formulaire public"
echo ""
echo -e "🔙 En cas de problème, restaurez le backup:"
echo -e "   cat $BACKUP_FILE | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME"
echo ""
