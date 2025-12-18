import React, { useState, useContext } from 'react';
import { Share2 } from 'lucide-react';
import { 
  Sparkles, Shield, Brain, Users, BookOpen, 
  TrendingUp, CheckCircle, AlertTriangle, 
  ArrowRight, Zap, Target, Globe,
  BarChart3, Smartphone, Download,
  Star, Clock, Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../../contexts/LanguageContext';

const Home = ({ currentUser }) => {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  const [checkContent, setCheckContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // DÉFINITION DE pageT corrigée
  const pageT = (key) => {
    // Utilise directement la fonction t du contexte
    return t(key);
  };

  // Fonctionnalités principales
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Détection IA',
      description: 'Analyse intelligente des biais et de la crédibilité avec modèles spécifiques au contexte malgache',
      color: 'primary'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Formation intégrée',
      description: 'Modules d\'apprentissage sur la pensée critique et la littératie médiatique',
      color: 'secondary'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Communauté',
      description: 'Partagez et discutez des résultats avec d\'autres utilisateurs',
      color: 'accent'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile & Hors-ligne',
      description: 'Accessible même avec une connexion limitée, optimisé pour mobile',
      color: 'warning'
    }
  ];

  // Étapes de fonctionnement
  const steps = [
    {
      number: '01',
      title: 'Coller le contenu',
      description: 'Copiez-collez n\'importe quel texte, image ou lien suspect',
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      number: '02',
      title: 'Analyse IA',
      description: 'Notre IA analyse avec des règles spécifiques au contexte malgache',
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      number: '03',
      title: 'Résultats détaillés',
      description: 'Recevez un score de fiabilité et des explications claires',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      number: '04',
      title: 'Apprendre et partager',
      description: 'Améliorez vos compétences et partagez en connaissance de cause',
      icon: <Share2 className="w-6 h-6" />
    }
  ];

  // Statistiques
  const stats = [
    {
      value: '10,000+',
      label: 'Contenus vérifiés',
      icon: <CheckCircle className="w-5 h-5" />,
      change: '+24%'
    },
    {
      value: '98%',
      label: 'Précision',
      icon: <Target className="w-5 h-5" />,
      change: '+2.3%'
    },
    {
      value: '50+',
      label: 'Écoles partenaires',
      icon: <Users className="w-5 h-5" />,
      change: '+8'
    },
    {
      value: '3 langues',
      label: 'Support multilingue',
      icon: <Globe className="w-5 h-5" />,
      change: ''
    }
  ];

  // Modules d'apprentissage populaires
  const learningModules = [
    {
      title: 'Détecter les fausses nouvelles',
      description: 'Apprenez les techniques pour identifier la désinformation',
      icon: <AlertTriangle className="w-6 h-6" />,
      time: '15 min',
      level: 'Débutant',
      students: '1.2k'
    },
    {
      title: 'Recherche de sources fiables',
      description: 'Comment trouver et évaluer des sources crédibles',
      icon: <BookOpen className="w-6 h-6" />,
      time: '20 min',
      level: 'Intermédiaire',
      students: '890'
    },
    {
      title: 'Contexte malgache',
      description: 'Comprendre les spécificités locales de l\'information',
      icon: <Globe className="w-6 h-6" />,
      time: '25 min',
      level: 'Avancé',
      students: '540'
    }
  ];

  // Démonstration de résultat
  const demoResult = {
    content: 'Ny voanjo dia manasitrana ny kansera amin\'ny 3 andro',
    score: 2.5,
    risk: 'High',
    biases: ['Sensationaliste', 'Non scientifique', 'Pas de sources'],
    explanation: 'Tsy misy porofo ara-tsiansa milaza fa afaka manasitrana ny kansera ny voanjo. Mety ho diso fampahalalam-baovao izany.',
    sources: [
      'World Health Organization - Cancer treatments',
      'Ministère de la Santé Publique Madagascar',
      'Journal of Medical Research'
    ]
  };

  const handleCheckContent = async () => {
    if (!checkContent.trim()) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate('/check', { 
        state: { 
          content: checkContent,
          isDemo: true 
        } 
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleQuickDemo = () => {
    navigate('/check', { 
      state: { 
        content: 'Exemple de contenu viral suspect',
        isDemo: true,
        demoData: demoResult
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-neutral-950 dark:to-neutral-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-900/20 dark:to-secondary-900/20" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Projet Gagnant - Hackathon INSI
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white leading-tight">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {pageT('heroTitle')}
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 dark:text-neutral-300">
                {pageT('heroSubtitle')}
              </p>
              
              {/* Zone de vérification */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col space-y-4">
                  <textarea
                    value={checkContent}
                    onChange={(e) => setCheckContent(e.target.value)}
                    placeholder={pageT('checkPlaceholder')}
                    className="w-full h-32 px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCheckContent}
                      disabled={isAnalyzing}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyse en cours...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>{pageT('checkButton')}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleQuickDemo}
                      className="px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg font-medium transition-colors"
                    >
                      Voir une démo
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Actions rapides */}
              <div className="flex flex-wrap gap-4">
                {currentUser ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      <BarChart3 className="w-5 h-5" />
                      {pageT('dashboard')}
                    </Link>
                    <Link
                      to="/learn"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      {pageT('learningTitle')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      <Zap className="w-5 h-5" />
                      {pageT('getStarted')}
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                      {pageT('login')}
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl p-8 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-6">
                  {/* Cartes d'illustration */}
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Précision
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      98%
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Détection fiable
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                        <Clock className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Rapidité
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">
                      2.3s
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Temps moyen
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                        <Award className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Impact Éducatif
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-300">
                          Écoles touchées
                        </span>
                        <span className="font-semibold">50+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-300">
                          Modules complétés
                        </span>
                        <span className="font-semibold">15,000+</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Graphique animé */}
                <div className="mt-8 relative h-32">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/50 dark:from-neutral-900/50 to-transparent rounded-b-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {pageT('featuresTitle')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Une solution complète adaptée au contexte malgache
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`p-3 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 w-fit mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {pageT('howItWorks')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              4 étapes simples pour vérifier n'importe quel contenu
            </p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 -translate-y-1/2" />
            
            <div className="grid lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="relative bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="flex justify-center mb-4 mt-6">
                      <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-center text-neutral-600 dark:text-neutral-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {pageT('statsTitle')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              L'impact de notre plateforme sur la communauté éducative malgache
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 mb-6">
                  <div className="text-primary-600 dark:text-primary-400">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
                  {stat.label}
                </div>
                {stat.change && (
                  <div className="inline-flex items-center text-sm text-accent-600 dark:text-accent-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change} ce mois
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {pageT('learningTitle')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Améliorez vos compétences en littératie médiatique avec nos modules interactifs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {learningModules.map((module, index) => (
              <div key={index} className="group bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    {module.icon}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600 dark:text-neutral-400">{module.time}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {module.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {module.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm">
                      <Star className="w-3 h-3" />
                      {module.level}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {module.students} étudiants
                    </span>
                  </div>
                  <button className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              <BookOpen className="w-5 h-5" />
              Voir tous les modules
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {pageT('demoTitle')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Voyez comment notre IA analyse un contenu suspect
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-8 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Contenu suspect détecté
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                    <p className="text-neutral-700 dark:text-neutral-300 italic">
                      "{demoResult.content}"
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      Biais détectés :
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {demoResult.biases.map((bias, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 rounded-full text-sm"
                        >
                          {bias}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      Sources vérifiées :
                    </h4>
                    <ul className="space-y-2">
                      {demoResult.sources.map((source, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <CheckCircle className="w-4 h-4 text-accent-500" />
                          {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                    Score de fiabilité
                  </h3>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Fiabilité
                      </span>
                      <span className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                        {demoResult.score}/5
                      </span>
                    </div>
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-warning-500 to-warning-600"
                        style={{ width: `${(demoResult.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                        demoResult.risk === 'High' 
                          ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300'
                          : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        Risque {demoResult.risk}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
                    Explication :
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                    {demoResult.explanation}
                  </p>
                </div>
                
                <button
                  onClick={handleQuickDemo}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Essayer avec votre propre contenu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {pageT('ctaTitle')}
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-10">
              {pageT('ctaSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={currentUser ? "/check" : "/register"}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-colors"
              >
                <Shield className="w-5 h-5" />
                {currentUser ? 'Vérifier du contenu' : 'Créer un compte gratuit'}
              </Link>
              
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
              >
                <Download className="w-5 h-5" />
                Télécharger l'app mobile
              </a>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-primary-200">Gratuit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">3 langues</div>
                <div className="text-primary-200">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-primary-200">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">ODD 4 & 16</div>
                <div className="text-primary-200">Objectifs ONU</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;