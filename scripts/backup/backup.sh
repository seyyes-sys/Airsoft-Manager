#!/bin/bash
# ============================================
# BACKUP BASE DE DONNÉES POSTGRESQL
# ============================================
# Sauvegarde complète de la base airsoft_db
# Avec compression et horodatage
# ============================================

set -e  # Arrêt en cas d'erreur

# Configuration
BACKUP_DIR="/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="airsoft_db_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="airsoft-db"
DB_NAME="airsoft_db"
DB_USER="airsoft_user"

# Créer le répertoire de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "============================================"
echo "🗄️  BACKUP BASE DE DONNÉES AIRSOFT MANAGER"
echo "============================================"
echo ""
echo "📅 Date : $(date '+%d/%m/%Y %H:%M:%S')"
echo "🗃️  Base : $DB_NAME"
echo "📦 Fichier : $BACKUP_FILE"
echo ""

# Vérifier que le container existe
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ ERREUR : Container $CONTAINER_NAME introuvable"
    exit 1
fi

# Vérifier que le container est en cours d'exécution
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ ERREUR : Container $CONTAINER_NAME n'est pas démarré"
    exit 1
fi

# Sauvegarde
echo "⏳ Sauvegarde en cours..."
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Vérifier la réussite
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    echo ""
    echo "✅ BACKUP RÉUSSI !"
    echo "📁 Emplacement : ${BACKUP_DIR}/${BACKUP_FILE}"
    echo "💾 Taille : $BACKUP_SIZE"
    echo ""
    
    # Lister les 5 derniers backups
    echo "📋 Derniers backups disponibles :"
    ls -lht "$BACKUP_DIR"/airsoft_db_backup_*.sql.gz | head -5 | awk '{print "   📦", $9, "-", $5}'
    echo ""
    
    # Nettoyer les backups de plus de 30 jours
    echo "🧹 Nettoyage des backups > 30 jours..."
    find "$BACKUP_DIR" -name "airsoft_db_backup_*.sql.gz" -mtime +30 -delete
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "airsoft_db_backup_*.sql.gz" -mtime +30 | wc -l)
    echo "   ✅ $DELETED_COUNT ancien(s) backup(s) supprimé(s)"
    echo ""
    
    echo "✅ Backup terminé avec succès !"
else
    echo ""
    echo "❌ ERREUR lors du backup"
    exit 1
fi

echo ""
echo "============================================"
echo "Pour restaurer ce backup :"
echo "   bash restore.sh ${BACKUP_FILE}"
echo "============================================"
