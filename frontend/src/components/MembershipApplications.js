import React, { useState, useEffect } from 'react';
import api from '../api';
import './MembershipApplications.css';

function MembershipApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplicationsByStatus();
  }, [applications, filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/membership-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des candidatures' });
    } finally {
      setLoading(false);
    }
  };

  const filterApplicationsByStatus = () => {
    if (filterStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filterStatus));
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    const statusText = newStatus === 'approved' ? 'approuver' : 'refuser';
    if (!window.confirm(`Voulez-vous vraiment ${statusText} cette candidature ?`)) {
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/api/membership-applications/${applicationId}/status`, {
        status: newStatus
      });
      setMessage({ 
        type: 'success', 
        text: `Candidature ${newStatus === 'approved' ? 'approuvée' : 'refusée'} avec succès` 
      });
      fetchApplications();
      setSelectedApplication(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du statut' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'En attente', class: 'status-pending', icon: '⏳' },
      approved: { text: 'Approuvée', class: 'status-approved', icon: '✅' },
      rejected: { text: 'Refusée', class: 'status-rejected', icon: '❌' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const pendingCount = applications.filter(app => app.status === 'pending').length;

  return (
    <div className="membership-applications">
      <div className="applications-header">
        <h2>👥 Candidatures d'adhésion</h2>
        <p>Gestion des demandes d'adhésion à l'association</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="applications-controls">
        <div className="filter-buttons">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            Toutes ({applications.length})
          </button>
          <button 
            className={filterStatus === 'pending' ? 'active' : ''}
            onClick={() => setFilterStatus('pending')}
          >
            En attente ({pendingCount})
          </button>
          <button 
            className={filterStatus === 'approved' ? 'active' : ''}
            onClick={() => setFilterStatus('approved')}
          >
            Approuvées ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button 
            className={filterStatus === 'rejected' ? 'active' : ''}
            onClick={() => setFilterStatus('rejected')}
          >
            Refusées ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {loading && <div className="loading">Chargement...</div>}

      {!loading && filteredApplications.length === 0 && (
        <div className="no-applications">
          <p>Aucune candidature trouvée</p>
        </div>
      )}

      {!loading && filteredApplications.length > 0 && (
        <div className="applications-grid">
          {filteredApplications.map(application => (
            <div key={application.id} className="application-card">
              <div className="card-header">
                <div className="applicant-info">
                  <h3>{application.first_name} {application.last_name}</h3>
                  <p className="application-date">
                    Candidature du {new Date(application.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>

              <div className="card-content">
                <div className="info-item">
                  <span className="info-label">📧 Email:</span>
                  <span>{application.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📞 Téléphone:</span>
                  <span>{application.phone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📍 Adresse:</span>
                  <span>{application.address}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">🎯 A déjà joué chez nous:</span>
                  <span>{application.has_played_before ? 'Oui' : 'Non'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">⏱️ Expérience airsoft:</span>
                  <span>{application.airsoft_experience}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="details-button"
                  onClick={() => setSelectedApplication(application)}
                >
                  📄 Voir détails
                </button>
                {application.status === 'pending' && (
                  <>
                    <button 
                      className="approve-button"
                      onClick={() => handleStatusUpdate(application.id, 'approved')}
                      disabled={loading}
                    >
                      ✅ Approuver
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      disabled={loading}
                    >
                      ❌ Refuser
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content application-details-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setSelectedApplication(null)}
            >
              ✖
            </button>

            <h2>Détails de la candidature</h2>

            <div className="details-section">
              <h3>Informations personnelles</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Nom complet:</strong>
                  <span>{selectedApplication.first_name} {selectedApplication.last_name}</span>
                </div>
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{selectedApplication.email}</span>
                </div>
                <div className="detail-item">
                  <strong>Téléphone:</strong>
                  <span>{selectedApplication.phone}</span>
                </div>
                <div className="detail-item">
                  <strong>Adresse:</strong>
                  <span>{selectedApplication.address}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Expérience</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>A déjà joué chez nous:</strong>
                  <span>{selectedApplication.has_played_before ? 'Oui' : 'Non'}</span>
                </div>
                <div className="detail-item">
                  <strong>Pratique l'airsoft depuis:</strong>
                  <span>{selectedApplication.airsoft_experience}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Motivation et attentes</h3>
              <div className="motivation-text">
                {selectedApplication.motivation}
              </div>
            </div>

            <div className="details-section">
              <h3>Statut</h3>
              {getStatusBadge(selectedApplication.status)}
              <p className="status-date">
                Candidature envoyée le {new Date(selectedApplication.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {selectedApplication.status === 'pending' && (
              <div className="modal-actions">
                <button 
                  className="approve-button"
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                  disabled={loading}
                >
                  ✅ Approuver cette candidature
                </button>
                <button 
                  className="reject-button"
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                  disabled={loading}
                >
                  ❌ Refuser cette candidature
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MembershipApplications;
