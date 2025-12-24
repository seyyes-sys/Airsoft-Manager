#!/bin/bash
# ============================================
# CONSULTATION LOGS CENTRALISÉE
# ============================================
# Affiche les logs de tous les services
# avec options de filtrage
# ============================================

# Fonction d'aide
show_help() {
    echo "============================================"
    echo "📋 CONSULTATION LOGS - AIRSOFT MANAGER"
    echo "============================================"
    echo ""
    echo "Usage : bash logs.sh [OPTIONS]"
    echo ""
    echo "OPTIONS :"
    echo "  -s, --service <nom>    Service spécifique (backend|frontend|db|caddy|all)"
    echo "  -f, --follow           Suivre les logs en temps réel"
    echo "  -n, --lines <nombre>   Nombre de lignes (défaut: 50)"
    echo "  -e, --errors           Afficher seulement les erreurs"
    echo "  -t, --tail             Mode tail (dernières lignes)"
    echo "  -h, --help             Afficher cette aide"
    echo ""
    echo "EXEMPLES :"
    echo "  bash logs.sh                           # Tous les logs (50 dernières lignes)"
    echo "  bash logs.sh -s backend -f             # Backend en temps réel"
    echo "  bash logs.sh -s backend -n 100         # Backend 100 dernières lignes"
    echo "  bash logs.sh -e                        # Toutes les erreurs"
    echo "  bash logs.sh -s backend -e -f          # Erreurs backend en temps réel"
    echo ""
}

# Valeurs par défaut
SERVICE="all"
FOLLOW=false
LINES=50
ERRORS_ONLY=false

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -e|--errors)
            ERRORS_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Option inconnue : $1"
            show_help
            exit 1
            ;;
    esac
done

# Mapping service -> container
case $SERVICE in
    backend)
        CONTAINER="airsoft-backend"
        ;;
    frontend)
        CONTAINER="airsoft-frontend"
        ;;
    db|database)
        CONTAINER="airsoft-db"
        ;;
    caddy)
        CONTAINER="airsoft-caddy"
        ;;
    all)
        CONTAINER=""
        ;;
    *)
        echo "❌ Service inconnu : $SERVICE"
        echo "Services disponibles : backend, frontend, db, caddy, all"
        exit 1
        ;;
esac

echo "============================================"
echo "📋 LOGS AIRSOFT MANAGER"
echo "============================================"
echo "📅 $(date '+%d/%m/%Y %H:%M:%S')"
echo "🔍 Service : $SERVICE"
echo "📊 Lignes : $LINES"
if [ "$ERRORS_ONLY" = true ]; then
    echo "⚠️  Mode : Erreurs uniquement"
fi
if [ "$FOLLOW" = true ]; then
    echo "⏩ Mode : Temps réel (Ctrl+C pour arrêter)"
fi
echo "============================================"
echo ""

# Fonction pour afficher les logs
show_logs() {
    local container=$1
    local header=$2
    
    if [ -n "$header" ]; then
        echo "───────────────────────────────────────────"
        echo "📦 $header"
        echo "───────────────────────────────────────────"
    fi
    
    if [ "$FOLLOW" = true ]; then
        if [ "$ERRORS_ONLY" = true ]; then
            docker logs -f --tail "$LINES" "$container" 2>&1 | grep -i "error\|exception\|failed\|critical"
        else
            docker logs -f --tail "$LINES" "$container" 2>&1
        fi
    else
        if [ "$ERRORS_ONLY" = true ]; then
            docker logs --tail "$LINES" "$container" 2>&1 | grep -i "error\|exception\|failed\|critical"
        else
            docker logs --tail "$LINES" "$container" 2>&1
        fi
    fi
}

# Afficher les logs
if [ "$SERVICE" = "all" ]; then
    # Tous les services
    for service in "airsoft-backend:Backend" "airsoft-frontend:Frontend" "airsoft-db:Database" "airsoft-caddy:Caddy"; do
        IFS=':' read -r container name <<< "$service"
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            show_logs "$container" "$name"
            echo ""
        fi
    done
else
    # Service spécifique
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        show_logs "$CONTAINER" ""
    else
        echo "❌ Container $CONTAINER n'est pas en cours d'exécution"
        exit 1
    fi
fi

if [ "$FOLLOW" = false ]; then
    echo ""
    echo "============================================"
    echo "ℹ️  Pour suivre en temps réel : bash logs.sh -s $SERVICE -f"
    echo "============================================"
fi
