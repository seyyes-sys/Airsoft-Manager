#!/bin/bash
#===============================================================================
# Script de rollback : Annuler le déploiement du système d'approbation
#
# Utilisation: ./rollback-approval-system.sh <fichier_backup.sql>
#===============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Usage: $0 <fichier_backup.sql>${NC}"
    echo ""
    echo "Backups disponibles:"
    ls -la backups/*.sql 2>/dev/null || echo "Aucun backup trouvé dans ./backups/"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Fichier backup non trouvé: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}============================================================${NC}"
echo -e "${YELLOW}🔙 ROLLBACK : Restauration de la base de données${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

read -p "⚠️  Cette opération va écraser la base de données actuelle. Continuer ? (oui/non) " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
    echo "Annulé."
    exit 0
fi

# Trouver le container DB
DB_CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -1)
DB_USER="${POSTGRES_USER:-airsoft_user}"
DB_NAME="${POSTGRES_DB:-airsoft_db}"

echo -e "${YELLOW}Restauration en cours...${NC}"

# Restaurer le backup
cat "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME"

echo -e "${GREEN}✓ Base de données restaurée depuis $BACKUP_FILE${NC}"

# Redémarrer le backend
echo -e "${YELLOW}Redémarrage du backend...${NC}"
docker restart $(docker ps --filter "name=backend" --format "{{.Names}}" | head -1)

echo ""
echo -e "${GREEN}✅ ROLLBACK TERMINÉ${NC}"
echo -e "${YELLOW}Note: Le code applicatif n'a pas été modifié.${NC}"
echo -e "${YELLOW}Pour un rollback complet, utilisez: git checkout <commit_precedent>${NC}"
