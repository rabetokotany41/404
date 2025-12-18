import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';

// CONTEXT
import { LanguageProvider } from './contexts/LanguageContext';

// AUTH
import Login from './components/Clients/Auth/Login';
import Register from './components/Clients/Auth/Register';
import ProtectedRoute from './components/Clients/Auth/ProtectedRoute';

// LAYOUTS
import ClientLayout from './components/ClientLayout';

// CLIENT PAGES
import Home from './components/Clients/Home/Home';
import About from './components/Clients/About/About';
import CheckContent from './components/Clients/CheckContent/CheckContent';
import Learn from './components/Clients/Learn/Learn';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Vérifier session au chargement
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (userData && authToken) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          ...user,
          email: user.email || '',
          first_name: user.first_name || user.name || user.email?.split('@')[0] || 'Utilisateur',
          role: user.role || 'user'
        });
        setUserRole(user.role || 'user');
        setIsAuthenticated(true);

        // Redirection automatique selon rôle
        if (user.role === 'admin' && !location.pathname.startsWith('/admin')) {
          navigate('/admin', { replace: true });
        } else if (user.role === 'user' && location.pathname.startsWith('/admin')) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Erreur parsing userData:', error);
        handleLogout();
      }
    }
    setIsLoading(false);
  }, [location.pathname, navigate]);

  const handleLogin = (userData, token) => {
    const formattedUser = {
      ...userData,
      email: userData.email || '',
      first_name: userData.first_name || userData.name || userData.email?.split('@')[0] || 'Utilisateur',
      role: userData.role || 'user'
    };
    
    localStorage.setItem('userData', JSON.stringify(formattedUser));
    localStorage.setItem('authToken', token);
    
    setCurrentUser(formattedUser);
    setUserRole(formattedUser.role);
    setIsAuthenticated(true);

    if (formattedUser.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
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
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />
          ) : (
            <ClientLayout 
              isAuthenticated={isAuthenticated} 
              onLogout={handleLogout} 
              currentUser={currentUser}
            >
              <Login onLogin={handleLogin} />
            </ClientLayout>
          )
        }
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />
          ) : (
            <ClientLayout 
              isAuthenticated={isAuthenticated} 
              onLogout={handleLogout} 
              currentUser={currentUser}
            >
              <Register onLogin={handleLogin} />
            </ClientLayout>
          )
        }
      />
      {/* ROUTES CLIENT PUBLIQUES */}
      <Route
        path="/*"
        element={
          <ClientLayout 
            isAuthenticated={isAuthenticated} 
            onLogout={handleLogout} 
            currentUser={currentUser}
          >
            <Routes>
              <Route path="/" element={<Home currentUser={currentUser} />} />
              <Route path="/about" element={<About />} />
              <Route path="/check" element={<CheckContent />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ClientLayout>
        }
      />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  );
}