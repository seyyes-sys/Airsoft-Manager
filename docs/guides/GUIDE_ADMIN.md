# 👨‍💼 Guide Administrateur Complet

**Version :** 2.0  
**Date :** 24 Décembre 2025  
**Public :** Administrateurs de terrain d'airsoft

---

## 📋 Table des Matières

1. [Première Connexion](#première-connexion)
2. [Interface Admin](#interface-admin)
3. [Gestion des Parties](#gestion-des-parties)
4. [Gestion des Inscriptions](#gestion-des-inscriptions)
5. [Lightning Tags NFC](#lightning-tags-nfc)
6. [Candidatures Membres](#candidatures-membres)
7. [Système de Paiement](#système-de-paiement)
8. [Statistiques](#statistiques)
9. [Personnalisation](#personnalisation)
10. [Maintenance](#maintenance)

---

## 🔐 Première Connexion

### Accès à l'Interface Admin

1. **Allez sur** : `https://votredomaine.com/admin/login`
2. **Credentials par défaut** :
   - Username : `admin`
   - Password : `admin123`

### ⚠️ Changement Obligatoire du Mot de Passe

**IMPORTANT** : Changez immédiatement le mot de passe par défaut !

1. Après connexion, cliquez sur l'onglet **"🔐 Mot de passe"**
2. Entrez un nouveau mot de passe **fort** :
   - Minimum 8 caractères
   - Majuscules + minuscules + chiffres
   - Exemple : `M0nT3rra!n2025`
3. Confirmez le mot de passe
4. Cliquez **"Changer le mot de passe"**

✅ **Mot de passe changé avec succès !**

---

## 🖥️ Interface Admin

### Sidebar Verticale (10 Onglets)

L'interface admin dispose d'une sidebar moderne sur la gauche :

1. **📋 Parties et Inscriptions** - Gestion complète
2. **➕ Créer une partie** - Nouvelle partie
3. **📊 Statistiques** - Métriques et graphiques
4. **⚡ Lightning Tags** - Gestion tags NFC
5. **👥 Candidatures** - Validation candidatures + badge notification
6. **💳 Paiement** - Tarifs + types + associations
7. **🖼️ Logo** - Upload logo terrain
8. **⚙️ Personnalisation** - Titre, couleurs, description
9. **📜 Règlement** - Éditeur + versioning
10. **🔐 Mot de passe** - Sécurité compte

### Navigation

- **Clic sur un onglet** : Affiche le contenu
- **Badge rouge** : Notification (ex: nouvelles candidatures)
- **Responsive** : S'adapte mobile/tablette/desktop

---

## 🎮 Gestion des Parties

### Créer une Nouvelle Partie

**Onglet : "➕ Créer une partie"**

1. **Nom de la partie** : "Partie du 15 Janvier 2026"
2. **Date** : Sélectionnez la date avec le calendrier
3. **Description** : "Scénario capture du drapeau en forêt"
4. Cliquez **"Créer la partie"**

✅ **Partie créée !** Les joueurs peuvent maintenant s'inscrire.

### Voir les Parties Existantes

**Onglet : "📋 Parties et Inscriptions"**

**En haut de page** :
- **Sélecteur de partie** : Liste déroulante
- **Date de la partie** : Affichée automatiquement
- **Nombre d'inscrits** : Compteur avec filtres

**Actions disponibles** :
- **Clôturer les inscriptions** : Bouton rouge "Clôturer"
- **Rouvrir les inscriptions** : Après clôture
- **Supprimer la partie** : ⚠️ Supprime tout !

### Clôturer/Rouvrir une Partie

**Pourquoi clôturer ?**
- Plus d'inscriptions acceptées
- Préparer la partie
- Finaliser la liste

**Comment ?**
1. Sélectionnez la partie
2. Cliquez **"Clôturer les inscriptions"**
3. Confirmez

**Pour rouvrir** :
- Le bouton devient **"Rouvrir les inscriptions"**

---

## 👥 Gestion des Inscriptions

**Onglet : "📋 Parties et Inscriptions"**

### Vue d'Ensemble

**Tableau des inscriptions** avec colonnes :
- **Nom** - Nom du joueur
- **Email** - Contact
- **Téléphone** - Contact
- **Association** - Nom de l'association
- **Paiement** - Type + statut
- **PAF** - Montant calculé
- **Présence** - Matinée/Journée
- **Tag NFC** - Lightning Tag attribué
- **Présence J** - Présent le jour J ?
- **Actions** - Modifier/Supprimer

### Filtres Puissants

**Barre de recherche** :
- Tapez un nom, email, ou association
- Filtrage instantané

**Filtres rapides** :
- **Tous** - Toutes les inscriptions
- **Paiement validé** - Seulement validés
- **Paiement non validé** - À valider
- **Présent** - Confirmés présents
- **Absent** - Absents

**Compteur dynamique** :
- S'actualise selon les filtres
- Exemple : "12 inscriptions (5 validées)"

### Tri des Colonnes

**Clic sur un en-tête** :
- Premier clic : ▲ Tri croissant
- Deuxième clic : ▼ Tri décroissant
- Troisième clic : Retour normal

### Validation des Paiements

**Pour chaque inscription** :

1. **Sélectionner le type** :
   - Espèces 💵
   - CB 💳
   - Virement 🏦
   - Invité 🎟️
   - Autre 📝

2. **Le PAF s'affiche** :
   - Calculé automatiquement selon association
   - Invité = 0€

3. **Cocher "Validé"** :
   - ✅ = Paiement confirmé
   - ⬜ = En attente

4. **Sauvegarder** : Clic sur "💾 Sauvegarder"

### Attribution Lightning Tags

**Si vous utilisez les tags NFC** :

1. Dans la colonne **"Tag NFC"**
2. Cliquez sur le sélecteur
3. Choisissez un tag **disponible**
4. Cliquez **"💾 Sauvegarder"**

✅ **Tag attribué !** Le joueur récupérera ce tag le jour J.

### Marquage Présence Jour J

**Pendant la partie** :

1. Colonne **"Présence"**
2. Cliquez sur le sélecteur :
   - ✅ **Présent** - Joueur présent
   - ❌ **Absent** - Joueur absent
   - ❓ **?** - Inconnu
3. Sauvegardez

**Utilité** :
- Statistiques précises
- Calcul revenu réel
- Historique présences

### Modification d'une Inscription

**Bouton "✏️ Modifier"** :

1. Formulaire d'édition s'affiche
2. Modifiez les champs :
   - Nom, prénom, email, téléphone
   - Association
   - Grammage billes
   - Présence matinée/journée
3. **"💾 Sauvegarder"** ou **"❌ Annuler"**

### Suppression d'une Inscription

**Bouton "🗑️ Supprimer"** :

1. Confirmation demandée
2. ⚠️ **Action irréversible** !
3. Supprime :
   - L'inscription
   - Libère le tag NFC si attribué

---

## ⚡ Lightning Tags NFC

**Onglet : "⚡ Lightning Tags"**

### Qu'est-ce qu'un Lightning Tag ?

Tag NFC d'identification joueur :
- Identification rapide
- Suivi équipement
- Gestion stock en temps réel

### Créer des Tags

1. **Nom du tag** : `LT-001`, `LT-002`, etc.
2. Cliquez **"➕ Ajouter un Tag"**
3. Le tag apparaît dans la liste

**Bonnes pratiques** :
- Numérotation séquentielle : LT-001, LT-002...
- Ou par couleur : LT-Rouge-01, LT-Bleu-01...

### Activer/Désactiver un Tag

**Colonne "Actif"** :
- ✅ **Activé** : Disponible pour attribution
- ⬜ **Désactivé** : Tag perdu/cassé

**Utilité** :
- Tag perdu ? Désactivez-le
- Tag retrouvé ? Réactivez-le

### Statut des Tags

**Colonne "Disponible"** :
- ✅ **Disponible** : Peut être attribué
- ❌ **Attribué** : En cours d'utilisation

**Attribution automatique** :
- Attribué via l'onglet "Inscriptions"
- Devient indisponible automatiquement
- Redevient disponible après retrait

### Workflow Complet

```
1. Admin crée tag : LT-001 ✅ Disponible
2. Joueur s'inscrit en ligne
3. Admin attribue LT-001 → ❌ Attribué
4. Jour J : Joueur récupère LT-001
5. Après partie : Admin retire tag
6. LT-001 redevient → ✅ Disponible
```

### Supprimer un Tag

**Bouton "🗑️"** :
- ⚠️ Impossible si tag attribué
- Retirer d'abord l'attribution
- Puis supprimer

---

## 👥 Candidatures Membres

**Onglet : "👥 Candidatures"** (avec badge si nouvelles candidatures)

### Recevoir une Candidature

**Formulaire public** :
- URL : `https://votredomaine.com` → Bouton "Rejoignez-nous"
- Candidat remplit : nom, email, motivation

**Notification** :
- Badge rouge apparaît sur l'onglet : 👥 **1**
- Indique nombre de candidatures en attente

### Traiter les Candidatures

**Vue liste** :

**Colonnes** :
- **Nom** - Nom du candidat
- **Email** - Contact
- **Motivation** - Texte complet
- **Date** - Date de soumission
- **Statut** - En attente / Approuvé / Rejeté
- **Actions** - Boutons

### Approuver une Candidature

1. Lisez la motivation
2. Cliquez **"✅ Approuver"**
3. **Confirmation** : "Candidature approuvée !"
4. Badge -1 (si c'était la dernière en attente)

**Ce qui se passe** :
- Statut → "Approuvé"
- Reste dans l'historique
- Vous pouvez contacter le candidat par email

### Rejeter une Candidature

1. Cliquez **"❌ Rejeter"**
2. Confirmation demandée
3. Statut → "Rejeté"

**Utilité** :
- Candidature inappropriée
- Doublon
- Motivation insuffisante

### Filtres

**Barre de recherche** : Nom ou email

**Filtres rapides** :
- **Toutes** - Toutes les candidatures
- **En attente** - À traiter
- **Approuvées** - Historique validées
- **Rejetées** - Historique refusées

### Historique Complet

Toutes les candidatures sont archivées :
- Date de soumission
- Date de traitement
- Statut final

---

## 💳 Système de Paiement

**Onglet : "💳 Paiement"** avec 3 sous-onglets

### Sous-onglet 1 : Types de Paiement

**Gestion des types** :

**Types par défaut** :
- 💵 Espèces
- 💳 CB
- 🏦 Virement
- 🎟️ Invité (gratuit)
- 📝 Autre

**Ajouter un type** :
1. **Nom** : "PayPal"
2. **Icône** : 💸
3. **Gratuit** : ☐ Non (ou ✅ Oui)
4. **"➕ Ajouter"**

**Modifier/Supprimer** :
- **✏️** : Modifier nom/icône
- **🗑️** : Supprimer (si non utilisé)

### Sous-onglet 2 : Associations Partenaires

**Liste des associations** avec tarif réduit

**Ajouter une association** :
1. **Nom** : "Airsoft Team 31"
2. **"➕ Ajouter"**

✅ **Les membres de cette asso paieront le tarif partenaire**

**Supprimer** :
- **🗑️** : Retirer du partenariat

### Sous-onglet 3 : Tarifs PAF

**Configuration des 3 niveaux** :

**Tarif 1 - Association Partenaire** 🏢
- Par défaut : 5€
- Pour membres d'assos listées dans l'onglet 2

**Tarif 2 - Autre Association** 🏛️
- Par défaut : 7€
- Pour membres d'assos NON listées

**Tarif 3 - Freelance** 👤
- Par défaut : 9€
- Pour joueurs sans association

**Modifier les tarifs** :
1. Changez les valeurs
2. **"💾 Sauvegarder"**

### Calcul Automatique

**Lors de l'inscription** :

```
SI invité (type paiement "Invité")
  → PAF = 0€

SINON SI association IN liste partenaires
  → PAF = Tarif 1 (5€)

SINON SI a une association
  → PAF = Tarif 2 (7€)

SINON (freelance)
  → PAF = Tarif 3 (9€)
```

**Exemples** :
- Jean de "Airsoft Team 31" (partenaire) → 5€
- Marie de "Airsoft 77" (non partenaire) → 7€
- Pierre (sans asso) → 9€
- Sophie (invitée) → 0€

---

## 📊 Statistiques

**Onglet : "📊 Statistiques"**

### Métriques Principales

**4 cartes en haut** :

**👥 Inscrits** :
- Total inscriptions pour la partie
- Toutes confondues

**✅ Confirmés** :
- Paiements validés uniquement
- Prêts pour la partie

**🎯 Présents** :
- Marqués "Présent" le jour J
- Calcul après la partie

**💰 Revenu** :
- Somme des PAF validés
- Exemple : 12 × 7€ = 84€

### Répartition Présence

**Graphique en barres** :
- 🌅 **Matinée uniquement** : X joueurs
- ☀️ **Journée complète** : Y joueurs

### Top 5 Associations

**Classement** :
1. Airsoft Team 31 - 15 joueurs
2. Airsoft 77 - 8 joueurs
3. Tactical Force - 5 joueurs
...

**Utilité** :
- Identifier vos associations fidèles
- Offres partenariat

### Historique Parties

**10 dernières parties** :
- Date
- Nom
- Nombre d'inscrits
- Revenu

**Utilité** :
- Suivi activité
- Tendances fréquentation

---

## 🎨 Personnalisation

### Logo du Terrain

**Onglet : "🖼️ Logo"**

1. **Cliquez** "Choisir un fichier"
2. **Sélectionnez** votre logo :
   - Formats : PNG, JPG, SVG
   - Taille recommandée : 200x200px à 400x400px
3. **"📤 Uploader le Logo"**

✅ **Logo mis à jour !**

**Où apparaît le logo ?**
- Page d'accueil
- Formulaire d'inscription
- Emails (futur)

### Personnalisation du Site

**Onglet : "⚙️ Personnalisation"**

**Titre du Terrain** :
- Nom affiché partout
- Exemple : "Airsoft Tactical Arena"

**Description** :
- Message d'accueil
- Exemple : "Bienvenue sur notre terrain de 15 hectares..."

**Couleur Principale** :
- Sélecteur visuel
- Appliqué aux boutons, liens, etc.

**Sauvegarder** :
- Changements appliqués immédiatement

### Gestion du Règlement

**Onglet : "📜 Règlement"**

**5 sections éditables** :
1. **Règles Générales**
2. **Équipement Autorisé**
3. **Sécurité**
4. **Comportement**
5. **Sanctions**

**Modifier** :
1. Éditez le texte (supporte Markdown)
2. **"💾 Sauvegarder"**

**Versioning** :
- Jusqu'à 3 versions sauvegardées
- **"📜 Historique"** : Voir versions
- **"↩️ Restaurer"** : Revenir en arrière

---

## 🔧 Maintenance

### Vérifier la Santé de l'Application

**Via l'interface** :
- Si vous pouvez vous connecter → Backend OK
- Si stats s'affichent → Database OK

**Via ligne de commande** :
```bash
# Status containers
docker ps

# Logs backend
docker logs airsoft-backend --tail 50

# Logs erreurs uniquement
docker logs airsoft-backend 2>&1 | grep -i error
```

### Consulter les Rappels Automatiques

```bash
# Vérifier le scheduler
docker logs airsoft-backend | grep "Scheduler"

# Résultat attendu :
# ✅ Scheduler démarré
# 📅 Prochaine exécution: 2025-12-25 09:00:00
```

### Redémarrer un Service

```bash
cd docker/compose

# Redémarrer backend
docker compose restart backend

# Redémarrer tout
docker compose restart
```

### Backup de la Base

```bash
# Lancer backup
bash scripts/backup/backup.sh

# Résultat :
# ✅ Backup créé : /backup/airsoft_db_backup_20251224_143022.sql.gz
```

### Restaurer un Backup

```bash
# Restaurer
bash scripts/backup/restore.sh airsoft_db_backup_20251224_143022.sql.gz

# ⚠️ Confirmer (écrase la base actuelle)
```

---

## ❓ FAQ Admin

### Comment changer mon mot de passe ?
Onglet "🔐 Mot de passe" → Nouveau mot de passe → Confirmer → Sauvegarder

### Comment ajouter une nouvelle association partenaire ?
Onglet "💳 Paiement" → "Associations Partenaires" → Nom → "➕ Ajouter"

### Un joueur n'a pas reçu l'email de confirmation ?
Vérifiez la configuration SMTP dans le fichier `.env` sur le serveur

### Comment supprimer une partie ?
Sélectionnez la partie → Bouton "🗑️ Supprimer la partie" → Confirmer

### Les rappels J-2 ne partent pas ?
```bash
docker logs airsoft-backend | grep -i smtp
# Vérifier les erreurs SMTP
```

### Comment voir tous les logs ?
```bash
bash scripts/utility/logs.sh --service backend --lines 100
```

### Espace disque plein ?
```bash
# Nettoyer Docker
bash scripts/utility/cleanup.sh

# Vérifier espace
df -h
```

---

## 📞 Support

**En cas de problème** :
1. Consultez les logs
2. Vérifiez la documentation complète : `GUIDE_COMPLET.md`
3. Ouvrez une issue GitHub

---

**Bon courage dans la gestion de votre terrain ! 🎯**

*24 Décembre 2025*
