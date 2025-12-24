# ⚡ Commandes Publication GitHub - Aide-Mémoire

**Première publication avec compte personnel**

---

## 🎯 Préparation (Une seule fois)

### 1. Créer Token GitHub
```
1. https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Cocher: "repo"
4. Copier le token (ghp_...)
```

### 2. Configurer Git Local
```powershell
cd C:\airsoft-manager
git config user.name "Votre Nom"
git config user.email "votre-email@example.com"
```

---

## 📦 Publication

### 3. Vérifier Sécurité
```powershell
git status --ignored | Select-String ".env"
# Résultat : .env doit être dans "Ignored files"
```

### 4. Ajouter Tous les Fichiers
```powershell
git add .
git status
# Vérifier qu'aucun .env ou mot de passe n'apparaît
```

### 5. Créer Commit
```powershell
git commit -m "Initial release v2.0: Application complète de gestion de terrain d'airsoft

Fonctionnalités: Inscription en ligne, Lightning Tags NFC, Candidatures membres, 
Rappels J-2, Paiements intelligents, Stats avancées, Interface admin moderne

Installation simplifiée: Scripts auto (install.ps1/sh), Config en 5 questions

Stack: Python/FastAPI, React, PostgreSQL, Docker, APScheduler
Documentation: README, GUIDE_COMPLET, INSTALLATION_SIMPLE, 25+ guides
Licence: MIT"
```

### 6. Créer Repository sur GitHub
```
https://github.com/new
Nom: airsoft-manager
Description: Application web complète pour la gestion d'un terrain d'airsoft
Visibility: Public
NE PAS cocher: README, .gitignore, License
```

### 7. Connecter et Publier
```powershell
git remote add origin https://github.com/VOTRE-USERNAME/airsoft-manager.git
git branch -M main
git push -u origin main
```

### 8. Authentification
```
Username: VOTRE-USERNAME
Password: [COLLEZ VOTRE TOKEN]
```

---

## ✅ Vérification

```
https://github.com/VOTRE-USERNAME/airsoft-manager
- README affiché ✅
- .env NON visible ✅
- Licence MIT ✅
```

---

## 🔧 Commandes Utiles

```powershell
# Vérifier config
git config user.name
git config user.email

# Vérifier remote
git remote -v

# Voir commit
git log --oneline

# Status complet
git status --ignored
```

---

## ❌ En Cas d'Erreur

### Token refusé
```powershell
# Régénérer: https://github.com/settings/tokens
```

### Remote exists
```powershell
git remote remove origin
git remote add origin https://github.com/VOTRE-USERNAME/airsoft-manager.git
```

### .env visible sur GitHub
```powershell
echo ".env" >> .gitignore
git rm --cached .env
git add .gitignore
git commit -m "fix: Remove .env"
git push
# PUIS: Changer tous vos mots de passe !
```

---

**🚀 C'est tout ! Temps total: 15-20 minutes**
