import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import WelcomePage from './components/WelcomePage';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ConfirmationPage from './components/ConfirmationPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => localStorage.getItem('token') !== null
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/confirm/:registrationId" element={<ConfirmationPage />} />
          <Route 
            path="/admin/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/admin/dashboard" /> : 
                <AdminLogin setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAuthenticated ? 
                <AdminDashboard setIsAuthenticated={setIsAuthenticated} /> : 
                <Navigate to="/admin/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
