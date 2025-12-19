import React, { useState, useContext, useEffect } from 'react';
import {Share2 } from 'lucide-react';
import { 
  Sparkles, Shield, Brain, Users, BookOpen, 
  TrendingUp, CheckCircle, AlertTriangle, 
  ArrowRight, Zap, Target, Globe,
  BarChart3, Smartphone, Download,
  Star, Clock, Award, Cpu, Database, Cloud,
  Search, Eye, ShieldAlert, GraduationCap,
  MessageSquare, Languages, Filter, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { motion } from 'framer-motion';

const Home = ({ currentUser }) => {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  const [checkContent, setCheckContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const pageT = (key) => {
    return t(key);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Images locales à importer dans votre projet
  const images = {
    hero: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    analysis: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=2065&q=80',
    education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    community: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    mobile: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  };

  const aiModels = {
    textAnalysis: {
      primary: {
        name: "BLOOM (560M)",
        description: "Modèle multilingue optimisé pour le malgache",
        type: "LLM Local",
        languages: ["Malgache", "Français", "Anglais"],
        accuracy: "92%",
        size: "1.7 Go",
        bestFor: "Analyse de texte, détection de fake news locales"
      }
    },
    imageAnalysis: {
      primary: {
        name: "YOLOv8 Nano",
        description: "Détection d'objets et OCR pour images malgaches",
        type: "Vision",
        languages: ["Toutes"],
        accuracy: "95%",
        size: "6 Mo",
        bestFor: "Mèmes, screenshots, images virales"
      }
    }
  };

  const features = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: "IA Intelligente",
      description: "Analyse automatique des contenus douteux avec notre modèle BLOOM optimisé pour le malgache",
      color: "primary",
      delay: 0.1
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Protection en Temps Réel",
      description: "Alertes avant partage sur WhatsApp et réseaux sociaux",
      color: "secondary",
      delay: 0.2
    },
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: "Apprentissage Interactif",
      description: "Modules éducatifs pour développer l'esprit critique des étudiants",
      color: "accent",
      delay: 0.3
    },
    {
      icon: <Languages className="w-10 h-10" />,
      title: "100% Malagasy",
      description: "Interface et analyses disponibles en malgache, français et anglais",
      color: "warning",
      delay: 0.4
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Coller",
      description: "Copiez le contenu suspect depuis Facebook, WhatsApp ou autre",
      icon: <Search className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-400"
    },
    {
      number: "02",
      title: "Analyser",
      description: "Notre IA examine le texte, les images et le contexte",
      icon: <Brain className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      title: "Comprendre",
      description: "Recevez une explication claire en malgache sur les biais détectés",
      icon: <Eye className="w-6 h-6" />,
      color: "from-green-500 to-emerald-400"
    },
    {
      number: "04",
      title: "Partager",
      description: "Diffusez l'information avec une alerte de fiabilité",
      icon: <ShieldAlert className="w-6 h-6" />,
      color: "from-orange-500 to-red-400"
    }
  ];

  const stats = [
    {
      value: "10,000+",
      label: "Contenus analysés",
      icon: <Database className="w-6 h-6" />,
      description: "Base de données enrichie quotidiennement"
    },
    {
      value: "94.2%",
      label: "Précision",
      icon: <Target className="w-6 h-6" />,
      description: "Sur le corpus malgache"
    },
    {
      value: "< 3s",
      label: "Analyse rapide",
      icon: <Zap className="w-6 h-6" />,
      description: "Temps moyen de vérification"
    },
    {
      value: "50+",
      label: "Écoles",
      icon: <Users className="w-6 h-6" />,
      description: "Utilisent notre plateforme"
    }
  ];

  const handleCheckContent = async () => {
    if (!checkContent.trim()) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate("/check", { 
        state: { 
          content: checkContent,
          isDemo: false
        } 
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleQuickDemo = () => {
    navigate("/check", { 
      state: { 
        content: "Ny voanjo dia manasitrana ny kansera amin'ny 3 andro fotsiny!",
        isDemo: true
      } 
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/20 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section avec effet parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background avec effet de particules */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
        
        {/* Éléments décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight 
              }}
              animate={{
                y: [null, -20, 20, -10],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte principal */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 backdrop-blur-sm rounded-full border border-primary-500/20"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Projet Lauréat - Hackathon ODD Madagascar
                </span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold"
              >
                <span className="block text-neutral-900 dark:text-white">
                  {pageT('heroTitleLine1')}
                </span>
                <span className="block mt-2 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                  {pageT('heroTitleLine2')}
                </span>
                <span className="block mt-4 text-xl md:text-2xl text-neutral-600 dark:text-neutral-300">
                  {pageT('heroTitleLine3')}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
                className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl"
              >
                {pageT('heroDescription')}
              </motion.p>

              {/* Zone de vérification interactive */}
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                <div className="relative bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Search className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        Vérifiez instantanément
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Collez un texte, image ou lien suspect
                      </p>
                    </div>
                  </div>
                  
                  <textarea
                    value={checkContent}
                    onChange={(e) => setCheckContent(e.target.value)}
                    placeholder="Ex: 'Ny voanjo dia manasitrana ny kansera...'"
                    className="w-full h-32 px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder:text-neutral-400"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={handleCheckContent}
                      disabled={isAnalyzing}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{pageT('analyzingText')}</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>{pageT('analyzeButton')}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleQuickDemo}
                      className="px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg font-medium transition-colors hover:border-primary-600"
                    >
                      {pageT('demoButton')}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Boutons d'action */}
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                {currentUser ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent-600 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <BarChart3 className="w-5 h-5" />
                      Tableau de bord
                    </Link>
                    <Link
                      to="/learn"
                      className="inline-flex items-center gap-3 px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <GraduationCap className="w-5 h-5" />
                      Modules d&#39;apprentissage
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent-600 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <Zap className="w-5 h-5" />
                      Commencer gratuitement
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-3 px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Se connecter
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats rapides */}
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
              >
                {stats.slice(0, 4).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                {/* Carte principale */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-8 shadow-2xl border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="absolute -top-3 -right-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur" />
                      <div className="relative p-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Résultat d'analyse */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="font-medium text-neutral-900 dark:text-white">
                            Analyse en temps réel
                          </span>
                        </div>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          Modèle BLOOM 560M
                        </span>
                      </div>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 border-l-4 border-primary-500">
                        <p className="text-neutral-700 dark:text-neutral-300 italic">
                          &quot;Ny voanjo dia manasitrana ny kansera amin&#39;ny 3 andro...&quot;
                        </p>
                      </div>
                    </div>

                    {/* Score de fiabilité */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Score de fiabilité
                        </span>
                        <span className="text-lg font-bold text-warning-600 dark:text-warning-400">
                          2.3/5
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "46%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-warning-400 to-warning-600"
                        />
                      </div>
                      <div className="text-sm text-warning-600 dark:text-warning-400">
                        ⚠️ Risque élevé - Source non vérifiée
                      </div>
                    </div>

                    {/* Sources vérifiées */}
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="w-4 h-4 text-primary-600" />
                        <span className="font-medium text-neutral-900 dark:text-white">
                          Sources vérifiées
                        </span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <CheckCircle className="w-4 h-4 text-accent-500" />
                          Ministère de la Santé - Madagascar
                        </li>
                        <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <CheckCircle className="w-4 h-4 text-accent-500" />
                          Organisation Mondiale de la Santé
                        </li>
                        <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <CheckCircle className="w-4 h-4 text-accent-500" />
                          Journal Médical Malagasy
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Cartes flottantes */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  className="absolute -bottom-6 -left-6 bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-xl border border-neutral-200 dark:border-neutral-700 w-64"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        5,000+ étudiants
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Utilisent notre plateforme
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
                  className="absolute -top-6 -right-6 bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-xl border border-neutral-200 dark:border-neutral-700 w-64"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                      <Zap className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        2.3 secondes
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Analyse moyenne
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Features */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/10 to-transparent dark:via-primary-900/5" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Fonctionnalités innovantes
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Pourquoi choisir{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Mpanolo-tsaina AI
              </span>
              ?
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Une solution complète pour lutter contre la désinformation à Madagascar, 
              spécialement conçue pour les étudiants et éducateurs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="relative bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className={`p-4 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 w-fit mb-6 transition-transform duration-300 ${hoveredFeature === index ? 'scale-110 rotate-3' : ''}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center text-primary-600 dark:text-primary-400">
                      <span className="text-sm font-medium">En savoir plus</span>
                      <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
              Simple et{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                efficace
              </span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {pageT('stepsTitle')}
            </p>
          </motion.div>

          <div className="relative">
            {/* Ligne de connexion */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 -translate-y-1/2" />
            
            <div className="grid lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="relative bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r ${step.color}`}>
                      {step.number}
                    </div>
                    
                    <div className="flex justify-center mb-6 mt-6">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${step.color} bg-opacity-10`}>
                        {step.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-center text-neutral-600 dark:text-neutral-400">
                      {step.description}
                    </p>
                    
                    <div className="mt-6 flex justify-center">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${step.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Alerte WhatsApp */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-secondary-600/10 to-accent-600/10" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Fonctionnalité exclusive
                </span>
              </div>
              
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white">
                Alerte IA avant{' '}
                <span className="text-green-600">partage WhatsApp</span>
              </h2>
              
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Notre innovation primée : une alerte intelligente qui vous prévient 
                avant de partager du contenu douteux sur WhatsApp.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      Protection en temps réel
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Détection automatique des fake news avant partage
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      Explications claires
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Comprenez pourquoi le contenu est douteux
                    </p>
                  </div>
                </div>
              </div>
              
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5" />
                Tester l&#39;alerte WhatsApp
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-neutral-900 rounded-3xl p-6 max-w-md mx-auto shadow-2xl">
                {/* Simulation WhatsApp */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">WhatsApp</div>
                      <div className="text-sm text-neutral-400">Connexion sécurisée</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Message reçu */}
                    <div className="bg-neutral-800 rounded-xl p-4 max-w-[80%]">
                      <p className="text-white">
                        Regarde cette info incroyable ! Le voanjo guérit le cancer en 3 jours ! 
                        Partage à tous tes contacts 🔥
                      </p>
                      <div className="text-xs text-neutral-400 mt-2">15:42</div>
                    </div>
                    
                    {/* Alerte Mpanolo-tsaina */}
                    <div className="bg-gradient-to-r from-warning-500/20 to-warning-600/20 rounded-xl p-4 border-l-4 border-warning-500">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-warning-500" />
                        <span className="font-semibold text-warning-500">
                          Mpanolo-tsaina AI - Alerte
                        </span>
                      </div>
                      <p className="text-sm text-white">
                        ⚠️ Cette information présente un risque élevé de désinformation. 
                        Score de fiabilité : 2.3/5. Aucune source médicale vérifiée ne 
                        confirme cette affirmation.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 px-3 py-2 bg-warning-600 hover:bg-warning-700 text-white text-sm rounded-lg transition-colors">
                          Voir l&#39;analyse complète
                        </button>
                        <button className="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors">
                          Annuler le partage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Apprentissage */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 dark:bg-accent-900/30 rounded-full mb-4">
              <GraduationCap className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-medium text-accent-700 dark:text-accent-300">
                ODD 4 - Éducation de qualité
              </span>
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">
              Formez-vous à la{' '}
              <span className="bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                littératie médiatique
              </span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Modules interactifs spécialement conçus pour les étudiants malgaches
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Détecter les fake news",
                description: "Apprenez à identifier les signes de désinformation",
                icon: <Filter className="w-8 h-8" />,
                lessons: "5 leçons",
                time: "45 min",
                students: "2,500+"
              },
              {
                title: "Sources fiables MG",
                description: "Découvrez les sources crédibles pour Madagascar",
                icon: <Database className="w-8 h-8" />,
                lessons: "7 leçons",
                time: "60 min",
                students: "1,800+"
              },
              {
                title: "Partage responsable",
                description: "Apprenez à partager l'information de manière éthique",
                icon: <Share2 className="w-8 h-8" />,
                lessons: "4 leçons",
                time: "30 min",
                students: "3,200+"
              }
            ].map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="p-3 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl w-fit mb-6">
                  {module.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {module.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {module.description}
                </p>
                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{module.lessons}</span>
                  <span>{module.time}</span>
                  <span>{module.students} étudiants</span>
                </div>
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-primary-500/10 to-primary-500/5 hover:from-primary-500/20 hover:to-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg font-medium transition-colors">
                  Commencer le module
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {pageT('ctaTitle')}
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              {pageT('ctaDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={currentUser ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-all hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                {pageT('startFreeButton')}
              </Link>
              
              <Link
                to="/demo"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
              >
                <Play className="w-5 h-5" />
                Voir la démo vidéo
              </Link>
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-primary-200">Gratuit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-primary-200">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3</div>
                <div className="text-primary-200">Langues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">ODD 4 & 16</div>
                <div className="text-primary-200">Objectifs</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Composant Play pour l'icône manquante
const Play = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Home;