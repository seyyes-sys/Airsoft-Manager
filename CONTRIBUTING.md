# Contributing to Airsoft Manager

Merci de votre intérêt pour contribuer à Airsoft Manager ! 🎉

## Comment Contribuer

### Signaler un Bug 🐛

1. Vérifiez que le bug n'est pas déjà signalé dans les [Issues](https://github.com/VOTRE_USERNAME/airsoft-manager/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Décrivez précisément :
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Logs/screenshots si possible
   - Environnement (OS, Docker version, etc.)

### Proposer une Fonctionnalité 💡

1. Ouvrez une issue avec le template "Feature Request"
2. Expliquez le problème que ça résout
3. Décrivez la solution proposée
4. Discutez avec les mainteneurs avant de coder

### Soumettre une Pull Request 🔀

1. **Fork** le projet
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commitez vos changements : `git commit -m 'feat: ajouter ma fonctionnalité'`
4. Pushez : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request

#### Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage, pas de changement de code
- `refactor:` - Refactoring
- `test:` - Ajout de tests
- `chore:` - Maintenance

**Exemples :**
```
feat(backend): ajouter endpoint pour statistiques avancées
fix(frontend): corriger erreur de validation du formulaire
docs: mettre à jour guide de déploiement Caddy
refactor(auth): simplifier la gestion des sessions
```

### Développement Local

```bash
# 1. Cloner le repo
git clone https://github.com/VOTRE_USERNAME/airsoft-manager.git
cd airsoft-manager

# 2. Copier .env.example
cp .env.example .env
# Éditez .env avec vos paramètres locaux

# 3. Lancer en dev
docker compose up -d

# 4. Accéder à l'app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Configuration de Développement

#### Backend (FastAPI)

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer en mode dev (avec hot reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (React + Vite)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en mode dev (avec HMR)
npm run dev

# Builder pour production
npm run build
```

### Tests

#### Backend

```bash
cd backend

# Lancer tous les tests
pytest

# Avec coverage
pytest --cov=. --cov-report=html

# Tests spécifiques
pytest tests/test_auth.py -v
```

#### Frontend

```bash
cd frontend

# Lancer les tests
npm test

# Avec coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Linting et Formatage

#### Backend (Python)

```bash
cd backend

# Formatter avec black
black .

# Linter avec flake8
flake8 .

# Type checking avec mypy
mypy .
```

#### Frontend (JavaScript/TypeScript)

```bash
cd frontend

# Linter ESLint
npm run lint

# Fix automatique
npm run lint:fix

# Formatter Prettier
npm run format
```

## Standards de Code

### Python (Backend)

- Suivre [PEP 8](https://peps.python.org/pep-0008/)
- Utiliser des type hints
- Documenter les fonctions complexes (docstrings)
- Noms de variables explicites en anglais
- Maximum 88 caractères par ligne (Black)

**Exemple :**
```python
from typing import List, Optional
from pydantic import BaseModel

class User(BaseModel):
    """Modèle utilisateur."""
    id: int
    email: str
    full_name: Optional[str] = None

async def get_active_users(limit: int = 100) -> List[User]:
    """
    Récupère les utilisateurs actifs.
    
    Args:
        limit: Nombre maximum d'utilisateurs à retourner
        
    Returns:
        Liste des utilisateurs actifs
    """
    # Implementation
    pass
```

### JavaScript/TypeScript (Frontend)

- Suivre [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Composants fonctionnels avec Hooks
- PropTypes ou TypeScript
- Noms de composants en PascalCase
- Maximum 80 caractères par ligne

**Exemple :**
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserCard = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onUpdate(user.id)}>
        Update
      </button>
    </div>
  );
};

UserCard.propTypes = {
  userId: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default UserCard;
```

## Code Review

Toute Pull Request sera reviewée par un mainteneur. Merci de :

- ✅ **Tester localement** avant de soumettre
- ✅ **Suivre les conventions** de code et commit
- ✅ **Documenter** les changements complexes
- ✅ **Ajouter des tests** si applicable
- ✅ **Garder les PRs petites** (< 400 lignes si possible)
- ✅ **Répondre aux commentaires** de review
- ✅ **Squash les commits** avant merge (si demandé)

### Checklist PR

Avant de soumettre votre PR, vérifiez que :

- [ ] Le code build sans erreur
- [ ] Tous les tests passent
- [ ] Le linter ne signale aucun problème
- [ ] La documentation est à jour
- [ ] Les commits suivent les conventions
- [ ] Pas de secrets/credentials hardcodés
- [ ] Les changements sont testés manuellement

## Structure du Projet

```
airsoft-manager/
├── backend/              # API FastAPI
│   ├── main.py          # Point d'entrée
│   ├── models/          # Modèles SQLAlchemy
│   ├── routes/          # Endpoints API
│   ├── services/        # Logique métier
│   ├── utils/           # Utilitaires
│   └── tests/           # Tests pytest
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages
│   │   ├── services/    # API calls
│   │   └── utils/       # Utilitaires
│   └── public/          # Assets statiques
├── docker/              # Configuration Docker
│   ├── caddy/          # Dockerfile Caddy
│   └── compose/        # docker-compose files
├── docs/                # Documentation
│   ├── deploiement/    # Guides de déploiement
│   ├── fonctionnalites/ # Documentation features
│   └── guides/         # Guides utilisateur
├── scripts/             # Scripts utilitaires
│   ├── backup/         # Scripts de backup
│   ├── build/          # Scripts de build
│   └── deployment/     # Scripts de déploiement
└── config/              # Configuration (Caddyfile, etc.)
```

## Branches

- `main` - Branche principale (production-ready)
- `develop` - Branche de développement (features en cours)
- `feature/*` - Nouvelles fonctionnalités
- `fix/*` - Corrections de bugs
- `docs/*` - Modifications documentation
- `hotfix/*` - Corrections urgentes en production

## Versioning

Nous utilisons [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH) :

- **MAJOR** : Changements incompatibles (breaking changes)
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs compatibles

**Exemples :**
- `1.0.0` → `1.1.0` : Nouvelle fonctionnalité (ajout de statistiques)
- `1.1.0` → `1.1.1` : Correction de bug (fix email)
- `1.1.1` → `2.0.0` : Breaking change (nouvelle API auth)

## Releases

Pour créer une release :

1. Mettre à jour `CHANGELOG.md`
2. Créer un tag Git : `git tag -a v1.1.0 -m "Release v1.1.0"`
3. Pusher le tag : `git push origin v1.1.0`
4. Créer une GitHub Release avec le changelog

## Questions et Support

### Pour les Contributeurs

- 💬 **Discussions générales** : [GitHub Discussions](https://github.com/VOTRE_USERNAME/airsoft-manager/discussions)
- 🐛 **Bugs** : [GitHub Issues](https://github.com/VOTRE_USERNAME/airsoft-manager/issues)
- 📧 **Email privé** : [VOTRE_EMAIL]

### Ressources Utiles

- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation React](https://react.dev/)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Caddy](https://caddyserver.com/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Code de Conduite

Ce projet adhère au [Code de Conduite](./CODE_OF_CONDUCT.md). En participant, vous acceptez de respecter ses termes.

## Licence

En contribuant, vous acceptez que vos contributions soient sous la même [licence MIT](./LICENSE) que le projet.

---

## 🙏 Merci de Contribuer !

Chaque contribution, qu'elle soit grande ou petite, est précieuse. Merci de faire partie de ce projet ! ❤️

**Questions ?** N'hésitez pas à ouvrir une Discussion ou une Issue !
