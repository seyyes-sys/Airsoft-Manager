#!/bin/bash
# ============================================
# NETTOYAGE DOCKER
# ============================================
# Nettoie les images, containers et volumes
# inutilisés pour libérer de l'espace
# ============================================

echo "============================================"
echo "🧹 NETTOYAGE DOCKER - AIRSOFT MANAGER"
echo "============================================"
echo ""

# Afficher l'espace actuel
echo "💾 ESPACE DISQUE AVANT NETTOYAGE :"
echo "-------------------------------------------"
docker system df
echo ""

# Demander confirmation
echo "⚠️  Ce script va supprimer :"
echo "   - Images Docker inutilisées"
echo "   - Containers arrêtés"
echo "   - Réseaux non utilisés"
echo "   - Cache de build"
echo ""
echo "⚠️  Les volumes de données seront PRÉSERVÉS"
echo ""
read -p "Continuer ? (oui/non) : " confirmation

if [ "$confirmation" != "oui" ]; then
    echo "❌ Nettoyage annulé"
    exit 0
fi

echo ""
echo "🧹 Nettoyage en cours..."
echo ""

# Arrêter les containers arrêtés
echo "⏳ Suppression des containers arrêtés..."
STOPPED_COUNT=$(docker ps -a -q -f status=exited | wc -l)
if [ $STOPPED_COUNT -gt 0 ]; then
    docker container prune -f
    echo "   ✅ $STOPPED_COUNT container(s) supprimé(s)"
else
    echo "   ✅ Aucun container arrêté"
fi
echo ""

# Supprimer les images inutilisées
echo "⏳ Suppression des images inutilisées..."
docker image prune -a -f
echo "   ✅ Images inutilisées supprimées"
echo ""

# Nettoyer les réseaux
echo "⏳ Suppression des réseaux non utilisés..."
docker network prune -f
echo "   ✅ Réseaux inutilisés supprimés"
echo ""

# Nettoyer le cache de build
echo "⏳ Suppression du cache de build..."
docker builder prune -f
echo "   ✅ Cache de build nettoyé"
echo ""

# Afficher l'espace après
echo "💾 ESPACE DISQUE APRÈS NETTOYAGE :"
echo "-------------------------------------------"
docker system df
echo ""

# Calculer l'espace libéré
echo "✅ NETTOYAGE TERMINÉ !"
echo ""
echo "============================================"
echo "ℹ️  NOTES :"
echo "   - Les volumes de données sont préservés"
echo "   - Les images des containers en cours sont préservées"
echo "   - Un rebuild sera nécessaire au prochain démarrage"
echo ""
echo "Pour un nettoyage COMPLET incluant les volumes :"
echo "   docker system prune -a --volumes"
echo "   ⚠️  ATTENTION : Supprimera TOUTES les données !"
echo "============================================"
