import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from './Header';

function AdminLogin({ setIsAuthenticated }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', credentials);
      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header 
        title="🔐 Administration"
        subtitle="Connexion à l'espace administrateur"
      />

      <div className="container">
        <div className="form-container" style={{ maxWidth: '400px' }}>
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="admin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="admin-link">
            <a href="/">← Retour au formulaire d'inscription</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
