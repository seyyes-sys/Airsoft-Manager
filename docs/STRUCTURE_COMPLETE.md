# 📂 Structure Complète du Projet Airsoft Manager

**Version :** 2.0  
**Date :** 24 Décembre 2025

---

## 🗂️ Arborescence Complète

```
airsoft-manager/
│
├── 📂 backend/                          # API Backend FastAPI
│   ├── main.py                         # Point d'entrée + routes API
│   ├── models.py                       # 11 modèles SQLAlchemy
│   ├── schemas.py                      # 30+ schémas Pydantic validation
│   ├── database.py                     # Connexion PostgreSQL
│   ├── auth.py                         # Authentification JWT
│   ├── email_service.py                # Service envoi emails SMTP
│   ├── scheduler.py                    # Rappels automatiques APScheduler
│   ├── requirements.txt                # Dépendances Python
│   ├── Dockerfile                      # Image Docker backend
│   │
│   └── 📂 Migrations/                  # Scripts migration base de données
│       ├── migrate_reminder_sent.py    # Champ rappel automatique
│       ├── migrate_nfc_tags.py         # Table Lightning Tags
│       ├── migrate_membership_applications.py  # Table candidatures
│       ├── migrate_payment_types.py    # Table types paiement
│       ├── migrate_pricing_system.py   # Tables tarifs 3 niveaux
│       ├── migrate_rule_versions.py    # Versioning règlement
│       ├── migrate_bb_weight.py        # Grammage billes
│       ├── migrate_is_closed.py        # Clôture inscriptions
│       ├── migrate_payment_validated.py # Validation paiements
│       └── ... (13 migrations au total)
│
├── 📂 frontend/                         # Application React
│   ├── public/                         # Assets statiques
│   │   ├── index.html                  # Template HTML
│   │   ├── favicon.ico                 # Icône site
│   │   └── manifest.json               # PWA manifest
│   │
│   ├── src/                            # Code source React
│   │   ├── index.js                    # Point d'entrée React
│   │   ├── App.js                      # Router principal
│   │   ├── App.css                     # Styles globaux
│   │   │
│   │   └── components/                 # Composants React
│   │       ├── HomePage.js             # Page d'accueil publique
│   │       ├── RegistrationForm.js     # Formulaire inscription
│   │       ├── AdminLogin.js           # Page connexion admin
│   │       ├── AdminDashboard.js       # Dashboard avec sidebar
│   │       ├── CreateGame.js           # Création parties
│   │       ├── GameRegistrations.js    # Gestion inscriptions
│   │       ├── Statistics.js           # Statistiques avancées
│   │       ├── NFCTagsManager.js       # Gestion Lightning Tags
│   │       ├── MembershipApplications.js # Candidatures membres
│   │       ├── PaymentTypesManager.js  # Gestion paiements
│   │       ├── LogoManager.js          # Upload logo
│   │       ├── SiteSettings.js         # Personnalisation
│   │       ├── RulesManager.js         # Éditeur règlement
│   │       └── PasswordChange.js       # Changement mot de passe
│   │
│   ├── package.json                    # Dépendances npm
│   ├── .env.production                 # Config production
│   ├── Dockerfile                      # Image Docker frontend
│   └── nginx.conf                      # Configuration Nginx
│
├── 📂 config/                           # Configuration
│   ├── .env.example                    # Template variables environnement
│   ├── Caddyfile                       # Reverse proxy + SSL
│   └── reglements.txt                  # Règlement initial
│
├── 📂 docker/                           # Infrastructure Docker
│   ├── compose/
│   │   ├── docker-compose.yml          # Dev local
│   │   ├── docker-compose.prod.yml     # Production
│   │   └── .env                        # Variables (gitignored)
│   │
│   └── caddy/
│       └── Dockerfile                  # Build Caddy + Cloudflare
│
├── 📂 scripts/                          # Scripts utilitaires
│   ├── install.ps1                     # Installation automatique Windows
│   ├── install.sh                      # Installation automatique Linux
│   ├── start.ps1                       # Démarrage rapide Windows
│   ├── start.sh                        # Démarrage rapide Linux
│   │
│   ├── backup/                         # Backup base de données
│   │   ├── backup.sh                   # Sauvegarde PostgreSQL
│   │   └── restore.sh                  # Restauration
│   │
│   ├── deployment/                     # Scripts déploiement
│   │   ├── deploy.sh                   # Déploiement production
│   │   └── update.sh                   # Mise à jour
│   │
│   └── utility/                        # Scripts maintenance
│       ├── monitor.sh                  # Monitoring containers
│       ├── logs.sh                     # Consultation logs
│       └── cleanup.sh                  # Nettoyage Docker
│
├── 📂 docs/                             # Documentation complète
│   │
│   ├── deploiement/                    # Guides déploiement
│   │   ├── GUIDE_DEPLOIEMENT.md        # Guide principal
│   │   ├── ARCHITECTURE_DEPLOIEMENT.md # Architecture système
│   │   ├── CLOUDFLARE_SETUP.md         # Configuration SSL
│   │   ├── GUIDE_RESEAU_DOCKER.md      # Réseau Docker
│   │   ├── COMMANDES_DEPLOIEMENT.md    # Commandes utiles
│   │   └── ... (25+ guides)
│   │
│   ├── fonctionnalites/                # Documentation features
│   │   ├── FONCTIONNALITE_PAIEMENT.md  # Système paiement
│   │   ├── LIGHTNING_TAGS.md           # Tags NFC
│   │   ├── CANDIDATURES.md             # Candidatures membres
│   │   ├── RAPPELS_AUTOMATIQUES.md     # Rappels J-2
│   │   ├── STATISTIQUES.md             # Stats avancées
│   │   └── ... (10+ docs)
│   │
│   ├── guides/                         # Guides utilisateur
│   │   ├── GUIDE_ADMIN.md              # Guide administrateur
│   │   ├── GUIDE_JOUEUR.md             # Guide joueur
│   │   ├── GUIDE_PERSONNALISATION.md   # Personnaliser site
│   │   └── FAQ.md                      # Questions fréquentes
│   │
│   ├── STRUCTURE_COMPLETE.md           # Ce fichier
│   └── SETUP_WIZARD_IMPLEMENTATION.md  # Specs v2.1
│
├── 📄 README.md                         # Documentation principale
├── 📄 GUIDE_COMPLET.md                  # Guide exhaustif 15+ features
├── 📄 INSTALLATION_SIMPLE.md            # Installation débutants
├── 📄 DEPLOIEMENT_V2_GUIDE.md           # Déploiement production
├── 📄 PROJECT_STRUCTURE.md              # Structure projet
├── 📄 SIMPLIFICATION_RECAP.md           # Récap améliorations v2.0
├── 📄 PUBLICATION_GITHUB_GUIDE.md       # Guide publication GitHub
├── 📄 PUBLICATION_AIDE_MEMOIRE.md       # Aide-mémoire GitHub
├── 📄 CHECKLIST_GIT.md                  # Checklist publication
│
├── 📄 LICENSE                           # Licence MIT
├── 📄 CONTRIBUTING.md                   # Guide contributeurs
├── 📄 CODE_OF_CONDUCT.md                # Code de conduite
├── 📄 SECURITY.md                       # Politique sécurité
│
├── 📄 .gitignore                        # Fichiers ignorés Git
└── 📄 .env.example                      # Template configuration

```

