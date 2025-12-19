import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

// CONTEXT
import { LanguageProvider } from './contexts/LanguageContext';

// AUTH
import Login from './components/Clients/Auth/Login';
import Register from './components/Clients/Auth/Register';

// LAYOUTS
import ClientLayout from './components/ClientLayout';

// CLIENT PAGES
import Home from './components/Clients/Home/Home';
import About from './components/Clients/About/About';
import CheckContent from './components/Clients/CheckContent/CheckContent';
import Learn from './components/Clients/Learn/Learn';
import Profile from './components/Clients/Profile/Profile';
import Notifications from './components/Clients/Notifications/Notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Vérifier la session au chargement
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');

    if (userData && authToken) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(formatUserData(user));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur parsing userData:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const formatUserData = (user) => ({
    ...user,
    id: user.id,
    email: user.email || '',
    first_name: user.first_name || user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Utilisateur',
    full_name: user.full_name || user.first_name || '',
    role: user.user_type || 'citizen',
    language_preference: user.language_preference || 'mg',
  });

  const handleLogin = (userData, token) => {
    const formattedUser = formatUserData(userData);
    localStorage.setItem('userData', JSON.stringify(formattedUser));
    localStorage.setItem('authToken', token);
    setCurrentUser(formattedUser);
    setIsAuthenticated(true);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    logout();
  };

  const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes publiques pour Auth */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />}
      />

      {/* Routes principales avec ClientLayout */}
      <Route
        path="/*"
        element={
          <ClientLayout
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            currentUser={currentUser}
          >
            <Routes>
              {/* Routes protégées */}
              <Route
                path="/profile"
                element={isAuthenticated ? <Profile user={currentUser} /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/notifications"
                element={isAuthenticated ? <Notifications /> : <Navigate to="/login" replace />}
              />

              {/* Routes publiques */}
              <Route path="/" element={<Home currentUser={currentUser} />} />
              <Route path="/about" element={<About />} />
              <Route path="/check" element={<CheckContent />} />
              <Route path="/learn" element={<Learn />} />

              {/* Redirect pour routes inconnues */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ClientLayout>
        }
      />
    </Routes>
  );
}

// AppWrapper pour Router et Context
export default function AppWrapper() {
  return (
    <Router>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  );
}