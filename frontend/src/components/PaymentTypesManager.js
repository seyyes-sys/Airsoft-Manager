import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './PaymentTypesManager.css';

function PaymentTypesManager() {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [partnerAssociations, setPartnerAssociations] = useState([]);
  const [pricingSettings, setPricingSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingAssocId, setEditingAssocId] = useState(null);
  const [activeTab, setActiveTab] = useState('payment-types'); // 'payment-types', 'associations', 'pricing'
  const [formData, setFormData] = useState({
    name: '',
    generates_cost: true
  });
  const [assocFormData, setAssocFormData] = useState({
    name: ''
  });
  const [pricingFormData, setPricingFormData] = useState({
    partner_association_price: 5,
    other_association_price: 7,
    freelance_price: 9
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingAssoc, setIsCreatingAssoc] = useState(false);

  // Gestion du redimensionnement des colonnes
  const [resizing, setResizing] = useState(null);
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('paymentTypesColumnWidths');
    return saved ? JSON.parse(saved) : {
      paymentTypes: [90, 80, 60, 60],
      associations: [130, 60, 60]
    };
  });

  // Sauvegarder les largeurs dans localStorage
  const saveColumnWidths = (widths) => {
    setColumnWidths(widths);
    localStorage.setItem('paymentTypesColumnWidths', JSON.stringify(widths));
  };

  // Gérer le début du redimensionnement
  const handleMouseDown = (table, colIndex, e) => {
    e.preventDefault();
    setResizing({ table, colIndex, startX: e.pageX });
  };

  // Gérer le mouvement de la souris
  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    const diff = e.pageX - resizing.startX;
    const newWidths = { ...columnWidths };
    const currentWidth = newWidths[resizing.table][resizing.colIndex];
    const newWidth = Math.max(50, currentWidth + diff);
    newWidths[resizing.table][resizing.colIndex] = newWidth;
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
    fetchPaymentTypes();
    fetchPartnerAssociations();
    fetchPricingSettings();
  }, []);

  const fetchPaymentTypes = async () => {
    try {
      const response = await api.get('/api/payment-types');
      setPaymentTypes(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des types de paiement:', err);
      alert('Erreur lors du chargement des types de paiement');
    }
  };

  const fetchPartnerAssociations = async () => {
    try {
      const response = await api.get('/api/partner-associations');
      setPartnerAssociations(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des associations:', err);
    }
  };

  const fetchPricingSettings = async () => {
    try {
      const response = await api.get('/api/pricing-settings');
      setPricingSettings(response.data);
      setPricingFormData({
        partner_association_price: response.data.partner_association_price,
        other_association_price: response.data.other_association_price,
        freelance_price: response.data.freelance_price
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des tarifs:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Le nom est obligatoire');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/payment-types', formData);
      setFormData({ name: '', generates_cost: true });
      setIsCreating(false);
      fetchPaymentTypes();
      alert('Type de paiement créé avec succès');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    const paymentType = paymentTypes.find(pt => pt.id === id);
    if (!paymentType) return;

    setLoading(true);
    try {
      await api.put(`/api/payment-types/${id}`, {
        name: paymentType.name,
        generates_cost: paymentType.generates_cost,
        is_active: paymentType.is_active
      });
      alert('Type de paiement mis à jour');
      setEditingId(null);
      fetchPaymentTypes();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type de paiement ?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/payment-types/${id}`);
      fetchPaymentTypes();
      alert('Type de paiement supprimé');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // === Gestion des associations partenaires ===

  const handleCreateAssociation = async (e) => {
    e.preventDefault();
    if (!assocFormData.name.trim()) {
      alert('Le nom est obligatoire');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/partner-associations', assocFormData);
      setAssocFormData({ name: '' });
      setIsCreatingAssoc(false);
      fetchPartnerAssociations();
      alert('Association partenaire créée avec succès');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssociation = async (id) => {
    const association = partnerAssociations.find(a => a.id === id);
    if (!association) return;

    setLoading(true);
    try {
      await api.put(`/api/partner-associations/${id}`, {
        name: association.name,
        is_active: association.is_active
      });
      alert('Association mise à jour');
      setEditingAssocId(null);
      fetchPartnerAssociations();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssociation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/partner-associations/${id}`);
      fetchPartnerAssociations();
      alert('Association supprimée');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleAssocFieldChange = (id, field, value) => {
    setPartnerAssociations(partnerAssociations.map(assoc =>
      assoc.id === id ? { ...assoc, [field]: value } : assoc
    ));
  };

  // === Gestion des tarifs ===

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/pricing-settings', pricingFormData);
      fetchPricingSettings();
      alert('Tarifs mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour des tarifs:', err);
      alert('Erreur lors de la mise à jour des tarifs');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setPaymentTypes(prevTypes =>
      prevTypes.map(pt =>
        pt.id === id ? { ...pt, [field]: value } : pt
      )
    );
  };

  return (
    <div className="payment-types-manager">
      <div className="header-section">
        <h2>💳 Gestion des Paiements</h2>
        <p className="subtitle">
          Configurez les types de paiement, gérez les associations partenaires et définissez les tarifs PAF.
          <button
            onClick={() => {
              localStorage.removeItem('paymentTypesColumnWidths');
              setColumnWidths({ paymentTypes: [90, 80, 60, 60], associations: [130, 60, 60] });
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

      {/* Système d'onglets */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'payment-types' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment-types')}
        >
          Types de Paiement
        </button>
        <button
          className={`tab-button ${activeTab === 'associations' ? 'active' : ''}`}
          onClick={() => setActiveTab('associations')}
        >
          Associations Partenaires
        </button>
        <button
          className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          Tarifs PAF
        </button>
      </div>

      {/* Onglet 1: Types de Paiement */}
      {activeTab === 'payment-types' && (
        <div className="tab-content">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="create-button"
            >
              ➕ Nouveau type de paiement
            </button>
          )}

          {isCreating && (
            <form onSubmit={handleCreate} className="create-form">
              <h3>Créer un nouveau type</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nom du type (ex: Espèces, Paypal...)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={50}
                  required
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.generates_cost}
                    onChange={(e) => setFormData({ ...formData, generates_cost: e.target.checked })}
                  />
                  Génère un coût (compté dans les revenus)
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({ name: '', generates_cost: true });
                  }}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table 
              className="payment-types-table"
              style={{ 
                width: `${columnWidths.paymentTypes.reduce((a, b) => a + b, 0)}px`,
                tableLayout: 'fixed'
              }}
            >
              <thead>
                <tr>
                  {['Nom', 'Génère un coût', 'Actif', 'Actions'].map((label, idx) => (
                    <th key={idx} style={{ width: `${columnWidths.paymentTypes[idx]}px`, position: 'relative' }}>
                      {label}
                      <div
                        className="resize-handle"
                        onMouseDown={(e) => handleMouseDown('paymentTypes', idx, e)}
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
                {paymentTypes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                      Aucun type de paiement configuré
                    </td>
                  </tr>
                ) : (
                  paymentTypes.map(pt => (
                    <tr key={pt.id}>
                      <td>
                        {editingId === pt.id ? (
                          <input
                            type="text"
                            value={pt.name}
                            onChange={(e) => handleFieldChange(pt.id, 'name', e.target.value)}
                            maxLength={50}
                            style={{ width: '95%' }}
                          />
                        ) : (
                          pt.name
                        )}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={pt.generates_cost}
                          onChange={(e) => {
                            handleFieldChange(pt.id, 'generates_cost', e.target.checked);
                            if (editingId !== pt.id) {
                              setEditingId(pt.id);
                            }
                          }}
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={pt.is_active}
                          onChange={(e) => {
                            handleFieldChange(pt.id, 'is_active', e.target.checked);
                            if (editingId !== pt.id) {
                              setEditingId(pt.id);
                            }
                          }}
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {editingId === pt.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(pt.id)}
                                className="action-button success"
                                disabled={loading}
                                title="Enregistrer"
                              >
                                💾
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  fetchPaymentTypes();
                                }}
                                className="action-button"
                                disabled={loading}
                                title="Annuler"
                              >
                                ✖
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingId(pt.id)}
                                className="action-button"
                                disabled={loading}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(pt.id)}
                                className="action-button danger"
                                disabled={loading}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="info-box">
            <h4>ℹ️ À propos des types de paiement</h4>
            <ul>
              <li><strong>Génère un coût :</strong> Si coché, les inscriptions avec ce type seront comptées dans les revenus (statistiques)</li>
              <li><strong>Actif :</strong> Décochez pour désactiver temporairement un type sans le supprimer</li>
              <li><strong>Suppression :</strong> Impossible de supprimer un type utilisé par des inscriptions existantes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Onglet 2: Associations Partenaires */}
      {activeTab === 'associations' && (
        <div className="tab-content">
          {!isCreatingAssoc && (
            <button
              onClick={() => setIsCreatingAssoc(true)}
              className="create-button"
            >
              ➕ Nouvelle association
            </button>
          )}

          {isCreatingAssoc && (
            <form onSubmit={handleCreateAssociation} className="create-form">
              <h3>Créer une nouvelle association partenaire</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nom de l'association"
                  value={assocFormData.name}
                  onChange={(e) => setAssocFormData({ ...assocFormData, name: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAssoc(false);
                    setAssocFormData({ name: '' });
                  }}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          <div className="table-container">
            <table 
              className="associations-table"
              style={{ 
                width: `${columnWidths.associations.reduce((a, b) => a + b, 0)}px`,
                tableLayout: 'fixed'
              }}
            >
              <thead>
                <tr>
                  {['Nom', 'Actif', 'Actions'].map((label, idx) => (
                    <th key={idx} style={{ width: `${columnWidths.associations[idx]}px`, position: 'relative' }}>
                      {label}
                      <div
                        className="resize-handle"
                        onMouseDown={(e) => handleMouseDown('associations', idx, e)}
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
                {partnerAssociations.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                      Aucune association partenaire configurée
                    </td>
                  </tr>
                ) : (
                  partnerAssociations.map(assoc => (
                    <tr key={assoc.id}>
                      <td>
                        {editingAssocId === assoc.id ? (
                          <input
                            type="text"
                            value={assoc.name}
                            onChange={(e) => handleAssocFieldChange(assoc.id, 'name', e.target.value)}
                            maxLength={100}
                            style={{ width: '95%' }}
                          />
                        ) : (
                          assoc.name
                        )}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={assoc.is_active}
                          onChange={(e) => {
                            handleAssocFieldChange(assoc.id, 'is_active', e.target.checked);
                            if (editingAssocId !== assoc.id) {
                              setEditingAssocId(assoc.id);
                            }
                          }}
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {editingAssocId === assoc.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateAssociation(assoc.id)}
                                className="action-button success"
                                disabled={loading}
                                title="Enregistrer"
                              >
                                💾
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAssocId(null);
                                  fetchPartnerAssociations();
                                }}
                                className="action-button"
                                disabled={loading}
                                title="Annuler"
                              >
                                ✖
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingAssocId(assoc.id)}
                                className="action-button"
                                disabled={loading}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteAssociation(assoc.id)}
                                className="action-button danger"
                                disabled={loading}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="info-box">
            <h4>ℹ️ À propos des associations partenaires</h4>
            <ul>
              <li><strong>Associations partenaires :</strong> Ces associations bénéficient d'un tarif préférentiel (tarif le plus bas)</li>
              <li><strong>Actif :</strong> Décochez pour désactiver temporairement une association sans la supprimer</li>
              <li><strong>Impact :</strong> Les joueurs de ces associations paieront le tarif "Association Partenaire" configuré dans l'onglet "Tarifs PAF"</li>
            </ul>
          </div>
        </div>
      )}

      {/* Onglet 3: Tarifs PAF */}
      {activeTab === 'pricing' && (
        <div className="tab-content">
          <form onSubmit={handleUpdatePricing} className="pricing-form">
            <h3>Configuration des tarifs PAF</h3>
            
            <div className="pricing-fields">
              <div className="pricing-field">
                <label htmlFor="partner_price">
                  <strong>Tarif association partenaire (€)</strong>
                  <span className="field-description">Pour les joueurs des associations partenaires</span>
                </label>
                <input
                  id="partner_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricingFormData.partner_association_price}
                  onChange={(e) => setPricingFormData({ ...pricingFormData, partner_association_price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="pricing-field">
                <label htmlFor="other_price">
                  <strong>Tarif autre association (€)</strong>
                  <span className="field-description">Pour les joueurs d'associations non partenaires</span>
                </label>
                <input
                  id="other_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricingFormData.other_association_price}
                  onChange={(e) => setPricingFormData({ ...pricingFormData, other_association_price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="pricing-field">
                <label htmlFor="freelance_price">
                  <strong>Tarif freelance (€)</strong>
                  <span className="field-description">Pour les joueurs sans association</span>
                </label>
                <input
                  id="freelance_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricingFormData.freelance_price}
                  onChange={(e) => setPricingFormData({ ...pricingFormData, freelance_price: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Enregistrement...' : '💾 Enregistrer les tarifs'}
            </button>
          </form>

          <div className="info-box">
            <h4>ℹ️ Règles de tarification</h4>
            <ul>
              <li><strong>Association partenaire :</strong> Appliqué automatiquement aux joueurs inscrits via les associations partenaires (onglet précédent)</li>
              <li><strong>Autre association :</strong> Appliqué aux joueurs qui sélectionnent une association non partenaire lors de l'inscription</li>
              <li><strong>Freelance :</strong> Appliqué aux joueurs qui ne sélectionnent aucune association</li>
              <li><strong>Calcul automatique :</strong> Le système détermine le tarif applicable en fonction du statut du joueur lors de l'inscription</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentTypesManager;
