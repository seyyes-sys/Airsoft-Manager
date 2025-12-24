import React, { useState, useEffect } from 'react';
import api from '../api';
import './EditPlayerModal.css';

function EditPlayerModal({ player, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    email: '',
    phone: '',
    attendance_type: 'full_day',
    has_association: false,
    association_name: '',
    bb_weight_pistol: '',
    bb_weight_rifle: '',
    has_second_rifle: false,
    bb_weight_rifle_2: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (player) {
      setFormData({
        first_name: player.first_name || '',
        last_name: player.last_name || '',
        nickname: player.nickname || '',
        email: player.email || '',
        phone: player.phone || '',
        attendance_type: player.attendance_type || 'full_day',
        has_association: player.has_association || false,
        association_name: player.association_name || '',
        bb_weight_pistol: player.bb_weight_pistol || '',
        bb_weight_rifle: player.bb_weight_rifle || '',
        has_second_rifle: player.has_second_rifle || false,
        bb_weight_rifle_2: player.bb_weight_rifle_2 || ''
      });
    }
  }, [player]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/api/registrations/${player.id}`, formData);
      alert('Inscription mise à jour avec succès !');
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Erreur lors de la mise à jour de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (!player) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Modifier l'inscription</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="error-message" style={{ 
            padding: '10px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            borderRadius: '4px', 
            marginBottom: '15px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h3>Informations personnelles</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Pseudo *</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Type de présence</h3>
            <div className="form-group">
              <select
                name="attendance_type"
                value={formData.attendance_type}
                onChange={handleChange}
              >
                <option value="full_day">Journée entière</option>
                <option value="morning">Matinée uniquement</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Association</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="has_association"
                  checked={formData.has_association}
                  onChange={handleChange}
                />
                Membre d'une association
              </label>
            </div>
            {formData.has_association && (
              <div className="form-group">
                <label>Nom de l'association</label>
                <input
                  type="text"
                  name="association_name"
                  value={formData.association_name}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Grammages des billes</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Grammage PA</label>
                <select
                  name="bb_weight_pistol"
                  value={formData.bb_weight_pistol}
                  onChange={handleChange}
                >
                  <option value="">-- Non renseigné --</option>
                  <option value="0.20g">0.20g</option>
                  <option value="0.23g">0.23g</option>
                  <option value="0.25g">0.25g</option>
                  <option value="0.28g">0.28g</option>
                  <option value="0.30g">0.30g</option>
                  <option value="0.32g">0.32g</option>
                </select>
              </div>
              <div className="form-group">
                <label>Grammage Longue</label>
                <select
                  name="bb_weight_rifle"
                  value={formData.bb_weight_rifle}
                  onChange={handleChange}
                >
                  <option value="">-- Non renseigné --</option>
                  <option value="0.20g">0.20g</option>
                  <option value="0.23g">0.23g</option>
                  <option value="0.25g">0.25g</option>
                  <option value="0.28g">0.28g</option>
                  <option value="0.30g">0.30g</option>
                  <option value="0.32g">0.32g</option>
                  <option value="0.36g">0.36g</option>
                  <option value="0.40g">0.40g</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="has_second_rifle"
                  checked={formData.has_second_rifle}
                  onChange={handleChange}
                />
                Seconde réplique longue
              </label>
            </div>

            {formData.has_second_rifle && (
              <div className="form-group">
                <label>Grammage Longue 2</label>
                <select
                  name="bb_weight_rifle_2"
                  value={formData.bb_weight_rifle_2}
                  onChange={handleChange}
                >
                  <option value="">-- Non renseigné --</option>
                  <option value="0.20g">0.20g</option>
                  <option value="0.23g">0.23g</option>
                  <option value="0.25g">0.25g</option>
                  <option value="0.28g">0.28g</option>
                  <option value="0.30g">0.30g</option>
                  <option value="0.32g">0.32g</option>
                  <option value="0.36g">0.36g</option>
                  <option value="0.40g">0.40g</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="action-button secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="action-button primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPlayerModal;
