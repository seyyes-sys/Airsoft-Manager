import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Header from './Header';

function ConfirmationPage() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    confirmRegistration();
  }, [registrationId]);

  const confirmRegistration = async () => {
    try {
      await api.post(`/api/registrations/${registrationId}/confirm`);
      setSuccess(true);
    } catch (err) {
      setError('Erreur lors de la confirmation de votre inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header 
        title="✅ Confirmation d'inscription"
      />

      <div className="container">
        <div className="form-container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Confirmation en cours...</p>
            </div>
          )}

          {success && (
            <div>
              <div className="success-message">
                <h2>🎉 Inscription confirmée !</h2>
                <p>Votre inscription a été confirmée avec succès.</p>
                <p>Vous recevrez un rappel par email quelques jours avant la partie.</p>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="submit-button"
                style={{ marginTop: '20px' }}
              >
                Retour à l'accueil
              </button>
            </div>
          )}

          {error && (
            <div>
              <div className="error-message">
                <h2>❌ Erreur</h2>
                <p>{error}</p>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="submit-button"
                style={{ marginTop: '20px' }}
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
