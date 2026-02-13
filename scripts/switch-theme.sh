#!/bin/bash
##############################################################################
# Script de switch de thème - Airsoft Manager
# Usage: ./scripts/switch-theme.sh [original|military|status]
##############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_DIR/frontend/src"
THEMES_DIR="$SRC_DIR/themes"

CSS_FILES=(
    "index.css:$SRC_DIR/index.css"
    "App.css:$SRC_DIR/App.css"
    "Header.css:$SRC_DIR/components/Header.css"
    "PendingRegistrations.css:$SRC_DIR/components/PendingRegistrations.css"
    "MembershipApplications.css:$SRC_DIR/components/MembershipApplications.css"
    "LogoManager.css:$SRC_DIR/components/LogoManager.css"
    "EditPlayerModal.css:$SRC_DIR/components/EditPlayerModal.css"
    "PaymentTypesManager.css:$SRC_DIR/components/PaymentTypesManager.css"
    "NFCTagsManager.css:$SRC_DIR/components/NFCTagsManager.css"
    "ChangePassword.css:$SRC_DIR/components/ChangePassword.css"
    "SiteCustomizer.css:$SRC_DIR/components/SiteCustomizer.css"
    "RulesEditor.css:$SRC_DIR/components/RulesEditor.css"
)

get_current_theme() {
    if grep -q "Oswald\|Rajdhani" "$SRC_DIR/index.css" 2>/dev/null; then
        echo "military"
    else
        echo "original"
    fi
}

THEME="${1:-status}"

if [ "$THEME" = "status" ]; then
    CURRENT=$(get_current_theme)
    echo ""
    echo "  Thème actuel: $CURRENT"
    echo "  Thèmes disponibles: original, military"
    echo ""
    echo "  Usage: ./scripts/switch-theme.sh [original|military]"
    echo ""
    exit 0
fi

if [ "$THEME" != "original" ] && [ "$THEME" != "military" ]; then
    echo "Usage: $0 [original|military|status]"
    exit 1
fi

THEME_DIR="$THEMES_DIR/$THEME"

if [ ! -d "$THEME_DIR" ]; then
    echo "Erreur: Le thème '$THEME' n'existe pas"
    exit 1
fi

CURRENT=$(get_current_theme)
if [ "$CURRENT" = "$THEME" ]; then
    echo "Le thème '$THEME' est déjà actif."
    exit 0
fi

echo ""
echo "  Switch: $CURRENT → $THEME"
echo ""

COPIED=0
for entry in "${CSS_FILES[@]}"; do
    SRC="${entry%%:*}"
    DEST="${entry##*:}"
    SOURCE="$THEME_DIR/$SRC"
    if [ -f "$SOURCE" ]; then
        cp "$SOURCE" "$DEST"
        echo "  ✓ $SRC"
        ((COPIED++))
    else
        echo "  - $SRC (non trouvé)"
    fi
done

echo ""
echo "  $COPIED fichiers mis à jour."
echo "  Thème actif: $THEME"
echo ""
echo "  Relancez 'npm start' ou rebuild Docker pour voir les changements."
echo ""
