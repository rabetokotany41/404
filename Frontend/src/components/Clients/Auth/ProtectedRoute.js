// components/Clients/Auth/ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({
  children,
  isAuthenticated = false,
  requiredRole = null,
  userRole = null
}) => {

  // Pas connecté → redirection login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // --- Contrôle du rôle ---
  if (requiredRole && userRole !== requiredRole) {

    // Cas ADMIN essaye d'entrer dans une route USER
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    // Cas USER essaye d'entrer dans une route ADMIN
    if (userRole === "user") {
      return <Navigate to="/" replace />;   // Redirection HOME
    }

    // Autre cas → redirection page accueil
    return <Navigate to="/" replace />;
  }

  // Tout est OK → afficher la page protégée
  return children;
};

export default ProtectedRoute;
