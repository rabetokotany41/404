import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
  RefreshCw,
  Loader,
  Cpu,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Printer,
  ExternalLink
} from 'lucide-react';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const CheckContent = () => {
  const { t } = useContext(LanguageContext);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showShareWarning, setShowShareWarning] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);
  const [aiPipeline, setAiPipeline] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [contentType, setContentType] = useState('text');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Configuration des modèles IA
  const [aiModels] = useState({
    textAnalysis: {
      primary: { name: "Mpanolo-tsaina AI", accuracy: "92%", size: "Optimisé local" }
    },
    imageAnalysis: { primary: { name: "Vision AI", accuracy: "89%" } }
  });

  // Traductions
  const translations = {
    enterContent: t('enterContent') || 'Saisissez le contenu à vérifier',
    characters: t('characters') || 'caractères',
    contentPlaceholder: t('contentPlaceholder') || 'Collez ici le texte à analyser...',
    contentTooShort: t('contentTooShort') || 'Le contenu doit contenir au moins 10 caractères',
    analyzing: t('analyzing') || 'Analyse IA en cours...',
    analyzeButton: t('analyzeButton') || 'Analyser avec l&apos;IA',
    shareWarningTitle: t('shareWarningTitle') || '⚠️ Attention : Fiabilité faible',
    lowReliabilityWarning: t('lowReliabilityWarning') || 'Cette information présente des risques',
    detectedIssues: t('detectedIssues') || 'Problèmes détectés :',
    shareAnyway: t('shareAnyway') || 'Partager quand même',
    cancel: t('cancel') || 'Annuler',
    reliable: t('reliable') || 'Fiable',
    unreliable: t('unreliable') || 'Non fiable',
    uncertain: t('uncertain') || 'Incertain'
  };

  // Catégories
  const categories = [
    { id: 'all', label: 'Toutes', icon: Globe, color: 'gray' },
    { id: 'news', label: 'Actualités', icon: FileText, color: 'blue' },
    { id: 'social', label: 'Réseaux Sociaux', icon: Users, color: 'purple' },
    { id: 'science', label: 'Science/Santé', icon: Zap, color: 'green' },
    { id: 'politics', label: 'Politique', icon: Shield, color: 'red' }
  ];

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem('mpanolotsaina_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Limiter à 20 entrées maximum
        setHistory(parsedHistory.slice(0, 20));
      } catch (e) {
        console.error('Erreur chargement historique:', e);
        setHistory([]);
      }
    }

    // Charger depuis les paramètres URL
    const queryParam = searchParams.get('q');
    if (queryParam) {
      const decoded = decodeURIComponent(queryParam);
      setContent(decoded);
      setCharCount(decoded.length);
    }

    // Charger depuis l'état de navigation
    if (location.state?.content) {
      setContent(location.state.content);
      setCharCount(location.state.content.length);
      if (location.state.analysisData) {
        setAnalysisResult(location.state.analysisData);
      }
    }
  }, [searchParams, location.state]);

  // Gestion des images uploadées
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setError('L&apos;image est trop grande (max 5MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    setUploadedImage(file);
    setContentType('image');
    setError(null);
    
    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setContentType('text');
    setGeneratedImage(null);
  };

  // Génération d'image IA
  const handleGenerateImage = async () => {
    if (!content.trim() || content.trim().length < 5) {
      setError('Description trop courte (min 5 caractères)');
      return;
    }

    setIsGeneratingImage(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content })
      });

      const data = await response.json();
      
      if (data.success && data.image_url) {
        const imageUrl = `http://localhost:5000${data.image_url}`;
        setGeneratedImage(imageUrl);
        
        // Convertir en File pour analyse
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.blob();
        const file = new File([blob], 'generated-image.png', { type: 'image/png' });
        setUploadedImage(file);
        setImagePreview(imageUrl);
      } else {
        setError(data.message || 'Génération simulée activée');
      }
    } catch (err) {
      console.error('Erreur génération:', err);
      setError('Service temporairement indisponible');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Simulation du pipeline IA
  const simulateAiPipeline = () => {
    const steps = contentType === 'text' ? [
      { id: 1, name: 'Analyse Sémantique', status: 'pending', time: '0.5s' },
      { id: 2, name: 'Détection de Biais', status: 'pending', time: '0.8s' },
      { id: 3, name: 'Vérification Sources', status: 'pending', time: '1.2s' },
      { id: 4, name: 'Génération Rapport', status: 'pending', time: '0.3s' }
    ] : [
      { id: 1, name: 'Analyse Image', status: 'pending', time: '1.5s' },
      { id: 2, name: 'Extraction Texte', status: 'pending', time: '0.8s' },
      { id: 3, name: 'Vérification Contexte', status: 'pending', time: '1.2s' },
      { id: 4, name: 'Génération Rapport', status: 'pending', time: '0.3s' }
    ];
    
    setAiPipeline(steps);
    
    // Animer les étapes
    const timeouts = [];
    steps.forEach((step, index) => {
      timeouts.push(setTimeout(() => {
        setAiPipeline(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'processing' } : s
        ));
      }, index * 300));
      
      timeouts.push(setTimeout(() => {
        setAiPipeline(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'completed' } : s
        ));
      }, (index * 300) + 500));
    });
    
    // Retourner une fonction de nettoyage
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  };

  // Fonction principale d'analyse
  const handleAnalyze = async () => {
    // Validation
    if (contentType === 'text' && content.trim().length < 10) {
      setError(translations.contentTooShort);
      return;
    }

    if (contentType === 'image' && !uploadedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAiPipeline([]);
    const cleanup = simulateAiPipeline();

    try {
      let endpoint = 'http://localhost:5000/api/ai/analyze';
      let body;
      let headers = {};

      if (contentType === 'text') {
        body = JSON.stringify({
          content: content,
          language: localStorage.getItem('language') || 'fr',
          category: selectedCategory === 'all' ? 'general' : selectedCategory
        });
        headers = { 'Content-Type': 'application/json' };
      } else {
        // Pour les images, utiliser FormData
        const formData = new FormData();
        formData.append('content', 'Analyse d&apos;image');
        formData.append('language', 'fr');
        formData.append('category', selectedCategory === 'all' ? 'general' : selectedCategory);
        formData.append('image', uploadedImage);
        body = formData;
        endpoint = 'http://localhost:5000/api/check/image';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Formater les résultats
        const score = data.data?.reliability_score || 50;
        
        let reliability, color;
        if (score >= 80) {
          reliability = 'veryReliable';
          color = 'green';
        } else if (score >= 60) {
          reliability = 'reliable';
          color = 'blue';
        } else if (score >= 40) {
          reliability = 'uncertain';
          color = 'yellow';
        } else if (score >= 20) {
          reliability = 'unreliable';
          color = 'orange';
        } else {
          reliability = 'critical';
          color = 'red';
        }

        const result = {
          id: Date.now(),
          score: score,
          reliability,
          color,
          risk_level: data.data?.risk_level || 'medium',
          summary: data.data?.summary_french || data.data?.summary_malagasy || 'Analyse terminée',
          issues: data.data?.bias_types || data.data?.warnings_found > 0 
            ? [`${data.data.warnings_found} avertissement(s)`] 
            : ['Aucun problème détecté'],
          suggestions: data.data?.recommendations || [
            'Vérifier la source originale',
            'Consulter plusieurs médias',
            'Rechercher des informations officielles'
          ],
          analysisDate: new Date().toISOString(),
          contentLength: content.length,
          model_used: data.model_used || aiModels.textAnalysis.primary.name,
          confidence: data.data?.confidence_score || 0.85,
          details: data.data || {},
          word_count: data.data?.word_count || 0
        };

        setAnalysisResult(result);

        // Sauvegarder dans l'historique
        const historyEntry = {
          id: result.id,
          content: contentType === 'text' 
            ? content.substring(0, 100) + (content.length > 100 ? '...' : '')
            : '📷 Image analysée',
          reliability,
          score,
          category: selectedCategory,
          date: new Date().toLocaleDateString('fr-FR'),
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          type: contentType
        };

        const newHistory = [historyEntry, ...history.slice(0, 19)];
        setHistory(newHistory);
        localStorage.setItem('mpanolotsaina_history', JSON.stringify(newHistory));

      } else {
        throw new Error(data.message || 'Erreur lors de l&apos;analyse');
      }

    } catch (err) {
      console.error('Erreur analyse:', err);
      
      // Mode démo en cas d'erreur
      const demoScore = Math.floor(Math.random() * 100);
      const demoResult = {
        id: Date.now(),
        score: demoScore,
        reliability: demoScore >= 70 ? 'reliable' : demoScore >= 40 ? 'uncertain' : 'unreliable',
        color: demoScore >= 70 ? 'green' : demoScore >= 40 ? 'yellow' : 'red',
        risk_level: 'medium',
        summary: 'Analyse en mode démo - Service en maintenance',
        issues: ['Mode démo activé'],
        suggestions: ['Réessayer plus tard', 'Vérifier votre connexion'],
        analysisDate: new Date().toISOString(),
        contentLength: content.length,
        model_used: 'DEMO MODE',
        confidence: 0.7
      };
      
      setAnalysisResult(demoResult);
      setError('Mode démo activé - ' + err.message);
      
    } finally {
      setIsAnalyzing(false);
      if (cleanup) cleanup();
    }
  };

  // Jauge de fiabilité
  const ReliabilityGauge = ({ score, size = 120 }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color;
    if (score >= 80) color = '#10B981';
    else if (score >= 60) color = '#3B82F6';
    else if (score >= 40) color = '#F59E0B';
    else if (score >= 20) color = '#F97316';
    else color = '#EF4444';

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none stroke-gray-200 dark:stroke-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="fill-none transition-all duration-1000 ease-out"
            style={{ stroke: color }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{score}%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Fiabilité</div>
        </div>
      </div>
    );
  };

  // Fonctions utilitaires
  const handleShare = () => {
    if (!analysisResult) return;
    
    if (analysisResult.score < 50) {
      setShowShareWarning(true);
    } else {
      shareContent();
    }
  };

  const shareContent = () => {
    const shareText = `🔍 Mpanolo-tsaina AI - Analyse FIabilité\n\n` +
      `📊 Score: ${analysisResult.score}%\n` +
      `📈 Niveau: ${analysisResult.reliability === 'veryReliable' ? 'Très fiable' : 
                  analysisResult.reliability === 'reliable' ? 'Fiable' : 
                  analysisResult.reliability === 'unreliable' ? 'Peu fiable' : 'Incertain'}\n` +
      `🤖 Modèle: ${analysisResult.model_used}\n` +
      `📝 Résumé: ${analysisResult.summary}\n\n` +
      `🔗 Vérifié sur Mpanolo-tsaina AI`;

    if (navigator.share) {
      navigator.share({
        title: 'Résultat d&apos;analyse - Mpanolo-tsaina',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
    setShowShareWarning(false);
  };

  const downloadReport = () => {
    if (!analysisResult) return;
    
    const report = `=== RAPPORT D'ANALYSE - MPANOLO-TSAINA AI ===

📅 Date: ${new Date(analysisResult.analysisDate).toLocaleDateString('fr-FR')}
⏰ Heure: ${new Date(analysisResult.analysisDate).toLocaleTimeString('fr-FR')}

🎯 RESULTATS:
• Score de fiabilité: ${analysisResult.score}%
• Niveau: ${analysisResult.reliability === 'veryReliable' ? 'Très fiable' : 
            analysisResult.reliability === 'reliable' ? 'Fiable' : 
            analysisResult.reliability === 'unreliable' ? 'Peu fiable' : 'Incertain'}
• Risque: ${analysisResult.risk_level}

🤖 INFORMATIONS TECHNIQUES:
• Modèle utilisé: ${analysisResult.model_used}
• Confiance: ${(analysisResult.confidence * 100).toFixed(1)}%
• Type: ${contentType === 'image' ? 'Image' : 'Texte'}

📝 RESUME:
${analysisResult.summary}

⚠️ PROBLEMES DETECTES:
${analysisResult.issues.map(issue => `• ${issue}`).join('\n')}

💡 RECOMMANDATIONS:
${analysisResult.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

-- Généré par Mpanolo-tsaina AI --
-- IA locale pour Madagascar --`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-mpanolotsaina-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (contentType === 'text' && content) {
      navigator.clipboard.writeText(content);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const clearAll = () => {
    setContent('');
    setUploadedImage(null);
    setImagePreview(null);
    setGeneratedImage(null);
    setAnalysisResult(null);
    setCharCount(0);
    setError(null);
    setAiPipeline([]);
    setContentType('text');
  };

  // Filtrer l'historique par catégorie
  const filteredHistory = selectedCategory === 'all' 
    ? history 
    : history.filter(item => item.category === selectedCategory);

  // Calcul des statistiques
  const totalAnalyses = history.length;
  const averageScore = history.length > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length)
    : 0;
  const riskyContent = history.length > 0 
    ? Math.round((history.filter(item => item.score < 50).length / history.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* En-tête */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mb-4 md:mb-6 shadow-lg"
            >
              <Cpu className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {t('checkPageTitle') || 'Vérificateur de Contenu IA'}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              {t('checkPageDescription') || 'Détectez la désinformation avec notre IA optimisée pour le contexte malgache'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Cpu className="h-4 w-4" />
                <span>Powered by {aiModels.textAnalysis.primary.name}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span>Analyse texte & images</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Globe className="h-4 w-4" />
                <span>MG / FR / EN</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-16">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Colonne gauche - Zone d'analyse */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {/* Zone de saisie */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {contentType === 'image' ? 
                      <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    }
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      {contentType === 'image' ? 'Analyser une image' : translations.enterContent}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {contentType === 'image' ? 'Téléchargez ou générez une image' : 'Supporte malgache, français, anglais'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {contentType === 'image' ? '📷 Image' : `${charCount} ${translations.characters}`}
                  </span>
                </div>
              </div>

              {/* Sélecteur de type */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => { setContentType('text'); removeImage(); }}
                  className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm md:text-base ${
                    contentType === 'text' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Texte
                </button>
                <button
                  onClick={() => setContentType('image')}
                  className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm md:text-base ${
                    contentType === 'image' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  Image
                </button>
              </div>

              {/* Zone de contenu */}
              {contentType === 'text' ? (
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setCharCount(e.target.value.length);
                      setError(null);
                    }}
                    placeholder={translations.contentPlaceholder}
                    className="w-full h-48 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                    disabled={isAnalyzing}
                  />
                  {content && (
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-3 right-3 p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Copier le texte"
                    >
                      {copiedUrl ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload d'image */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 md:p-8 text-center">
                    {!imagePreview ? (
                      <div>
                        <Upload className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4">Glissez-déposez ou cliquez pour sélectionner</p>
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label htmlFor="image-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                          <Upload className="h-4 w-4" />
                          Choisir une image
                        </label>
                        <p className="text-xs md:text-sm text-gray-500 mt-2">PNG, JPG, GIF (max 5MB)</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-48 md:max-h-64 mx-auto rounded-lg shadow-md" 
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Supprimer l&apos;image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Génération d'image IA */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Générer une image avec IA</h3>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Décrivez l&apos;image à générer..."
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !content.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isGeneratingImage ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Cpu className="h-4 w-4" />
                        )}
                        Générer
                      </button>
                    </div>
                    {generatedImage && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Image générée :</p>
                        <img src={generatedImage} alt="Généré" className="max-h-32 rounded-lg mx-auto" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages d'erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  </motion.div>
                )}

                {contentType === 'text' && content.length > 0 && content.length < 10 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-yellow-700 dark:text-yellow-300">
                        Minimum 10 caractères requis
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (contentType === 'text' ? content.length < 10 : !uploadedImage)}
                  className="flex-1 min-w-full sm:min-w-[200px] flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span className="flex items-center gap-2">
                        {translations.analyzing}
                        <span className="text-xs font-normal hidden sm:inline">
                          ({contentType === 'image' ? aiModels.imageAnalysis.primary.name : aiModels.textAnalysis.primary.name})
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>{translations.analyzeButton}</span>
                    </>
                  )}
                </motion.button>

                <div className="flex gap-3">
                  {contentType === 'text' && content && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyToClipboard}
                      disabled={isAnalyzing}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {copiedUrl ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs">Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="text-xs">Copier</span>
                        </>
                      )}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearAll}
                    disabled={isAnalyzing}
                    className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-xs">Effacer</span>
                  </motion.button>
                </div>
              </div>

              {/* Pipeline IA */}
              {aiPipeline.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 md:p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm md:text-base">
                    <Cpu className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    Processus d&apos;analyse
                  </h3>
                  <div className="space-y-2">
                    {aiPipeline.map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-2 md:p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 
                            'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {step.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                            {step.time}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {step.status === 'completed' ? '✓' : 
                             step.status === 'processing' ? '⟳' : '○'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Résultats d'analyse */}
            <AnimatePresence>
              {analysisResult && (
                <motion.div
                  key="analysis-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                        <BarChart className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                          Résultats d&apos;Analyse
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {analysisResult.model_used} • {new Date(analysisResult.analysisDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(analysisResult.analysisDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                    {/* Jauge de fiabilité */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center">
                      <ReliabilityGauge score={analysisResult.score} size={120} />
                      <div className="mt-4 text-center">
                        <div className={`text-lg md:text-xl font-bold ${
                          analysisResult.color === 'green' ? 'text-green-600' : 
                          analysisResult.color === 'blue' ? 'text-blue-600' : 
                          analysisResult.color === 'yellow' ? 'text-yellow-600' : 
                          analysisResult.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {analysisResult.reliability === 'veryReliable' ? 'Très fiable' : 
                           analysisResult.reliability === 'reliable' ? 'Fiable' : 
                           analysisResult.reliability === 'unreliable' ? 'Peu fiable' : 'Incertain'}
                        </div>
                        <div className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          Confiance: {(analysisResult.confidence * 100).toFixed(1)}%
                        </div>
                        <button
                          onClick={() => setShowDetails(true)}
                          className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
                        >
                          <Eye className="h-3 w-3" />
                          Voir détails
                        </button>
                      </div>
                    </div>

                    {/* Résumé et problèmes */}
                    <div className="md:col-span-2 space-y-4 md:space-y-6">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                          <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                          Résumé
                        </h3>
                        <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                            {analysisResult.summary}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                          Avertissements
                        </h3>
                        <div className="space-y-2">
                          {analysisResult.issues.map((issue, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2 md:gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg"
                            >
                              {issue.toLowerCase().includes('aucun') || issue.includes('✓') ? (
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                              )}
                              <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{issue}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 md:pt-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                      <Star className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                      Recommandations
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 rounded-xl p-3 md:p-4 border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                              <Star className="h-2 w-2 md:h-3 md:w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              Recommandation {index + 1}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">{suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-lg md:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
                    >
                      <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                      Partager
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadReport}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 md:py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg md:rounded-xl transition-colors text-sm md:text-base"
                    >
                      <Download className="h-4 w-4 md:h-5 md:w-5" />
                      Télécharger
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowDetails(true);
                      }}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg md:rounded-xl transition-colors text-sm md:text-base"
                    >
                      <Eye className="h-4 w-4 md:h-5 md:w-5" />
                      Détails
                    </motion.button>
                  </div>

                  {/* URL de partage */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        Lien de partage:
                      </span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/analyse/${analysisResult.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedUrl ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Copié!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copier le lien
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 truncate">
                      {window.location.origin}/analyse/{analysisResult.id}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Colonne droite - Outils */}
          <div className="space-y-6 md:space-y-8">
            {/* Filtres */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Filter className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                Filtres par catégorie
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs md:text-sm ${
                      selectedCategory === category.id
                        ? `bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-700 dark:text-${category.color}-400 border border-${category.color}-300 dark:border-${category.color}-700`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                    }`}
                  >
                    <category.icon className="h-3 w-3" />
                    {category.label}
                  </motion.button>
                ))}
              </div>
              <p className="mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {filteredHistory.length} analyse{filteredHistory.length !== 1 ? 's' : ''} dans cette catégorie
              </p>
            </motion.div>

            {/* Historique */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  Historique récent
                </h3>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {filteredHistory.length} analyse{filteredHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        if (item.type === 'image') {
                          setContentType('image');
                        } else {
                          setContent(item.content);
                          setContentType('text');
                        }
                        setCharCount(item.content?.length || 0);
                        setAnalysisResult(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md cursor-pointer bg-white dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1 rounded ${
                              item.category === 'news' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              item.category === 'social' ? 'bg-purple-100 dark:bg-purple-900/30' :
                              item.category === 'science' ? 'bg-green-100 dark:bg-green-900/30' :
                              'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {item.type === 'image' ? (
                                <ImageIcon className="h-2 w-2 md:h-3 md:w-3 text-blue-600 dark:text-blue-400" />
                              ) : item.category === 'news' ? (
                                <FileText className="h-2 w-2 md:h-3 md:w-3 text-blue-600 dark:text-blue-400" />
                              ) : item.category === 'social' ? (
                                <Users className="h-2 w-2 md:h-3 md:w-3 text-purple-600 dark:text-purple-400" />
                              ) : item.category === 'science' ? (
                                <Zap className="h-2 w-2 md:h-3 md:w-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <Shield className="h-2 w-2 md:h-3 md:w-3 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {item.type === 'image' ? 'Image' : item.category}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.content}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                          item.reliability === 'veryReliable' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          item.reliability === 'reliable' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          item.reliability === 'unreliable' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {item.score}%
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.date} {item.time}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <FileText className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune analyse récente</p>
                    <p className="text-xs mt-1">Commencez par analyser un contenu</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Statistiques */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                Vos statistiques
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Analyses totales</span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{totalAnalyses}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Score moyen</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {averageScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Contenu à risque</span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                    {riskyContent}%
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <Cpu className="h-3 w-3 md:h-4 md:w-4 inline mr-1" />
                    {aiModels.textAnalysis.primary.name}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetails && analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* En-tête */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                  <BarChart className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    Détails de l&apos;analyse
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    ID: {analysisResult.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenu */}
            <div className="p-4 md:p-6">
              {/* Informations générales */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">📋 Informations</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date</span>
                      <span className="font-medium">{new Date(analysisResult.analysisDate).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Modèle</span>
                      <span className="font-medium">{analysisResult.model_used}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Confiance</span>
                      <span className="font-medium">{(analysisResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Évaluation des risques</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      analysisResult.risk_level === 'very_low' ? 'bg-green-500' :
                      analysisResult.risk_level === 'low' ? 'bg-blue-500' :
                      analysisResult.risk_level === 'medium' ? 'bg-yellow-500' :
                      analysisResult.risk_level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">
                      {analysisResult.risk_level === 'very_low' ? 'Très faible' :
                       analysisResult.risk_level === 'low' ? 'Faible' :
                       analysisResult.risk_level === 'medium' ? 'Moyen' :
                       analysisResult.risk_level === 'high' ? 'Élevé' : 'Critique'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {analysisResult.issues.join(' • ')}
                  </p>
                </div>
              </div>
              
              {/* Métriques détaillées */}
              {analysisResult.details && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Métriques techniques</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {analysisResult.details.word_count && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {analysisResult.details.word_count}
                          </div>
                          <div className="text-xs text-gray-500">Mots</div>
                        </div>
                      )}
                      {analysisResult.details.character_count && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {analysisResult.details.character_count}
                          </div>
                          <div className="text-xs text-gray-500">Caractères</div>
                        </div>
                      )}
                      {analysisResult.details.warnings_found !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {analysisResult.details.warnings_found}
                          </div>
                          <div className="text-xs text-gray-500">Avertissements</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {analysisResult.score}%
                        </div>
                        <div className="text-xs text-gray-500">Score final</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* URL de partage détaillé */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Lien permanent</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/analyse/${analysisResult.id}`}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/analyse/${analysisResult.id}`);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    {copiedUrl ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copié!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Pied de page */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadReport}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal d'avertissement pour partage */}
      {showShareWarning && analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  {translations.shareWarningTitle}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Score: {analysisResult.score}%</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
              {translations.lowReliabilityWarning}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2 text-sm md:text-base">
                <AlertTriangle className="h-4 w-4" />
                {translations.detectedIssues}
              </h4>
              <ul className="space-y-1 md:space-y-2">
                {analysisResult.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-yellow-700 dark:text-yellow-300">
                    <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2"></div>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  shareContent();
                  setShowShareWarning(false);
                }}
                className="flex-1 px-4 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
              >
                {translations.shareAnyway}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareWarning(false)}
                className="flex-1 px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                {translations.cancel}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pied de page */}
      <footer className="mt-8 md:mt-12 py-4 md:py-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 Mpanolo-tsaina AI. Tous droits réservés.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                IA locale optimisée pour la vérification d&apos;information à Madagascar
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('https://github.com/mpanolotsaina', '_blank')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                GitHub
              </button>
              <button
                onClick={() => window.open('mailto:contact@mpanolotsaina.mg', '_blank')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact
              </button>
              <button
                onClick={() => window.open('/privacy', '_blank')}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Confidentialité
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckContent;