#!/bin/bash
#===============================================================================
# Script de vérification des prérequis avant déploiement
# Exécuter sur le serveur de production
#===============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}🔍 Vérification des prérequis - Airsoft Manager${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

ERRORS=0

#--- Système ---
echo -e "${YELLOW}📋 Système${NC}"
echo "   OS: $(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')"
echo "   Kernel: $(uname -r)"
echo ""

#--- Docker ---
echo -e "${YELLOW}🐳 Docker${NC}"
if command -v docker &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    echo -e "   ${RED}✗${NC} Docker non installé"
    ERRORS=$((ERRORS+1))
fi

if command -v docker-compose &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} Docker Compose: $(docker-compose --version | cut -d' ' -f4 | tr -d ',')"
elif docker compose version &> /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Docker Compose (plugin): $(docker compose version | cut -d' ' -f4)"
else
    echo -e "   ${RED}✗${NC} Docker Compose non installé"
    ERRORS=$((ERRORS+1))
fi
echo ""

#--- Espace disque ---
echo -e "${YELLOW}💾 Espace disque${NC}"
DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}')
DISK_PERCENT=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_PERCENT" -lt 90 ]; then
    echo -e "   ${GREEN}✓${NC} Espace disponible: $DISK_AVAIL (${DISK_PERCENT}% utilisé)"
else
    echo -e "   ${RED}✗${NC} Espace faible: $DISK_AVAIL (${DISK_PERCENT}% utilisé)"
    ERRORS=$((ERRORS+1))
fi
echo ""

#--- Containers actifs ---
echo -e "${YELLOW}📦 Containers Airsoft Manager${NC}"
DB_CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}} ({{.Status}})" 2>/dev/null | head -1)
BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}} ({{.Status}})" 2>/dev/null | head -1)
FRONTEND_CONTAINER=$(docker ps --filter "name=frontend" --format "{{.Names}} ({{.Status}})" 2>/dev/null | head -1)

if [ -n "$DB_CONTAINER" ]; then
    echo -e "   ${GREEN}✓${NC} DB: $DB_CONTAINER"
else
    echo -e "   ${RED}✗${NC} Container DB non trouvé"
    ERRORS=$((ERRORS+1))
fi

if [ -n "$BACKEND_CONTAINER" ]; then
    echo -e "   ${GREEN}✓${NC} Backend: $BACKEND_CONTAINER"
else
    echo -e "   ${RED}✗${NC} Container Backend non trouvé"
    ERRORS=$((ERRORS+1))
fi

if [ -n "$FRONTEND_CONTAINER" ]; then
    echo -e "   ${GREEN}✓${NC} Frontend: $FRONTEND_CONTAINER"
else
    echo -e "   ${YELLOW}⚠${NC} Container Frontend non trouvé (peut-être Caddy ?)"
fi
echo ""

#--- Git ---
echo -e "${YELLOW}📂 Dépôt Git${NC}"
if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    REMOTE=$(git remote get-url origin 2>/dev/null)
    STATUS=$(git status --porcelain 2>/dev/null | wc -l)
    
    echo -e "   ${GREEN}✓${NC} Branche: $BRANCH"
    echo "   Remote: $REMOTE"
    
    if [ "$STATUS" -eq 0 ]; then
        echo -e "   ${GREEN}✓${NC} Working directory propre"
    else
        echo -e "   ${YELLOW}⚠${NC} $STATUS fichier(s) modifié(s) localement"
    fi
    
    # Vérifier les commits en retard
    git fetch origin --quiet 2>/dev/null
    BEHIND=$(git rev-list HEAD..origin/$BRANCH --count 2>/dev/null || echo "?")
    if [ "$BEHIND" != "?" ] && [ "$BEHIND" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} $BEHIND commit(s) en retard sur origin"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} Pas de dépôt Git dans ce répertoire"
fi
echo ""

#--- Fichiers requis ---
echo -e "${YELLOW}📄 Fichiers requis${NC}"
FILES_TO_CHECK=(
    "backend/main.py"
    "backend/models.py"
    "backend/migrate_approval_status.py"
    "frontend/src/components/PendingRegistrations.js"
    "docker/compose/docker-compose.prod.yml"
)

for FILE in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "   ${GREEN}✓${NC} $FILE"
    else
        echo -e "   ${RED}✗${NC} $FILE manquant"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

#--- API Health Check ---
echo -e "${YELLOW}🌐 Santé de l'API${NC}"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} API répond (HTTP 200)"
else
    echo -e "   ${RED}✗${NC} API non disponible (HTTP $API_RESPONSE)"
    ERRORS=$((ERRORS+1))
fi
echo ""

#--- Résumé ---
echo -e "${BLUE}============================================================${NC}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES PRÉREQUIS SONT SATISFAITS${NC}"
    echo -e "${GREEN}   Vous pouvez lancer le déploiement !${NC}"
else
    echo -e "${RED}❌ $ERRORS PROBLÈME(S) DÉTECTÉ(S)${NC}"
    echo -e "${YELLOW}   Résolvez les erreurs avant de déployer.${NC}"
fi
echo -e "${BLUE}============================================================${NC}"
