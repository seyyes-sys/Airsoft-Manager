#!/bin/bash
# ============================================
# RESTAURATION BASE DE DONNÉES POSTGRESQL
# ============================================
# Restaure une sauvegarde compressée
# ATTENTION : Écrase la base existante !
# ============================================

set -e  # Arrêt en cas d'erreur

# Configuration
BACKUP_DIR="/backup"
CONTAINER_NAME="airsoft-db"
DB_NAME="airsoft_db"
DB_USER="airsoft_user"

# Vérifier l'argument
if [ $# -eq 0 ]; then
    echo "❌ ERREUR : Aucun fichier de backup spécifié"
    echo ""
    echo "Usage : bash restore.sh <fichier_backup.sql.gz>"
    echo ""
    echo "Backups disponibles :"
    ls -lht "$BACKUP_DIR"/airsoft_db_backup_*.sql.gz 2>/dev/null | head -10 | awk '{print "   📦", $9, "-", $5, "-", $6, $7, $8}'
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier que le fichier existe
if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    # Essayer sans le chemin complet
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ ERREUR : Fichier $BACKUP_FILE introuvable"
        echo ""
        echo "Backups disponibles dans $BACKUP_DIR :"
        ls -lht "$BACKUP_DIR"/airsoft_db_backup_*.sql.gz 2>/dev/null | head -10 | awk '{print "   📦", $9}'
        exit 1
    fi
    BACKUP_PATH="$BACKUP_FILE"
else
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
fi

echo "============================================"
echo "♻️  RESTAURATION BASE DE DONNÉES"
echo "============================================"
echo ""
echo "📅 Date : $(date '+%d/%m/%Y %H:%M:%S')"
echo "🗃️  Base : $DB_NAME"
echo "📦 Backup : $(basename $BACKUP_PATH)"
echo "💾 Taille : $(du -h "$BACKUP_PATH" | cut -f1)"
echo ""

# Vérifier que le container existe et tourne
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ ERREUR : Container $CONTAINER_NAME n'est pas démarré"
    exit 1
fi

# Confirmation
echo "⚠️  ATTENTION : Cette opération va ÉCRASER la base actuelle !"
echo ""
read -p "Êtes-vous sûr de vouloir continuer ? (oui/non) : " confirmation

if [ "$confirmation" != "oui" ]; then
    echo "❌ Restauration annulée"
    exit 0
fi

echo ""
echo "⏳ Arrêt du backend pour éviter les connexions..."
docker stop airsoft-backend 2>/dev/null || echo "   ⚠️  Backend déjà arrêté"

echo "⏳ Suppression de la base existante..."
docker exec -t "$CONTAINER_NAME" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres

echo "⏳ Recréation de la base..."
docker exec -t "$CONTAINER_NAME" psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" postgres

echo "⏳ Restauration des données..."
gunzip -c "$BACKUP_PATH" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

# Vérifier la réussite
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ RESTAURATION RÉUSSIE !"
    echo ""
    
    # Compter les tables
    TABLE_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    echo "📊 Tables restaurées : $TABLE_COUNT"
    
    # Redémarrer le backend
    echo ""
    echo "⏳ Redémarrage du backend..."
    docker start airsoft-backend
    
    echo ""
    echo "✅ Restauration terminée avec succès !"
    echo ""
    echo "ℹ️  Vérifiez que l'application fonctionne :"
    echo "   curl http://localhost:8000/api/health"
    echo "   ou visitez : http://localhost:3000"
else
    echo ""
    echo "❌ ERREUR lors de la restauration"
    echo ""
    echo "⚠️  La base peut être dans un état incohérent"
    echo "   Essayez de redémarrer tous les containers :"
    echo "   cd docker/compose && docker compose restart"
    exit 1
fi

echo ""
echo "============================================"
