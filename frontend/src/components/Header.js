import React from 'react';
import './Header.css';

function Header({ title, subtitle, showLogo = true, showMembershipButton = false, onMembershipClick }) {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  return (
    <div className="header">
      {showLogo && (
        <div className="logo-container">
          <img 
            src={`${apiUrl}/api/logo?t=${Date.now()}`}
            alt="Logo" 
            className="logo"
            onError={(e) => {
              // Si le logo de l'API n'est pas disponible, essayer le logo local
              if (!e.target.src.includes('/logo.svg')) {
                e.target.src = '/logo.svg';
              } else if (e.target.src.endsWith('.svg')) {
                e.target.src = '/logo.png';
              } else {
                // Si aucun logo n'est trouvé, afficher l'icône par défaut
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }
            }}
          />
          <div className="logo-fallback" style={{ display: 'none' }}>
            🎯
          </div>
        </div>
      )}
      <div className="header-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {showMembershipButton && (
        <div className="membership-button-container">
          <button className="membership-button" onClick={onMembershipClick}>
            <span className="membership-icon">👥</span>
            <span>Rejoignez-nous</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;
