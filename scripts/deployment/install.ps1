# ============================================
# AIRSOFT MANAGER - INSTALLATION AUTOMATIQUE
# ============================================
# Script d'installation pour Windows
# Version 2.0 - 24 Décembre 2025
# ============================================

# Fonction pour afficher des messages colorés
function Write-ColorMessage {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Title {
    param([string]$Title)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# En-tête
Clear-Host
Write-ColorMessage "╔═══════════════════════════════════════════════════════╗" "Cyan"
Write-ColorMessage "║                                                       ║" "Cyan"
Write-ColorMessage "║           🎯 AIRSOFT MANAGER v2.0                     ║" "Cyan"
Write-ColorMessage "║        Installation Automatique Windows              ║" "Cyan"
Write-ColorMessage "║                                                       ║" "Cyan"
Write-ColorMessage "╚═══════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

# Vérification des prérequis
Write-Title "Étape 1/6 : Vérification des prérequis"

$allOk = $true

Write-Host "Vérification de Docker..." -NoNewline
if (Test-Command "docker") {
    Write-ColorMessage " ✅ Installé" "Green"
    $dockerVersion = docker --version
    Write-Host "  → $dockerVersion" -ForegroundColor Gray
} else {
    Write-ColorMessage " ❌ Non installé" "Red"
    Write-ColorMessage "  → Installez Docker Desktop : https://www.docker.com/products/docker-desktop" "Yellow"
    $allOk = $false
}

Write-Host "Vérification de Docker Compose..." -NoNewline
if (Test-Command "docker") {
    $composeTest = docker compose version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage " ✅ Installé" "Green"
        Write-Host "  → $composeTest" -ForegroundColor Gray
    } else {
        Write-ColorMessage " ❌ Non installé" "Red"
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host ""
    Write-ColorMessage "⚠️  Des prérequis sont manquants. Installez-les et relancez ce script." "Red"
    Write-Host ""
    Write-Host "Appuyez sur une touche pour quitter..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-ColorMessage "✅ Tous les prérequis sont installés !" "Green"
Start-Sleep -Seconds 2

# Questions interactives
Write-Title "Étape 2/6 : Configuration de votre terrain"

$config = @{}

Write-ColorMessage "📝 Répondez aux questions suivantes pour configurer votre application :" "Yellow"
Write-Host ""

# Nom du terrain
Write-Host "Nom de votre terrain d'airsoft :" -ForegroundColor White
Write-Host "  Exemple : Airsoft Tactical Arena" -ForegroundColor Gray
$config.TERRAIN_NAME = Read-Host "→"
if ([string]::IsNullOrWhiteSpace($config.TERRAIN_NAME)) {
    $config.TERRAIN_NAME = "Mon Terrain d'Airsoft"
}

Write-Host ""

# Email Gmail
Write-ColorMessage "📧 Configuration Email (Gmail recommandé)" "White"
Write-Host "  Les emails servent à envoyer les confirmations d'inscription" -ForegroundColor Gray
Write-Host "  et les rappels automatiques J-2 avant les parties." -ForegroundColor Gray
Write-Host ""
Write-Host "Adresse email Gmail :" -ForegroundColor White
$config.SMTP_USERNAME = Read-Host "→"

Write-Host ""

# Mot de passe application Gmail
Write-ColorMessage "🔑 Mot de passe d'application Gmail" "White"
Write-Host "  ⚠️  Pas votre mot de passe Gmail habituel !" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Comment obtenir un mot de passe d'application :" -ForegroundColor Gray
Write-Host "  1. Allez sur https://myaccount.google.com/" -ForegroundColor Gray
Write-Host "  2. Cliquez 'Sécurité' → 'Validation en 2 étapes' (activez-la si besoin)" -ForegroundColor Gray
Write-Host "  3. Cliquez 'Mots de passe des applications'" -ForegroundColor Gray
Write-Host "  4. Créez un nouveau mot de passe pour 'Autre application'" -ForegroundColor Gray
Write-Host "  5. Copiez le mot de passe de 16 caractères généré" -ForegroundColor Gray
Write-Host ""
Write-Host "Mot de passe d'application Gmail :" -ForegroundColor White
$config.SMTP_PASSWORD = Read-Host "→" -AsSecureString
$config.SMTP_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($config.SMTP_PASSWORD))

Write-Host ""

# Email admin
Write-Host "Email administrateur (pour recevoir les notifications) :" -ForegroundColor White
Write-Host "  Exemple : admin@monterrain.fr" -ForegroundColor Gray
$config.ADMIN_EMAIL = Read-Host "→"
if ([string]::IsNullOrWhiteSpace($config.ADMIN_EMAIL)) {
    $config.ADMIN_EMAIL = $config.SMTP_USERNAME
}

Write-Host ""

# Mot de passe admin
Write-ColorMessage "🔐 Mot de passe administrateur" "White"
Write-Host "  Choisissez un mot de passe sécurisé pour l'interface admin" -ForegroundColor Gray
Write-Host ""
Write-Host "Mot de passe admin (minimum 6 caractères) :" -ForegroundColor White
$config.ADMIN_PASSWORD = Read-Host "→" -AsSecureString
$config.ADMIN_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($config.ADMIN_PASSWORD))

Write-Host ""

# Type d'installation
Write-Title "Étape 3/6 : Type d'installation"
Write-Host "Choisissez le type d'installation :" -ForegroundColor White
Write-Host ""
Write-Host "  1) Installation locale (test sur cet ordinateur)" -ForegroundColor Cyan
Write-Host "     → Accessible sur http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "  2) Installation production (sur un serveur avec domaine)" -ForegroundColor Cyan
Write-Host "     → Nécessite un nom de domaine et Cloudflare" -ForegroundColor Gray
Write-Host ""