---

## 📋 Description des Composants

### Backend (API FastAPI)

**Fichiers principaux :**
- `main.py` : Routes API, CORS, startup/shutdown
- `models.py` : Modèles SQLAlchemy (User, Game, Registration, NFCTag, etc.)
- `schemas.py` : Schémas Pydantic pour validation
- `database.py` : Connexion base de données
- `auth.py` : Authentification JWT, hash mots de passe
- `email_service.py` : Envoi emails SMTP via Gmail
- `scheduler.py` : Tâches planifiées (rappels J-2)

**Technologies :**
- Python 3.11
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- PostgreSQL 15
- APScheduler 3.10.4
- PyJWT 2.8.0
- Passlib + bcrypt 4.0.1

### Frontend (React)

**Structure :**
- `public/` : Assets statiques (HTML, favicon, manifest)
- `src/components/` : 15+ composants React
- `App.js` : Router React avec routes publiques et admin
- `App.css` : Styles globaux + sidebar verticale

**Composants clés :**
- **HomePage** : Page d'accueil avec règlement
- **RegistrationForm** : Inscription joueur
- **AdminDashboard** : Interface admin (sidebar 10 onglets)
- **NFCTagsManager** : Gestion Lightning Tags
- **MembershipApplications** : Candidatures membres
- **PaymentTypesManager** : Système paiement 3 tarifs

**Technologies :**
- React 18.2.0
- React Router 6.x
- Axios 1.6.2
- CSS Modules
- Nginx 1.25-alpine

### Infrastructure Docker

**Containers :**
1. **airsoft-db** : PostgreSQL 15-alpine
2. **airsoft-backend** : API FastAPI
3. **airsoft-frontend** : React + Nginx
4. **airsoft-caddy** : Reverse proxy + SSL

