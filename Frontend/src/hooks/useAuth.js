// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');

      if (!token || !userDataStr) {
        console.warn('Authentification requise');
        navigate('/login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      
      // Vérifier l'expiration du token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          throw new Error('Token expiré');
        }
      } catch (e) {
        logout();
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || 'user');
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    setUser(null);
    navigate('/login');
  };

  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  return {
    user,
    loading,
    login,
    logout,
    getToken,
    checkAuth
  };
};