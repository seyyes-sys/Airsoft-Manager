# 🚀 Installation Simplifiée - Airsoft Manager v2.0

**Guide pour utilisateurs débutants** - Aucune connaissance technique requise !

---

## 📋 Ce dont vous avez besoin

Avant de commencer, préparez :

1. **Un ordinateur** (Windows, Linux ou MacOS)
2. **Une connexion Internet**
3. **Un compte Gmail** (gratuit) pour envoyer les emails
4. **15 minutes de votre temps** ⏱️

---

## 🎯 Installation en 3 étapes

### Étape 1️⃣ : Installer Docker Desktop

Docker permet de faire tourner l'application facilement, sans configuration compliquée.

#### Windows / MacOS :

1. Allez sur [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Téléchargez **Docker Desktop**
3. Installez-le (double-clic sur le fichier téléchargé)
4. Redémarrez votre ordinateur
5. Lancez Docker Desktop (une icône 🐳 apparaît dans la barre des tâches)

#### Linux (Ubuntu/Debian) :

```bash
# Copiez-collez ces commandes dans le terminal
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Redémarrez votre ordinateur après l'installation.

---

### Étape 2️⃣ : Préparer votre compte Gmail

L'application envoie des emails automatiques (confirmations, rappels J-2). Gmail est gratuit et facile à configurer.

#### A. Activer la validation en 2 étapes

1. Allez sur [https://myaccount.google.com/](https://myaccount.google.com/)
2. Cliquez sur **"Sécurité"** (menu gauche)
3. Trouvez **"Validation en 2 étapes"**
4. Cliquez sur **"Activer"** et suivez les instructions

#### B. Créer un mot de passe d'application

1. Restez dans **"Sécurité"**
2. Cliquez sur **"Mots de passe des applications"** (tout en bas)
3. Sélectionnez **"Autre (nom personnalisé)"**
4. Tapez : `Airsoft Manager`
5. Cliquez sur **"Générer"**
6. **IMPORTANT** : Copiez le mot de passe de 16 caractères affiché
   - Il ressemble à : `abcd efgh ijkl mnop`
   - **Gardez-le précieusement**, vous en aurez besoin à l'étape suivante !

---

### Étape 3️⃣ : Installer Airsoft Manager

C'est parti ! L'installation est **100% automatique**.

#### Sur Windows :

1. Téléchargez le projet sur votre ordinateur
2. Ouvrez le dossier `airsoft-manager`
3. **Clic-droit** sur le fichier `install.ps1`
4. Sélectionnez **"Exécuter avec PowerShell"**
5. Répondez aux questions qui s'affichent :

```
Nom de votre terrain : Mon Terrain d'Airsoft
Email Gmail : votre-email@gmail.com
Mot de passe d'application : [collez le mot de passe copié précédemment]
Email admin : admin@monterrain.fr
Mot de passe admin : [choisissez un mot de passe fort]
Type d'installation : 1 (pour tester localement)
```

6. Patientez 5-10 minutes pendant l'installation ☕

#### Sur Linux / MacOS :

1. Téléchargez le projet sur votre ordinateur
2. Ouvrez un **Terminal**
3. Allez dans le dossier du projet :
   ```bash
   cd ~/airsoft-manager
   ```
4. Rendez le script exécutable :
   ```bash
   chmod +x install.sh
   ```
5. Lancez l'installation :
   ```bash
   ./install.sh
   ```
6. Répondez aux questions (même chose que Windows)
7. Patientez 5-10 minutes ☕

---

## ✅ C'est terminé !

Une fois l'installation terminée, vous verrez :

```
╔═══════════════════════════════════════════════════════╗
║          ✅ INSTALLATION RÉUSSIE !                    ║
╚═══════════════════════════════════════════════════════╝

🌐 Site public         : http://localhost:3000
🔐 Interface admin     : http://localhost:3000/admin/login

👤 Nom d'utilisateur   : admin
🔑 Mot de passe        : (celui que vous avez choisi)
```

### Accéder à l'application

1. Ouvrez votre navigateur (Chrome, Firefox, Edge...)
2. Allez sur **http://localhost:3000**
3. 🎉 **Votre site est en ligne !**

### Se connecter en tant qu'administrateur

1. Cliquez sur le bouton **"Admin"** (en haut à droite)
2. Utilisez :
   - **Nom d'utilisateur** : `admin`
   - **Mot de passe** : celui que vous avez choisi
3. Changez immédiatement votre mot de passe via l'onglet **"🔐 Mot de passe"**

---

## 🎨 Personnaliser votre site

Une fois connecté en admin, personnalisez votre terrain :

### 1. Ajouter votre logo
- Onglet **"🖼️ Logo"**
- Cliquez **"Choisir un fichier"** et sélectionnez votre logo
- Formats acceptés : PNG, JPG, SVG

### 2. Changer le nom et la description
- Onglet **"⚙️ Personnalisation"**
- Modifiez le titre (ex: "Airsoft Tactical Arena")
- Changez le message d'accueil
- Choisissez une couleur thématique

### 3. Configurer les tarifs
- Onglet **"💳 Paiement"** → **"Tarifs"**
- Définissez vos 3 tarifs :
  - Association partenaire (ex: 5€)
  - Autre association (ex: 7€)
  - Freelance (ex: 9€)

### 4. Ajouter vos associations partenaires
- Onglet **"💳 Paiement"** → **"Associations"**
- Cliquez **"Ajouter"**
- Tapez le nom de l'association (ex: "Airsoft Team 31")

### 5. Modifier le règlement
- Onglet **"📜 Règlement"**
- Modifiez les 5 sections
- Cliquez **"Sauvegarder"**

---

## 📅 Créer votre première partie

1. Allez dans **"➕ Créer une partie"**
2. Remplissez :
   - **Nom** : Partie du 15 Janvier 2026
   - **Date** : 15/01/2026
   - **Description** : Scénario capture du drapeau
3. Cliquez **"Créer la partie"**
4. 🎉 **C'est fait !** Les joueurs peuvent maintenant s'inscrire

---

## ❓ Questions Fréquentes (FAQ)

### Je n'arrive pas à accéder au site

**Vérifiez que Docker Desktop est lancé** :
- Windows/MacOS : Regardez l'icône 🐳 dans la barre des tâches
- Linux : `sudo systemctl status docker`

**Vérifiez que les containers tournent** :
```bash
cd docker/compose
docker compose ps
```

Vous devriez voir 4 services "Up" (running).

### Les emails ne partent pas

1. Vérifiez votre mot de passe d'application Gmail
2. Assurez-vous que la validation en 2 étapes est activée
3. Consultez les logs :
   ```bash
   docker compose logs backend | grep -i smtp
   ```

### Je veux arrêter l'application

```bash
cd docker/compose
docker compose stop
```

Pour la redémarrer :
```bash
docker compose start
```

### Je veux réinstaller complètement

```bash
cd docker/compose
docker compose down -v  # Supprime tout
```

Puis relancez `install.ps1` ou `install.sh`.

---

## 🆘 Besoin d'aide ?

### Documentation complète
- 📖 **[GUIDE_COMPLET.md](GUIDE_COMPLET.md)** - Toutes les fonctionnalités détaillées
- 📁 **[docs/](docs/)** - Guides techniques

### Problème technique
Ouvrez une **Issue** sur GitHub avec :
- Description du problème
- Ce que vous avez fait
- Le message d'erreur (capture d'écran)

### Logs pour diagnostic
```bash
# Voir tous les logs
docker compose logs

# Logs backend uniquement
docker compose logs backend

# Logs en temps réel
docker compose logs -f
```

---

## 🚀 Installation en Production (Serveur avec nom de domaine)

Si vous voulez rendre votre site accessible sur Internet (ex: airsoft.votre-club.fr), relancez le script d'installation et choisissez **"Option 2 : Production"**.

Vous aurez besoin de :
1. **Un nom de domaine** (ex: OVH, Gandi, etc.)
2. **Un compte Cloudflare** (gratuit) pour les certificats SSL
3. **Un serveur Linux** (VPS OVH, Scaleway, etc.)

Le script configurera automatiquement :
- ✅ Certificats SSL (HTTPS)
- ✅ Reverse proxy (Caddy)
- ✅ Renouvellement automatique des certificats

---

## 📊 Statistiques d'utilisation

Une fois quelques parties créées, consultez l'onglet **"📊 Statistiques"** pour voir :
- Nombre total d'inscrits
- Paiements validés
- Revenu généré
- Top 5 des associations
- Historique des parties

---

## 🎯 Prochaines Étapes

1. ✅ Installez l'application (vous y êtes !)
2. ✅ Personnalisez votre site
3. ✅ Créez votre première partie
4. ✅ Partagez le lien avec vos joueurs
5. ✅ Gérez les inscriptions depuis l'interface admin
6. ✅ Profitez des rappels automatiques J-2 !

---

**Développé avec ❤️ pour la communauté airsoft**

*Bonne gestion de vos parties !* 🎯

*Version 2.0 - 24 Décembre 2025*
