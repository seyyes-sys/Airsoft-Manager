import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings doit être utilisé dans SiteSettingsProvider');
  }
  return context;
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_title: 'Bienvenue sur le terrain de la LSPA',
    primary_color: '#4CAF50'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings(response.data);
      applyColorTheme(response.data.primary_color);
    } catch (err) {
      console.error('Erreur récupération paramètres:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyColorTheme = (color) => {
    // Appliquer la couleur principale à tout le document
    document.documentElement.style.setProperty('--primary-color', color);
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
