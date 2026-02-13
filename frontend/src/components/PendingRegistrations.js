import React, { useState, useEffect } from 'react';
import api from '../api';
import './PendingRegistrations.css';

function PendingRegistrations({ onCountChange }) {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/registrations/pending');
      setPendingRegistrations(response.data);
      if (onCountChange) {
        onCountChange(response.data.length);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des inscriptions en attente:', err);
      setError('Impossible de charger les inscriptions en attente');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    if (!window.confirm('Voulez-vous vraiment approuver cette inscription ?')) {
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/api/registrations/${registrationId}/approve`);
      alert('Inscription approuvée ! Un email de confirmation a été envoyé au joueur.');
      fetchPendingRegistrations();
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err);
      alert('Erreur : ' + (err.response?.data?.detail || 'Impossible d\'approuver cette inscription'));
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (registration) => {
    setSelectedRegistration(registration);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedRegistration(null);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez saisir un motif de rejet');
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/api/registrations/${selectedRegistration.id}/reject`, {
        rejection_reason: rejectionReason
      });
      alert('Inscription rejetée. Un email a été envoyé au joueur avec le motif du refus.');
      closeRejectModal();
      fetchPendingRegistrations();
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
      alert('Erreur : ' + (err.response?.data?.detail || 'Impossible de rejeter cette inscription'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="pending-loading">Chargement des inscriptions en attente...</div>;
  }

  if (error) {
    return <div className="pending-error">{error}</div>;
  }

  return (
    <div className="pending-registrations">
      <h2>📋 Inscriptions en attente de validation</h2>
      
      {pendingRegistrations.length === 0 ? (
        <div className="pending-empty">
          <p>✅ Aucune inscription en attente de validation</p>
        </div>
      ) : (
        <div className="pending-list">
          <p className="pending-count">
            {pendingRegistrations.length} inscription{pendingRegistrations.length > 1 ? 's' : ''} en attente
          </p>
          
          <div className="pending-cards">
            {pendingRegistrations.map((reg) => (
              <div key={reg.id} className="pending-card">
                <div className="pending-card-header">
                  <div className="pending-player-info">
                    <h3>{reg.nickname}</h3>
                    <span className="pending-player-name">{reg.first_name} {reg.last_name}</span>
                  </div>
                  <div className="pending-game-info">
                    <span className="pending-game-name">{reg.game_name}</span>
                    <span className="pending-game-date">📅 {formatDate(reg.game_date)}</span>
                  </div>
                </div>
                
                <div className="pending-card-body">
                  <div className="pending-detail">
                    <span className="pending-label">📧 Email :</span>
                    <span className="pending-value">{reg.email}</span>
                  </div>
                  <div className="pending-detail">
                    <span className="pending-label">📱 Téléphone :</span>
                    <span className="pending-value">{reg.phone}</span>
                  </div>
                  <div className="pending-detail">
                    <span className="pending-label">⏰ Présence :</span>
                    <span className="pending-value">
                      {reg.attendance_type === 'full_day' ? 'Journée complète' : 'Matinée uniquement'}
                    </span>
                  </div>
                  {reg.has_association && (
                    <div className="pending-detail">
                      <span className="pending-label">🏢 Association :</span>
                      <span className="pending-value">{reg.association_name || 'Non spécifiée'}</span>
                    </div>
                  )}
                  <div className="pending-detail">
                    <span className="pending-label">💰 PAF estimée :</span>
                    <span className="pending-value">{reg.calculated_price}€</span>
                  </div>
                  <div className="pending-detail">
                    <span className="pending-label">📝 Demande reçue :</span>
                    <span className="pending-value">{formatDateTime(reg.created_at)}</span>
                  </div>
                </div>
                
                <div className="pending-card-actions">
                  <button 
                    className="pending-btn pending-btn-approve"
                    onClick={() => handleApprove(reg.id)}
                    disabled={processing}
                  >
                    ✅ Approuver
                  </button>
                  <button 
                    className="pending-btn pending-btn-reject"
                    onClick={() => openRejectModal(reg)}
                    disabled={processing}
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {rejectModalOpen && selectedRegistration && (
        <div className="pending-modal-overlay" onClick={closeRejectModal}>
          <div className="pending-modal" onClick={(e) => e.stopPropagation()}>
            <h3>❌ Rejeter l'inscription</h3>
            <p>
              Vous êtes sur le point de rejeter l'inscription de <strong>{selectedRegistration.nickname}</strong> 
              ({selectedRegistration.first_name} {selectedRegistration.last_name}).
            </p>
            <p>Veuillez indiquer le motif du rejet :</p>
            <textarea
              className="pending-reject-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Place non disponible, informations incomplètes, joueur non éligible..."
              rows={4}
            />
            <div className="pending-modal-actions">
              <button 
                className="pending-btn pending-btn-cancel"
                onClick={closeRejectModal}
                disabled={processing}
              >
                Annuler
              </button>
              <button 
                className="pending-btn pending-btn-confirm-reject"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Envoi...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingRegistrations;
