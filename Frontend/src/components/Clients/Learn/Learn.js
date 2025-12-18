import React, { useState } from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Users, 
  Brain,
  Shield,
  Globe,
  TrendingUp,
  Award,
  Play,
  Download,
  Share2,
  Bookmark,
  ChevronRight,
  Filter,
  Calendar,
  Clock,
  Eye,
  Heart
} from 'lucide-react';

const Learn = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarked, setBookmarked] = useState([]);

  // Catégories d'apprentissage
  const categories = [
    { id: 'all', label: 'Tout', icon: Globe, count: 12 },
    { id: 'basics', label: 'Bases', icon: BookOpen, count: 4 },
    { id: 'advanced', label: 'Avancé', icon: Brain, count: 5 },
    { id: 'tools', label: 'Outils', icon: Shield, count: 3 }
  ];

  // Ressources d'apprentissage
  const learningResources = [
    {
      id: 1,
      title: 'Comment repérer une fake news ?',
      type: 'article',
      category: 'basics',
      duration: '5 min',
      level: 'Débutant',
      description: 'Apprenez les signes révélateurs des informations trompeuses',
      content: `Les fake news utilisent souvent des techniques spécifiques : 
      - Titres sensationnalistes
      - Sources floues ou inexistantes
      - Dates de publication manquantes
      - Appels émotionnels forts
      - Images manipulées ou hors contexte`,
      author: 'Équipe Mpanolo-tsaina',
      date: '2024-01-15',
      views: 1245,
      likes: 89,
      bookmarked: false
    },
    {
      id: 2,
      title: 'L\'IA dans la vérification des faits',
      type: 'video',
      category: 'advanced',
      duration: '12 min',
      level: 'Intermédiaire',
      description: 'Comprendre comment l\'IA aide à détecter la désinformation',
      content: 'https://example.com/video-ia-verification',
      author: 'Dr. Rakoto Andriana',
      date: '2024-01-14',
      views: 892,
      likes: 45,
      bookmarked: true
    },
    {
      id: 3,
      title: 'Guide des sources fiables',
      type: 'guide',
      category: 'tools',
      duration: '8 min',
      level: 'Tous niveaux',
      description: 'Liste des sources vérifiées et comment les utiliser',
      content: `Sources recommandées :
      1. Organisations gouvernementales officielles
      2. Institutions académiques reconnues
      3. Médias avec charte éthique
      4. Organisations internationales`,
      author: 'Équipe de Recherche',
      date: '2024-01-13',
      views: 1567,
      likes: 102,
      bookmarked: false
    },
    {
      id: 4,
      title: 'Analyse de cas : Élection présidentielle',
      type: 'case-study',
      category: 'advanced',
      duration: '15 min',
      level: 'Avancé',
      description: 'Étude approfondie des fake news pendant les élections',
      content: 'Analyse détaillée des campagnes de désinformation...',
      author: 'Observatoire des Médias',
      date: '2024-01-12',
      views: 734,
      likes: 67,
      bookmarked: true
    },
    {
      id: 5,
      title: 'Introduction à la littératie numérique',
      type: 'article',
      category: 'basics',
      duration: '6 min',
      level: 'Débutant',
      description: 'Les compétences essentielles pour naviguer sur internet',
      content: 'Guide des compétences numériques de base...',
      author: 'Sarah Rabe',
      date: '2024-01-11',
      views: 1890,
      likes: 123,
      bookmarked: false
    },
    {
      id: 6,
      title: 'Atelier pratique : Vérification d\'image',
      type: 'video',
      category: 'tools',
      duration: '10 min',
      level: 'Intermédiaire',
      description: 'Comment vérifier l\'authenticité d\'une photo',
      content: 'https://example.com/video-image-verification',
      author: 'Jean Dupont',
      date: '2024-01-10',
      views: 1123,
      likes: 78,
      bookmarked: false
    }
  ];

  // Statistiques de progression
  const progressStats = {
    completed: 8,
    total: 15,
    timeSpent: '2h 30min',
    streak: 7,
    level: 'Intermédiaire'
  };

  // Gérer les bookmarks
  const toggleBookmark = (id) => {
    setBookmarked(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Ressources filtrées
  const filteredResources = learningResources.filter(resource => {
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-6">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Centre d'Apprentissage</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Devenez un expert en <span className="text-blue-600 dark:text-blue-400">vérification</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Apprenez à repérer la désinformation, à vérifier les sources et à développer votre esprit critique.
                Des ressources gratuites pour tous les niveaux.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300">
                  Commencer le Parcours
                </button>
                <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <Play className="h-5 w-5 inline mr-2" />
                  Vidéo d'introduction
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Progression</div>
                    <div className="text-gray-600 dark:text-gray-400">Continuez votre apprentissage</div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Leçons complétées</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {progressStats.completed}/{progressStats.total}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Temps passé</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {progressStats.timeSpent}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Série en cours</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {progressStats.streak} jours
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                    Reprendre la dernière leçon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation par onglets */}
      <section className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {['articles', 'videos', 'guides', 'case-studies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'articles' && 'Articles'}
                {tab === 'videos' && 'Vidéos'}
                {tab === 'guides' && 'Guides'}
                {tab === 'case-studies' && 'Études de cas'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Colonne gauche - Filtres et catégories */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Catégories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className="h-5 w-5" />
                      <span>{category.label}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Conseil du jour</h3>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <p className="text-gray-700 dark:text-gray-300">
                  Toujours vérifier la date de publication d'un article avant de le partager.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quiz rapide</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Testez vos connaissances en 2 minutes
              </p>
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                Démarrer le quiz
              </button>
            </div>
          </div>

          {/* Colonne principale - Ressources */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredResources.length} ressources disponibles
                </h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download className="h-5 w-5 inline mr-2" />
                    Télécharger tout
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {resource.type === 'video' && (
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <Video className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                          )}
                          {resource.type === 'article' && (
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          {resource.type === 'guide' && (
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            resource.level === 'Débutant' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            resource.level === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {resource.level}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(resource.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          <Bookmark className={`h-5 w-5 ${
                            resource.bookmarked ? 'fill-yellow-400 text-yellow-400' : ''
                          }`} />
                        </button>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {resource.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {resource.duration}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{resource.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{resource.likes}</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium group/btn">
                          Lire
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section recommandations */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommandé pour vous</h2>
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Award className="h-12 w-12 mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Certification de Vérificateur</h3>
                    <p className="opacity-90 mb-6">
                      Obtenez une certification reconnue en complétant notre parcours avancé.
                    </p>
                    <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      Découvrir le parcours
                    </button>
                  </div>
                  <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                    <h4 className="font-bold mb-4">Prochaines étapes</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <span>Compléter 5 leçons avancées</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <span>Passer le quiz final</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <span>Soumettre un projet pratique</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">
            Rejoignez notre communauté d'apprenants
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Recevez chaque semaine de nouvelles ressources, des conseils pratiques et des alertes sur les dernières tendances en désinformation.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                S'abonner
              </button>
            </div>
            <p className="text-sm opacity-80 mt-4">
              Nous respectons votre vie privée. Désabonnez-vous à tout moment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Learn;