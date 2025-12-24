import React, { useState, useEffect } from 'react';
import api from '../api';
import './SiteCustomizer.css';

const PRESET_COLORS = [
  { name: 'Vert', value: '#4CAF50' },
  { name: 'Rouge', value: '#f44336' },
  { name: 'Bleu', value: '#2196F3' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Violet', value: '#9C27B0' },
  { name: 'Cyan', value: '#00BCD4' },
  { name: 'Jaune', value: '#FFC107' },
  { name: 'Rose', value: '#E91E63' },
];

function SiteCustomizer() {
  const [settings, setSettings] = useState({
    site_title: '',
    primary_color: '#4CAF50'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [customColor, setCustomColor] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings(response.data);
      setCustomColor(response.data.primary_color);
    } catch (err) {
      console.error('Erreur récupération paramètres:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.put('/api/settings', settings);
      setMessage('Paramètres sauvegardés avec succès !');
      
      // Recharger la page après 2 secondes pour appliquer les changements
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (color) => {
    setSettings({ ...settings, primary_color: color });
    setCustomColor(color);
  };

  const handleCustomColorChange = (e) => {
    const value = e.target.value;
    setCustomColor(value);
    
    // Valider le format hex
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setSettings({ ...settings, primary_color: value });
    }
  };

  return (
    <div className="site-customizer">
      <h2>⚙️ Personnalisation du site</h2>

      {message && (
        <div className="success-message">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="customizer-section">
        <h3>Titre du site</h3>
        <div className="form-group">
          <label>Titre affiché sur la page d'accueil</label>
          <input
            type="text"
            value={settings.site_title}
            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
            placeholder="Ex: Bienvenue sur le terrain de la LSPA"
            maxLength="100"
          />
          <small>Ce titre apparaîtra sur la page d'inscription</small>
        </div>
      </div>

      <div className="customizer-section">
        <h3>Couleur principale</h3>
        <p className="section-description">
          Cette couleur sera appliquée aux textes importants, bordures et barres de défilement
        </p>

        <div className="color-presets">
          <label>Couleurs prédéfinies :</label>
          <div className="preset-grid">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                className={`color-preset ${settings.primary_color === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              >
                {settings.primary_color === color.value && '✓'}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-color-input">
          <label>Ou saisissez un code couleur (RGB hex) :</label>
          <div className="color-input-group">
            <input
              type="text"
              value={customColor}
              onChange={handleCustomColorChange}
              placeholder="#4CAF50"
              pattern="^#[0-9A-Fa-f]{6}$"
              maxLength="7"
            />
            <div 
              className="color-preview" 
              style={{ backgroundColor: settings.primary_color }}
            ></div>
          </div>
          <small>Format : #RRGGBB (ex: #FF5733)</small>
        </div>
      </div>

      <div className="preview-section">
        <h3>Aperçu</h3>
        <div className="preview-box" style={{ borderColor: settings.primary_color }}>
          <h2 style={{ color: settings.primary_color }}>{settings.site_title || 'Titre du site'}</h2>
          <p>Texte normal avec des éléments en <span style={{ color: settings.primary_color }}>couleur principale</span></p>
          <button className="preview-button" style={{ backgroundColor: settings.primary_color }}>
            Bouton exemple
          </button>
          <div className="preview-scrollbox" style={{ 
            borderColor: settings.primary_color,
            '--scroll-color': settings.primary_color 
          }}>
            <p>Zone avec défilement</p>
            <p>Ligne 1</p>
            <p>Ligne 2</p>
            <p>Ligne 3</p>
            <p>Ligne 4</p>
            <p>Ligne 5</p>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={handleSave}
          className="action-button primary"
          disabled={loading}
        >
          {loading ? '💾 Sauvegarde...' : '💾 Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}

export default SiteCustomizer;
