# 🚀 Guide de Déploiement Version 2.0 sur Serveur

**Date :** 24 Décembre 2025  
**Version :** 2.0 (avec Sidebar, Lightning Tags, Rappels Automatiques, Candidatures)  
**Méthode :** Déploiement via Git clone

---

## 📋 Prérequis

**Serveur :**
- ✅ Serveur Linux (Ubuntu 20.04+ / Debian 11+ recommandé)
- ✅ Accès SSH avec droits sudo
- ✅ Docker et Docker Compose installés
- ✅ Nom de domaine pointant vers votre serveur

**Configuration Gmail pour les emails :**
- ✅ Compte Gmail pour envoyer les emails
- ✅ Mot de passe d'application Gmail (voir [guide Google](https://support.google.com/accounts/answer/185833))

**Cloudflare (optionnel mais recommandé) :**
- ✅ Compte Cloudflare gratuit
- ✅ Domaine configuré dans Cloudflare
- ✅ Token API Cloudflare (pour SSL automatique)

---

## 🔌 ÉTAPE 1 : Connexion SSH

Depuis PowerShell sur votre PC Windows :

```powershell
ssh utilisateur@votre-serveur.com
# Entrez votre mot de passe
```

---

## 📂 ÉTAPE 2 : Vérifier les Prérequis Système

**Sur le serveur (SSH) :**

```bash
# Vérifier que Docker est installé
docker --version
# Résultat attendu : Docker version 20.10.x ou supérieur

# Vérifier que Docker Compose est installé
docker compose version
# Résultat attendu : Docker Compose version v2.x.x ou supérieur

# Vérifier que Git est installé
git --version
# Résultat attendu : git version 2.x.x ou supérieur
```

**⚠️ Si Docker n'est pas installé :**
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Se reconnecter pour appliquer les permissions
exit
# Puis reconnectez-vous en SSH
```

**⚠️ Si Git n'est pas installé :**
```bash
sudo apt update
sudo apt install git -y
```

---

## � ÉTAPE 3 : Cloner le Projet depuis GitHub

**Sur le serveur (SSH) :**

```bash
# Naviguer dans votre répertoire home
cd ~

# Cloner le repository (remplacez l'URL par votre repository)
git clone https://github.com/votre-organisation/airsoft-manager.git
cd airsoft-manager

# Vérifier que le clonage a réussi
ls -la
```

**✅ Projet cloné avec succès !** Vous devriez voir les dossiers :
- `backend/` - API FastAPI
- `frontend/` - Interface React
- `docker/` - Fichiers Docker
- `config/` - Configuration Caddy
- `docs/` - Documentation

---

## 🔄 ÉTAPE 4 : Configurer les Variables d'Environnement

**Créer le fichier `.env` principal :**

```bash
cd ~/airsoft-manager

# Copier le template d'exemple
cp .env.example .env

# Éditer le fichier
nano .env
```

**Variables à configurer dans `.env` :**

```bash
# === BASE DE DONNÉES ===
POSTGRES_DB=airsoft_db
POSTGRES_USER=airsoft_user
POSTGRES_PASSWORD=VotreMotDePasseSecuriseIci123!  # ⚠️ CHANGEZ-MOI !

# === SÉCURITÉ ===
SECRET_KEY=genere_une_cle_secrete_aleatoire_64_caracteres  # ⚠️ CHANGEZ-MOI !

# === SMTP - CONFIGURATION EMAIL (Gmail) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com  # ⚠️ Votre Gmail
SMTP_PASSWORD=votre_mot_de_passe_application  # ⚠️ Mot de passe app Gmail
EMAIL_FROM=votre-email@gmail.com  # ⚠️ Adresse expéditeur

# === ADMIN PAR DÉFAUT ===
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123  # ⚠️ Changez via l'interface après installation
ADMIN_EMAIL=votre-email@gmail.com

# === APPLICATION ===
APP_URL=https://votre-domaine.com  # ⚠️ Votre domaine

