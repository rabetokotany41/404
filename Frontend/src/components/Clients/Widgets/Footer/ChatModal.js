import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageCircle, X, Send,
  User, AlertCircle, Loader2
} from 'lucide-react';
import { io } from 'socket.io-client';

const ChatModal = ({ currentUser, isAuthenticated, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // URL de base pour les APIs
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // Récupérer le token
  const getAuthToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      // Nettoyer le token
      let cleanToken = token.trim();
      if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1);
      }
      if (cleanToken.startsWith("'") && cleanToken.endsWith("'")) {
        cleanToken = cleanToken.slice(1, -1);
      }
      
      return cleanToken;
    } catch (error) {
      console.error('❌ Erreur token:', error);
      return null;
    }
  };

  // Configuration axios
  const getAxiosConfig = () => {
    const token = getAuthToken();
    if (!token) return null;
    
    return {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fonction pour vérifier si un ID est temporaire
  const isTempId = (id) => {
    if (!id) return false;
    if (typeof id !== 'string') return false;
    return id.startsWith('temp-');
  };

  // Fonction pour extraire l'ID numérique du temp ID
  const getTempIdNumber = (tempId) => {
    if (!tempId || typeof tempId !== 'string') return null;
    const match = tempId.match(/temp-(\d+)/);
    return match ? match[1] : null;
  };

  // Initialiser Socket.io
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const token = getAuthToken();
      if (!token) {
        setError('Token d\'authentification manquant.');
        return;
      }

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('✅ Connecté au serveur Socket.io');
        setError(null);
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Erreur Socket.io:', err.message);
      });

      newSocket.on('new_message', (message) => {
        console.log('📨 Nouveau message:', message);
        handleNewMessage(message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, currentUser]);

  // Charger ou créer une conversation
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadOrCreateConversation();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  const loadOrCreateConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const config = getAxiosConfig();
      if (!config) {
        throw new Error('Configuration invalide');
      }

      // 1. Récupérer les conversations
      const conversationsResponse = await axios.get(
        `${API_URL}/messages/conversations`,
        config
      );

      let conversationData = null;

      if (conversationsResponse.data.success && conversationsResponse.data.conversations) {
        conversationData = conversationsResponse.data.conversations.find(
          conv => conv.status === 'open' || conv.status === 'pending'
        );
        
        if (!conversationData && conversationsResponse.data.conversations.length > 0) {
          conversationData = conversationsResponse.data.conversations[0];
        }
      }

      // 2. Si aucune conversation, en créer une nouvelle
      if (!conversationData) {
        // Récupérer un admin disponible
        let adminId = 1;
        try {
          const adminsResponse = await axios.get(`${API_URL}/messages/admins/available`, config);
          if (adminsResponse.data.success && adminsResponse.data.admins.length > 0) {
            adminId = adminsResponse.data.admins[0].id;
          }
        } catch (adminError) {
          console.warn('Utilisation admin par défaut');
        }

        const newConversationData = {
          title: `Support - ${currentUser.first_name} ${currentUser.last_name}`,
          admin_id: adminId
        };

        const createResponse = await axios.post(
          `${API_URL}/messages/conversations`,
          newConversationData,
          config
        );

        if (createResponse.data.success) {
          conversationData = createResponse.data.conversation;
        } else {
          throw new Error('Échec création');
        }
      }

      // 3. Charger les messages
      if (conversationData) {
        setConversation(conversationData);
        await loadMessages(conversationData.id);
      }

    } catch (error) {
      console.error('❌ Erreur chargement conversation:', error);
      setError(error.response?.data?.message || 'Impossible de charger le chat');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const config = getAxiosConfig();
      if (!config) return;
      
      const response = await axios.get(
        `${API_URL}/messages/conversations/${conversationId}/messages`,
        config
      );

      if (response.data.success) {
        const messagesData = response.data.messages || [];
        
        // Formater les messages
        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          sender: {
            id: msg.sender_id,
            first_name: msg.sender_id === currentUser.id ? currentUser.first_name : 'Conseiller',
            last_name: msg.sender_id === currentUser.id ? currentUser.last_name : 'Nexus'
          }
        }));
        
        setMessages(formattedMessages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
    }
  };

  const handleNewMessage = (message) => {
    if (message.conversation_id === conversation?.id) {
      setMessages(prev => {
        // Éviter les doublons
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        
        return [...prev, {
          ...message,
          sender: {
            id: message.sender_id,
            first_name: message.sender_id === currentUser.id ? currentUser.first_name : 'Conseiller',
            last_name: message.sender_id === currentUser.id ? currentUser.last_name : 'Nexus'
          }
        }];
      });
      scrollToBottom();
    }
  };

  const handleSendMessage = async () => {
    const messageContent = inputMessage.trim();
    if (!messageContent || !conversation || isSending) return;

    // Déclarer tempId à l'extérieur du try block
    let tempId;

    try {
      setIsSending(true);
      
      const config = getAxiosConfig();
      if (!config) {
        setError('Session expirée');
        navigate('/login');
        return;
      }

      // Créer ID temporaire
      tempId = `temp-${Date.now()}`;
      
      // Message temporaire
      const tempMessage = {
        id: tempId,
        content: messageContent,
        sender_id: currentUser.id,
        conversation_id: conversation.id,
        created_at: new Date().toISOString(),
        is_read: false,
        is_temp: true,
        sender: {
          id: currentUser.id,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name
        }
      };

      // Ajouter le message temporaire
      setMessages(prev => [...prev, tempMessage]);
      setInputMessage('');
      scrollToBottom();

      // Envoyer via API
      const response = await axios.post(
        `${API_URL}/messages`,
        {
          conversation_id: conversation.id,
          content: messageContent
        },
        config
      );

      console.log('📤 Réponse API envoi message:', response.data);

      if (response.data.success) {
        const realMessage = response.data.message;
        
        // Remplacer le message temporaire avec vérification sécurisée
        setMessages(prev => prev.map(msg => {
          // Vérifier si c'est le message temporaire
          if (isTempId(msg.id) && msg.id === tempId) {
            return {
              ...realMessage,
              sender: {
                id: currentUser.id,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name
              }
            };
          }
          return msg;
        }));

      } else {
        throw new Error('Échec envoi');
      }

    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      console.error('Détails erreur:', error.response?.data);
      
      // Sauvegarder tempId pour utilisation dans le catch
      const errorTempId = tempId;
      
      // Marquer le message temporaire comme erreur
      setMessages(prev => prev.map(msg => {
        if (isTempId(msg.id)) {
          const tempNum = getTempIdNumber(msg.id);
          const currentTempNum = getTempIdNumber(errorTempId);
          if (tempNum === currentTempNum) {
            return { 
              ...msg, 
              error: true,
              content: msg.content || '(Message en erreur)'
            };
          }
        }
        return msg;
      }));
      
      setError('Impossible d\'envoyer le message. Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const handleRetry = () => {
    setError(null);
    loadOrCreateConversation();
  };

  // Si non authentifié
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border dark:border-neutral-800 z-50">
        <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">Support Nexus</h3>
                <p className="text-xs opacity-90">Connectez-vous pour chatter</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Connectez-vous pour discuter avec notre équipe de support
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:opacity-90 mb-3"
          >
            Se connecter
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border dark:border-neutral-800 z-50">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">
                Support Nexus
              </h3>
              <p className="text-xs opacity-90">
                {isLoading ? 'Connexion...' : 'En ligne'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 sm:h-72 p-4 overflow-y-auto bg-gray-50 dark:bg-neutral-950">
        {error && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Réessayer
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-gray-600 dark:text-gray-400">Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun message. Commencez la conversation !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              // Vérifier que message.id existe et est valide
              const messageId = message.id || `message-${index}`;
              const isCurrentUser = message.sender_id === currentUser.id;
              
              return (
                <div
                  key={messageId}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-none border dark:border-neutral-700'
                  } ${message.error ? 'border-red-300 bg-red-50' : ''}`}>
                    <p className="text-sm">{message.content || '(Message vide)'}</p>
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      isCurrentUser ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.created_at)}</span>
                      {message.is_temp && (
                        <span className="text-xs italic">Envoi...</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={chatInputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="w-full pl-4 pr-4 py-3 rounded-xl border bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading || isSending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isSending}
            className="p-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;