// LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Traductions COMPLÈTES de l'application (mis à jour avec les nouvelles clés)
const translations = {
  mg: {
    // Navigation
    home: 'Fandraisana',
    check: 'Hamarinina',
    learn: 'Fianarana',
    about: 'Momba',
    trending: 'Vaovao malaza',
    login: 'Hiditra',
    register: 'Hisoratra',
    logout: 'Hivoaka',
    profile: 'Profil',
    dashboard: 'Tabilao',
    language: 'Fiteny',
    theme: 'Teny',
    light: 'Mazava',
    dark: 'Maizina',
    system: 'Rafitra',
    welcome: 'Tonga soa',
    getStarted: 'Atombohy',
    search_placeholder: 'Hikaroka vaovao, fanabeazana, sns...',
    popular_searches: 'Hikaroka malaza',
    notifications: 'Fampandrenesana',

    // Page Home spécifique
    heroTitle: 'Mpanolo-tsaina AI: Mpiara-miaina amin\'ny fandinihana ny vaovao',
    heroSubtitle: 'Rindran\'ASA AI mpanampy amin\'ny fanadiniana ny fahamarinan\'ny vaovao an-tserasera ao Madagasikara',
    checkPlaceholder: 'Ampidiro ny lahatsoratra, sary na rohy hohamarinina...',
    checkButton: 'Hamarinina',
    featuresTitle: 'Toetra manokana',
    forStudents: 'Ho an\'ny mpianatra',
    forTeachers: 'Ho an\'ny mpampianatra',
    forResearchers: 'Ho an\'ny mpikaroka',
    howItWorks: 'Ahoana no fiasany?',
    statsTitle: 'Statistika',
    learningTitle: 'Fianarana',
    demoTitle: 'Ohatra amin\'ny asa',
    ctaTitle: 'Atombohy ny fiarovana ny fahalalanao',
    ctaSubtitle: 'Miaraha aminay amin\'ny fananganana firenena iray manana fahalalana marina',

    // Page CheckContent
    verifyTitle: 'Hamarinina ny vaovao',
    pasteContent: 'Apetaho eto ny lahatsoratra na rohy...',
    analyzeButton: 'Hamarinina amin\'ny AI',
    uploadImage: 'Alefaso sary',
    recentChecks: 'Fanadiniana farany',
    reliabilityScore: 'Mari-pahamarinana',
    detailedReport: 'Tati-panadihadiana',

    // Page Learn
    modulesTitle: 'Fianarana momba ny fandinihana ny vaovao',
    myProgress: 'Fivoarana',
    startModule: 'Atombohy ity mody',
    completed: 'Vita',
    certificate: 'Taraty fanamarinana',

    // Page About
    missionTitle: 'Ny tanjonay',
    teamTitle: 'Ny ekipa',
    contactTitle: 'Fifandraisana',
    impactTitle: 'Vokatra',

    // Dictionnaire commun
    loading: 'Eo am-pandefasana...',
    error: 'Nisy olana',
    success: 'Nahomby',
    save: 'Tehirizo',
    cancel: 'Avelao',
    confirm: 'Eny',
    delete: 'Fafao',
    edit: 'Ahitsio',
    view: 'Hijery',
    share: 'Zarazarao',
    download: 'Aliso',
    moreInfo: 'Fampahalalana fanampiny',
    close: 'Akatony'
  },
  fr: {
    // Navigation
    home: 'Accueil',
    check: 'Vérifier',
    learn: 'Apprendre',
    about: 'À propos',
    trending: 'Tendances',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    profile: 'Profil',
    dashboard: 'Tableau de bord',
    language: 'Langue',
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    welcome: 'Bienvenue',
    getStarted: 'Commencer',
    search_placeholder: 'Rechercher une info, un cours, etc...',
    popular_searches: 'Recherches populaires',
    notifications: 'Notifications',

    // Page Home spécifique
    heroTitle: 'Mpanolo-tsaina AI : Votre assistant en littératie médiatique',
    heroSubtitle: 'Une IA qui vous aide à vérifier la fiabilité des contenus en ligne à Madagascar',
    checkPlaceholder: 'Collez le texte, image ou lien à vérifier...',
    checkButton: 'Vérifier',
    featuresTitle: 'Fonctionnalités',
    forStudents: 'Pour les étudiants',
    forTeachers: 'Pour les enseignants',
    forResearchers: 'Pour les chercheurs',
    howItWorks: 'Comment ça marche ?',
    statsTitle: 'Statistiques',
    learningTitle: 'Apprentissage',
    demoTitle: 'Démonstration',
    ctaTitle: 'Protégez vos connaissances dès maintenant',
    ctaSubtitle: 'Rejoignez-nous pour bâtir une nation mieux informée',

    // Page CheckContent
    verifyTitle: 'Vérifier une information',
    pasteContent: 'Collez le texte ou le lien ici...',
    analyzeButton: 'Analyser avec l\'IA',
    uploadImage: 'Télécharger une image',
    recentChecks: 'Vérifications récentes',
    reliabilityScore: 'Score de fiabilité',
    detailedReport: 'Rapport détaillé',

    // Page Learn
    modulesTitle: 'Apprendre la vérification d\'informations',
    myProgress: 'Ma progression',
    startModule: 'Commencer ce module',
    completed: 'Terminé',
    certificate: 'Certificat',

    // Page About
    missionTitle: 'Notre mission',
    teamTitle: 'Notre équipe',
    contactTitle: 'Contact',
    impactTitle: 'Impact',

    // Dictionnaire commun
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    share: 'Partager',
    download: 'Télécharger',
    moreInfo: 'Plus d\'infos',
    close: 'Fermer'
  },
  en: {
    // Navigation
    home: 'Home',
    check: 'Check',
    learn: 'Learn',
    about: 'About',
    trending: 'Trending',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    dashboard: 'Dashboard',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    welcome: 'Welcome',
    getStarted: 'Get Started',
    search_placeholder: 'Search for news, courses, etc...',
    popular_searches: 'Popular searches',
    notifications: 'Notifications',

    // Page Home spécifique
    heroTitle: 'Mpanolo-tsaina AI: Your Media Literacy Assistant',
    heroSubtitle: 'An AI that helps verify online content reliability in Madagascar',
    checkPlaceholder: 'Paste text, image or link to check...',
    checkButton: 'Check Now',
    featuresTitle: 'Features',
    forStudents: 'For Students',
    forTeachers: 'For Teachers',
    forResearchers: 'For Researchers',
    howItWorks: 'How It Works',
    statsTitle: 'Statistics',
    learningTitle: 'Learning',
    demoTitle: 'Demo',
    ctaTitle: 'Protect Your Knowledge Now',
    ctaSubtitle: 'Join us in building a better-informed nation',

    // Page CheckContent
    verifyTitle: 'Verify Information',
    pasteContent: 'Paste text or link here...',
    analyzeButton: 'Analyze with AI',
    uploadImage: 'Upload Image',
    recentChecks: 'Recent Checks',
    reliabilityScore: 'Reliability Score',
    detailedReport: 'Detailed Report',

    // Page Learn
    modulesTitle: 'Learn Fact-Checking',
    myProgress: 'My Progress',
    startModule: 'Start This Module',
    completed: 'Completed',
    certificate: 'Certificate',

    // Page About
    missionTitle: 'Our Mission',
    teamTitle: 'Our Team',
    contactTitle: 'Contact',
    impactTitle: 'Impact',

    // Dictionnaire commun
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    share: 'Share',
    download: 'Download',
    moreInfo: 'More Info',
    close: 'Close'
  }
};

// Créer le contexte
export const LanguageContext = createContext();

// Provider du contexte
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage && translations[savedLanguage] ? savedLanguage : 'mg';
  });
  
  // Synchroniser avec localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  // Fonction de traduction
  const t = (key, defaultValue = key) => {
    return translations[language]?.[key] || defaultValue;
  };
  
  // Changer la langue
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };
  
  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: changeLanguage, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personnalisé
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};