# === CLOUDFLARE (pour SSL automatique) ===
CLOUDFLARE_API_TOKEN=votre_token_cloudflare  # ⚠️ Token API Cloudflare
```

**🔑 Générer une SECRET_KEY sécurisée :**
```bash
# Générer une clé aléatoire de 64 caractères
openssl rand -hex 32
# Copiez le résultat dans SECRET_KEY
```

**📧 Obtenir un mot de passe d'application Gmail :**
1. Allez sur https://myaccount.google.com/security
2. Activez la validation en 2 étapes si ce n'est pas fait
3. Allez dans "Mots de passe des applications"
4. Générez un mot de passe pour "Autre (nom personnalisé)"
5. Copiez le mot de passe (16 caractères) dans `SMTP_PASSWORD`

**☁️ Obtenir un token Cloudflare :**
1. Connectez-vous sur https://dash.cloudflare.com
2. Allez dans "My Profile" → "API Tokens"
3. Créez un token avec permissions : `Zone:DNS:Edit` et `Zone:Zone:Read`
4. Copiez le token dans `CLOUDFLARE_API_TOKEN`

**Sauvegarder et quitter :**
- `Ctrl + O` puis `Entrée` pour sauvegarder
- `Ctrl + X` pour quitter nano

**✅ Vérifier que le fichier est bien configuré :**
```bash
grep -E "SMTP_USER|SECRET_KEY|CLOUDFLARE" .env | grep -v "^#"
# Vous devriez voir vos valeurs (pas les exemples)
```

---

## 🏗️ ÉTAPE 5 : Configurer Caddy (Reverse Proxy SSL)

**Éditer le Caddyfile :**

```bash
cd ~/airsoft-manager
nano config/Caddyfile
```

**Remplacer `votre-domaine.com` par votre domaine réel :**

```Caddyfile
votre-domaine.com {  # ⚠️ CHANGEZ-MOI : exemple.com
    # Le reste du fichier reste identique
    ...
}
```

**Sauvegarder :** `Ctrl + O`, `Entrée`, `Ctrl + X`

**✅ Configuration Caddy terminée !** Caddy gérera automatiquement le SSL via Cloudflare

---

## 🐳 ÉTAPE 6 : Build des Containers Docker

```bash
cd docker/compose

# Build de tous les containers avec la nouvelle version
docker compose -f docker-compose.prod.yml build --no-cache

# Cela va prendre 5-10 minutes
# Vous verrez :
# [+] Building backend...
# [+] Building frontend...
```

**⏱️ Patience...** Le build peut prendre quelques minutes.

---

## 🚀 ÉTAPE 7 : Démarrer l'Application

```bash
# Démarrer tous les services
docker compose -f docker-compose.prod.yml up -d

# Vérifier que tout démarre
docker compose -f docker-compose.prod.yml ps

# Attendre 30 secondes que tout s'initialise
sleep 30
```

**✅ Services attendus :**
- `airsoft-db` : healthy
- `airsoft-backend` : running
- `airsoft-frontend` : running
- `airsoft-caddy` : running

---

## 🔍 ÉTAPE 8 : Vérifications Post-Déploiement

### 10.1 Vérifier les Logs Backend

```bash
# Logs du backend
docker logs airsoft-backend --tail 50

# Rechercher le scheduler
docker logs airsoft-backend | grep "Scheduler"
```

**✅ Messages attendus :**
```
============================================================
🚀 DÉMARRAGE DE L'APPLICATION
============================================================
✅ Scheduler démarré - Rappels automatiques configurés pour 9h00 chaque jour
📅 Job planifié: Envoi automatique des rappels - Prochaine exécution: 2025-12-24 09:00:00
============================================================
```

### 10.2 Vérifier les Logs Frontend

```bash
docker logs airsoft-frontend --tail 20
```

**✅ Message attendu :** Nginx démarré sans erreur

### 10.3 Vérifier la Base de Données

```bash
# Se connecter à la base
docker exec -it airsoft-db psql -U airsoft_user -d airsoft_db

# Lister les tables
\dt

# Vous devriez voir les nouvelles tables :
# - nfc_tags
# - membership_applications
# - pricing_settings
# - partner_associations
# - rule_versions
# - games (avec colonne reminder_sent)

# Quitter
\q
```

### 10.4 Tester l'Accès Web

```bash
# Tester l'API
curl http://localhost:8000/api/health

# Devrait retourner : {"status":"ok"}
```

**Depuis votre navigateur :**
- Accédez à : `https://votredomaine.com`
- Page d'accueil doit s'afficher
- Accédez à : `https://votredomaine.com/admin/login`

**Credentials par défaut :**
- Username : `admin`
- Password : `admin123`

**⚠️ IMPORTANT : Changez le mot de passe immédiatement via l'onglet "🔐 Mot de passe" !**

---

## ✅ ÉTAPE 9 : Explorer les Fonctionnalités

Dans l'interface admin, vérifiez que vous voyez bien :

- [ ] **Sidebar verticale** avec 10 onglets sur la gauche
- [ ] **Onglet "⚡ Lightning Tags"** - Nouveau
- [ ] **Onglet "👥 Candidatures"** - Nouveau
- [ ] **Onglet "💳 Paiement"** avec 3 sous-onglets
- [ ] **Statistiques** avec calcul du revenu
- [ ] **Création de partie** avec champs nom/date/description

### Test Rapide des Nouvelles Features

1. **Lightning Tags :**
   - Allez dans "⚡ Lightning Tags"
   - Créez un tag test : `LT-001`
   - Vérifiez qu'il apparaît comme "Disponible"

2. **Candidatures :**
   - Allez dans "👥 Candidatures"
   - Badge devrait afficher `0`

3. **Paiement :**
   - Allez dans "💳 Paiement"
   - Onglet "Types de paiement" : devrait avoir les types par défaut
   - Onglet "Tarifs PAF" : 5€ / 7€ / 9€

4. **Rappels Automatiques :**
   ```bash
   # Retour au terminal SSH
   docker logs airsoft-backend | grep "Prochaine exécution"
   ```
   Devrait afficher : `Prochaine exécution: 2025-12-24 09:00:00`

---

