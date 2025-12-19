import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Nettoyer au chargement
    console.log('Login component mounted');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      setLoading(false);
      return;
    }

    try {
      console.log('Tentative de connexion avec:', formData.email);

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      console.log('📦 Réponse complète:', response);
      console.log('📊 Données de réponse:', response.data);

      const data = response.data;

      // Analyser la structure de la réponse
      let token = null;
      let user = null;
      let message = '';

      // Différentes structures possibles
      if (data.token) {
        token = data.token;
      } else if (data.data?.token) {
        token = data.data.token;
      } else if (data.access_token) {
        token = data.access_token;
      }

      if (data.user) {
        user = data.user;
      } else if (data.data?.user) {
        user = data.data.user;
      } else if (data.userData) {
        user = data.userData;
      }

      if (data.message) {
        message = data.message;
      }

      console.log('🔍 Données extraites:', { token, user, message });

      if (data.success === true || data.status === 'success') {
        if (token) {
          // Nettoyer le token
          let cleanToken = token.trim();
          if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
            cleanToken = cleanToken.slice(1, -1);
          }

          console.log('✅ Token nettoyé:', cleanToken.substring(0, 30) + '...');

          // Nettoyer le localStorage
          localStorage.clear();

          // Stocker les données
          localStorage.setItem('authToken', cleanToken);

          if (user) {
            localStorage.setItem('userData', JSON.stringify(user));
            console.log('👤 Utilisateur stocké:', user);
          } else {
            // Créer un objet utilisateur basique
            const basicUser = {
              email: formData.email,
              name: formData.email.split('@')[0],
              role: 'user'
            };
            localStorage.setItem('userData', JSON.stringify(basicUser));
            user = basicUser;
          }

          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('rememberedEmail', formData.email);
          }

          setSuccess(message || 'Connexion réussie ! Redirection en cours...');

          // Appeler le callback parent
          if (onLogin && typeof onLogin === 'function') {
            console.log('📞 Appel du callback onLogin...');
            try {
              onLogin(user, cleanToken);
            } catch (callbackError) {
              console.error('Erreur callback:', callbackError);
            }
          }

          // Redirection après 1 seconde
          setTimeout(() => {
            console.log('🔄 Redirection vers /');
            window.location.href = '/';
          }, 1000);

        } else {
          // Pas de token mais succès quand même (pour debug)
          console.warn('⚠️ Succès mais pas de token reçu');
          setSuccess('Connexion réussie (debug) ! Stockage des données...');

          // Stocker quand même pour tester
          const basicUser = {
            email: formData.email,
            name: formData.email.split('@')[0],
            role: 'user'
          };

          localStorage.setItem('userData', JSON.stringify(basicUser));
          localStorage.setItem('authToken', 'debug-token-' + Date.now());

          if (onLogin && typeof onLogin === 'function') {
            onLogin(basicUser, 'debug-token');
          }

          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } else {
        setError(message || 'Email ou mot de passe incorrect');
        setLoading(false);
      }

    } catch (error) {
      console.error('❌ Erreur de connexion:', error);

      let errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';

      if (error.response) {
        console.error('📡 Réponse erreur:', error.response.data);
        console.error('📡 Status:', error.response.status);

        if (error.response.data) {
          errorMessage = error.response.data.message ||
            error.response.data.error ||
            `Erreur ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Pas de réponse du serveur. Vérifiez que le backend est en marche sur http://localhost:5000';
        console.error('🌐 Pas de réponse:', error.request);
      } else {
        console.error('⚡ Erreur de configuration:', error.message);
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDemoAccount = (accountType) => {
    let email, password;

    switch (accountType) {
      case 'admin':
        email = 'admin@gmail.com';
        password = 'admin123';
        break;
      case 'user':
        email = 'utilisateur@gmail.com';
        password = 'user123';
        break;
      default:
        email = 'test@test.com';
        password = 'test123';
    }

    setFormData({ email, password });
    setSuccess(`Compte ${accountType} pré-rempli. Cliquez sur "Se connecter".`);
  };

  const testAPIConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 3000
      });
      console.log('✅ Serveur disponible:', response.data);
      setSuccess('✅ Serveur backend disponible !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.warn('❌ Serveur non disponible:', error.message);
      setError('❌ Serveur backend non disponible. Vérifiez que le serveur est en marche.');
    }
  };

  // Test direct de l'API login (pour debug)
  const testLoginAPI = async () => {
    try {
      const testData = {
        email: 'test@test.com',
        password: 'test123'
      };

      console.log('🧪 Test API login avec:', testData);

      const response = await axios.post('http://localhost:5000/api/auth/login', testData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('🧪 Réponse test:', response.data);
      alert('API test: ' + JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('🧪 Erreur test:', err.response?.data || err.message);
      alert('Erreur test: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-300/20 to-secondary-300/20 rounded-full blur-3xl dark:from-primary-500/10 dark:to-secondary-500/10"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent-300/20 to-primary-300/20 rounded-full blur-3xl dark:from-accent-500/10 dark:to-primary-500/10"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Hero Section */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white/80 to-white/20 dark:from-neutral-900/80 dark:to-neutral-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-neutral-800/50 overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        Bienvenue
                      </h1>
                      <p className="text-neutral-600 dark:text-neutral-400">Connectez-vous à votre compte</p>
                    </div>
                  </div>

                  {/* Debug buttons */}
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Debug
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={testLoginAPI}
                        className="w-full p-2 text-left rounded-lg bg-yellow-100 dark:bg-yellow-800/30 hover:bg-yellow-200 dark:hover:bg-yellow-700/30 transition-colors text-sm"
                      >
                        🧪 Tester l&apos;API Login
                      </button>
                      <button
                        onClick={testAPIConnection}
                        className="w-full p-2 text-left rounded-lg bg-blue-100 dark:bg-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-700/30 transition-colors text-sm"
                      >
                        🔗 Tester connexion API
                      </button>
                    </div>
                  </div>

                  {/* Comptes de démo */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                      Comptes de démo
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleDemoAccount('admin')}
                        className="w-full p-3 text-left rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:from-primary-500/20 hover:to-secondary-500/20 border border-primary-500/20 transition-all duration-300"
                      >
                        <div className="font-medium text-primary-600 dark:text-primary-400">Admin</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">admin@gmail.com / admin123</div>
                      </button>
                      <button
                        onClick={() => handleDemoAccount('user')}
                        className="w-full p-3 text-left rounded-xl bg-gradient-to-r from-accent-500/10 to-primary-500/10 hover:from-accent-500/20 hover:to-primary-500/20 border border-accent-500/20 transition-all duration-300"
                      >
                        <div className="font-medium text-accent-600 dark:text-accent-400">Utilisateur</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">utilisateur@gmail.com / user123</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 group">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Authentification sécurisée</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Token JWT valide 24h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-neutral-900/90 dark:to-neutral-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-neutral-800/50 transition-all duration-500">

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 mb-4 shadow-lg">
                    <LogIn className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Connexion
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    Entrez vos identifiants pour vous connecter
                  </p>
                </div>

                {/* Messages */}
                {success && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800/50">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800/50">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-2">{error}</p>
                        <button
                          onClick={testAPIConnection}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Tester la connexion au serveur
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Adresse Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-12 pr-12 block w-full px-4 py-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300"
                        placeholder="Votre mot de passe"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                        Se souvenir de moi
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                      Mot de passe oublié?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-white font-medium bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/25 transform hover:-translate-y-0.5"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                        {loading ? (
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <LogIn className="h-5 w-5 text-white" />
                        )}
                      </span>
                      <span className="pl-6">
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                      </span>
                    </button>
                  </div>

                  {/* Register Link */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Pas de compte?{' '}
                      <Link
                        to="/register"
                        className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors group"
                      >
                        Créer un compte
                        <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;