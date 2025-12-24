# 👥 Candidatures Membres - Documentation Technique

**Version :** 2.0  
**Date :** 24 Décembre 2025  
**Module :** Gestion des demandes d'adhésion

---

## 📋 Vue d'Ensemble

### Qu'est-ce que les Candidatures ?

**Système de candidature** permettant aux joueurs de :
- 📝 **Postuler** pour devenir membre du terrain
- 💬 **Expliquer leur motivation**
- ⏳ **Suivre** leur demande

Et aux admins de :
- 📨 **Recevoir** les candidatures avec badge notification
- ✅ **Approuver** ou ❌ **Rejeter**
- 📊 **Archiver** l'historique complet

### Workflow Utilisateur

```
1. Joueur voit bouton "Rejoignez-nous" sur homepage
2. Remplit formulaire (nom, email, motivation)
3. Soumet la candidature
4. Admin reçoit notification (badge rouge sur onglet)
5. Admin lit la motivation
6. Admin approuve ou rejette
7. Admin peut contacter le candidat par email
```

---

## 🏗️ Architecture Technique

### Base de Données

**Table `candidatures`** :
```sql
CREATE TABLE candidatures (
    id SERIAL PRIMARY KEY,
    nom VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    motivation TEXT NOT NULL,
    statut VARCHAR DEFAULT 'en_attente',  -- en_attente, approuve, rejete
    date_soumission TIMESTAMP DEFAULT NOW(),
    date_traitement TIMESTAMP
);
```

**Index** :
```sql
CREATE INDEX idx_candidatures_statut ON candidatures(statut);
CREATE INDEX idx_candidatures_date ON candidatures(date_soumission DESC);
```

### États (statut)

**3 états possibles** :
1. **`en_attente`** : Candidature soumise, pas encore traitée
2. **`approuve`** : Candidature acceptée
3. **`rejete`** : Candidature refusée

**Transition d'états** :
```
en_attente → approuve
en_attente → rejete

(Pas de retour en arrière)
```

---

## 🔧 Implémentation Backend

### Modèle SQLAlchemy

**Fichier : `backend/models.py`**

```python
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Candidature(Base):
    __tablename__ = "candidatures"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    email = Column(String, nullable=False)
    motivation = Column(Text, nullable=False)
    statut = Column(String, default="en_attente")  # en_attente, approuve, rejete
    date_soumission = Column(DateTime(timezone=True), server_default=func.now())
    date_traitement = Column(DateTime(timezone=True), nullable=True)
```

### Schéma Pydantic

**Fichier : `backend/schemas.py`**

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class CandidatureCreate(BaseModel):
    """Soumission publique d'une candidature"""
    nom: str
    email: EmailStr
    motivation: str

class Candidature(BaseModel):
    """Candidature complète (admin)"""
    id: int
    nom: str
    email: str
    motivation: str
    statut: str
    date_soumission: datetime
    date_traitement: Optional[datetime] = None

    class Config:
        from_attributes = True
```

### Endpoints API

#### 1. Soumettre une Candidature (Public)

**Route** : `POST /api/candidatures`  
**Accès** : Public (pas d'authentification)

```python
@app.post("/api/candidatures", response_model=schemas.Candidature)
async def create_candidature(
    candidature: schemas.CandidatureCreate,
    db: Session = Depends(get_db)
):
    """Soumettre une nouvelle candidature (endpoint public)"""
    
    # Validation
    if len(candidature.motivation) < 20:
        raise HTTPException(
            status_code=400,
            detail="La motivation doit contenir au moins 20 caractères"
        )
    
    # Vérifier doublon email récent (même email dans les 30 derniers jours)
    recent_candidature = db.query(models.Candidature).filter(
        models.Candidature.email == candidature.email,
        models.Candidature.date_soumission >= datetime.now() - timedelta(days=30)
    ).first()
    
    if recent_candidature:
        raise HTTPException(
            status_code=400,
            detail="Vous avez déjà soumis une candidature récemment"
        )
    
    # Créer candidature
    db_candidature = models.Candidature(
        nom=candidature.nom,
        email=candidature.email,
        motivation=candidature.motivation
    )
    db.add(db_candidature)
    db.commit()
    db.refresh(db_candidature)
    
    return db_candidature
