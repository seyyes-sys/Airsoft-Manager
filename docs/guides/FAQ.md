# ❓ FAQ - Questions Fréquentes

**Version :** 2.0  
**Date :** 24 Décembre 2025

---

## 📋 Table des Matières

**Pour les Joueurs**
- [Inscription et Paiement](#inscription-et-paiement)
- [Emails et Confirmations](#emails-et-confirmations)
- [Le Jour de la Partie](#le-jour-de-la-partie)

**Pour les Administrateurs**
- [Installation](#installation)
- [Configuration](#configuration)
- [Gestion Courante](#gestion-courante)
- [Problèmes Techniques](#problèmes-techniques)

---

## 🎮 POUR LES JOUEURS

### Inscription et Paiement

#### Comment m'inscrire à une partie ?
1. Allez sur le site du terrain
2. Cliquez "S'inscrire à une partie"
3. Remplissez le formulaire
4. Validez

✅ Vous recevrez un email de confirmation.

#### Je n'ai pas d'association, je peux quand même jouer ?
**Oui !** Absolument.
- Laissez le champ "Association" vide
- Vous serez considéré comme "Freelance"
- Tarif légèrement différent

#### Combien ça coûte ?
**3 tarifs possibles** (exemple) :
- 🏢 Association partenaire : 5€
- 🏛️ Autre association : 7€
- 👤 Freelance : 9€

*Les tarifs dépendent de la configuration du terrain.*

#### Je peux payer en ligne ?
**Non**, pas encore (v2.0).
- Paiement sur place uniquement
- Modes : Espèces, CB, Virement

**Prévu** : Paiement en ligne dans une future version.

#### Je peux annuler mon inscription ?
**Oui**, contactez l'admin :
- Par téléphone
- Par email terrain
- Le plus tôt possible

*Pas d'annulation en ligne pour l'instant.*

---

### Emails et Confirmations

#### Je n'ai pas reçu l'email de confirmation ?
**Vérifiez** :
1. 📁 **Spam/Courrier indésirable**
2. ✉️ **Adresse email** : correcte dans le formulaire ?

**Toujours rien ?**
- Votre inscription est quand même enregistrée
- Contactez l'admin pour confirmer

#### Je vais recevoir des spams ?
**Non !**
- Emails uniquement pour les parties auxquelles vous vous inscrivez
- Confirmation d'inscription
- Rappel J-2 (2 jours avant)
- Aucune newsletter non sollicitée

#### C'est quoi le rappel J-2 ?
**Email automatique** envoyé 48h avant la partie :
- Rappel de la date et horaires
- Vos détails d'inscription
- Checklist équipement

**Pratique** : Ça évite les oublis !

---

### Le Jour de la Partie

#### Qu'est-ce qu'un Lightning Tag ?
**Tag NFC d'identification** :
- Petit objet avec puce électronique
- Prêté à votre arrivée
- **À rendre** en partant !

**Utilité** :
- Identification rapide
- Gestion équipement (futur)

*Tous les terrains ne l'utilisent pas.*

#### Je dois apporter quoi ?
**Checklist** :
- ✅ Réplique airsoft + chargeur
- ✅ Billes (grammage déclaré)
- ✅ Protections (lunettes OBLIGATOIRES)
- ✅ Équipement tactique
- ✅ Pièce d'identité
- ✅ Paiement PAF
- ✅ Eau et nourriture

#### C'est quoi "Matinée" vs "Journée" ?
**Matinée uniquement** :
- Vous jouez le matin
- Départ à midi
- Tarif parfois réduit

**Journée complète** :
- Matin + après-midi
- Départ en fin de journée

---

## 👨‍💼 POUR LES ADMINISTRATEURS

### Installation

#### Quels sont les prérequis ?
**Serveur Linux** (ou Windows avec Docker) :
- Docker + Docker Compose
- 2 Go RAM minimum
- 10 Go espace disque
- Nom de domaine (optionnel mais recommandé)

#### Combien de temps prend l'installation ?
**10-15 minutes** avec les scripts automatiques :
- `install.sh` (Linux/MacOS)
- `install.ps1` (Windows)

*Anciennement 30-60 minutes.*

#### Je peux installer sur un Raspberry Pi ?
**Oui**, si :
- Raspberry Pi 4 (4 Go RAM recommandé)
- Carte SD rapide (Classe 10 minimum)
- OS 64 bits (Raspberry Pi OS ou Ubuntu)

**Performance** : Suffisante pour un terrain de taille moyenne.

#### Je peux installer en local (pas de serveur) ?
**Oui !** Pour tester :
```bash
git clone https://github.com/votrecompte/airsoft-manager.git
cd airsoft-manager
bash install.sh
```

**Accès** : http://localhost

*Pour la production, un serveur avec nom de domaine est recommandé.*

---

### Configuration

#### Comment configurer les emails (SMTP) ?
**Fichier `.env`** :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
```

**Gmail** :
1. Activez "Validation en 2 étapes"
2. Générez un "Mot de passe d'application"
3. Utilisez ce mot de passe dans `SMTP_PASSWORD`

#### Les emails ne partent pas ?
**Vérifiez** :
1. **Logs backend** :
   ```bash
   docker logs airsoft-backend | grep -i smtp
   ```

2. **Configuration Gmail** :
   - Mot de passe d'application (pas mot de passe compte)
   - "Accès moins sécurisé" activé (anciennes configs)

3. **Variables .env** :
   - `SMTP_HOST` = smtp.gmail.com
   - `SMTP_USER` = votre email complet

#### Comment changer le mot de passe admin ?
**Via l'interface** (recommandé) :
1. Connectez-vous avec le mot de passe par défaut : `admin123`
2. Onglet "🔐 Mot de passe"
3. Nouveau mot de passe → Confirmer → Sauvegarder

**Via ligne de commande** :
```bash
docker exec -it airsoft-backend python -c "
from database import get_db
from auth import get_password_hash
db = next(get_db())
# Script de changement
"
```

#### Comment configurer SSL/HTTPS ?
**Avec Cloudflare** (recommandé) :
1. Domaine sur Cloudflare
2. SSL/TLS → "Full"
3. Cloudflare gère le certificat automatiquement

**Sans Cloudflare** :
- Certificat Let's Encrypt
- Configuration Caddy dans `Caddyfile`

*Voir : [docs/deploiement/CLOUDFLARE_SETUP.md](../deploiement/CLOUDFLARE_SETUP.md)*

---

### Gestion Courante

#### Comment ajouter une association partenaire ?
1. Onglet **"💳 Paiement"**
2. Sous-onglet **"Associations Partenaires"**
3. Nom : "Airsoft Team 31"
4. **"➕ Ajouter"**

✅ Les membres de cette asso paieront le tarif partenaire.

#### Comment créer des Lightning Tags ?
1. Onglet **"⚡ Lightning Tags"**
2. Nom : `LT-001`, `LT-002`, etc.
3. **"➕ Ajouter un Tag"**

**Conseil** : Numérotation séquentielle pour faciliter la gestion.

#### Un tag est perdu, que faire ?
1. Onglet **"⚡ Lightning Tags"**
2. Trouvez le tag dans la liste
3. **Décochez "Actif"**

Le tag devient indisponible pour attribution.

#### Comment valider un paiement ?
1. Onglet **"📋 Parties et Inscriptions"**
2. Sélectionnez la partie
3. Dans le tableau, pour chaque joueur :
   - Type de paiement : Espèces / CB / Virement
   - Cochez **"Validé"**
4. **"💾 Sauvegarder"**

#### Les rappels J-2 ne partent pas ?
**Vérifiez le scheduler** :
```bash
docker logs airsoft-backend | grep "Scheduler"
```

**Résultat attendu** :
```
✅ Scheduler démarré
📅 Prochaine exécution: 2025-12-25 09:00:00
```

**Si absent** :
- Scheduler désactivé ou erreur
- Vérifiez la configuration SMTP

---

### Problèmes Techniques

#### Le site ne s'affiche pas ?
**Vérifications** :

1. **Containers actifs** :
   ```bash
   docker ps
   ```
   ➡️ Vous devez voir 4 containers : db, backend, frontend, caddy

2. **Logs Caddy** :
   ```bash
   docker logs airsoft-caddy
   ```

3. **DNS** :
   - Vérifiez que le domaine pointe vers votre serveur

#### "Database connection error" ?
**Base de données non démarrée** :

```bash
# Vérifier status
docker ps | grep airsoft-db

# Redémarrer
docker compose restart db

# Logs
docker logs airsoft-db
```

#### Comment voir les logs ?
**Script utilitaire** :
```bash
# Logs backend
bash scripts/utility/logs.sh --service backend

# Logs en temps réel
bash scripts/utility/logs.sh --service backend --follow

# Erreurs uniquement
bash scripts/utility/logs.sh --service backend --errors
```

**Manuellement** :
```bash
docker logs airsoft-backend --tail 50
docker logs airsoft-frontend --tail 50
docker logs airsoft-db --tail 50
docker logs airsoft-caddy --tail 50
```

#### Comment faire un backup ?
```bash
bash scripts/backup/backup.sh
```

**Résultat** :
```
✅ Backup créé : /backup/airsoft_db_backup_20251224_143022.sql.gz
```

**Rotation automatique** : Backups > 30 jours supprimés.

#### Comment restaurer un backup ?
```bash
bash scripts/backup/restore.sh airsoft_db_backup_20251224_143022.sql.gz
```

⚠️ **Attention** : Écrase la base actuelle !

#### L'espace disque est plein ?
**Nettoyage Docker** :
```bash
bash scripts/utility/cleanup.sh
```

**Supprime** :
- Containers arrêtés
- Images inutilisées
- Réseaux orphelins
- Build cache

**Préserve** : Volumes (données protégées)

#### Comment mettre à jour vers une nouvelle version ?
```bash
cd /chemin/vers/airsoft-manager
git pull origin main
docker compose build
docker compose up -d
```

**Sauvegardez avant** :
```bash
bash scripts/backup/backup.sh
```

#### Un container ne démarre pas ?
**Diagnostics** :

1. **Logs** :
   ```bash
   docker logs airsoft-backend
   docker logs airsoft-db
   ```

2. **Status** :
   ```bash
   docker ps -a | grep airsoft
   ```

3. **Santé** :
   ```bash
   bash scripts/utility/monitor.sh
   ```

**Erreurs communes** :
- Port déjà utilisé (3000, 8000, 5432)
- Variable `.env` manquante
- Permissions fichiers

#### Comment monitorer la santé de l'app ?
**Script de monitoring** :
```bash
bash scripts/utility/monitor.sh
```

**Affiche** :
- Status containers
- CPU/Mémoire
- Santé services
- Erreurs récentes
- Espace disque

---

## 🔐 Sécurité

#### Dois-je changer le SECRET_KEY ?
**Oui**, absolument !
- Généré automatiquement par le script d'installation
- Si installation manuelle, changez-le dans `.env`

```bash
# Générer une nouvelle clé
openssl rand -hex 32
```

#### Dois-je exposer le port 8000 (backend) ?
**Non !**
- Seul Caddy (port 80/443) doit être exposé
- Backend/Frontend en réseau interne Docker

**docker-compose.yml** :
```yaml
backend:
  ports:
    - "8000:8000"  # ❌ À RETIRER en production
```

Remplacer par :
```yaml
backend:
  expose:
    - "8000"  # ✅ Interne uniquement
```

#### Comment sécuriser l'accès admin ?
**Bonnes pratiques** :
1. **Mot de passe fort** : Min 12 caractères
2. **HTTPS obligatoire** : Cloudflare ou Let's Encrypt
3. **Firewall** : Bloquez ports inutiles (sauf 80/443)
4. **Logs** : Surveillez tentatives connexion
5. **Backups** : Quotidiens automatiques

#### Les .env sont versionnés sur Git ?
**Non !**
- `.env` dans `.gitignore`
- Contient des secrets (mots de passe)
- **JAMAIS** commiter `.env`

**Partagez** : `.env.example` (template sans valeurs)

---

## 📱 Fonctionnalités Futures

#### Quand le paiement en ligne sera disponible ?
**Roadmap v2.1** (prévu) :
- Intégration Stripe ou PayPal
- Acompte en ligne
- Paiement complet avant partie

#### Application mobile prévue ?
**Roadmap v2.2** :
- Application React Native
- iOS + Android
- Notifications push
- Inscriptions rapides

#### Mode SaaS multi-terrains ?
**Roadmap v3.0** :
- 1 instance = plusieurs terrains
- Gestion centralisée
- Facturation automatique
- Dashboard global

---

## 📞 Support

**Besoin d'aide ?**
1. Consultez cette FAQ
2. Lisez la documentation complète
3. Vérifiez les logs
4. Ouvrez une issue GitHub

**Documentation** :
- [Guide Admin](GUIDE_ADMIN.md)
- [Guide Joueur](GUIDE_JOUEUR.md)
- [Structure Projet](../STRUCTURE_COMPLETE.md)

---

**Bonne gestion ! 🎯**

*24 Décembre 2025*