**Fichiers :**
- `docker-compose.yml` : Développement local
- `docker-compose.prod.yml` : Production avec SSL
- `Dockerfile` (backend/frontend/caddy)

### Configuration

**Variables d'environnement (.env) :**
- Base de données : POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_URL
- Sécurité : SECRET_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
- SMTP : SMTP_HOST, SMTP_USER, SMTP_PASSWORD
- Production : CLOUDFLARE_API_TOKEN, DOMAIN

**Caddyfile :**
- Reverse proxy
- SSL automatique Let's Encrypt
- Cloudflare DNS challenge
- Routes /api/* vers backend
- Routes /* vers frontend

### Scripts

**Installation :**
- `install.ps1` / `install.sh` : Installation automatique
- Configuration interactive en 5 questions
- Génération .env automatique

**Backup :**
- `backup.sh` : Sauvegarde PostgreSQL avec compression
- `restore.sh` : Restauration depuis backup

**Déploiement :**
- `deploy.sh` : Déploiement complet production
- `update.sh` : Mise à jour sans downtime

**Utilitaires :**
- `monitor.sh` : Status containers
- `logs.sh` : Consultation logs centralisée
- `cleanup.sh` : Nettoyage Docker

### Documentation

**Guides principaux :**
- `README.md` : Vue d'ensemble + installation rapide
- `GUIDE_COMPLET.md` : Documentation exhaustive 15+ features
- `INSTALLATION_SIMPLE.md` : Guide débutants pas-à-pas

**Documentation technique :**
- `docs/deploiement/` : 25+ guides déploiement
- `docs/fonctionnalites/` : Documentation features
- `docs/guides/` : Guides utilisateur

---

## 🗃️ Base de Données (11 Tables)

1. **users** : Comptes administrateurs
2. **games** : Parties d'airsoft
3. **registrations** : Inscriptions joueurs
4. **payment_types** : Types de paiement
5. **partner_associations** : Associations partenaires
6. **pricing_settings** : Tarifs 3 niveaux
7. **nfc_tags** : Lightning Tags NFC
8. **membership_applications** : Candidatures membres
9. **rules** : Règlement terrain
10. **rule_versions** : Versions règlement
11. **site_settings** : Paramètres site

---

## 🔄 Workflow Application

### Côté Joueur
1. Visite `https://votredomaine.com`
2. Lit le règlement (acceptation obligatoire)
3. Remplit formulaire inscription
4. Reçoit email confirmation
5. Reçoit rappel automatique J-2

### Côté Admin
1. Connexion `/admin/login`
2. Dashboard avec sidebar 10 onglets
3. Création partie
4. Gestion inscriptions (filtres, tri, validation paiements)
5. Attribution Lightning Tags
6. Consultation statistiques
7. Personnalisation site

### Tâches Automatiques
- **Rappels J-2** : APScheduler exécute à 9h00 quotidien
- **Emails** : Envoi via Gmail SMTP
- **Logs** : Enregistrement dans stdout Docker

---

## 🔐 Sécurité

**Authentification :**
- JWT tokens avec expiration 24h
- Hash bcrypt pour mots de passe
- Secret key 64 caractères

**Variables sensibles :**
- Toutes dans .env (gitignored)
- Templates .env.example fournis
- Aucun mot de passe en dur dans code

**SSL/TLS :**
- Let's Encrypt automatique via Caddy
- Cloudflare DNS challenge
- HTTPS forcé
- HSTS activé

**Headers sécurité :**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

---

## 📊 Métriques Projet

**Code :**
- Backend : ~3000 lignes Python
- Frontend : ~5000 lignes JavaScript/CSS
- Migrations : 13 scripts
- Documentation : 50+ fichiers markdown

**Features :**
- 15+ fonctionnalités majeures
- 11 tables base de données
- 30+ routes API
- 15+ composants React
- 10 onglets admin

**Documentation :**
- 8 guides principaux
- 25+ guides déploiement
- 10+ docs fonctionnalités
- 5+ guides utilisateur
- 200+ pages documentation

---

## 🚀 Évolution Future

**v2.1 (Q1 2026) :**
- Setup Wizard web
- Export données CSV/Excel
- Graphiques statistiques

**v2.2 (Q2 2026) :**
- API publique pour intégrations
- Application mobile React Native
- Mode multi-terrains

**v3.0 (Q3 2026) :**
- Mode SaaS cloud
- Paiement en ligne intégré
- Système de réservation

---

**📄 Licence :** MIT  
**👥 Contributeurs :** Open-source, contributions bienvenues  
**🙏 Communauté :** Développé pour l'airsoft par passion

*24 Décembre 2025*
