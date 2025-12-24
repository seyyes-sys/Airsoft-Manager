import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EditPlayerModal from './EditPlayerModal';
import LogoManager from './LogoManager';
import SiteCustomizer from './SiteCustomizer';
import RulesEditor from './RulesEditor';
import ChangePassword from './ChangePassword';
import PaymentTypesManager from './PaymentTypesManager';
import NFCTagsManager from './NFCTagsManager';
import MembershipApplications from './MembershipApplications';

function AdminDashboard({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [gameStats, setGameStats] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [nfcTags, setNfcTags] = useState([]);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newGame, setNewGame] = useState({
    name: '',
    date: '',
    description: '',
    is_active: true
  });
  const [sortConfig, setSortConfig] = useState({ key: 'nickname', direction: 'asc' });
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    paymentValidated: 'all',
    wasPresent: 'all'
  });
  const [editingPlayer, setEditingPlayer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
    fetchStatistics();
    fetchGameStatistics();
    fetchPaymentTypes();
    fetchNFCTags();
    fetchPendingApplicationsCount();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      fetchRegistrations(selectedGame.id);
    }
  }, [selectedGame]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchPendingApplicationsCount();
    }
  }, [activeTab]);

  // Rafraîchir les types de paiement quand on revient sur l'onglet des inscriptions
  useEffect(() => {
    if (activeTab === 'games') {
      fetchPaymentTypes();
      fetchNFCTags();
    }
  }, [activeTab]);

  const fetchGames = async () => {
    try {
      const response = await api.get('/api/games');
      setGames(response.data);
      if (response.data.length > 0) {
        setSelectedGame(response.data[0]);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des parties:', err);
    }
  };

  const fetchRegistrations = async (gameId) => {
    try {
      const response = await api.get(`/api/games/${gameId}/registrations`);
      setRegistrations(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des inscriptions:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/api/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
    }
  };

  const fetchGameStatistics = async () => {
    try {
      const response = await api.get('/api/statistics/by-game?limit=10');
      setGameStats(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques par partie:', err);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const response = await api.get('/api/payment-types');
      setPaymentTypes(response.data.filter(pt => pt.is_active));
    } catch (err) {
      console.error('Erreur lors de la récupération des types de paiement:', err);
    }
  };

  const fetchNFCTags = async () => {
    try {
      const response = await api.get('/api/nfc-tags');
      setNfcTags(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des tags NFC:', err);
    }
  };

  const assignNFCTag = async (registrationId, tagId) => {
    try {
      await api.patch(`/api/registrations/${registrationId}/nfc-tag`, {
        nfc_tag_id: tagId || null
      });
      fetchRegistrations(selectedGame.id);
      fetchNFCTags(); // Rafraîchir la liste des tags pour mettre à jour leur disponibilité
    } catch (err) {
      console.error('Erreur lors de l\'attribution du tag:', err);
      alert('Erreur : ' + (err.response?.data?.detail || 'Impossible d\'attribuer ce tag'));
    }
  };

  const fetchPendingApplicationsCount = async () => {
    try {
      const response = await api.get('/api/membership-applications/pending/count');
      setPendingApplicationsCount(response.data.count || 0);
    } catch (err) {
      console.error('Erreur lors de la récupération du compteur de candidatures:', err);
      setPendingApplicationsCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const togglePresence = async (registrationId, currentStatus) => {
    try {
      await api.patch(`/api/registrations/${registrationId}/attendance`, {
        was_present: !currentStatus,
      });
      fetchRegistrations(selectedGame.id);
      fetchStatistics();
      fetchGameStatistics();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la présence:', err);
    }
  };

  const togglePayment = async (registrationId, currentStatus) => {
    // Fonction legacy - remplacée par setPaymentType
    console.warn('togglePayment est obsolète, utilisez setPaymentType');
  };

  const setPaymentType = async (registrationId, paymentTypeId) => {
    try {
      await api.patch(`/api/registrations/${registrationId}/payment-type`, {
        payment_type_id: paymentTypeId || null
      });
      fetchRegistrations(selectedGame.id);
      fetchStatistics();
      fetchGameStatistics();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du type de paiement:', err);
      alert('Erreur lors de la mise à jour du type de paiement');
    }
  };

  const deleteRegistration = async (registrationId, playerName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'inscription de ${playerName} ?`)) {
      return;
    }

    try {
      await api.delete(`/api/registrations/${registrationId}`);
      fetchRegistrations(selectedGame.id);
      fetchStatistics();
      fetchGameStatistics();
      alert('Inscription supprimée avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de l\'inscription');
    }
  };

  const sendReminders = async () => {
    if (!selectedGame) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/api/games/${selectedGame.id}/send-reminders`);
      alert(response.data.message);
    } catch (err) {
      alert('Erreur lors de l\'envoi des rappels');
    } finally {
      setLoading(false);
    }
  };

  const toggleGameClosed = async () => {
    if (!selectedGame) return;

    const action = selectedGame.is_closed ? 'rouvrir' : 'clôturer';
    if (!window.confirm(`Voulez-vous ${action} les inscriptions pour "${selectedGame.name}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/api/games/${selectedGame.id}/toggle-close`);
      alert(response.data.message);
      await fetchGames();
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      alert('Erreur lors de la modification du statut');
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (e) => {
    e.preventDefault();
    
    if (!newGame.name || !newGame.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/games', newGame);
      alert('Partie créée avec succès !');
      setNewGame({
        name: '',
        date: '',
        description: '',
        is_active: true
      });
      await fetchGames();
      setActiveTab('games');
    } catch (err) {
      console.error('Erreur lors de la création de la partie:', err);
      alert('Erreur lors de la création de la partie');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de tri
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Fonction de filtrage
  const getFilteredAndSortedRegistrations = () => {
    let filtered = [...registrations];

    // Filtres
    if (filters.name) {
      filtered = filtered.filter(reg =>
        `${reg.first_name} ${reg.last_name} ${reg.nickname}`.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(reg =>
        reg.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    if (filters.phone) {
      filtered = filtered.filter(reg =>
        reg.phone.includes(filters.phone)
      );
    }
    if (filters.paymentValidated !== 'all') {
      const isValidated = filters.paymentValidated === 'validated';
      filtered = filtered.filter(reg => reg.payment_validated === isValidated);
    }
    if (filters.wasPresent !== 'all') {
      if (filters.wasPresent === 'present') {
        filtered = filtered.filter(reg => reg.was_present === true);
      } else if (filters.wasPresent === 'absent') {
        filtered = filtered.filter(reg => reg.was_present === false);
      } else if (filters.wasPresent === 'unknown') {
        filtered = filtered.filter(reg => reg.was_present === null);
      }
    }

    // Tri
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'name':
            aValue = `${a.first_name} ${a.last_name}`;
            bValue = `${b.first_name} ${b.last_name}`;
            break;
          case 'payment_validated':
            aValue = a.payment_validated ? 1 : 0;
            bValue = b.payment_validated ? 1 : 0;
            break;
          case 'was_present':
            aValue = a.was_present === true ? 2 : a.was_present === false ? 1 : 0;
            bValue = b.was_present === true ? 2 : b.was_present === false ? 1 : 0;
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      email: '',
      phone: '',
      paymentValidated: 'all',
      wasPresent: 'all'
    });
    setSortConfig({ key: 'nickname', direction: 'asc' });
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
  };

  const handleCloseModal = () => {
    setEditingPlayer(null);
  };

  const handleUpdatePlayer = () => {
    if (selectedGame) {
      fetchRegistrations(selectedGame.id);
      fetchStatistics();
      fetchGameStatistics();
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Tableau de bord administrateur</h1>
        <button onClick={handleLogout} className="logout-button">
          Déconnexion
        </button>
      </div>

      <div className="dashboard-layout">
        <nav className="sidebar">
          <button
            className={`sidebar-button ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <span className="sidebar-icon">📋</span>
            <span className="sidebar-label">Parties et Inscriptions</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <span className="sidebar-icon">➕</span>
            <span className="sidebar-label">Créer une partie</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-label">Statistiques</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'logo' ? 'active' : ''}`}
            onClick={() => setActiveTab('logo')}
          >
            <span className="sidebar-icon">🎨</span>
            <span className="sidebar-label">Logo</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'customize' ? 'active' : ''}`}
            onClick={() => setActiveTab('customize')}
          >
            <span className="sidebar-icon">⚙️</span>
            <span className="sidebar-label">Personnalisation</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <span className="sidebar-icon">📖</span>
            <span className="sidebar-label">Règles</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <span className="sidebar-icon">💳</span>
            <span className="sidebar-label">Paiement</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'lightning' ? 'active' : ''}`}
            onClick={() => setActiveTab('lightning')}
          >
            <span className="sidebar-icon">⚡</span>
            <span className="sidebar-label">Lightning Tags</span>
          </button>
          <button
            className={`sidebar-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="sidebar-icon">👥</span>
            <span className="sidebar-label">Candidatures</span>
            {pendingApplicationsCount > 0 && (
              <span className="tab-badge">{pendingApplicationsCount}</span>
            )}
          </button>
          <button
            className={`sidebar-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span className="sidebar-icon">🔐</span>
            <span className="sidebar-label">Mot de passe</span>
          </button>
        </nav>

        <div className="main-content">

        {activeTab === 'password' && (
          <ChangePassword />
        )}

        {activeTab === 'payment' && (
          <PaymentTypesManager />
        )}

        {activeTab === 'lightning' && (
          <NFCTagsManager />
        )}

        {activeTab === 'applications' && (
          <MembershipApplications />
        )}

        {activeTab === 'rules' && (
          <RulesEditor />
        )}

        {activeTab === 'customize' && (
          <SiteCustomizer />
        )}

        {activeTab === 'logo' && (
          <LogoManager />
        )}

        {activeTab === 'create' && (
          <div className="create-game-section">
            <h2>Créer une nouvelle partie</h2>
            <form onSubmit={createGame} className="game-form">
              <div className="form-group">
                <label htmlFor="gameName">
                  Nom de la partie <span style={{color: '#f44336'}}>*</span>
                </label>
                <input
                  type="text"
                  id="gameName"
                  value={newGame.name}
                  onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  placeholder="Ex: Partie d'airsoft du mois"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gameDate">
                  Date de la partie <span style={{color: '#f44336'}}>*</span>
                </label>
                <input
                  type="date"
                  id="gameDate"
                  value={newGame.date}
                  onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gameDescription">
                  Description (optionnel)
                </label>
                <textarea
                  id="gameDescription"
                  value={newGame.description}
                  onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  placeholder="Description de la partie..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={newGame.is_active}
                    onChange={(e) => setNewGame({...newGame, is_active: e.target.checked})}
                  />
                  Partie active (visible pour les inscriptions)
                </label>
              </div>

              <button 
                type="submit" 
                className="action-button primary"
                disabled={loading}
              >
                {loading ? 'Création en cours...' : '✅ Créer la partie'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            {/* Sélection de la partie */}
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label>Sélectionner une partie :</label>
              <select
                value={selectedGame?.id || ''}
                onChange={(e) => {
                  const game = games.find(g => g.id === parseInt(e.target.value));
                  setSelectedGame(game);
                }}
                style={{ maxWidth: '400px' }}
              >
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {new Date(game.date).toLocaleDateString('fr-FR')} - {game.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedGame && (
              <>
                <div className="game-status-info" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px', borderLeft: `4px solid ${selectedGame.is_closed ? '#ff9800' : '#4CAF50'}` }}>
                  <strong>Statut des inscriptions : </strong>
                  <span style={{ color: selectedGame.is_closed ? '#ff9800' : '#4CAF50', fontWeight: 'bold' }}>
                    {selectedGame.is_closed ? '🔒 CLÔTURÉES' : '✅ OUVERTES'}
                  </span>
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={toggleGameClosed} 
                    className={`action-button ${selectedGame.is_closed ? 'success' : 'warning'}`}
                    disabled={loading}
                  >
                    {loading ? 'Traitement...' : selectedGame.is_closed ? '🔓 Rouvrir les inscriptions' : '🔒 Clôturer les inscriptions'}
                  </button>
                  
                  <button 
                    onClick={sendReminders} 
                    className="action-button secondary"
                    disabled={loading}
                  >
                    {loading ? 'Envoi en cours...' : '📧 Envoyer des rappels'}
                  </button>
                </div>

                <p style={{ 
                  color: '#b0b0b0', 
                  fontSize: '0.9em', 
                  marginBottom: '10px',
                  fontStyle: 'italic'
                }}>
                  💡 Faites défiler le tableau horizontalement pour voir toutes les colonnes et les actions
                </p>

                {/* Filtres */}
                <div className="filters-section" style={{ 
                  marginBottom: '20px', 
                  padding: '20px', 
                  backgroundColor: '#1a1a1a', 
                  borderRadius: '8px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#4CAF50' }}>🔍 Filtres</h3>
                    <button onClick={resetFilters} className="action-button secondary" style={{ fontSize: '0.9em' }}>
                      ↺ Réinitialiser
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Nom / Pseudo</label>
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={filters.name}
                        onChange={(e) => setFilters({...filters, name: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #333' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Paiement</label>
                      <select
                        value={filters.paymentValidated}
                        onChange={(e) => setFilters({...filters, paymentValidated: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #333' }}
                      >
                        <option value="all">Tous</option>
                        <option value="validated">Validé</option>
                        <option value="notValidated">Non validé</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Présence</label>
                      <select
                        value={filters.wasPresent}
                        onChange={(e) => setFilters({...filters, wasPresent: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #333' }}
                      >
                        <option value="all">Tous</option>
                        <option value="present">Présent</option>
                        <option value="absent">Absent</option>
                        <option value="unknown">Non défini</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#b0b0b0' }}>
                    {getFilteredAndSortedRegistrations().length} / {registrations.length} inscription(s)
                  </div>
                </div>

                <div className="table-container">
                  <table className="with-actions">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('nickname')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Pseudo {sortConfig.key === 'nickname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Nom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('association_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Association {sortConfig.key === 'association_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('payment_validated')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Paiement {sortConfig.key === 'payment_validated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('calculated_price')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Prix PAF {sortConfig.key === 'calculated_price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Grammage PA</th>
                        <th>Grammage Longue</th>
                        <th>Longue 2</th>
                        <th>Tag Lightning</th>
                        <th onClick={() => handleSort('attendance_type')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Présence {sortConfig.key === 'attendance_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Confirmé</th>
                        <th onClick={() => handleSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Téléphone {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('was_present')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          Présent {sortConfig.key === 'was_present' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="actions-cell" style={{ width: '130px', minWidth: '130px', maxWidth: '130px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAndSortedRegistrations().length === 0 ? (
                        <tr>
                          <td colSpan="15" style={{ textAlign: 'center', padding: '30px' }}>
                            {registrations.length === 0 ? 'Aucune inscription pour cette partie' : 'Aucun résultat ne correspond aux filtres'}
                          </td>
                        </tr>
                      ) : (
                        getFilteredAndSortedRegistrations().map(reg => (
                          <tr key={reg.id}>
                            <td>{reg.nickname}</td>
                            <td>{reg.first_name} {reg.last_name}</td>
                            <td>
                              {reg.has_association ? reg.association_name : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <select
                                value={reg.payment_type_id || ''}
                                onChange={(e) => setPaymentType(reg.id, e.target.value ? parseInt(e.target.value) : null)}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#1a1a1a',
                                  color: '#fff',
                                  border: '1px solid #444',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  minWidth: '120px'
                                }}
                              >
                                <option value="">Non payé</option>
                                {paymentTypes.map(pt => (
                                  <option key={pt.id} value={pt.id}>
                                    {pt.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: reg.calculated_price === 0 ? '#888' : '#4CAF50' }}>
                              {reg.calculated_price !== undefined && reg.calculated_price !== null ? `${reg.calculated_price}€` : '-'}
                            </td>
                            <td>
                              {reg.bb_weight_pistol || '-'}
                            </td>
                            <td>
                              {reg.bb_weight_rifle || '-'}
                            </td>
                            <td>
                              {reg.has_second_rifle ? (reg.bb_weight_rifle_2 || '-') : '-'}
                            </td>
                            <td>
                              <select
                                value={reg.nfc_tag_id || ''}
                                onChange={(e) => assignNFCTag(reg.id, e.target.value ? parseInt(e.target.value) : null)}
                                style={{ 
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  fontSize: '13px',
                                  backgroundColor: reg.nfc_tag_id ? '#d4edda' : 'white'
                                }}
                              >
                                <option value="">Aucun tag</option>
                                {reg.nfc_tag_id && (
                                  <option value={reg.nfc_tag_id}>⚡ {reg.nfc_tag_number}</option>
                                )}
                                {nfcTags
                                  .filter(tag => tag.is_available && tag.is_active)
                                  .map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                      ⚡ {tag.tag_number}
                                    </option>
                                  ))
                                }
                              </select>
                            </td>
                            <td>
                              {reg.attendance_type === 'morning' ? 'Matinée' : 'Journée entière'}
                            </td>
                            <td>
                              <span className={`badge ${reg.confirmed ? 'confirmed' : 'pending'}`}>
                                {reg.confirmed ? 'Oui' : 'En attente'}
                              </span>
                            </td>
                            <td>{reg.email}</td>
                            <td>{reg.phone}</td>
                            <td>
                              <span className={`badge ${reg.was_present ? 'present' : reg.was_present === false ? 'absent' : ''}`}>
                                {reg.was_present === null ? '-' : reg.was_present ? 'Présent' : 'Absent'}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <div className="action-buttons-group">
                                <button
                                  onClick={() => handleEditPlayer(reg)}
                                  className="action-button"
                                  title="Modifier cette inscription"
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  onClick={() => togglePresence(reg.id, reg.was_present)}
                                  className="action-button"
                                  title={reg.was_present ? 'Marquer comme absent' : 'Marquer comme présent'}
                                >
                                  {reg.was_present ? '❌ Absent' : '✅ Présent'}
                                </button>
                                <button
                                  onClick={() => deleteRegistration(reg.id, `${reg.first_name} ${reg.last_name}`)}
                                  className="action-button danger"
                                  title="Supprimer cette inscription"
                                >
                                  🗑️ Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'statistics' && statistics && (
          <div>
            <h2 style={{ padding: '20px 0', color: 'var(--primary-color)' }}>📊 Statistiques Globales</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total de parties</h3>
                <div className="value">{statistics.total_games}</div>
              </div>
              <div className="stat-card">
                <h3>Total d'inscriptions</h3>
                <div className="value">{statistics.total_registrations}</div>
              </div>
              <div className="stat-card">
                <h3>Inscriptions confirmées</h3>
                <div className="value">{statistics.total_confirmed}</div>
              </div>
              <div className="stat-card">
                <h3>Présents</h3>
                <div className="value">{statistics.total_present}</div>
              </div>
              <div className="stat-card highlight">
                <h3>💰 Revenu Total</h3>
                <div className="value">{statistics.total_revenue.toFixed(2)} €</div>
              </div>
              <div className="stat-card">
                <h3>Moyenne par partie</h3>
                <div className="value">{statistics.average_per_game.toFixed(1)}</div>
              </div>
              <div className="stat-card">
                <h3>Matinée uniquement</h3>
                <div className="value">{statistics.morning_only}</div>
              </div>
              <div className="stat-card">
                <h3>Journée entière</h3>
                <div className="value">{statistics.full_day}</div>
              </div>
            </div>

            {Object.keys(statistics.top_associations).length > 0 && (
              <div className="table-container">
                <h2 style={{ padding: '20px', color: 'var(--primary-color)' }}>Top Associations</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Association</th>
                      <th>Nombre de participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistics.top_associations).map(([name, count]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {gameStats.length > 0 && (
              <div className="table-container" style={{ marginTop: '40px' }}>
                <h2 style={{ padding: '20px', color: 'var(--primary-color)' }}>🎮 Statistiques par Partie</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Partie</th>
                      <th>Inscrits</th>
                      <th>Confirmés</th>
                      <th>Présents</th>
                      <th>Paiements</th>
                      <th>💰 Revenu</th>
                      <th>Matinée</th>
                      <th>Journée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameStats.map((game) => (
                      <tr key={game.game_id}>
                        <td>{new Date(game.game_date).toLocaleDateString('fr-FR')}</td>
                        <td>{game.game_name}</td>
                        <td>{game.total_registrations}</td>
                        <td>{game.confirmed}</td>
                        <td>{game.present}</td>
                        <td>{game.payments_validated}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {game.revenue.toFixed(2)} €
                        </td>
                        <td>{game.morning_only}</td>
                        <td>{game.full_day}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={handleCloseModal}
          onUpdate={handleUpdatePlayer}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
