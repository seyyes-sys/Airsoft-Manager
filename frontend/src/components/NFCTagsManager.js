import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './NFCTagsManager.css';

function NFCTagsManager() {
  // États
  const [nfcTags, setNfcTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ tag_number: '', is_active: true });
  const [isCreating, setIsCreating] = useState(false);

  // Gestion du redimensionnement des colonnes
  const [resizing, setResizing] = useState(null);
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('nfcTagsColumnWidths');
    return saved ? JSON.parse(saved) : [90, 90, 60, 60];
  });

  // Sauvegarder les largeurs dans localStorage
  const saveColumnWidths = (widths) => {
    setColumnWidths(widths);
    localStorage.setItem('nfcTagsColumnWidths', JSON.stringify(widths));
  };

  // Gérer le début du redimensionnement
  const handleMouseDown = (colIndex, e) => {
    e.preventDefault();
    setResizing({ colIndex, startX: e.pageX });
  };

  // Gérer le mouvement de la souris
  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    const diff = e.pageX - resizing.startX;
    const newWidths = [...columnWidths];
    const currentWidth = newWidths[resizing.colIndex];
    const newWidth = Math.max(50, currentWidth + diff);
    newWidths[resizing.colIndex] = newWidth;
    saveColumnWidths(newWidths);
    setResizing({ ...resizing, startX: e.pageX });
  }, [resizing, columnWidths]);

  // Gérer la fin du redimensionnement
  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  // Ajouter les listeners globaux
  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    fetchNFCTags();
  }, []);

  // Récupérer les tags NFC
  const fetchNFCTags = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/nfc-tags');
      // Trier par numéro de tag
      const sortedTags = response.data.sort((a, b) => 
        a.tag_number.localeCompare(b.tag_number)
      );
      setNfcTags(sortedTags);
    } catch (error) {
      console.error('Erreur lors de la récupération des tags NFC:', error);
      alert('Erreur lors du chargement des tags NFC');
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau tag
  const handleCreate = async () => {
    if (!formData.tag_number.trim()) {
      alert('Le numéro du tag est requis');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/nfc-tags', formData);
      alert('Tag NFC créé avec succès');
      setFormData({ tag_number: '', is_active: true });
      setIsCreating(false);
      fetchNFCTags();
    } catch (error) {
      console.error('Erreur lors de la création du tag:', error);
      if (error.response?.status === 400) {
        alert('Ce numéro de tag existe déjà');
      } else {
        alert('Erreur lors de la création du tag');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un tag
  const handleUpdate = async (id) => {
    const tag = nfcTags.find(t => t.id === id);
    
    if (!tag.tag_number.trim()) {
      alert('Le numéro du tag est requis');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/nfc-tags/${id}`, {
        tag_number: tag.tag_number,
        is_active: tag.is_active
      });
      alert('Tag NFC mis à jour avec succès');
      setEditingId(null);
      fetchNFCTags();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tag:', error);
      if (error.response?.status === 400) {
        alert('Ce numéro de tag existe déjà');
      } else {
        alert('Erreur lors de la mise à jour du tag');
      }
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un tag
  const handleDelete = async (id) => {
    const tag = nfcTags.find(t => t.id === id);
    
    if (tag && !tag.is_available) {
      alert('Impossible de supprimer un tag attribué à un joueur');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce tag NFC ?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/nfc-tags/${id}`);
      alert('Tag NFC supprimé avec succès');
      fetchNFCTags();
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      if (error.response?.status === 400) {
        alert('Impossible de supprimer un tag attribué');
      } else {
        alert('Erreur lors de la suppression du tag');
      }
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de champs en édition inline
  const handleFieldChange = (id, field, value) => {
    setNfcTags(nfcTags.map(tag =>
      tag.id === id ? { ...tag, [field]: value } : tag
    ));
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingId(null);
    fetchNFCTags(); // Recharger pour annuler les modifications
  };

  // Annuler la création
  const handleCancelCreate = () => {
    setIsCreating(false);
    setFormData({ tag_number: '', is_active: true });
  };

  return (
    <div className="payment-types-manager">
      {/* En-tête */}
      <div className="header-section">
        <h2>⚡ Lightning Tags NFC</h2>
        <p className="subtitle">
          Gérez les tags NFC Lightning pour l'identification rapide des joueurs
          <button
            onClick={() => {
              localStorage.removeItem('nfcTagsColumnWidths');
              setColumnWidths([90, 90, 60, 60]);
            }}
            style={{
              marginLeft: '15px',
              padding: '4px 8px',
              fontSize: '0.75em',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🔄 Réinitialiser tailles colonnes
          </button>
        </p>
      </div>

      {/* Bouton de création */}
      {!isCreating && (
        <button 
          className="create-button" 
          onClick={() => setIsCreating(true)}
          disabled={loading}
        >
          ➕ Nouveau tag
        </button>
      )}

      {/* Formulaire de création */}
      {isCreating && (
        <div className="create-form">
          <h3>Créer un nouveau tag NFC</h3>
          <div className="form-group">
            <label>Numéro du Tag *</label>
            <input
              type="text"
              value={formData.tag_number}
              onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
              placeholder="Ex: TAG001, NFC-A1, etc."
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={loading}
              />
              {' '}Tag actif
            </label>
          </div>
          <div className="form-actions">
            <button 
              className="action-button success" 
              onClick={handleCreate}
              disabled={loading}
            >
              Créer
            </button>
            <button 
              className="action-button" 
              onClick={handleCancelCreate}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table des tags */}
      {loading && <p>Chargement...</p>}
      
      {!loading && nfcTags.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
          Aucun tag NFC enregistré
        </p>
      )}

      {!loading && nfcTags.length > 0 && (
        <div className="table-container">
          <table 
            className="nfc-tags-table"
            style={{ 
              width: `${columnWidths.reduce((a, b) => a + b, 0)}px`,
              tableLayout: 'fixed'
            }}
          >
            <thead>
              <tr>
                {['Numéro du Tag', 'Disponible', 'Actif', 'Actions'].map((label, idx) => (
                  <th key={idx} style={{ width: `${columnWidths[idx]}px`, position: 'relative' }}>
                    {label}
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown(idx, e)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '5px',
                        cursor: 'col-resize',
                        backgroundColor: 'transparent',
                        userSelect: 'none'
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nfcTags.map(tag => (
                <tr key={tag.id}>
                  {/* Numéro du tag */}
                  <td>
                    {editingId === tag.id ? (
                      <input
                        type="text"
                        value={tag.tag_number}
                        onChange={(e) => handleFieldChange(tag.id, 'tag_number', e.target.value)}
                        disabled={loading}
                        style={{ width: '95%' }}
                      />
                    ) : (
                      <strong>{tag.tag_number}</strong>
                    )}
                  </td>

                  {/* Statut de disponibilité */}
                  <td>
                    <span 
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'bold',
                        backgroundColor: tag.is_available ? '#28a745' : '#dc3545',
                        color: 'white'
                      }}
                    >
                      {tag.is_available ? '✓ Disponible' : '⚠ Attribué'}
                    </span>
                  </td>

                  {/* Statut actif */}
                  <td>
                    <input
                      type="checkbox"
                      checked={tag.is_active}
                      onChange={(e) => handleFieldChange(tag.id, 'is_active', e.target.checked)}
                      disabled={editingId !== tag.id || loading}
                    />
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="action-buttons-group">
                      {editingId === tag.id ? (
                        <>
                          <button
                            className="action-button success"
                            onClick={() => handleUpdate(tag.id)}
                            disabled={loading}
                            title="Enregistrer"
                          >
                            💾
                          </button>
                          <button
                            className="action-button"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            title="Annuler"
                          >
                            ✖
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-button"
                            onClick={() => setEditingId(tag.id)}
                            disabled={loading || editingId !== null}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-button danger"
                            onClick={() => handleDelete(tag.id)}
                            disabled={loading || editingId !== null}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Boîte d'information */}
      <div className="info-box">
        <h4>ℹ️ À propos des Lightning Tags</h4>
        <ul>
          <li>Les tags NFC permettent une identification rapide des joueurs lors des parties</li>
          <li>Un tag "Disponible" peut être attribué à un joueur dans la gestion des utilisateurs</li>
          <li>Un tag "Attribué" est actuellement lié à un joueur et ne peut pas être supprimé</li>
          <li>Désactivez temporairement un tag sans le supprimer en décochant "Actif"</li>
          <li>Le numéro de tag doit être unique dans le système</li>
        </ul>
      </div>
    </div>
  );
}

export default NFCTagsManager;
