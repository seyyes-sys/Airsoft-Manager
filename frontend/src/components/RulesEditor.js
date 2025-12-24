import React, { useState, useEffect } from 'react';
import './RulesEditor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function RulesEditor() {
  const [rules, setRules] = useState({
    security: '',
    power_distances: '',
    power_distances_indoor: '',
    power_distances_outdoor: '',
    fair_play: '',
    shooting_rules: '',
    pyrotechnics: '',
    terrain_respect: '',
    safety_stop: '',
    formal_bans: '',
    important_info: ''
  });
  const [showIndoor, setShowIndoor] = useState(false);
  const [showOutdoor, setShowOutdoor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('security');
  const [versions, setVersions] = useState([]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  const sections = [
    { key: 'security', title: 'Sécurité', icon: '🎯' },
    { key: 'power_distances', title: 'Puissances et Distances', icon: '⚡' },
    { key: 'fair_play', title: 'Fair-Play et Élimination', icon: '🎮' },
    { key: 'shooting_rules', title: 'Règles de Tir', icon: '🔫' },
    { key: 'pyrotechnics', title: 'Pyrotechnie et Grenades', icon: '💥' },
    { key: 'terrain_respect', title: 'Respect du Terrain', icon: '🌳' },
    { key: 'safety_stop', title: 'Sécurité et Arrêt de Jeu', icon: '🛑' },
    { key: 'formal_bans', title: 'Interdictions Formelles', icon: '🚫' },
    { key: 'important_info', title: 'Informations Importantes', icon: '⚡', isImportant: true }
  ];

  useEffect(() => {
    fetchRules();
    fetchVersions();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rules`);
      if (response.ok) {
        const data = await response.json();
        setRules(data);
        // Activer les checkboxes si les sous-sections ont du contenu
        if (data.power_distances_indoor) setShowIndoor(true);
        if (data.power_distances_outdoor) setShowOutdoor(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rules)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Règles mises à jour avec succès !' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, value) => {
    setRules(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const fetchVersions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rule-versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des versions:', error);
    }
  };

  const handleSaveVersion = async () => {
    if (!newVersionName.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un nom pour la version' });
      return;
    }

    if (versions.length >= 3) {
      setMessage({ type: 'error', text: 'Maximum 3 versions. Supprimez-en une avant d\'en créer une nouvelle.' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/rule-versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ version_name: newVersionName })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Version sauvegardée avec succès !' });
        setNewVersionName('');
        setShowVersionModal(false);
        fetchVersions();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVersion = async (versionId, versionName) => {
    if (!window.confirm(`Voulez-vous vraiment appliquer la version "${versionName}" ? Les règles actuelles seront remplacées.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/rule-versions/${versionId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Version "${versionName}" appliquée !` });
        fetchRules();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'application de la version' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async (versionId, versionName) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer la version "${versionName}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/rule-versions/${versionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Version supprimée' });
        fetchVersions();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rules-editor">
      <div className="rules-editor-header">
        <h2>📋 Gestion des Règles du Terrain</h2>
        <p>Modifiez les différentes sections des règles affichées sur la page d'inscription</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="rules-editor-container">
        <div className="rules-sections-menu">
          <h3>Sections</h3>
          {sections.map(section => (
            <button
              key={section.key}
              className={`section-button ${activeSection === section.key ? 'active' : ''} ${section.isImportant ? 'important' : ''}`}
              onClick={() => setActiveSection(section.key)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-title">{section.title}</span>
            </button>
          ))}

          <div className="versions-section">
            <h3>📚 Versions sauvegardées</h3>
            <p className="versions-help">Sauvegardez jusqu'à 3 versions de vos règles</p>
            
            <button 
              className="save-version-button"
              onClick={() => setShowVersionModal(true)}
              disabled={loading || versions.length >= 3}
            >
              💾 Sauvegarder version actuelle
            </button>

            {versions.length > 0 ? (
              <div className="versions-list">
                {versions.map(version => (
                  <div key={version.id} className="version-item">
                    <div className="version-info">
                      <strong>{version.version_name}</strong>
                      <small>{new Date(version.created_at).toLocaleDateString('fr-FR')}</small>
                    </div>
                    <div className="version-actions">
                      <button 
                        className="apply-version-btn"
                        onClick={() => handleApplyVersion(version.id, version.version_name)}
                        disabled={loading}
                        title="Appliquer cette version"
                      >
                        ✓
                      </button>
                      <button 
                        className="delete-version-btn"
                        onClick={() => handleDeleteVersion(version.id, version.version_name)}
                        disabled={loading}
                        title="Supprimer cette version"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-versions">Aucune version sauvegardée</p>
            )}

            {versions.length >= 3 && (
              <p className="max-versions-warning">⚠️ Maximum atteint (3 versions)</p>
            )}
          </div>
        </div>

        <div className="rules-editor-content">
          {sections.map(section => (
            <div
              key={section.key}
              className={`editor-section ${activeSection === section.key ? 'active' : ''}`}
            >
              {activeSection === section.key && (
                <>
                  <div className="section-header">
                    <h3>{section.icon} {section.title}</h3>
                    <p className="section-help">
                      Saisissez le contenu de cette section. Utilisez des sauts de ligne pour séparer les points.
                    </p>
                  </div>
                  <textarea
                    value={rules[section.key] || ''}
                    onChange={(e) => handleChange(section.key, e.target.value)}
                    placeholder={`Entrez le contenu de la section "${section.title}"...\n\nExemple:\n• Premier point important\n• Deuxième point\n• Troisième point avec détails`}
                    rows={20}
                  />

                  {section.key === 'power_distances' && (
                    <div className="subsections">
                      <div className="subsection-toggle">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={showIndoor}
                            onChange={(e) => {
                              setShowIndoor(e.target.checked);
                              if (!e.target.checked) {
                                handleChange('power_distances_indoor', '');
                              }
                            }}
                          />
                          <span>Afficher une sous-section "Intérieur des bâtiments"</span>
                        </label>
                      </div>

                      {showIndoor && (
                        <div className="subsection-content">
                          <h4>🏠 Intérieur des bâtiments</h4>
                          <textarea
                            value={rules.power_distances_indoor || ''}
                            onChange={(e) => handleChange('power_distances_indoor', e.target.value)}
                            placeholder="Règles spécifiques pour l'intérieur des bâtiments..."
                            rows={10}
                          />
                        </div>
                      )}

                      <div className="subsection-toggle">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={showOutdoor}
                            onChange={(e) => {
                              setShowOutdoor(e.target.checked);
                              if (!e.target.checked) {
                                handleChange('power_distances_outdoor', '');
                              }
                            }}
                          />
                          <span>Afficher une sous-section "Extérieur"</span>
                        </label>
                      </div>

                      {showOutdoor && (
                        <div className="subsection-content">
                          <h4>🌲 Extérieur</h4>
                          <textarea
                            value={rules.power_distances_outdoor || ''}
                            onChange={(e) => handleChange('power_distances_outdoor', e.target.value)}
                            placeholder="Règles spécifiques pour l'extérieur..."
                            rows={10}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="editor-actions">
            <button
              onClick={handleSave}
              className="save-button"
              disabled={loading}
            >
              {loading ? '💾 Enregistrement...' : '💾 Enregistrer toutes les modifications'}
            </button>
            <button
              onClick={fetchRules}
              className="cancel-button"
              disabled={loading}
            >
              🔄 Annuler les modifications
            </button>
          </div>

          <div className="preview-note">
            <strong>📝 Note :</strong> Les modifications seront immédiatement visibles sur la page d'inscription après l'enregistrement.
          </div>
        </div>
      </div>

      {showVersionModal && (
        <div className="modal-overlay" onClick={() => setShowVersionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>💾 Sauvegarder une version</h3>
            <p>Entrez un nom pour identifier cette version des règles :</p>
            <input
              type="text"
              className="version-name-input"
              placeholder="Ex: Partie Hiver 2025, Règles de base..."
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              maxLength={100}
            />
            <div className="modal-actions">
              <button 
                className="confirm-button"
                onClick={handleSaveVersion}
                disabled={loading || !newVersionName.trim()}
              >
                💾 Sauvegarder
              </button>
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowVersionModal(false);
                  setNewVersionName('');
                }}
              >
                ✖ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RulesEditor;
