// components/ChatBot.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, X, Brain, Shield, AlertCircle, Loader2,
  Image as ImageIcon, FileText, Trash2, Filter, ExternalLink,
  ThumbsUp, ThumbsDown, Copy, Download, Bell, Star
} from 'lucide-react';
import { getAIAnalysis } from '../../../../services/aiAnalysis';

const ChatBot = ({ isAuthenticated, onClose, user }) => {
  // === ÉTATS PRINCIPAUX ===
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState('text');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // === RÉFÉRENCES ===
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // === EFFETS ===
  useEffect(() => {
    // Défilement automatique
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages, showAnalysis]);

  useEffect(() => {
    // Focus sur l'input
    if (!isSending) {
      inputRef.current?.focus();
    }
  }, [isSending]);

  // === FONCTIONS UTILITAIRES ===
  const formatTime = (timestamp) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (timestamp) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  const renderReliabilityScore = (score) => {
    const getColor = (score) => {
      if (score >= 4) return 'text-green-600 dark:text-green-400';
      if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
      if (score >= 2) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    };

    const getLabel = (score) => {
      if (score >= 4.5) return 'Tena azo itokiana 🏆';
      if (score >= 4) return 'Azo itokiana ✅';
      if (score >= 3) return 'Mety azo itokiana ⚠️';
      if (score >= 2) return 'Tsy azo antoka ❓';
      return 'Tsy azo itokiana ❌';
    };

    const getBarWidth = (score) => {
      return `${(score / 5) * 100}%`;
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl font-bold ${getColor(score)}`}>
              {score.toFixed(1)}
            </div>
            <div className={`text-sm font-medium ${getColor(score)}`}>
              {getLabel(score)}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            sur 5.0
          </div>
        </div>

        <div className="h-2 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColor(score).replace('text-', 'bg-')}`}
            style={{ width: getBarWidth(score) }}
          />
        </div>
      </div>
    );
  };

  // === GESTION DES MESSAGES ===
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    if (!content || isSending) return;

    // Message utilisateur
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      content,
      sender: {
        id: user?.id || 'user',
        name: user?.name || 'Utilisateur',
        is_ai: false
      },
      timestamp: new Date().toISOString(),
      type: contentType,
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);
    setError(null);
    setAnalysisResult(null);
    setShowAnalysis(false);

    try {
      // Appel au service d'analyse
      const result = await getAIAnalysis(content, contentType);

      // Message IA
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        content: result.summary_malagasy,
        sender: {
          id: 'ai_assistant',
          name: 'Mpanolo-tsaina AI',
          is_ai: true
        },
        timestamp: new Date().toISOString(),
        isAnalysis: true,
        result,
        status: 'delivered'
      };

      setMessages(prev => [...prev, aiMessage]);
      setAnalysisResult(result);
      setShowAnalysis(true);

      showNotification('Analyse terminée avec succès !', 'success');

    } catch (err) {
      console.error('Erreur d\'analyse:', err);

      const errorMsg = err.message || 'Nisy olana tamin\'ny fanamarinana. Andramo indray.';

      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        content: errorMsg,
        sender: {
          id: 'ai_error',
          name: 'Système',
          is_ai: true,
          is_error: true
        },
        timestamp: new Date().toISOString(),
        status: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(errorMsg);
      showNotification(errorMsg, 'error');

    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setAnalysisResult(null);
    setShowAnalysis(false);
    showNotification('Conversation effacée', 'info');
  };

  const handleContentTypeChange = (type) => {
    setContentType(type);
    if (type === 'image') {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation basique
      if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner une image valide', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('L\'image est trop volumineuse (max 5MB)', 'error');
        return;
      }

      setInputMessage(`📸 ${file.name}`);
      setContentType('image');
      showNotification(`Image "${file.name}" prête à analyser`, 'success');
    }
  };

  const handleCopySource = (url) => {
    navigator.clipboard.writeText(url);
    showNotification('Lien copié dans le presse-papier', 'success');
  };

  const handleFeedback = (type, messageId) => {
    console.log(`Feedback ${type} pour le message ${messageId}`);
    showNotification(`Merci pour votre feedback ${type === 'like' ? '👍' : '👎'}`, 'success');
  };

  // === COMPOSANT D'AFFICHAGE DE L'ANALYSE ===
  const AnalysisDisplay = ({ result }) => {
    if (!result) return null;

    const filteredSources = result.sources.filter(src => {
      if (sourceFilter === 'all') return true;
      if (sourceFilter === 'malagasy') return src.is_malagasy_source;
      if (sourceFilter === 'international') return !src.is_malagasy_source;
      return true;
    });

    return (
      <div className="mt-4 animate-slide-up">
        <div className="p-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg max-h-[500px] flex flex-col">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-neutral-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  Vérification IA
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Catégorie: {result.category}</span>
                  <span>•</span>
                  <span>{formatDate(result.created_at)}</span>
                  <span>•</span>
                  <span>{formatTime(result.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFeedback('like', result.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Utile"
              >
                <ThumbsUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => handleFeedback('dislike', result.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Pas utile"
              >
                <ThumbsDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Score de fiabilité */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-neutral-900 dark:to-blue-900/20 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                Score de Fiabilité:
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Basé sur {result.sources.length} sources
              </span>
            </div>
            {renderReliabilityScore(result.reliability_score)}
          </div>

          {/* Résumé */}
          <div className="mb-6">
            <h5 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Fanazavana détaillée:
            </h5>
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.summary_malagasy}
              </p>
            </div>
          </div>

          {/* Filtres et sources */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter className="h-4 w-4 mr-2 text-green-500" />
                Loharano vérifiés:
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({filteredSources.length} sur {result.sources.length})
                </span>
              </h5>

              <div className="flex space-x-1">
                {['all', 'malagasy', 'international'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSourceFilter(filter)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${sourceFilter === filter
                        ? filter === 'malagasy'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          : filter === 'international'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                            : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                      }`}
                  >
                    {filter === 'all' && 'Tout'}
                    {filter === 'malagasy' && '🇲🇬 Malagasy'}
                    {filter === 'international' && '🌍 International'}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des sources */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {filteredSources.map((src, idx) => (
                <div
                  key={`${src.id}_${idx}`}
                  className="group p-3 bg-gray-50 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {src.source_name}
                        </div>
                        {src.is_malagasy_source && (
                          <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                            🇲🇬 Malagasy
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${src.reliability >= 4.5
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                            : src.reliability >= 4
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                          }`}>
                          Fiabilité: {src.reliability}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">{src.category}</span>
                        <span>•</span>
                        <span>Langue: {src.language}</span>
                      </div>

                      <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visiter le site
                        </a>

                        <button
                          onClick={() => handleCopySource(src.url)}
                          className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier le lien
                        </button>
                      </div>
                    </div>

                    <Star className={`h-4 w-4 flex-shrink-0 ${src.reliability >= 4.5
                        ? 'text-yellow-500 fill-yellow-500'
                        : src.reliability >= 4
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // === ÉCRAN NON AUTHENTIFIÉ ===
  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 z-50 animate-fade-in">
        <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold flex items-center text-lg">
            <Brain className="h-5 w-5 mr-2" />
            Mpanolo-tsaina AI
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
            Authentification requise
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Veuillez vous connecter pour accéder au vérificateur de faits AI
          </p>
          <button
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            onClick={() => window.location.href = '/login'}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // === RENDU PRINCIPAL ===
  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-down ${notification.type === 'error'
            ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            : notification.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}>
          <div className="flex items-center">
            {notification.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {notification.type === 'success' && <Bell className="h-5 w-5 mr-2" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* ChatBot */}
      <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 z-40 animate-slide-up">
        {/* En-tête */}
        <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg mr-3">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Mpanolo-tsaina AI</h3>
              <div className="text-xs opacity-90 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                En ligne • {user?.name || 'Utilisateur'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 rounded-lg hover:bg-white/20 text-sm font-medium transition-colors flex items-center"
              title="Effacer la conversation"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Hamafa
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fermer le chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        <div
          ref={chatContainerRef}
          className="h-64 sm:h-72 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900 space-y-3 scrollbar-thin"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center animate-pulse-gentle">
              <div className="p-4 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl mb-6">
                <Shield className="h-16 w-16 mx-auto text-primary-500 dark:text-primary-400" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                Salama! Mpanolo-tsaina AI aho 🤖
              </p>
              <p className="text-sm mb-6 max-w-xs">
                Alefaso vaovao, sary, na lahatsoraty ho hamariniko amin&apos;ny loharano azo itokiana.
              </p>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => handleContentTypeChange('text')}
                  className="px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Soratra
                </button>
                <button
                  onClick={() => handleContentTypeChange('image')}
                  className="px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Sary
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                <p>+200 loharano vérifiés • Temps de réponse: 2-3s</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isAI = msg.sender.is_ai;
                const isError = msg.sender.is_error;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-message-enter`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 ${isError
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'
                        : isAI
                          ? 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-chat'
                          : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-message-right'
                      }`}>
                      {/* En-tête du message */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {isAI && !isError && (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center">
                              <Brain className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <span className={`text-xs font-medium ${isError
                              ? 'text-red-700 dark:text-red-300'
                              : isAI
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-white/90'
                            }`}>
                            {isError ? '⚠️ Système' : isAI ? '🤖 AI Assistant' : '👤 Vous'}
                          </span>
                        </div>
                        <span className={`text-xs ${isError
                            ? 'text-red-600 dark:text-red-400'
                            : isAI
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-white/80'
                          }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Contenu du message */}
                      <p className={`text-sm break-words whitespace-pre-wrap leading-relaxed ${isError
                          ? 'text-red-800 dark:text-red-200'
                          : isAI
                            ? 'text-gray-800 dark:text-gray-200'
                            : 'text-white'
                        }`}>
                        {msg.content}
                      </p>

                      {/* Statut du message */}
                      {!isAI && (
                        <div className="flex justify-end mt-2">
                          <span className="text-xs opacity-70">
                            {msg.status === 'sent' && '✓ Envoyé'}
                            {msg.status === 'delivered' && '✓✓ Reçu'}
                            {msg.status === 'read' && '✓✓ Lu'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="p-3 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-2xl">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ampidiro ny vaovao na pejy web..."
                className="w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                disabled={isSending}
              />
              {contentType === 'image' && inputMessage && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                </div>
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 relative overflow-hidden group"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="absolute -bottom-6 left-0 right-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyse en cours...
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span className="absolute -bottom-6 left-0 right-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Envoyer
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Indicateur de type */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Type:
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleContentTypeChange('text')}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${contentType === 'text'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  📝 Texte
                </button>
                <button
                  onClick={() => handleContentTypeChange('image')}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${contentType === 'image'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  🖼️ Image
                </button>
              </div>
            </div>

            {messages.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {messages.length} message{messages.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Affichage de l'analyse */}
        {showAnalysis && analysisResult && (
          <AnalysisDisplay result={analysisResult} />
        )}
      </div>
    </>
  );
};


ChatBot.defaultProps = {
  isAuthenticated: false,
  user: null,
  onClose: () => console.log('ChatBot fermé')
};

export default ChatBot;