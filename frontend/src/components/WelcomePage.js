import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useSiteSettings } from '../SiteSettingsContext';
import api from '../api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function WelcomePage() {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [rules, setRules] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipData, setMembershipData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    email: '',
    phone: '',
    has_played_before: false,
    airsoft_experience: '',
    motivation: ''
  });
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipSuccess, setMembershipSuccess] = useState(false);
  const [membershipError, setMembershipError] = useState('');
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rules`);
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
    }
  };

  const formatRulesText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      line = line.trim();
      if (!line) return null;
      return <li key={index}>{line}</li>;
    }).filter(item => item !== null);
  };

  const handleContinue = () => {
    if (rulesAccepted) {
      navigate('/register');
    } else {
      alert('Veuillez accepter les règles du terrain avant de continuer');
    }
  };

  const handleMembershipChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMembershipData({
      ...membershipData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMembershipSubmit = async (e) => {
    e.preventDefault();
    setMembershipLoading(true);
    setMembershipError('');
    setMembershipSuccess(false);

    try {
      await api.post('/api/membership-applications', membershipData);
      setMembershipSuccess(true);
      setMembershipData({
        first_name: '',
        last_name: '',
        address: '',
        email: '',
        phone: '',
        has_played_before: false,
        airsoft_experience: '',
        motivation: ''
      });
      setTimeout(() => {
        setShowMembershipModal(false);
        setMembershipSuccess(false);
      }, 3000);
    } catch (err) {
      setMembershipError(
        err.response?.data?.detail || 
        'Une erreur est survenue lors de l\'envoi de la candidature'
      );
    } finally {
      setMembershipLoading(false);
    }
  };

  return (
    <div>
      <Header 
        title={settings.site_title}
        subtitle="Veuillez lire attentivement les règles avant de vous inscrire"
        showMembershipButton={true}
        onMembershipClick={() => setShowMembershipModal(true)}
      />

      <div className="container">
        <div className="rules-container">
          <h2> Règlement du Terrain</h2>
          
          <div className="rules-content">
            {rules && (
              <>
                {rules.security && (
                  <section className="rule-section">
                    <h3> Sécurité</h3>
                    <ul>{formatRulesText(rules.security)}</ul>
                  </section>
                )}

                {rules.power_distances && (
                  <section className="rule-section">
                    <h3>⚡ Puissances et Distances de Sécurité</h3>
                    <ul>{formatRulesText(rules.power_distances)}</ul>
                    
                    {rules.power_distances_indoor && (
                      <>
                        <h4 style={{ color: 'var(--primary-color)', marginTop: '15px', marginBottom: '10px' }}>
                          🏠 Intérieur des bâtiments
                        </h4>
                        <ul>{formatRulesText(rules.power_distances_indoor)}</ul>
                      </>
                    )}
                    
                    {rules.power_distances_outdoor && (
                      <>
                        <h4 style={{ color: 'var(--primary-color)', marginTop: '15px', marginBottom: '10px' }}>
                          🌲 Extérieur
                        </h4>
                        <ul>{formatRulesText(rules.power_distances_outdoor)}</ul>
                      </>
                    )}
                  </section>
                )}

                {rules.fair_play && (
                  <section className="rule-section">
                    <h3> Fair-Play et Élimination</h3>
                    <ul>{formatRulesText(rules.fair_play)}</ul>
                  </section>
                )}

                {rules.shooting_rules && (
                  <section className="rule-section">
                    <h3> Règles de Tir</h3>
                    <ul>{formatRulesText(rules.shooting_rules)}</ul>
                  </section>
                )}

                {rules.pyrotechnics && (
                  <section className="rule-section">
                    <h3> Pyrotechnie et Grenades</h3>
                    <ul>{formatRulesText(rules.pyrotechnics)}</ul>
                  </section>
                )}

                {rules.terrain_respect && (
                  <section className="rule-section">
                    <h3> Respect du Terrain</h3>
                    <ul>{formatRulesText(rules.terrain_respect)}</ul>
                  </section>
                )}

                {rules.safety_stop && (
                  <section className="rule-section">
                    <h3> Sécurité et Arrêt de Jeu</h3>
                    <ul>{formatRulesText(rules.safety_stop)}</ul>
                  </section>
                )}

                {rules.formal_bans && (
                  <section className="rule-section">
                    <h3> Interdictions Formelles</h3>
                    <ul>{formatRulesText(rules.formal_bans)}</ul>
                  </section>
                )}

                {rules.important_info && (
                  <section className="rule-section important">
                    <h3> Informations Importantes</h3>
                    <ul>{formatRulesText(rules.important_info)}</ul>
                  </section>
                )}
              </>
            )}

            {!rules && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#b0b0b0' }}>
                <p>Chargement des règles...</p>
              </div>
            )}
          </div>

          <div className="rules-acceptance">
            <label className="checkbox-label-large">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
              />
              <span>
                J'ai lu et j'accepte le règlement du terrain. Je m'engage à respecter toutes les règles 
                de sécurité et de fair-play durant la partie.
              </span>
            </label>
          </div>

          <div className="button-group">
            <button 
              onClick={handleContinue}
              className={`continue-button ${rulesAccepted ? 'enabled' : 'disabled'}`}
              disabled={!rulesAccepted}
            >
              {rulesAccepted ? "✅ Continuer vers l'inscription" : "❌ Veuillez accepter les règles"}
            </button>
          </div>

          <div className="admin-link">
            <a href="/admin/login">🔑 Accès administrateur</a>
            <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
              <a href="/admin/login" style={{ color: '#b0b0b0' }}>🔐 Mot de passe oublié ?</a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showMembershipModal && (
        <div className="modal-overlay" onClick={() => setShowMembershipModal(false)}>
          <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowMembershipModal(false)}
            >
              ✖
            </button>

            <h2>👥 Rejoignez notre association</h2>
            <p className="modal-subtitle">
              Vous souhaitez devenir membre de notre association d'airsoft ? 
              Remplissez ce formulaire et nous étudierons votre candidature.
            </p>

            {membershipSuccess && (
              <div className="success-message">
                ✅ Candidature envoyée avec succès ! Nous vous contacterons bientôt.
              </div>
            )}

            {membershipError && (
              <div className="error-message">
                ❌ {membershipError}
              </div>
            )}

            <form className="membership-form" onSubmit={handleMembershipSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={membershipData.first_name}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={membershipData.last_name}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse postale complète *</label>
                <input
                  type="text"
                  name="address"
                  value={membershipData.address}
                  onChange={handleMembershipChange}
                  placeholder="Numéro, rue, code postal, ville"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={membershipData.email}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={membershipData.phone}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="has_played_before"
                    checked={membershipData.has_played_before}
                    onChange={handleMembershipChange}
                  />
                  <span>J'ai déjà joué chez vous</span>
                </label>
              </div>

              <div className="form-group">
                <label>Depuis combien de temps pratiquez-vous l'airsoft ? *</label>
                <p className="field-help">Exemple : "2 ans", "6 mois", "Débutant", etc.</p>
                <input
                  type="text"
                  name="airsoft_experience"
                  value={membershipData.airsoft_experience}
                  onChange={handleMembershipChange}
                  placeholder="Votre expérience en airsoft"
                  required
                />
              </div>

              <div className="form-group">
                <label>Motivation et attentes *</label>
                <p className="field-help">
                  Expliquez pourquoi vous souhaitez rejoindre l'association et ce que vous en attendez (minimum 10 caractères)
                </p>
                <textarea
                  name="motivation"
                  value={membershipData.motivation}
                  onChange={handleMembershipChange}
                  rows="6"
                  placeholder="Décrivez votre motivation et vos attentes..."
                  required
                  minLength="10"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={membershipLoading}
                >
                  {membershipLoading ? 'Envoi en cours...' : '📤 Envoyer ma candidature'}
                </button>
                <button 
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowMembershipModal(false)}
                  disabled={membershipLoading}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomePage;
