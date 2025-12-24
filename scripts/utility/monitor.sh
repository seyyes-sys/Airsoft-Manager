#!/bin/bash
# ============================================
# MONITORING CONTAINERS DOCKER
# ============================================
# Affiche le status de tous les containers
# Airsoft Manager
# ============================================

echo "============================================"
echo "📊 MONITORING AIRSOFT MANAGER"
echo "============================================"
echo ""
echo "📅 $(date '+%d/%m/%Y %H:%M:%S')"
echo ""

# Status des containers
echo "🐳 STATUS DES CONTAINERS :"
echo "-------------------------------------------"
docker ps -a --filter "name=airsoft" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Utilisation CPU/Mémoire
echo "💻 UTILISATION RESSOURCES :"
echo "-------------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $(docker ps --filter "name=airsoft" -q)
echo ""

# Santé des containers
echo "🏥 SANTÉ DES SERVICES :"
echo "-------------------------------------------"

# Database
if docker ps --format '{{.Names}}' | grep -q "airsoft-db"; then
    DB_HEALTHY=$(docker inspect --format='{{.State.Health.Status}}' airsoft-db 2>/dev/null || echo "no health check")
    if [ "$DB_HEALTHY" = "healthy" ]; then
        echo "✅ Database    : Healthy"
    else
        echo "⚠️  Database    : $DB_HEALTHY"
    fi
else
    echo "❌ Database    : Arrêté"
fi

# Backend
if docker ps --format '{{.Names}}' | grep -q "airsoft-backend"; then
    BACKEND_STATUS=$(curl -s http://localhost:8000/api/health 2>/dev/null | grep -o "ok" || echo "down")
    if [ "$BACKEND_STATUS" = "ok" ]; then
        echo "✅ Backend     : Running"
    else
        echo "⚠️  Backend     : Unhealthy"
    fi
else
    echo "❌ Backend     : Arrêté"
fi

# Frontend
if docker ps --format '{{.Names}}' | grep -q "airsoft-frontend"; then
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo "✅ Frontend    : Running"
    else
        echo "⚠️  Frontend    : Unhealthy (HTTP $FRONTEND_STATUS)"
    fi
else
    echo "❌ Frontend    : Arrêté"
fi

# Caddy
if docker ps --format '{{.Names}}' | grep -q "airsoft-caddy"; then
    CADDY_RUNNING=$(docker ps --filter "name=airsoft-caddy" --filter "status=running" -q)
    if [ -n "$CADDY_RUNNING" ]; then
        echo "✅ Caddy       : Running"
    else
        echo "⚠️  Caddy       : Problème"
    fi
else
    echo "❌ Caddy       : Arrêté"
fi

echo ""

# Espace disque
echo "💾 ESPACE DISQUE :"
echo "-------------------------------------------"
df -h / | tail -1 | awk '{print "Système     : "$3" utilisé / "$2" total ("$5" utilisé)"}'
docker system df | grep "Images\|Containers\|Local Volumes" | awk '{print $1"  : "$3}'
echo ""

# Derniers logs d'erreur
echo "⚠️  DERNIÈRES ERREURS (5 min) :"
echo "-------------------------------------------"
ERROR_COUNT=$(docker logs --since 5m airsoft-backend 2>&1 | grep -i "error\|exception\|failed" | wc -l)
if [ $ERROR_COUNT -gt 0 ]; then
    echo "🔴 Backend : $ERROR_COUNT erreur(s) détectée(s)"
    docker logs --since 5m airsoft-backend 2>&1 | grep -i "error\|exception\|failed" | tail -3
else
    echo "✅ Aucune erreur détectée"
fi
echo ""

echo "============================================"
echo "ℹ️  COMMANDES UTILES :"
echo "   Logs en temps réel : docker logs -f airsoft-backend"
echo "   Redémarrer         : docker compose restart"
echo "   Arrêter tout       : docker compose stop"
echo "============================================"