```

#### 2. Lister les Candidatures (Admin)

**Route** : `GET /api/admin/candidatures`  
**Accès** : Authentifié (admin uniquement)

```python
@app.get("/api/admin/candidatures", response_model=List[schemas.Candidature])
async def list_candidatures(
    statut: Optional[str] = None,  # Filtre optionnel
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lister toutes les candidatures avec filtre optionnel"""
    
    query = db.query(models.Candidature)
    
    # Filtre par statut si spécifié
    if statut:
        query = query.filter(models.Candidature.statut == statut)
    
    # Tri : en attente d'abord, puis par date décroissante
    candidatures = query.order_by(
        models.Candidature.statut.desc(),  # en_attente en premier
        models.Candidature.date_soumission.desc()
    ).all()
    
    return candidatures
```

#### 3. Compter les Candidatures en Attente (Badge)

**Route** : `GET /api/admin/candidatures/count-pending`  
**Accès** : Authentifié (admin uniquement)

```python
@app.get("/api/admin/candidatures/count-pending")
async def count_pending_candidatures(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compter les candidatures en attente pour le badge de notification"""
    
    count = db.query(models.Candidature).filter(
        models.Candidature.statut == "en_attente"
    ).count()
    
    return {"count": count}
```

#### 4. Approuver une Candidature

**Route** : `PATCH /api/admin/candidatures/{candidature_id}/approve`  
**Accès** : Authentifié (admin uniquement)

```python
@app.patch("/api/admin/candidatures/{candidature_id}/approve")
async def approve_candidature(
    candidature_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approuver une candidature"""
    
    # Récupérer candidature
    candidature = db.query(models.Candidature).filter(
        models.Candidature.id == candidature_id
    ).first()
    
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    if candidature.statut != "en_attente":
        raise HTTPException(
            status_code=400,
            detail="Candidature déjà traitée"
        )
    
    # Approuver
    candidature.statut = "approuve"
    candidature.date_traitement = datetime.now()
    db.commit()
    
    return {
        "message": "Candidature approuvée",
        "candidature_id": candidature_id,
        "nom": candidature.nom,
        "email": candidature.email
    }
```

#### 5. Rejeter une Candidature

**Route** : `PATCH /api/admin/candidatures/{candidature_id}/reject`  
**Accès** : Authentifié (admin uniquement)

```python
@app.patch("/api/admin/candidatures/{candidature_id}/reject")
async def reject_candidature(
    candidature_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rejeter une candidature"""
    
    candidature = db.query(models.Candidature).filter(
        models.Candidature.id == candidature_id
    ).first()
    
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    if candidature.statut != "en_attente":
        raise HTTPException(
            status_code=400,
            detail="Candidature déjà traitée"
        )
    
    # Rejeter
    candidature.statut = "rejete"
    candidature.date_traitement = datetime.now()
    db.commit()
    
    return {
        "message": "Candidature rejetée",
        "candidature_id": candidature_id
    }
```

#### 6. Supprimer une Candidature

**Route** : `DELETE /api/admin/candidatures/{candidature_id}`  
**Accès** : Authentifié (admin uniquement)

```python
@app.delete("/api/admin/candidatures/{candidature_id}")
async def delete_candidature(
    candidature_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer définitivement une candidature"""
    
    candidature = db.query(models.Candidature).filter(
        models.Candidature.id == candidature_id
    ).first()
    
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    db.delete(candidature)
    db.commit()
    
    return {"message": "Candidature supprimée"}
```

---

## 🎨 Implémentation Frontend

### Formulaire Public (Homepage)

**Fichier : `frontend/src/components/CandidatureForm.jsx`**

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const CandidatureForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motivation: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/candidatures', formData);
      setSubmitted(true);
      alert('Candidature envoyée avec succès !');
      setFormData({ nom: '', email: '', motivation: '' });
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  return (
    <div className="candidature-form">
      <h2>Rejoignez-nous !</h2>
      {submitted ? (
        <p className="success">
          ✅ Votre candidature a été envoyée. Nous vous contacterons bientôt !
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
              placeholder="Jean Dupont"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="jean.dupont@email.com"
            />
          </div>

          <div className="form-group">
            <label>Motivation * (minimum 20 caractères)</label>
            <textarea
              value={formData.motivation}
              onChange={(e) => setFormData({...formData, motivation: e.target.value})}
              required
              rows={6}
              placeholder="Expliquez pourquoi vous souhaitez rejoindre notre terrain..."
            />
            <small>{formData.motivation.length} caractères</small>
          </div>

          <button type="submit" className="btn-primary">
            📤 Envoyer ma candidature
          </button>
        </form>
      )}
    </div>
  );
};

export default CandidatureForm;
```

### Interface Admin

**Fichier : `frontend/src/components/admin/Candidatures.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Candidatures = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [filter, setFilter] = useState('en_attente'); // tous, en_attente, approuve, rejete
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidatures();
  }, [filter]);

  const fetchCandidatures = async () => {
    try {
      const params = filter !== 'tous' ? { statut: filter } : {};
      const response = await axios.get('/api/admin/candidatures', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCandidatures(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const approveCandidature = async (id) => {
    try {
      await axios.patch(
        `/api/admin/candidatures/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      alert('Candidature approuvée !');
      fetchCandidatures();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  const rejectCandidature = async (id) => {
    if (!window.confirm('Rejeter cette candidature ?')) return;
    
    try {
      await axios.patch(
        `/api/admin/candidatures/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      alert('Candidature rejetée.');
      fetchCandidatures();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  const deleteCandidature = async (id) => {
    if (!window.confirm('Supprimer définitivement cette candidature ?')) return;
    
    try {
      await axios.delete(`/api/admin/candidatures/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Candidature supprimée.');
      fetchCandidatures();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'en_attente': { color: 'orange', icon: '⏳', text: 'En attente' },
      'approuve': { color: 'green', icon: '✅', text: 'Approuvé' },
      'rejete': { color: 'red', icon: '❌', text: 'Rejeté' }
    };
    const badge = badges[statut];
    return (
      <span className={`badge badge-${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="candidatures">
      <h2>👥 Candidatures Membres</h2>

      {/* Filtres */}
      <div className="filters">
        <button
          className={filter === 'en_attente' ? 'active' : ''}
          onClick={() => setFilter('en_attente')}
        >
          ⏳ En attente ({candidatures.filter(c => c.statut === 'en_attente').length})
        </button>
        <button
          className={filter === 'approuve' ? 'active' : ''}
          onClick={() => setFilter('approuve')}
        >
          ✅ Approuvées
        </button>
        <button
          className={filter === 'rejete' ? 'active' : ''}
          onClick={() => setFilter('rejete')}
        >
          ❌ Rejetées
        </button>
        <button
          className={filter === 'tous' ? 'active' : ''}
          onClick={() => setFilter('tous')}
        >
          📋 Toutes
        </button>
      </div>

      {/* Liste */}
      {candidatures.length === 0 ? (
        <p className="empty">Aucune candidature.</p>
      ) : (
        <div className="candidatures-list">
          {candidatures.map(candidature => (
            <div key={candidature.id} className="candidature-card">
              <div className="candidature-header">
                <h3>{candidature.nom}</h3>
                {getStatutBadge(candidature.statut)}
              </div>

              <p className="email">✉️ {candidature.email}</p>
              
              <p className="date">
                📅 Soumise le {new Date(candidature.date_soumission).toLocaleDateString()}
              </p>
              
              {candidature.date_traitement && (
                <p className="date-traitement">
                  ✅ Traitée le {new Date(candidature.date_traitement).toLocaleDateString()}
                </p>
              )}

              <div className="motivation">
                <strong>Motivation :</strong>
                <p>{candidature.motivation}</p>
              </div>

              {candidature.statut === 'en_attente' && (
                <div className="actions">
                  <button
                    className="btn-approve"
                    onClick={() => approveCandidature(candidature.id)}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => rejectCandidature(candidature.id)}
                  >
                    ❌ Rejeter
                  </button>
                </div>
              )}

              {candidature.statut !== 'en_attente' && (
                <div className="actions">
                  <button
                    className="btn-delete"
                    onClick={() => deleteCandidature(candidature.id)}
                  >
                    🗑️ Supprimer
                  </button>
                  <a
                    href={`mailto:${candidature.email}`}
                    className="btn-email"
                  >
                    ✉️ Contacter
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidatures;
```

### Badge Notification (Sidebar)

**Fichier : `frontend/src/components/admin/Sidebar.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await axios.get('/api/admin/candidatures/count-pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingCount(response.data.count);
    } catch (error) {
      console.error('Erreur compteur:', error);
    }
  };

  return (
    <div className="sidebar">
      {/* ... autres onglets ... */}
      
      <button
        className={activeTab === 'candidatures' ? 'active' : ''}
        onClick={() => setActiveTab('candidatures')}
      >
        👥 Candidatures
        {pendingCount > 0 && (
          <span className="badge-notification">{pendingCount}</span>
        )}
      </button>
      
      {/* ... autres onglets ... */}
    </div>
  );
};

export default Sidebar;
```

**CSS pour le badge** :
```css
.badge-notification {
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## 🔄 Workflows Complets

### Workflow 1 : Soumission Candidature

```
1. Joueur sur homepage → Clic "Rejoignez-nous"
2. Formulaire s'affiche
3. Remplissage :
   - Nom : Jean Dupont
   - Email : jean@email.com
   - Motivation : "Je joue depuis 3 ans, j'adore votre terrain..."
4. Validation minimum 20 caractères
5. Clic "Envoyer"
6. Backend crée candidature (statut = en_attente)
7. Message de confirmation
8. Badge +1 sur onglet admin "👥 Candidatures"
```

### Workflow 2 : Traitement Admin

```
1. Admin voit badge rouge "👥 1" dans sidebar
2. Clic sur onglet "Candidatures"
3. Filtre "En attente" actif par défaut
4. Liste affiche 1 candidature :
   - Nom : Jean Dupont
   - Email : jean@email.com
   - Motivation : "Je joue depuis 3 ans..."
   - Date : 24/12/2025
5. Admin lit la motivation
6. Décision :
   
   OPTION A - Approuver :
   - Clic "✅ Approuver"
   - Statut → "approuve"
   - Date traitement enregistrée
   - Badge -1
   - Admin peut contacter par email
   
   OPTION B - Rejeter :
   - Clic "❌ Rejeter"
   - Confirmation
   - Statut → "rejete"
   - Date traitement enregistrée
   - Badge -1
   - Reste dans l'historique
```

### Workflow 3 : Suivi Historique

```
1. Onglet "Candidatures"
2. Filtres :
   - "En attente" : 2 candidatures
   - "Approuvées" : 15 candidatures
   - "Rejetées" : 3 candidatures
   - "Toutes" : 20 candidatures
3. Tri chronologique inverse (plus récentes en premier)
4. Possibilité de supprimer définitivement
5. Bouton "✉️ Contacter" pour chaque candidature
```

---

## 📊 Statistiques

### Métriques Utiles

**Dashboard Admin** :

```python
# Total candidatures
total = db.query(models.Candidature).count()

# En attente
pending = db.query(models.Candidature).filter(
    models.Candidature.statut == "en_attente"
).count()

# Taux d'approbation
approved = db.query(models.Candidature).filter(
    models.Candidature.statut == "approuve"
).count()
rejected = db.query(models.Candidature).filter(
    models.Candidature.statut == "rejete"
).count()
treated = approved + rejected
approval_rate = (approved / treated * 100) if treated > 0 else 0

# Temps moyen de traitement
avg_treatment_time = db.query(
    func.avg(
        models.Candidature.date_traitement - models.Candidature.date_soumission
    )
).filter(
    models.Candidature.date_traitement.isnot(None)
).scalar()
```

---

## 🧪 Tests

### Tests Backend

```python
def test_submit_candidature():
    response = client.post("/api/candidatures", json={
        "nom": "Jean Test",
        "email": "jean@test.com",
        "motivation": "Motivation de test avec plus de 20 caractères."
    })
    assert response.status_code == 200
    assert response.json()["statut"] == "en_attente"

def test_cannot_submit_short_motivation():
    response = client.post("/api/candidatures", json={
        "nom": "Jean",
        "email": "jean@test.com",
        "motivation": "Court"  # < 20 caractères
    })
    assert response.status_code == 400

def test_approve_candidature():
    # Créer candidature
    candidature = create_test_candidature()
    
    # Approuver
    response = client.patch(
        f"/api/admin/candidatures/{candidature.id}/approve",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert "approuvée" in response.json()["message"]
    
    # Vérifier en base
    db_candidature = db.query(models.Candidature).filter(
        models.Candidature.id == candidature.id
    ).first()
    assert db_candidature.statut == "approuve"
    assert db_candidature.date_traitement is not None
```

---

## 🚀 Évolutions Futures

### v2.1 : Email Automatique au Candidat

```python
# Après approbation
send_email(
    to=candidature.email,
    subject="Candidature approuvée !",
    body=f"""
    Bonjour {candidature.nom},
    
    Félicitations ! Votre candidature pour rejoindre notre terrain a été approuvée.
    
    Nous vous contacterons prochainement pour finaliser votre adhésion.
    
    À très bientôt !
    """
)
```

### v2.2 : Portail Candidat

- URL unique pour suivre sa candidature
- Statut en temps réel
- Modification possible avant traitement

### v2.3 : Formulaire Étendu

- Questions supplémentaires :
  - Expérience airsoft (années)
  - Répliques possédées
  - Disponibilités
  - Compétences particulières

---

**Documentation complète - Candidatures v2.0**  
*24 Décembre 2025*
