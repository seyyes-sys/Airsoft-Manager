import React, { useState } from 'react';
import api from '../api';
import './LogoManager.css';

function LogoManager() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setError('Type de fichier non autorisé. Utilisez PNG, JPG ou SVG.');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 5MB)');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/api/logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Logo uploadé avec succès ! Rechargez la page pour voir les changements.');
      setSelectedFile(null);
      setPreview(null);
      
      // Recharger la page après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err.response?.data?.detail || 'Erreur lors de l\'upload du logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer le logo actuel ?')) {
      return;
    }

    try {
      await api.delete('/api/logo');
      setMessage('Logo supprimé avec succès !');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la suppression du logo');
    }
  };

  return (
    <div className="logo-manager">
      <h2>🎨 Gestion du logo</h2>
      
      <div className="logo-preview-section">
        <div className="current-logo">
          <h3>Logo actuel</h3>
          <div className="logo-display">
            <img 
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/logo?t=${Date.now()}`}
              alt="Logo actuel"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="no-logo" style={{ display: 'none' }}>
              <span>Aucun logo uploadé</span>
            </div>
          </div>
          <button onClick={handleDelete} className="action-button danger">
            🗑️ Supprimer le logo
          </button>
        </div>

        {preview && (
          <div className="new-logo-preview">
            <h3>Nouveau logo (prévisualisation)</h3>
            <div className="logo-display">
              <img src={preview} alt="Prévisualisation" />
            </div>
          </div>
        )}
      </div>

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

      <div className="upload-section">
        <h3>Uploader un nouveau logo</h3>
        <div className="upload-info">
          <p>📝 Formats acceptés : PNG, JPG, SVG</p>
          <p>📦 Taille maximale : 5 MB</p>
          <p>💡 Recommandation : Utilisez un fond transparent (PNG)</p>
        </div>

        <div className="file-input-container">
          <label htmlFor="logo-file" className="file-input-label">
            📁 Choisir un fichier
          </label>
          <input
            type="file"
            id="logo-file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          {selectedFile && (
            <span className="selected-file-name">
              {selectedFile.name}
            </span>
          )}
        </div>

        {selectedFile && (
          <button
            onClick={handleUpload}
            className="action-button primary"
            disabled={uploading}
          >
            {uploading ? '⏳ Upload en cours...' : '💾 Uploader le logo'}
          </button>
        )}
      </div>
    </div>
  );
}

export default LogoManager;
