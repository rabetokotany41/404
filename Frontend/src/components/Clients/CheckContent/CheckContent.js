import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Share2,
  Download,
  Copy,
  BarChart,
  Globe,
  Shield,
  Zap,
  Users,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from '../../../contexts/LanguageContext';

const CheckContent = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showShareWarning, setShowShareWarning] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Catégories de contenu
  const categories = [
    { id: 'all', label: 'Tout', icon: Globe },
    { id: 'news', label: 'Actualités', icon: FileText },
    { id: 'social', label: 'Réseaux Sociaux', icon: Users },
    { id: 'science', label: 'Science', icon: Zap },
    { id: 'politics', label: 'Politique', icon: Shield }
  ];

  // Exemple d'historique de vérifications
  const sampleHistory = [
    {
      id: 1,
      content: 'Le vaccin COVID-19 contient des puces de traçage',
      reliability: 'unreliable',
      score: 15,
      category: 'science',
      date: '2024-01-15',
      issues: ['Information non vérifiée', 'Source douteuse']
    },
    {
      id: 2,
      content: 'Madagascar vise 100% d\'énergie renouvelable d\'ici 2030',
      reliability: 'reliable',
      score: 85,
      category: 'news',
      date: '2024-01-14',
      issues: []
    },
    {
      id: 3,
      content: 'Nouvelle découverte archéologique à Ambohimanga',
      reliability: 'veryReliable',
      score: 95,
      category: 'news',
      date: '2024-01-13',
      issues: []
    }
  ];

  useEffect(() => {
    setHistory(sampleHistory);
  }, []);

  // Analyser le contenu
  const handleAnalyze = async () => {
    if (content.trim().length < 10) {
      alert(t('contentTooShort'));
      return;
    }

    setIsAnalyzing(true);
    
    // Simulation d'analyse (remplacer par appel API réel)
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100);
      let reliability = 'uncertain';
      let color = 'yellow';
      
      if (score >= 80) {
        reliability = 'veryReliable';
        color = 'green';
      } else if (score >= 60) {
        reliability = 'reliable';
        color = 'blue';
      } else if (score < 40) {
        reliability = 'unreliable';
        color = 'red';
      }

      const result = {
        score,
        reliability,
        color,
        issues: [
          score < 50 ? 'Sources limitées' : 'Sources diversifiées',
          score < 50 ? 'Ton émotionnel détecté' : 'Ton neutre'
        ],
        suggestions: [
          'Vérifier avec d\'autres sources',
          'Consulter des experts du domaine'
        ],
        analysisDate: new Date().toISOString(),
        contentLength: content.length
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);

      // Ajouter à l'historique
      const newEntry = {
        id: history.length + 1,
        content: content.substring(0, 100) + '...',
        reliability,
        score,
        category: 'news',
        date: new Date().toISOString().split('T')[0],
        issues: result.issues.slice(0, 2)
      };
      setHistory([newEntry, ...history]);
    }, 2000);
  };

  // Gérer le partage
  const handleShare = () => {
    if (analysisResult.score < 50) {
      setShowShareWarning(true);
      setSelectedContent(content);
    } else {
      shareContent();
    }
  };

  const shareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Analyse Mpanolo-tsaina AI',
        text: `Fiabilité: ${analysisResult.score}% - ${t(analysisResult.reliability)}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `🔍 Mpanolo-tsaina AI\nFiabilité: ${analysisResult.score}%\nÉvaluation: ${t(analysisResult.reliability)}\n\nContenu analysé: ${content.substring(0, 200)}...`
      );
      alert('Résultats copiés dans le presse-papier !');
    }
  };

  // Télécharger le rapport
  const downloadReport = () => {
    const report = `
      RAPPORT D'ANALYSE - MPANOLO-TSAINA AI
      ======================================
      
      Contenu analysé: ${content.substring(0, 500)}...
      
      SCORE DE FIABILITÉ: ${analysisResult.score}%
      NIVEAU: ${t(analysisResult.reliability)}
      
      Problèmes détectés:
      ${analysisResult.issues.map(issue => `• ${issue}`).join('\n')}
      
      Suggestions:
      ${analysisResult.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}
      
      Date d'analyse: ${new Date(analysisResult.analysisDate).toLocaleDateString()}
      Longueur du contenu: ${analysisResult.contentLength} caractères
      
      -- Généré par Mpanolo-tsaina AI --
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-mpanolo-tsaina-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copier le contenu
  const copyContent = () => {
    navigator.clipboard.writeText(content);
    alert('Contenu copié !');
  };

  // Réinitialiser
  const handleReset = () => {
    setContent('');
    setAnalysisResult(null);
    setCharCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Vérificateur de <span className="text-blue-600 dark:text-blue-400">Contenu</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Collez un article, une publication ou une information pour en vérifier la fiabilité
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Zone de saisie */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('enterContent')}
                  </h2>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {charCount} {t('characters')}
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder={t('contentPlaceholder')}
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isAnalyzing}
              />

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || content.length < 10}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      {t('analyzing')}
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      {t('analyzeButton')}
                    </>
                  )}
                </button>

                <button
                  onClick={copyContent}
                  disabled={!content}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Copy className="h-5 w-5 inline mr-2" />
                  Copier
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Effacer
                </button>
              </div>

              {content.length > 0 && content.length < 10 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 inline mr-2" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    {t('contentTooShort')} (minimum 10 caractères)
                  </span>
                </div>
              )}
            </div>

            {/* Résultats d'analyse */}
            {analysisResult && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    Résultats d'Analyse
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(analysisResult.analysisDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                        {analysisResult.score}%
                      </div>
                      <div className={`font-bold ${analysisResult.color === 'green' ? 'text-green-600' : analysisResult.color === 'red' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {t(analysisResult.reliability)}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Problèmes détectés</h3>
                    <div className="space-y-3">
                      {analysisResult.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {issue.includes('limitées') || issue.includes('émotionnel') ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-gray-700 dark:text-gray-300">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Suggestions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Recommandation {index + 1}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300"
                  >
                    <Share2 className="h-5 w-5" />
                    Partager le Résultat
                  </button>
                  <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Télécharger le Rapport
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Historique et statistiques */}
          <div className="space-y-8">
            {/* Filtres */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Filtres
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Historique des Vérifications
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {history.length} analyses
                </span>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {history
                  .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setContent(item.content);
                        setCharCount(item.content.length);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {item.content}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          item.reliability === 'veryReliable' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          item.reliability === 'reliable' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          item.reliability === 'unreliable' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {item.score}%
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{item.date}</span>
                        <span className="capitalize">{t(item.reliability)}</span>
                      </div>
                      {item.issues.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.issues.map((issue, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl shadow-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Statistiques
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Analyses aujourd'hui</span>
                  <span className="font-bold text-gray-900 dark:text-white">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Taux de fiabilité moyen</span>
                  <span className="font-bold text-green-600 dark:text-green-400">78%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Contenu non fiable détecté</span>
                  <span className="font-bold text-red-600 dark:text-red-400">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'avertissement pour le partage */}
      {showShareWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('shareWarningTitle')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('lowReliabilityWarning')}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                {t('detectedIssues')}
              </h4>
              <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 text-sm">
                {analysisResult.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              {t('shareAdvice')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={shareContent}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                {t('shareAnyway')}
              </button>
              <button
                onClick={() => setShowShareWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckContent;