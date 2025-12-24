# ⚡ Lightning Tags - Documentation Technique

**Version :** 2.0  
**Date :** 24 Décembre 2025  
**Module :** Gestion des tags NFC d'identification

---

## 📋 Vue d'Ensemble

### Qu'est-ce que les Lightning Tags ?

**Lightning Tags** est un système de gestion de tags NFC (Near Field Communication) permettant :
- 🏷️ **Identification rapide** des joueurs
- 📦 **Gestion d'équipement** en temps réel
- 📊 **Suivi statistique** des participations
- ⚡ **Check-in/Check-out** automatisés

### Cas d'Usage

**Scénario typique** :
1. Admin crée 50 tags : `LT-001` à `LT-050`
2. Joueur s'inscrit en ligne pour une partie
3. Admin attribue `LT-015` au joueur
4. Le jour J, joueur récupère le tag physique
5. Tag scanné à l'entrée (futur)
6. En fin de partie, joueur restitue le tag
7. Tag redevient disponible automatiquement

### Avantages

✅ **Rapidité** : Identification instantanée  
✅ **Fiabilité** : Pas d'erreur de saisie  
✅ **Traçabilité** : Historique complet  
✅ **Évolutivité** : Base pour fonctionnalités futures  
✅ **Économie** : Tags réutilisables à l'infini

---

## 🏗️ Architecture Technique

### Base de Données

**Table `lightning_tags`** :
```sql
CREATE TABLE lightning_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,     -- Ex: "LT-001"
    is_active BOOLEAN DEFAULT TRUE,   -- Tag actif ou désactivé
    is_available BOOLEAN DEFAULT TRUE -- Disponible ou attribué
);
```

**Contraintes** :
- `name` **UNIQUE** : Pas de doublons
- `is_active` : Tag physiquement opérationnel
- `is_available` : Disponible pour attribution

### Relations

**Avec `inscriptions`** :
```sql
ALTER TABLE inscriptions
ADD COLUMN lightning_tag_id INTEGER REFERENCES lightning_tags(id);
```

**Logique** :
- Une inscription peut avoir **0 ou 1** tag
- Un tag peut être attribué à **0 ou 1** inscription active

### Schéma Entités-Relations

```
lightning_tags          inscriptions
┌─────────────┐        ┌──────────────────┐
│ id          │◄───────│ lightning_tag_id │
│ name        │        │ ...              │
│ is_active   │        └──────────────────┘
│ is_available│
└─────────────┘
```

---

## 🔧 Implémentation Backend

### Modèle SQLAlchemy

**Fichier : `backend/models.py`**

```python
class LightningTag(Base):
    __tablename__ = "lightning_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
```

### Schéma Pydantic

**Fichier : `backend/schemas.py`**

```python
class LightningTagCreate(BaseModel):
    name: str

class LightningTag(BaseModel):
    id: int
    name: str
    is_active: bool
    is_available: bool

    class Config:
        from_attributes = True
```

### Endpoints API

**Fichier : `backend/main.py`**

#### 1. Créer un Tag

```python
@app.post("/api/admin/lightning-tags", response_model=schemas.LightningTag)
async def create_lightning_tag(
    tag: schemas.LightningTagCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Créer un nouveau Lightning Tag"""
    
    # Vérifier unicité
    existing = db.query(models.LightningTag).filter(
        models.LightningTag.name == tag.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag déjà existant")
    
    # Créer
    db_tag = models.LightningTag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    return db_tag
```

#### 2. Lister les Tags

```python
@app.get("/api/admin/lightning-tags", response_model=List[schemas.LightningTag])
async def list_lightning_tags(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lister tous les Lightning Tags"""
    tags = db.query(models.LightningTag).order_by(models.LightningTag.name).all()
    return tags
```

#### 3. Activer/Désactiver un Tag

```python
@app.patch("/api/admin/lightning-tags/{tag_id}/toggle-active")
async def toggle_tag_active(
    tag_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activer ou désactiver un tag"""
    tag = db.query(models.LightningTag).filter(models.LightningTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouvé")
    
    tag.is_active = not tag.is_active
    db.commit()
    
    return {"message": "Tag mis à jour", "is_active": tag.is_active}
```

#### 4. Supprimer un Tag

```python
@app.delete("/api/admin/lightning-tags/{tag_id}")
async def delete_lightning_tag(
    tag_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer un Lightning Tag"""
    tag = db.query(models.LightningTag).filter(models.LightningTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouvé")
    
    # Vérifier qu'il n'est pas attribué
    inscription = db.query(models.Inscription).filter(
        models.Inscription.lightning_tag_id == tag_id
    ).first()
    if inscription:
        raise HTTPException(
            status_code=400,
            detail="Impossible de supprimer un tag attribué"
        )
    
    db.delete(tag)
    db.commit()
    
    return {"message": "Tag supprimé"}
```

### Logique d'Attribution

**Lors de l'attribution à une inscription** :

```python
@app.patch("/api/admin/inscriptions/{inscription_id}/assign-tag")
async def assign_lightning_tag(
    inscription_id: int,
    tag_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Attribuer un tag à une inscription"""
    
    # Vérifier inscription
    inscription = db.query(models.Inscription).filter(
        models.Inscription.id == inscription_id
    ).first()
    if not inscription:
        raise HTTPException(status_code=404, detail="Inscription non trouvée")
    
    # Vérifier tag
    tag = db.query(models.LightningTag).filter(
        models.LightningTag.id == tag_id
    ).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouvé")
    
    # Vérifier disponibilité
    if not tag.is_available or not tag.is_active:
        raise HTTPException(status_code=400, detail="Tag non disponible")
    
    # Libérer ancien tag si existant
    if inscription.lightning_tag_id:
        old_tag = db.query(models.LightningTag).filter(
            models.LightningTag.id == inscription.lightning_tag_id
        ).first()
        if old_tag:
            old_tag.is_available = True
    
    # Attribuer nouveau tag
    inscription.lightning_tag_id = tag_id
    tag.is_available = False
    
    db.commit()
    
    return {"message": "Tag attribué", "tag_name": tag.name}
```

---

## 🎨 Implémentation Frontend

### Composant LightningTags

**Fichier : `frontend/src/components/admin/LightningTags.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LightningTags = () => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');

  // Charger les tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/admin/lightning-tags', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTags(response.data);
    } catch (error) {
      console.error('Erreur chargement tags:', error);
    }
  };

  // Créer un tag
  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      await axios.post('/api/admin/lightning-tags', 
        { name: newTagName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setNewTagName('');
      fetchTags();
      alert('Tag créé !');
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  // Activer/Désactiver
  const toggleActive = async (tagId) => {
    try {
      await axios.patch(
        `/api/admin/lightning-tags/${tagId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchTags();
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  // Supprimer
  const deleteTag = async (tagId) => {
    if (!window.confirm('Supprimer ce tag ?')) return;
    
    try {
      await axios.delete(`/api/admin/lightning-tags/${tagId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTags();
      alert('Tag supprimé !');
    } catch (error) {
      alert('Erreur: ' + error.response?.data?.detail);
    }
  };

  return (
    <div className="lightning-tags">
      <h2>⚡ Lightning Tags</h2>
      
      {/* Formulaire création */}
      <div className="create-tag">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Nom du tag (ex: LT-001)"
        />
        <button onClick={createTag}>➕ Ajouter un Tag</button>
      </div>

      {/* Tableau tags */}
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Actif</th>
            <th>Disponible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map(tag => (
            <tr key={tag.id}>
              <td>{tag.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={tag.is_active}
                  onChange={() => toggleActive(tag.id)}
                />
              </td>
              <td>
                {tag.is_available ? '✅ Disponible' : '❌ Attribué'}
              </td>
              <td>
                <button onClick={() => deleteTag(tag.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LightningTags;
```

### Intégration dans Inscriptions

**Sélecteur de tag dans le tableau des inscriptions** :

```jsx
<select
  value={inscription.lightning_tag_id || ''}
  onChange={(e) => assignTag(inscription.id, e.target.value)}
>
  <option value="">-- Aucun tag --</option>
  {availableTags.map(tag => (
    <option key={tag.id} value={tag.id}>
      {tag.name}
    </option>
  ))}
</select>
```

---

## 🔄 Workflows

### Workflow 1 : Création de Tags en Masse

**Scénario** : Admin crée 50 tags LT-001 à LT-050

**Méthode manuelle** :
1. Onglet "⚡ Lightning Tags"
2. Saisir `LT-001` → Ajouter
3. Répéter 50 fois

**Méthode script (futur)** :
```python
# Script Python pour génération massive
import requests

token = "votre-token-jwt"
headers = {"Authorization": f"Bearer {token}"}

for i in range(1, 51):
    tag_name = f"LT-{i:03d}"  # LT-001, LT-002, etc.
    requests.post(
        "http://localhost:8000/api/admin/lightning-tags",
        json={"name": tag_name},
        headers=headers
    )
print("50 tags créés !")
```

### Workflow 2 : Attribution le Jour J

**Scénario** : Jour de partie, 30 inscrits arrivent

1. **Admin ouvre** : Onglet "📋 Inscriptions"
2. **Pour chaque joueur** :
   - Joueur se présente
   - Admin cherche son nom (barre de recherche)
   - Attribue un tag disponible
   - Valide le paiement
   - Joueur reçoit le tag physique
3. **Fin de partie** :
   - Admin retire l'attribution
   - Tag redevient disponible

### Workflow 3 : Gestion Tag Perdu

**Scénario** : Tag LT-025 est perdu/cassé

1. Onglet "⚡ Lightning Tags"
2. Chercher `LT-025`
3. Décocher **"Actif"**
4. Tag devient indisponible pour attribution

**Plus tard** : Tag retrouvé
1. Recocher **"Actif"**
2. Tag redevient disponible

---

## 📊 Statistiques et Rapports

### Compteurs en Temps Réel

**À afficher sur le dashboard** :

```python
# Total tags
total_tags = db.query(models.LightningTag).count()

# Tags actifs
active_tags = db.query(models.LightningTag).filter(
    models.LightningTag.is_active == True
).count()

# Tags disponibles
available_tags = db.query(models.LightningTag).filter(
    models.LightningTag.is_active == True,
    models.LightningTag.is_available == True
).count()

# Tags en cours d'utilisation
in_use_tags = db.query(models.LightningTag).filter(
    models.LightningTag.is_available == False
).count()
```

### Historique d'Utilisation

**Requête : Tags les plus utilisés** :

```sql
SELECT lt.name, COUNT(i.id) as usage_count
FROM lightning_tags lt
LEFT JOIN inscriptions i ON i.lightning_tag_id = lt.id
GROUP BY lt.id, lt.name
ORDER BY usage_count DESC
LIMIT 10;
```

---

## 🚀 Fonctionnalités Futures

### v2.1 : Scan NFC Réel

**Objectif** : Scanner physiquement les tags NFC

**Matériel** :
- Lecteur NFC USB (ex: ACR122U)
- Tags NFC NTAG213/215/216

**Implémentation** :
```python
from nfcpy import ContactlessFrontend

def scan_tag():
    clf = ContactlessFrontend('usb')
    tag = clf.connect(rdwr={'on-connect': lambda tag: False})
    
    # Récupérer UID du tag
    tag_uid = tag.identifier.hex()
    
    # Chercher en base
    db_tag = db.query(models.LightningTag).filter(
        models.LightningTag.nfc_uid == tag_uid
    ).first()
    
    return db_tag
```

### v2.2 : Check-in/Check-out Automatique

**Workflow** :
1. Joueur arrive → Scan tag à l'entrée
2. Système enregistre : `check_in_time`
3. Joueur part → Scan tag à la sortie
4. Système enregistre : `check_out_time`
5. Calcul durée présence automatique

**Nouvelle table** :
```sql
CREATE TABLE tag_scans (
    id SERIAL PRIMARY KEY,
    lightning_tag_id INTEGER REFERENCES lightning_tags(id),
    scan_type VARCHAR(10),  -- 'check_in' ou 'check_out'
    scan_time TIMESTAMP DEFAULT NOW(),
    partie_id INTEGER REFERENCES parties(id)
);
```

### v2.3 : Gestion Équipement

**Objectif** : Associer équipement aux tags

**Exemple** :
- `LT-001` → Réplique M4 + Gilet tactique + Radio
- `LT-002` → Réplique AK + Casque + Gants

**Nouvelle table** :
```sql
CREATE TABLE equipments (
    id SERIAL PRIMARY KEY,
    lightning_tag_id INTEGER REFERENCES lightning_tags(id),
    item_name VARCHAR,       -- "Réplique M4"
    item_serial VARCHAR,     -- Numéro série
    condition VARCHAR        -- "Bon état", "À réparer"
);
```

---

## 🧪 Tests

### Tests Unitaires Backend

**Fichier : `backend/tests/test_lightning_tags.py`**

```python
def test_create_lightning_tag():
    response = client.post(
        "/api/admin/lightning-tags",
        json={"name": "LT-TEST-001"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "LT-TEST-001"

def test_cannot_create_duplicate_tag():
    # Créer une fois
    client.post("/api/admin/lightning-tags", json={"name": "LT-DUP"}, ...)
    
    # Tenter de créer à nouveau
    response = client.post("/api/admin/lightning-tags", json={"name": "LT-DUP"}, ...)
    assert response.status_code == 400
    assert "déjà existant" in response.json()["detail"]

def test_cannot_delete_assigned_tag():
    # Créer tag et l'attribuer
    tag = create_tag("LT-ASSIGNED")
    assign_to_inscription(tag.id, inscription_id=1)
    
    # Tenter de supprimer
    response = client.delete(f"/api/admin/lightning-tags/{tag.id}", ...)
    assert response.status_code == 400
    assert "attribué" in response.json()["detail"]
```

### Tests Frontend

**Fichier : `frontend/src/components/admin/__tests__/LightningTags.test.jsx`**

```jsx
test('renders lightning tags list', async () => {
  render(<LightningTags />);
  
  await waitFor(() => {
    expect(screen.getByText('LT-001')).toBeInTheDocument();
  });
});

test('creates new tag', async () => {
  render(<LightningTags />);
  
  const input = screen.getByPlaceholderText(/Nom du tag/i);
  const button = screen.getByText(/Ajouter un Tag/i);
  
  fireEvent.change(input, { target: { value: 'LT-NEW' } });
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText('LT-NEW')).toBeInTheDocument();
  });
});
```

---

## 📝 Migration Base de Données

**Fichier : `backend/alembic/versions/xxx_add_lightning_tags.py`**

```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Créer table lightning_tags
    op.create_table(
        'lightning_tags',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_available', sa.Boolean(), default=True)
    )
    
    # Ajouter colonne dans inscriptions
    op.add_column('inscriptions',
        sa.Column('lightning_tag_id', sa.Integer(), sa.ForeignKey('lightning_tags.id'))
    )

def downgrade():
    op.drop_column('inscriptions', 'lightning_tag_id')
    op.drop_table('lightning_tags')
```

---

## 🎓 Conclusion

**Lightning Tags** est un système :
- ✅ **Simple** : Création et attribution rapides
- ✅ **Fiable** : Contraintes base de données
- ✅ **Évolutif** : Base pour fonctionnalités futures (scan NFC, équipement)
- ✅ **Intégré** : S'intègre parfaitement avec les inscriptions

**Prochaines étapes** :
1. v2.1 : Scan NFC réel avec lecteurs physiques
2. v2.2 : Check-in/Check-out automatique
3. v2.3 : Gestion équipement associé

---

**Documentation complète - Lightning Tags v2.0**  
*24 Décembre 2025*