## 🎉 ÉTAPE 10 : Configuration Initiale

### 12.1 Changer le Mot de Passe Admin

1. Connexion : `https://votredomaine.com/admin/login`
2. Username : `admin` / Password : `admin123`
3. Clic sur l'onglet **"🔐 Mot de passe"**
4. Entrez un nouveau mot de passe sécurisé
5. Confirmez et sauvegardez

### 12.2 Personnaliser le Site

1. **Logo :** Onglet "🎨 Logo" → Upload votre logo
2. **Titre :** Onglet "⚙️ Personnalisation" → Titre du terrain
3. **Description :** Message d'accueil personnalisé
4. **Règlement :** Onglet "📖 Règles" → Éditer les 5 sections

### 12.3 Configurer les Tarifs

1. Onglet **"💳 Paiement"**
2. Sous-onglet **"Associations Partenaires"** :
   - Ajoutez vos associations partenaires
3. Sous-onglet **"Tarifs PAF"** :
   - Ajustez les prix si nécessaire (défaut : 5€ / 7€ / 9€)

### 12.4 Créer les Lightning Tags

1. Onglet **"⚡ Lightning Tags"**
2. Créez vos tags : `LT-001`, `LT-002`, etc.
3. Activez-les tous

---

## 🔧 Commandes Utiles

### Voir les Logs en Temps Réel

```bash
# Tous les services
docker compose -f docker-compose.prod.yml logs -f

# Backend uniquement
docker logs -f airsoft-backend

# Frontend uniquement
docker logs -f airsoft-frontend
```

### Redémarrer un Service

```bash
cd docker/compose

# Redémarrer backend
docker compose -f docker-compose.prod.yml restart backend

# Redémarrer frontend
docker compose -f docker-compose.prod.yml restart frontend

# Redémarrer tout
docker compose -f docker-compose.prod.yml restart
```

### Vérifier l'Espace Disque

```bash
# Espace disque total
df -h

# Espace Docker
docker system df
```

### Nettoyer Docker (si besoin)

```bash
# Supprimer images inutilisées
docker image prune -a

# Supprimer volumes inutilisés
docker volume prune

# Nettoyage complet (ATTENTION !)
docker system prune -a --volumes
```

---

## 🆘 Dépannage

### Problème : Le scheduler ne démarre pas

```bash
# Vérifier les logs
docker logs airsoft-backend | grep -i error

# Vérifier que APScheduler est installé
docker exec airsoft-backend pip list | grep apscheduler
```

**Solution :** Rebuild du backend
```bash
docker compose -f docker-compose.prod.yml build backend --no-cache
docker compose -f docker-compose.prod.yml up -d backend
```

### Problème : Base de données ne se crée pas

```bash
# Vérifier les logs de la DB
docker logs airsoft-db

# Recréer le volume
docker compose -f docker-compose.prod.yml down
docker volume rm compose_postgres_data
docker compose -f docker-compose.prod.yml up -d
```

### Problème : Frontend n'affiche pas les changements

```bash
# Vider le cache du build
docker compose -f docker-compose.prod.yml build frontend --no-cache
docker compose -f docker-compose.prod.yml up -d frontend

# Vider le cache du navigateur : Ctrl + Shift + R
```

### Problème : SSL/Certificats

```bash
# Vérifier les logs Caddy
docker logs airsoft-caddy

# Vérifier la configuration Cloudflare
cat config/.env | grep CLOUDFLARE
```

---

## 📊 Checklist Finale

Avant de déconnecter :

- [ ] ✅ Tous les containers sont `running` ou `healthy`
- [ ] ✅ Scheduler affiche "Prochaine exécution" dans les logs
- [ ] ✅ Interface admin accessible avec 10 onglets
- [ ] ✅ Mot de passe admin changé
- [ ] ✅ Lightning Tags créés
- [ ] ✅ Tarifs PAF configurés
- [ ] ✅ Logo uploadé
- [ ] ✅ Règlement personnalisé
- [ ] ✅ Test d'inscription fonctionnel
- [ ] ✅ Email de confirmation reçu

---

## 🎉 Déploiement Terminé !

**Version 2.0 déployée avec succès** ✅

**Nouvelles fonctionnalités actives :**
- ✅ Sidebar verticale moderne
- ✅ Lightning Tags NFC
- ✅ Candidatures membres
- ✅ Rappels automatiques J-2 (9h00 quotidien)
- ✅ Système de paiement 3 tarifs
- ✅ Statistiques avec revenu
- ✅ Versioning du règlement

**Prochaine exécution des rappels :** Demain à 9h00

---

## 📞 Support

En cas de problème, vérifiez :
1. **[GUIDE_COMPLET.md](GUIDE_COMPLET.md)** - Documentation complète
2. **[docs/deploiement/GUIDE_DEPLOIEMENT.md](docs/deploiement/GUIDE_DEPLOIEMENT.md)** - Guide déploiement détaillé
3. **Logs Docker** - `docker logs <nom_container>`

---

**Bon déploiement ! 🚀**

*Dernière mise à jour : 24 Décembre 2025*
