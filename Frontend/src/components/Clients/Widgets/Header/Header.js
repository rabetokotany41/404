import React, { useState, useEffect, useContext } from 'react';
import { Sun, Moon, Globe, Menu, X, ChevronDown, User, LogIn, UserPlus, Search, Bell, Home, Shield, Book, Info, TrendingUp } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from './../../../../contexts/LanguageContext';

const Header = ({ isAuthenticated = false, onLogout, currentUser = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useContext(LanguageContext);
  
  // États
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Récupérer les données utilisateur
  const userEmail = currentUser?.email || '';
  const userName = currentUser?.first_name || currentUser?.name || userEmail.split('@')[0] || 'User';
  
  // Navigation items avec icônes et traductions
  const navItems = [
    { 
      key: 'home', 
      path: '/', 
      icon: <Home size={18} />,
      label: 'home'
    },
    { 
      key: 'check', 
      path: '/check', 
      icon: <Shield size={18} />,
      label: 'check'
    },
    { 
      key: 'learn', 
      path: '/learn', 
      icon: <Book size={18} />,
      label: 'learn'
    },
    { 
      key: 'trending', 
      path: '/trending', 
      icon: <TrendingUp size={18} />,
      label: 'trending'
    },
    { 
      key: 'about', 
      path: '/about', 
      icon: <Info size={18} />,
      label: 'about'
    }
  ];
  
  // Suggestions de recherche populaires (en fonction de la langue)
  const popularSearches = {
    mg: [
      "Vaovao momba ny cyclona",
      "Fanafody nentim-paharazana",
      "Fivarotana an-tserasera",
      "Fampidirana vaksiny",
      "Fomba fijery mangina",
      "Hoosoka ara-toekarena",
      "Fampahalalam-baovao diso",
      "Loharanom-baovao azo itokiana"
    ],
    fr: [
      "Info cyclonique",
      "Médecine traditionnelle",
      "Arnaque en ligne",
      "Vaccination COVID",
      "Pensée critique",
      "Escroquerie économique",
      "Désinformation",
      "Sources fiables"
    ],
    en: [
      "Cyclone information",
      "Traditional medicine",
      "Online scam",
      "COVID vaccination",
      "Critical thinking",
      "Economic fraud",
      "Misinformation",
      "Reliable sources"
    ]
  };
  
  // Initialiser le mode sombre
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Simuler des notifications (à remplacer par une API réelle)
    if (isAuthenticated) {
      setHasNotifications(Math.random() > 0.5);
    }
  }, [isAuthenticated]);
  
  // Gérer la recherche
  useEffect(() => {
    if (searchQuery.length > 2) {
      const suggestions = popularSearches[language]?.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchSuggestions(suggestions || []);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, language]);
  
  // Changer le mode sombre/clair
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Changer de langue
  const changeLanguage = (lang) => {
    setLanguage(lang);
    setLanguageDropdownOpen(false);
  };
  
  // Changer le thème
  const changeTheme = (theme) => {
    if (theme === 'system') {
      localStorage.removeItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const newDarkMode = theme === 'dark';
      setDarkMode(newDarkMode);
      localStorage.setItem('theme', theme);
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setThemeDropdownOpen(false);
  };
  
  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&lang=${language}`);
      setSearchQuery('');
      setShowSearchBar(false);
      setSearchSuggestions([]);
    }
  };
  
  const handleSearchSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}&lang=${language}`);
    setShowSearchBar(false);
    setSearchSuggestions([]);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
  };
  
  // Navigation functions
  const handleLoginClick = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };
  
  const handleRegisterClick = () => {
    navigate('/register');
    setMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };
  
  const handleDashboardClick = () => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };
  
  const handleNotificationsClick = () => {
    navigate('/notifications');
    setHasNotifications(false);
  };
  
  // Vérifier si le lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo avec lien vers home */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={t('menu') || "Menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="font-bold text-white">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-neutral-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Mpanolo<span className="text-primary-600 dark:text-primary-400">Tsaina</span>
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
                  {t('app_subtitle') || "AI Fact-Checking Assistant"}
                </span>
              </div>
            </Link>
          </div>
          
          {/* Barre de recherche - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder') || "Rechercher..."}
                  className="w-full px-4 pl-12 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-md"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    aria-label={t('clear') || "Effacer"}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Suggestions de recherche */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-40 overflow-hidden animate-fade-in">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      {t('popular_searches') || "Recherches populaires"}
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSearchSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-neutral-700 dark:text-neutral-300 transition-colors duration-150 flex items-center space-x-3 group/item"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover/item:bg-primary-200 dark:group-hover/item:bg-primary-800/50 transition-colors">
                          <Search size={12} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Actions: Notifications, Langue, Thème, Authentification */}
          <div className="flex items-center space-x-2">
            
            {/* Bouton recherche mobile */}
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="lg:hidden p-2.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
              aria-label={t('search') || "Rechercher"}
            >
              <Search size={20} />
            </button>
            
            {/* Notifications (si authentifié) */}
            {isAuthenticated && (
              <button
                onClick={handleNotificationsClick}
                className="relative p-2.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                aria-label={t('notifications') || "Notifications"}
              >
                <Bell size={20} className="group-hover:animate-pulse" />
                {hasNotifications && (
                  <>
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                  </>
                )}
              </button>
            )}
            
            {/* Sélecteur de langue */}
            <div className="relative">
              <button
                onClick={() => {
                  setLanguageDropdownOpen(!languageDropdownOpen);
                  setThemeDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                aria-label={t('language') || "Langue"}
              >
                <Globe size={18} className="text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300 hidden sm:inline">
                  {language === 'en' ? 'EN' : language === 'fr' ? 'FR' : 'MG'}
                </span>
                <ChevronDown size={16} className="text-neutral-500 hidden sm:block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </button>
              
              {/* Dropdown langue */}
              {languageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 animate-fade-in">
                  <button
                    onClick={() => changeLanguage('mg')}
                    className={`w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors flex items-center space-x-3 ${language === 'mg' ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/20' : 'text-neutral-700 dark:text-neutral-300'}`}
                  >
                    <div className="w-8 h-6 rounded overflow-hidden flex items-center justify-center bg-gradient-to-r from-green-500 to-red-500">
                      <span className="text-xs font-bold text-white">MG</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{t('malagasy') || 'Malagasy'}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Gasy</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors flex items-center space-x-3 ${language === 'fr' ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/20' : 'text-neutral-700 dark:text-neutral-300'}`}
                  >
                    <div className="w-8 h-6 rounded overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-red-500">
                      <span className="text-xs font-bold text-white">FR</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{t('french') || 'Français'}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">French</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors flex items-center space-x-3 ${language === 'en' ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/20' : 'text-neutral-700 dark:text-neutral-300'}`}
                  >
                    <div className="w-8 h-6 rounded overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-600 to-red-600">
                      <span className="text-xs font-bold text-white">EN</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{t('english') || 'English'}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Anglais</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            
            {/* Sélecteur de thème */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setThemeDropdownOpen(!themeDropdownOpen);
                  setLanguageDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                aria-label={t('theme') || "Thème"}
              >
                {darkMode ? (
                  <Moon size={18} className="text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                ) : (
                  <Sun size={18} className="text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                )}
                <ChevronDown size={16} className="text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </button>
              
              {/* Dropdown thème */}
              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 animate-fade-in">
                  <button
                    onClick={() => changeTheme('light')}
                    className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 group/item"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover/item:bg-yellow-200 dark:group-hover/item:bg-yellow-800/50 transition-colors">
                      <Sun size={16} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t('light') || 'Light'}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('light_mode') || 'Mode clair'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 group/item"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover/item:bg-purple-200 dark:group-hover/item:bg-purple-800/50 transition-colors">
                      <Moon size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t('dark') || 'Dark'}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('dark_mode') || 'Mode sombre'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeTheme('system')}
                    className="w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 group/item"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-100 to-purple-100 dark:from-yellow-900/30 dark:to-purple-900/30 flex items-center justify-center group-hover/item:from-yellow-200 group-hover/item:to-purple-200 dark:group-hover/item:from-yellow-800/50 dark:group-hover/item:to-purple-800/50 transition-colors">
                      <div className="flex items-center">
                        <Sun size={12} className="text-yellow-600 dark:text-yellow-400" />
                        <Moon size={12} className="text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t('system') || 'System'}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('auto_detect') || 'Auto-détection'}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            
            {/* Bouton mode sombre/clair (version simple pour mobile) */}
            <button
              onClick={toggleDarkMode}
              className="sm:hidden p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              aria-label={t('toggle_theme') || "Changer le thème"}
            >
              {darkMode ? (
                <Moon size={20} className="text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Sun size={20} className="text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
            
            {/* Boutons d'authentification ou profil utilisateur */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLanguageDropdownOpen(false);
                    setThemeDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 group"
                >
                  <div className="h-7 w-7 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/40 transition-colors">
                    <span className="text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{userName}</span>
                  <ChevronDown size={16} className="hidden sm:block group-hover:translate-y-0.5 transition-transform" />
                </button>
                
                {/* Dropdown utilisateur */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={handleDashboardClick}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 w-full group/item"
                    >
                      <User size={18} className="group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors" />
                      <span>{currentUser?.role === 'admin' ? t('dashboard') : t('profile')}</span>
                    </button>
                    <button
                      onClick={handleNotificationsClick}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 w-full group/item"
                    >
                      <Bell size={18} className="group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400 transition-colors" />
                      <span>{t('notifications')}</span>
                      {hasNotifications && (
                        <span className="ml-auto">
                          <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                        </span>
                      )}
                    </button>
                    <div className="border-t border-neutral-200 dark:border-neutral-800 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 group/item"
                    >
                      <LogIn size={18} className="rotate-180 group-hover/item:scale-110 transition-transform" />
                      <span className="font-medium">{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLoginClick}
                  className="hidden md:flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group"
                >
                  <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-medium">{t('login')}</span>
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 group"
                >
                  <UserPlus size={18} className="hidden sm:block group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{t('register')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Barre de recherche mobile (affichée conditionnellement) */}
        {showSearchBar && (
          <div className="lg:hidden py-3 border-t border-neutral-200 dark:border-neutral-800 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder') || "Rechercher..."}
                  className="w-full px-4 pl-12 py-3.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  autoFocus
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    aria-label={t('clear') || "Effacer"}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              
              {/* Suggestions de recherche mobile */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-40 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                      {t('popular_searches') || "Recherches populaires"}
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSearchSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-neutral-700 dark:text-neutral-300 transition-colors duration-150 flex items-center space-x-3"
                      >
                        <Search size={14} className="text-primary-600 dark:text-primary-400" />
                        <span className="text-sm">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
        
        {/* Navigation Desktop avec icônes */}
        <nav className="hidden lg:flex items-center justify-center space-x-1 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-white/50 to-white/30 dark:from-neutral-900/50 dark:to-neutral-900/30 backdrop-blur-sm">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm group/nav ${
                isActive(item.path)
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }`}
            >
              <div className={`group-hover/nav:scale-110 transition-transform ${
                isActive(item.path) ? 'text-primary-600 dark:text-primary-400' : ''
              }`}>
                {item.icon}
              </div>
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </nav>
        
        {/* Menu Mobile complet */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 animate-slide-up bg-white dark:bg-neutral-900">
            <div className="flex flex-col space-y-1">
              {/* Navigation mobile avec icônes */}
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all duration-200 font-medium group/mobile ${
                    isActive(item.path)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-200 dark:bg-primary-800/50'
                      : 'bg-primary-100 dark:bg-primary-900/30 group-hover/mobile:bg-primary-200 dark:group-hover/mobile:bg-primary-800/50'
                  }`}>
                    {React.cloneElement(item.icon, { 
                      className: isActive(item.path) 
                        ? "text-primary-600 dark:text-primary-400" 
                        : "text-primary-600 dark:text-primary-400" 
                    })}
                  </div>
                  <span className="font-medium">{t(item.label)}</span>
                </Link>
              ))}
              
              {/* Boutons d'authentification pour mobile */}
              {!isAuthenticated ? (
                <>
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                    <button
                      onClick={handleLoginClick}
                      className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-lg border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors w-full"
                    >
                      <LogIn size={20} />
                      <span className="font-medium">{t('login')}</span>
                    </button>
                    <button
                      onClick={handleRegisterClick}
                      className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium transition-all duration-300 mt-3"
                    >
                      <UserPlus size={20} />
                      <span className="font-medium">{t('register')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                    <div className="flex items-center space-x-3 px-4 py-3.5 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-md">
                        <span className="font-bold text-white text-lg">{userName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">{userName}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDashboardClick}
                      className="flex items-center space-x-3 px-4 py-3.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 w-full"
                    >
                      <User size={20} />
                      <span>{currentUser?.role === 'admin' ? t('dashboard') : t('profile')}</span>
                    </button>
                    <button
                      onClick={handleNotificationsClick}
                      className="flex items-center space-x-3 px-4 py-3.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-neutral-700 dark:text-neutral-300 w-full"
                    >
                      <Bell size={20} />
                      <span>{t('notifications')}</span>
                      {hasNotifications && (
                        <span className="ml-auto">
                          <span className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-3 px-4 py-3.5 rounded-lg border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-3 w-full"
                    >
                      <LogIn size={20} className="rotate-180" />
                      <span className="font-medium">{t('logout')}</span>
                    </button>
                  </div>
                </>
              )}
              
              {/* Options de thème pour mobile */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col space-y-2">
                  <div className="px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {t('theme')}
                  </div>
                  <button
                    onClick={() => changeTheme('light')}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <Sun size={18} className="text-neutral-600 dark:text-neutral-400" />
                    <span className="text-neutral-700 dark:text-neutral-300">{t('light')}</span>
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <Moon size={18} className="text-neutral-600 dark:text-neutral-400" />
                    <span className="text-neutral-700 dark:text-neutral-300">{t('dark')}</span>
                  </button>
                  <button
                    onClick={() => changeTheme('system')}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <Sun size={14} className="mr-[-2px] text-neutral-600 dark:text-neutral-400" />
                      <Moon size={14} className="ml-[-2px] text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <span className="text-neutral-700 dark:text-neutral-300">{t('system')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;