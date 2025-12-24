import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from './Header';

function RegistrationForm() {
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
    bb_weight_rifle_2: '',
  });

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

  const [activeGame, setActiveGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipSuccess, setMembershipSuccess] = useState(false);
  const [membershipError, setMembershipError] = useState('');

  useEffect(() => {
    fetchActiveGame();
  }, []);

  const fetchActiveGame = async () => {
    try {
      const response = await api.get('/api/games/active');
      setActiveGame(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération de la partie active:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/api/registrations', formData);
      setSuccess(true);
      setFormData({
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
        bb_weight_rifle_2: '',
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setLoading(false);
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
        title="Inscription Partie d'Airsoft"
        subtitle={activeGame 
          ? `Prochaine partie : ${new Date(activeGame.date).toLocaleDateString('fr-FR')} - ${activeGame.name}`
          : 'Aucune partie programmée pour le moment'
        }
        showMembershipButton={true}
        onMembershipClick={() => setShowMembershipModal(true)}
      />

      <div className="container">
        <div className="form-container">
          {success && (
            <div className="success-message">
              ✅ Inscription réussie ! Veuillez vérifier votre email pour confirmer votre inscription.
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {!activeGame ? (
            <div className="error-message">
              Aucune partie n'est disponible pour l'inscription pour le moment.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="first_name">Prénom *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Nom *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nickname">Pseudonyme *</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  required
                  placeholder="Votre pseudo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre.email@exemple.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="form-group">
                <label>Présence *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="attendance_type"
                      value="morning"
                      checked={formData.attendance_type === 'morning'}
                      onChange={handleChange}
                    />
                    <span>Matinée uniquement</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="attendance_type"
                      value="full_day"
                      checked={formData.attendance_type === 'full_day'}
                      onChange={handleChange}
                    />
                    <span>Journée entière</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="has_association"
                    name="has_association"
                    checked={formData.has_association}
                    onChange={handleChange}
                  />
                  <label htmlFor="has_association">
                    Je fais partie d'une association
                  </label>
                </div>
              </div>

              {formData.has_association && (
                <div className="form-group">
                  <label htmlFor="association_name">Nom de l'association *</label>
                  <input
                    type="text"
                    id="association_name"
                    name="association_name"
                    value={formData.association_name}
                    onChange={handleChange}
                    required={formData.has_association}
                    placeholder="Nom de votre association"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="bb_weight_pistol">Grammage billes PA (Pistolet)</label>
                <select
                  id="bb_weight_pistol"
                  name="bb_weight_pistol"
                  value={formData.bb_weight_pistol}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="0.20g">0.20g</option>
                  <option value="0.23g">0.23g</option>
                  <option value="0.25g">0.25g</option>
                  <option value="0.28g">0.28g</option>
                  <option value="0.30g">0.30g</option>
                  <option value="0.32g">0.32g</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bb_weight_rifle">Grammage billes Longue (Réplique longue) *</label>
                <select
                  id="bb_weight_rifle"
                  name="bb_weight_rifle"
                  value={formData.bb_weight_rifle}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="0.20g">0.20g</option>
                  <option value="0.23g">0.23g</option>
                  <option value="0.25g">0.25g</option>
                  <option value="0.28g">0.28g</option>
                  <option value="0.30g">0.30g</option>
                  <option value="0.32g">0.32g</option>
                  <option value="0.36g">0.36g</option>
                  <option value="0.40g">0.40g</option>
                  <option value="0.43g">0.43g</option>
                  <option value="0.45g">0.45g</option>
                  <option value="0.48g">0.48g</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="has_second_rifle"
                    name="has_second_rifle"
                    checked={formData.has_second_rifle}
                    onChange={handleChange}
                  />
                  <label htmlFor="has_second_rifle">
                    J'ai une deuxième réplique longue
                  </label>
                </div>
              </div>

              {formData.has_second_rifle && (
                <div className="form-group">
                  <label htmlFor="bb_weight_rifle_2">Grammage billes Longue 2 *</label>
                  <select
                    id="bb_weight_rifle_2"
                    name="bb_weight_rifle_2"
                    value={formData.bb_weight_rifle_2}
                    onChange={handleChange}
                    required={formData.has_second_rifle}
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="0.20g">0.20g</option>
                    <option value="0.23g">0.23g</option>
                    <option value="0.25g">0.25g</option>
                    <option value="0.28g">0.28g</option>
                    <option value="0.30g">0.30g</option>
                    <option value="0.32g">0.32g</option>
                    <option value="0.36g">0.36g</option>
                    <option value="0.40g">0.40g</option>
                    <option value="0.43g">0.43g</option>
                    <option value="0.45g">0.45g</option>
                    <option value="0.48g">0.48g</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>
            </form>
          )}

          <div className="admin-link">
            <a href="/admin/login">Accès administrateur</a>
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showMembershipModal && (
        <div className="modal-overlay" onClick={() => setShowMembershipModal(false)}>
          <div className="modal-content membership-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowMembershipModal(false)}
            >
              ✖
            </button>
            
            <h2>👥 Rejoindre l'association</h2>
            <p className="modal-subtitle">
              Remplissez ce formulaire pour candidater à l'adhésion de notre association
            </p>

            {membershipSuccess && (
              <div className="success-message">
                ✅ Candidature envoyée avec succès ! Nous vous contacterons prochainement.
              </div>
            )}

            {membershipError && (
              <div className="error-message">
                ❌ {membershipError}
              </div>
            )}

            <form onSubmit={handleMembershipSubmit} className="membership-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="membership_first_name">Prénom *</label>
                  <input
                    type="text"
                    id="membership_first_name"
                    name="first_name"
                    value={membershipData.first_name}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="membership_last_name">Nom *</label>
                  <input
                    type="text"
                    id="membership_last_name"
                    name="last_name"
                    value={membershipData.last_name}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="membership_address">Adresse postale *</label>
                <textarea
                  id="membership_address"
                  name="address"
                  value={membershipData.address}
                  onChange={handleMembershipChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="membership_email">Email *</label>
                  <input
                    type="email"
                    id="membership_email"
                    name="email"
                    value={membershipData.email}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="membership_phone">Téléphone *</label>
                  <input
                    type="tel"
                    id="membership_phone"
                    name="phone"
                    value={membershipData.phone}
                    onChange={handleMembershipChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="has_played_before"
                    name="has_played_before"
                    checked={membershipData.has_played_before}
                    onChange={handleMembershipChange}
                  />
                  <label htmlFor="has_played_before">
                    J'ai déjà joué chez vous
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="airsoft_experience">Depuis combien de temps pratiquez-vous l'airsoft ? *</label>
                <input
                  type="text"
                  id="airsoft_experience"
                  name="airsoft_experience"
                  value={membershipData.airsoft_experience}
                  onChange={handleMembershipChange}
                  placeholder="Ex: 2 ans, débutant, depuis 2020..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="motivation">Motivation et attentes *</label>
                <p className="field-help">
                  Expliquez pourquoi vous souhaitez rejoindre l'association et ce que vous attendez de cette adhésion (minimum 10 caractères)
                </p>
                <textarea
                  id="motivation"
                  name="motivation"
                  value={membershipData.motivation}
                  onChange={handleMembershipChange}
                  rows="6"
                  minLength="10"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={membershipLoading}
                >
                  {membershipLoading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
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

export default RegistrationForm;
