##############################################################################
# Script de switch de thème - Airsoft Manager
# Usage: .\scripts\switch-theme.ps1 [original|military|status]
#
# Exemples:
#   .\scripts\switch-theme.ps1 military   → Appliquer le thème militaire
#   .\scripts\switch-theme.ps1 original   → Revenir au thème original
#   .\scripts\switch-theme.ps1 status     → Voir le thème actuel
##############################################################################

param(
    [Parameter(Position=0)]
    [ValidateSet("original", "military", "status")]
    [string]$Theme = "status"
)

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path "$ProjectRoot\frontend\src\App.css")) {
    $ProjectRoot = Split-Path -Parent $PSScriptRoot
    if (-not (Test-Path "$ProjectRoot\frontend\src\App.css")) {
        $ProjectRoot = $PSScriptRoot | Split-Path -Parent
    }
}

$SrcDir = "$ProjectRoot\frontend\src"
$ThemesDir = "$SrcDir\themes"

$cssFiles = @(
    @{ src = "index.css";       dest = "$SrcDir\index.css" },
    @{ src = "App.css";         dest = "$SrcDir\App.css" },
    @{ src = "Header.css";      dest = "$SrcDir\components\Header.css" },
    @{ src = "PendingRegistrations.css";   dest = "$SrcDir\components\PendingRegistrations.css" },
    @{ src = "MembershipApplications.css"; dest = "$SrcDir\components\MembershipApplications.css" },
    @{ src = "LogoManager.css";            dest = "$SrcDir\components\LogoManager.css" },
    @{ src = "EditPlayerModal.css";        dest = "$SrcDir\components\EditPlayerModal.css" },
    @{ src = "PaymentTypesManager.css";    dest = "$SrcDir\components\PaymentTypesManager.css" },
    @{ src = "NFCTagsManager.css";         dest = "$SrcDir\components\NFCTagsManager.css" },
    @{ src = "ChangePassword.css";         dest = "$SrcDir\components\ChangePassword.css" },
    @{ src = "SiteCustomizer.css";         dest = "$SrcDir\components\SiteCustomizer.css" },
    @{ src = "RulesEditor.css";            dest = "$SrcDir\components\RulesEditor.css" }
)

function Get-CurrentTheme {
    $indexCss = Get-Content "$SrcDir\index.css" -Raw
    if ($indexCss -match "Oswald|Rajdhani") {
        return "military"
    } else {
        return "original"
    }
}

if ($Theme -eq "status") {
    $current = Get-CurrentTheme
    Write-Host ""
    Write-Host "  Theme actuel: $current" -ForegroundColor Cyan
    Write-Host "  Themes disponibles: original, military" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Usage: .\scripts\switch-theme.ps1 [original|military]" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

$themeDir = "$ThemesDir\$Theme"

if (-not (Test-Path $themeDir)) {
    Write-Host "Erreur: Le theme '$Theme' n'existe pas dans $ThemesDir" -ForegroundColor Red
    exit 1
}

$current = Get-CurrentTheme
if ($current -eq $Theme) {
    Write-Host "Le theme '$Theme' est deja actif." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "  Switch: $current -> $Theme" -ForegroundColor Cyan
Write-Host ""

$copied = 0
foreach ($file in $cssFiles) {
    $source = "$themeDir\$($file.src)"
    if (Test-Path $source) {
        Copy-Item $source $file.dest -Force
        Write-Host "  [OK] $($file.src)" -ForegroundColor Green
        $copied++
    } else {
        Write-Host "  [--] $($file.src) (non trouve dans le theme)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  $copied fichiers mis a jour." -ForegroundColor Green
Write-Host "  Theme actif: $Theme" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Relancez 'npm start' ou rebuild Docker pour voir les changements." -ForegroundColor Gray
Write-Host ""