do {
    $installType = Read-Host "Votre choix (1 ou 2)"
} while ($installType -ne "1" -and $installType -ne "2")

$isProduction = $installType -eq "2"

if ($isProduction) {
    Write-Host ""
    Write-Host "Nom de domaine (ex: airsoft.monterrain.fr) :" -ForegroundColor White
    $config.DOMAIN = Read-Host "→"
    
    Write-Host ""
    Write-ColorMessage "☁️  Token API Cloudflare" "White"
    Write-Host "  Nécessaire pour générer automatiquement les certificats SSL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Comment obtenir le token :" -ForegroundColor Gray
    Write-Host "  1. Allez sur https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Gray
    Write-Host "  2. Créez un token avec 'Zone.DNS:Edit'" -ForegroundColor Gray
    Write-Host "  3. Copiez le token" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Token Cloudflare :" -ForegroundColor White
    $config.CLOUDFLARE_API_TOKEN = Read-Host "→"
}

# Génération du fichier .env
Write-Title "Étape 4/6 : Génération de la configuration"

Write-Host "Création du fichier de configuration..." -NoNewline

# Générer une SECRET_KEY sécurisée
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$config.SECRET_KEY = [System.BitConverter]::ToString($bytes) -replace '-', ''

# Contenu du fichier .env
$envContent = @"
#============================================
# AIRSOFT MANAGER - Configuration
# Généré automatiquement le $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
#============================================

#============================================
# BASE DE DONNÉES
#============================================
POSTGRES_USER=airsoft_user
POSTGRES_PASSWORD=airsoft_password_$(Get-Random -Minimum 1000 -Maximum 9999)
POSTGRES_DB=airsoft_db
DATABASE_URL=postgresql://airsoft_user:airsoft_password_$(Get-Random -Minimum 1000 -Maximum 9999)@db:5432/airsoft_db

#============================================
# BACKEND API
#============================================
SECRET_KEY=$($config.SECRET_KEY)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=$($config.ADMIN_PASSWORD)

#============================================
# SMTP (GMAIL)
#============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$($config.SMTP_USERNAME)
SMTP_PASSWORD=$($config.SMTP_PASSWORD)
EMAIL_FROM=$($config.SMTP_USERNAME)
ADMIN_EMAIL=$($config.ADMIN_EMAIL)

#============================================
# FRONTEND
#============================================
REACT_APP_API_URL=$(if ($isProduction) { "https://$($config.DOMAIN)" } else { "http://localhost:8000" })

#============================================
# SITE
#============================================
SITE_NAME=$($config.TERRAIN_NAME)
"@

