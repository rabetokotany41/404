import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Github, 
  Twitter,
  Sparkles,
  Shield,
  Smartphone,
  Fingerprint,
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
  const [activeTab, setActiveTab] = useState('email');
  const [hoverEffect, setHoverEffect] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Fonction pour nettoyer et valider le token
  const cleanToken = (token) => {
    if (!token) return null;
    
    let cleanToken = token.trim();
    
    // Enlever les guillemets
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    if (cleanToken.startsWith("'") && cleanToken.endsWith("'")) {
      cleanToken = cleanToken.slice(1, -1);
    }
    
    // Vérifier que c'est un JWT valide (doit contenir 3 parties séparées par des points)
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Token invalide: pas 3 parties JWT');
      return null;
    }
    
    return cleanToken;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
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
      console.log('🔄 Tentative de connexion...');
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      const data = response.data;

      console.log('📊 Réponse du serveur:', {
        success: data.success,
        message: data.message,
        hasToken: !!data.token,
        tokenLength: data.token?.length,
        user: data.user?.email
      });

      if (data.success && data.token) {
        // Nettoyer le token
        const cleanTokenValue = cleanToken(data.token);
        
        if (!cleanTokenValue) {
          setError('Token reçu invalide. Veuillez réessayer.');
          setLoading(false);
          return;
        }

        console.log('✅ Token nettoyé:', cleanTokenValue.substring(0, 30) + '...');
        console.log('📏 Longueur:', cleanTokenValue.length);
        
        // Stocker les données
        localStorage.setItem('authToken', cleanTokenValue);
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('userEmail', data.user.email);
        
        // Stocker le rôle
        const role = data.user.role || 'user';
        localStorage.setItem('userRole', role);
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedEmail');
        }

        setSuccess('Connexion réussie ! Redirection en cours...');

        // Appeler le callback parent
        if (onLogin) {
          onLogin(data.user, cleanTokenValue);
        }

        // Tester immédiatement le token avec une API call
        try {
          const testResponse = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${cleanTokenValue}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Token validé avec succès par API:', testResponse.data);
        } catch (testError) {
          console.warn('⚠️ Token API test échoué:', testError.response?.data);
        }

        // Redirection
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin/');
          } else {
            navigate('/dashboard');
          }
        }, 1500);

      } else {
        setError(data.message || 'Email ou mot de passe incorrect');
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Délai de connexion dépassé. Vérifiez votre connexion internet.');
      } else if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Email ou mot de passe incorrect');
            break;
          case 404:
            setError('Serveur API non trouvé. Vérifiez que le backend est en marche.');
            break;
          case 500:
            setError('Erreur serveur. Veuillez réessayer plus tard.');
            break;
          default:
            setError(`Erreur ${error.response.status}: ${error.response.data?.message || 'Erreur de connexion'}`);
        }
        console.error('Détails erreur:', error.response.data);
      } else if (error.request) {
        setError('Pas de réponse du serveur. Vérifiez que le backend est en marche sur http://localhost:5000');
        console.error('URL testée:', 'http://localhost:5000/api/auth/login');
        console.error('Requête sans réponse:', error.request);
      } else {
        setError('Erreur lors de la connexion. Veuillez réessayer.');
      }
      
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setError(`Login avec ${provider} n'est pas encore implémenté. Veuillez utiliser l'email.`);
  };

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail && savedRememberMe === 'true') {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
    
    // Vérifier le token actuel
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      console.log('🔍 Token actuel dans localStorage:', currentToken.substring(0, 30) + '...');
      console.log('📏 Longueur:', currentToken.length);
      
      // Nettoyer le token existant
      const cleaned = cleanToken(currentToken);
      if (cleaned && cleaned !== currentToken) {
        console.log('🧹 Nettoyage du token existant...');
        localStorage.setItem('authToken', cleaned);
      }
    }
  }, []);

  const testAPIConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 3000
      });
      console.log('✅ Serveur backend disponible:', response.data);
      return true;
    } catch (error) {
      console.warn('❌ Serveur backend non disponible:', error.message);
      return false;
    }
  };

  const handleDemoAccount = (accountType) => {
    let email, password;
    
    switch(accountType) {
      case 'admin':
        email = 'admin@nexus.com';
        password = 'admin123';
        break;
      case 'user':
        email = 'john@nexus.com';
        password = 'user123';
        break;
      default:
        email = 'test@test.com';
        password = 'test123';
    }
    
    setFormData({ email, password });
    setSuccess(`Compte ${accountType} pré-rempli. Cliquez sur "Se connecter".`);
  };

  // Fonction pour debug
  const debugToken = () => {
    const token = localStorage.getItem('authToken');
    console.log('- Présent:', token ? 'OUI' : 'NON');
    if (token) {
      console.log('- Longueur:', token.length);
      console.log('- Début:', token.substring(0, 30) + '...');
      console.log('- Fin:', '...' + token.substring(token.length - 30));
      console.log('- Contient "Bearer":', token.includes('Bearer'));
      console.log('- Partes JWT:', token.split('.').length);
      
      // Essayer de décoder
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          console.log('- Header:', header);
          console.log('- Payload:', payload);
        }
      } catch (e) {
        console.log('- Impossible de décoder:', e.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary-300/20 to-secondary-300/20 rounded-full blur-3xl dark:from-primary-500/10 dark:to-secondary-500/10"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent-300/20 to-primary-300/20 rounded-full blur-3xl dark:from-accent-500/10 dark:to-primary-500/10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-secondary-300/10 to-accent-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Hero Section */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Animated Card */}
              <div className="relative bg-gradient-to-br from-white/80 to-white/20 dark:from-neutral-900/80 dark:to-neutral-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-neutral-800/50 overflow-hidden">
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        Welcome Back
                      </h1>
                      <p className="text-neutral-600 dark:text-neutral-400">Sign in to your account</p>
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
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">admin@gmail.com</div>
                      </button>
                      <button
                        onClick={() => handleDemoAccount('user')}
                        className="w-full p-3 text-left rounded-xl bg-gradient-to-r from-accent-500/10 to-primary-500/10 hover:from-accent-500/20 hover:to-primary-500/20 border border-accent-500/20 transition-all duration-300"
                      >
                        <div className="font-medium text-accent-600 dark:text-accent-400">Utilisateur</div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Utilisateur@gmail.com</div>
                      </button>
                    </div>
                  </div>

                  {/* Features List */}
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
            <div className={`relative bg-gradient-to-br from-white/90 to-white/70 dark:from-neutral-900/90 dark:to-neutral-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-neutral-800/50 transition-all duration-500 ${hoverEffect ? 'scale-[1.02]' : ''}`}
                 onMouseEnter={() => setHoverEffect(true)}
                 onMouseLeave={() => setHoverEffect(false)}>
              
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

                {/* Display Success Message */}
                {success && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800/50">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                    </div>
                  </div>
                )}

                {/* Display Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800/50">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-2">{error}</p>
                        {error.includes('backend') && (
                          <button
                            onClick={testAPIConnection}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                          >
                            Tester la connexion au serveur
                          </button>
                        )}
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
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-float"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-secondary-400 rounded-full animate-float animation-delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-accent-400 rounded-full animate-float animation-delay-2000"></div>
    </div>
  );
};

export default Login;