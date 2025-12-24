# 🎯 Airsoft Manager

> Application web complète pour la gestion d'un terrain d'airsoft

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)](https://www.docker.com/)

**Airsoft Manager** est une solution open-source complète pour gérer l'ensemble des opérations d'un terrain d'airsoft : inscriptions en ligne, rappels automatiques, système de paiement intelligent, gestion Lightning Tags NFC, candidatures membres, et bien plus.

## ✨ Fonctionnalités Principales

### 🎮 Pour les Joueurs
- **Inscription en ligne** avec formulaire simple et intuitif
- **Confirmation email** automatique après inscription
- **Rappels automatiques J-2** avant chaque partie
- **Candidature en ligne** pour devenir membre
- Interface responsive (mobile, tablette, desktop)

### 👨‍💼 Pour les Administrateurs
- **Interface admin moderne** avec sidebar verticale (10 onglets)
- **Gestion complète des parties** : création, clôture, statistiques
- **Tableau des inscriptions** avec filtres et recherche
- **Lightning Tags NFC** : création, attribution, disponibilité
- **Candidatures membres** avec notifications badge rouge
- **Système de paiement intelligent** (3 niveaux de tarifs configurables)
- **Statistiques avancées** : inscrits, confirmés, présents, revenu
- **Personnalisation totale** : logo, couleurs, titre, description
- **Éditeur de règlement** avec versioning (3 versions)

### ⚡ Technologies et Automatisations
- **Rappels automatiques** : APScheduler envoie emails 48h avant parties
- **Calcul PAF automatique** : selon association (partenaire/autre/freelance)
- **Emails transactionnels** : confirmation, rappels (SMTP Gmail)
- **Backup automatique** : scripts de sauvegarde PostgreSQL
- **Monitoring** : scripts de surveillance containers

## 🚀 Installation Ultra-Rapide

### Prérequis
- **Docker** + Docker Compose
- **Serveur Linux** (ou Windows avec Docker Desktop)
- **2 Go RAM** minimum
- **10 Go espace disque**
- **Nom de domaine** (optionnel mais recommandé)

### Installation Automatique

**Linux / MacOS :**
```bash
git clone https://github.com/votrecompte/airsoft-manager.git
cd airsoft-manager
bash scripts/deployment/install.sh
```

**Windows :**
```powershell
git clone https://github.com/votrecompte/airsoft-manager.git
cd airsoft-manager
.\scripts\deployment\install.ps1
```

**Configuration interactive en 5 questions :**
1. 🌐 Nom de domaine (ex: airsoft-terrain.fr)
2. 📧 Email SMTP (Gmail recommandé)
3. 🔐 Mot de passe application Gmail
4. 📨 Email expéditeur
5. 🏢 Nom de votre terrain

**⏱️ Installation complète en 10-15 minutes !**

## 📖 Documentation Complète

### Pour les Utilisateurs
- **[Guide Joueur](docs/guides/GUIDE_JOUEUR.md)** - Inscription, candidature, jour J
- **[Guide Admin](docs/guides/GUIDE_ADMIN.md)** - Interface complète, toutes fonctionnalités
- **[FAQ](docs/guides/FAQ.md)** - Questions fréquentes

### Pour les Administrateurs Système
- **[Installation Simple](docs/deploiement/INSTALLATION_SIMPLE.md)** - Guide débutants
- **[Déploiement Production](docs/deploiement/DEPLOIEMENT_V2_GUIDE.md)** - Serveur Linux complet
- **[Structure Projet](docs/STRUCTURE_COMPLETE.md)** - Arborescence complète

### Documentation Technique
- **[Lightning Tags](docs/fonctionnalites/LIGHTNING_TAGS.md)** - Système NFC
- **[Candidatures](docs/fonctionnalites/CANDIDATURES.md)** - Gestion membres

## 🏗️ Architecture Technique

### Stack
- **Backend :** Python 3.11, FastAPI, SQLAlchemy, APScheduler
- **Frontend :** React 18, Axios, React Router
- **Base de données :** PostgreSQL 15
- **Serveur web :** Caddy (SSL automatique)
- **Infrastructure :** Docker, Docker Compose

### Containers
```
┌─────────────────┐
│  Caddy (80/443) │  ← Reverse proxy + SSL automatique
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬────────────┐
    │          │          │            │
┌───▼────┐ ┌──▼──────┐ ┌─▼────────┐ ┌─▼──────┐
│Frontend│ │ Backend │ │PostgreSQL│ │ Backup │
│React 18│ │FastAPI  │ │    15    │ │Scripts │
│Port    │ │Port     │ │Port      │ │        │
│3000    │ │8000     │ │5432      │ │        │
└────────┘ └─────────┘ └──────────┘ └────────┘
```

### Sécurité
- 🔐 **JWT** pour authentification admin
- 🔒 **bcrypt** pour hashage mots de passe
- 🌐 **SSL/TLS** automatique (Cloudflare ou Let's Encrypt)
- 🛡️ **Variables d'environnement** pour secrets
- 🚫 **Headers sécurité** (CORS, CSP)

## 📊 Base de Données

**11 tables principales :**
- `parties` - Événements airsoft
- `inscriptions` - Joueurs inscrits
- `lightning_tags` - Tags NFC d'identification
- `candidatures` - Demandes d'adhésion
- `payment_types` - Types de paiement configurables
- `partner_associations` - Associations partenaires
- `tarifs_paf` - Grille tarifaire (3 niveaux)
- `site_settings` - Configuration site
- `logo_uploads` - Logos uploadés
- `rules_versions` - Historique règlement
- `users` - Comptes administrateurs

## 🛠️ Scripts Utilitaires

### Backup et Restauration
```bash
# Backup automatique avec compression
bash scripts/backup/backup.sh

# Restauration d'un backup
bash scripts/backup/restore.sh airsoft_db_backup_20251224_143022.sql.gz
```

### Monitoring
```bash
# État de santé complet
bash scripts/utility/monitor.sh

# Logs en temps réel
bash scripts/utility/logs.sh --service backend --follow

# Nettoyage Docker
bash scripts/utility/cleanup.sh
```

## 🌟 Démonstration

**Interface Joueur :**
- Page d'accueil avec formulaire d'inscription
- Règlement intégré avec acceptation obligatoire
- Confirmation email immédiate
- Rappel J-2 automatique

**Interface Admin :**
- Dashboard complet avec statistiques
- Gestion visuelle des inscriptions
- Attribution Lightning Tags par drag & drop
- Validation paiements en un clic
- Graphiques de présence et revenu

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

### Développement Local

```bash
# Cloner le repository
git clone https://github.com/votrecompte/airsoft-manager.git
cd airsoft-manager

# Lancer avec Docker Compose
docker compose -f docker/compose/docker-compose.yml up --build

# Backend accessible sur http://localhost:8000
# Frontend accessible sur http://localhost:3000
```

### Tests

```bash
# Tests backend
cd backend
pytest

# Tests frontend
cd frontend
npm test
```

## 📝 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour détails.

## 🙏 Remerciements

Merci à tous les terrains d'airsoft qui ont testé et contribué à améliorer cette application !

## 📞 Support

- **Documentation :** [docs/](docs/)
- **Issues :** [GitHub Issues](https://github.com/votrecompte/airsoft-manager/issues)
- **Discussions :** [GitHub Discussions](https://github.com/votrecompte/airsoft-manager/discussions)

## 🗺️ Roadmap

### v2.1 (Prévu Q1 2026)
- ✨ Setup Wizard web (installation sans ligne de commande)
- 💳 Paiement en ligne (Stripe/PayPal)
- 📧 Templates emails personnalisables
- 📱 Notifications push

### v2.2 (Prévu Q2 2026)
- 📱 Application mobile (iOS/Android)
- ⚡ Scan NFC réel avec lecteurs physiques
- 📊 Dashboard statistiques avancées
- 🔗 API publique

### v3.0 (Prévu Q3 2026)
- 🏢 Mode SaaS multi-terrains
- 💰 Système de facturation intégré
- 🌍 Internationalisation (multilingue)
- 🤖 IA pour suggestions scénarios

---

<div align="center">

**Fait avec ❤️ pour la communauté airsoft**

⭐ **N'oubliez pas de laisser une étoile si ce projet vous aide !** ⭐

</div>