if ($isProduction) {
    $envContent += @"


#============================================
# PRODUCTION (Cloudflare SSL)
#============================================
CLOUDFLARE_API_TOKEN=$($config.CLOUDFLARE_API_TOKEN)
DOMAIN=$($config.DOMAIN)
"@
}

# Créer le répertoire docker/compose si nécessaire
$composeDir = Join-Path $PSScriptRoot "docker\compose"
if (-not (Test-Path $composeDir)) {
    New-Item -ItemType Directory -Path $composeDir -Force | Out-Null
}

# Sauvegarder le fichier .env
$envPath = Join-Path $composeDir ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-ColorMessage " ✅" "Green"
Write-Host "  → Configuration sauvegardée dans : $envPath" -ForegroundColor Gray

# Installation
Write-Title "Étape 5/6 : Installation et démarrage"

Write-ColorMessage "🚀 Démarrage de l'application..." "Yellow"
Write-Host ""

Set-Location $composeDir

if ($isProduction) {
    Write-Host "Mode : Production avec SSL" -ForegroundColor Cyan
    docker compose -f docker-compose.prod.yml up -d --build
} else {
    Write-Host "Mode : Développement local" -ForegroundColor Cyan
    docker compose up -d --build
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-ColorMessage "✅ Installation terminée avec succès !" "Green"
} else {
    Write-Host ""
    Write-ColorMessage "❌ Erreur lors de l'installation" "Red"
    Write-Host "Consultez les logs avec : docker compose logs" -ForegroundColor Yellow
    exit 1
}

# Résumé final
Write-Title "Étape 6/6 : Installation terminée !"

Write-ColorMessage "╔═══════════════════════════════════════════════════════╗" "Green"
Write-ColorMessage "║          ✅ INSTALLATION RÉUSSIE !                    ║" "Green"
Write-ColorMessage "╚═══════════════════════════════════════════════════════╝" "Green"
Write-Host ""

Write-ColorMessage "📌 INFORMATIONS DE CONNEXION" "Cyan"
Write-Host ""

if ($isProduction) {
    Write-Host "🌐 Site public         : " -NoNewline
    Write-ColorMessage "https://$($config.DOMAIN)" "White"
    Write-Host "🔐 Interface admin     : " -NoNewline
    Write-ColorMessage "https://$($config.DOMAIN)/admin/login" "White"
} else {
    Write-Host "🌐 Site public         : " -NoNewline
    Write-ColorMessage "http://localhost:3000" "White"
    Write-Host "🔐 Interface admin     : " -NoNewline
    Write-ColorMessage "http://localhost:3000/admin/login" "White"
    Write-Host "📊 API Documentation   : " -NoNewline
    Write-ColorMessage "http://localhost:8000/docs" "White"
}

Write-Host ""
Write-Host "👤 Nom d'utilisateur   : " -NoNewline
Write-ColorMessage "admin" "White"
Write-Host "🔑 Mot de passe        : " -NoNewline
Write-ColorMessage "(celui que vous avez choisi)" "White"

Write-Host ""
Write-ColorMessage "⚠️  IMPORTANT : Changez votre mot de passe après la première connexion !" "Yellow"
Write-Host "   → Onglet '🔐 Mot de passe' dans l'interface admin" -ForegroundColor Gray

Write-Host ""
Write-ColorMessage "📚 COMMANDES UTILES" "Cyan"
Write-Host ""
Write-Host "  Voir les logs           : " -NoNewline -ForegroundColor Gray
Write-ColorMessage "docker compose logs -f" "White"
Write-Host "  Redémarrer              : " -NoNewline -ForegroundColor Gray
Write-ColorMessage "docker compose restart" "White"
Write-Host "  Arrêter                 : " -NoNewline -ForegroundColor Gray
Write-ColorMessage "docker compose stop" "White"
Write-Host "  Supprimer complètement  : " -NoNewline -ForegroundColor Gray
Write-ColorMessage "docker compose down -v" "White"

Write-Host ""
Write-ColorMessage "📖 Documentation complète : GUIDE_COMPLET.md" "Cyan"

Write-Host ""
Write-Host "Appuyez sur une touche pour terminer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
