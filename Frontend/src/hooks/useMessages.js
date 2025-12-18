import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer le token
  const getToken = useCallback(() => {
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
  }, []);

  // Créer instance axios
  const createAxiosInstance = useCallback(() => {
    const token = getToken();
    
    const instance = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    // Intercepteur pour les erreurs
    instance.interceptors.response.use(
      response => response,
      error => {
        console.error('❌ Erreur API:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          setError('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  }, [getToken]);

  // Récupérer les messages d'une conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      console.log('📥 fetchMessages appelé pour conversation:', conversationId);
      setLoading(true);
      setError(null);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.get(`/messages/conversations/${conversationId}/messages`);
      console.log('📨 Réponse fetchMessages:', response.data);
      
      if (response.data.success) {
        setMessages(response.data.messages || []);
        setCurrentConversation(response.data.conversation);
        return response.data.messages;
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement des messages');
      }
    } catch (err) {
      console.error('❌ Erreur fetchMessages:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des messages');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createAxiosInstance]);

  // Récupérer toutes les conversations
  const fetchConversations = useCallback(async () => {
    try {
      console.log('📥 fetchConversations appelé');
      setLoading(true);
      setError(null);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.get('/messages/conversations');
      console.log('💬 Réponse fetchConversations:', response.data);
      
      if (response.data.success) {
        setConversations(response.data.conversations || []);
        return response.data.conversations;
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement des conversations');
      }
    } catch (err) {
      console.error('❌ Erreur fetchConversations:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des conversations');
      return [];
    } finally {
      setLoading(false);
    }
  }, [createAxiosInstance]);

  // Créer ou récupérer une conversation
  const getOrCreateConversation = useCallback(async (adminId) => {
    try {
      console.log('➕ getOrCreateConversation appelé pour admin:', adminId);
      setLoading(true);
      setError(null);
      const axiosInstance = createAxiosInstance();
      
      // Vérifier d'abord les conversations existantes
      if (conversations.length > 0) {
        const existing = conversations.find(c => c.admin_id === adminId && c.status !== 'closed');
        if (existing) {
          console.log('✅ Conversation existante trouvée:', existing.id);
          await fetchMessages(existing.id);
          return existing;
        }
      }

      // Créer une nouvelle conversation
      const response = await axiosInstance.post('/messages/conversations', {
        admin_id: adminId
      });
      
      console.log('📝 Réponse création conversation:', response.data);
      
      if (response.data.success) {
        const newConv = response.data.conversation;
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversation(newConv);
        return newConv;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création de la conversation');
      }
    } catch (err) {
      console.error('❌ Erreur getOrCreateConversation:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversations, createAxiosInstance, fetchMessages]);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      console.log('📤 sendMessage appelé:', { conversationId, content });
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.post('/messages', {
        conversation_id: conversationId,
        content: content.trim()
      });
      
      console.log('✅ Réponse sendMessage:', response.data);
      
      if (response.data.success) {
        const newMessage = response.data.message || response.data.data;
        setMessages(prev => [...prev, newMessage]);
        
        // Mettre à jour la conversation dans la liste
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              last_message: content.trim(),
              last_message_time: new Date().toISOString(),
              unread_count: 0
            };
          }
          return conv;
        }));
        
        return newMessage;
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (err) {
      console.error('❌ Erreur sendMessage:', err);
      console.error('Détails erreur:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'envoi du message');
      throw err;
    }
  }, [createAxiosInstance]);

  // Récupérer les admins
  const fetchAdmins = useCallback(async () => {
    try {
      console.log('👥 fetchAdmins appelé');
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/messages/admins');
      
      console.log('✅ Réponse fetchAdmins:', response.data);
      
      return response.data.success ? response.data.admins : [];
    } catch (err) {
      console.error('❌ Erreur fetchAdmins:', err);
      return [];
    }
  }, [createAxiosInstance]);

  // Récupérer les admins disponibles
  const fetchAvailableAdmins = useCallback(async () => {
    try {
      console.log('👥 fetchAvailableAdmins appelé');
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/messages/admins/available');
      
      console.log('✅ Réponse fetchAvailableAdmins:', response.data);
      
      return response.data.success ? response.data.admins : [];
    } catch (err) {
      console.error('❌ Erreur fetchAvailableAdmins:', err);
      return [];
    }
  }, [createAxiosInstance]);

  // Marquer les messages comme lus
  const markMessagesAsRead = useCallback(async (conversationId) => {
    try {
      const axiosInstance = createAxiosInstance();
      await axiosInstance.post('/messages/read', {
        conversation_id: conversationId
      });
      
      // Mettre à jour localement
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unread_count: 0 };
        }
        return conv;
      }));
    } catch (err) {
      console.error('❌ Erreur markMessagesAsRead:', err);
    }
  }, [createAxiosInstance]);

  // Prendre une conversation non assignée
  const assignConversation = useCallback(async (conversationId) => {
    try {
      console.log('📝 assignConversation appelé:', conversationId);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.post(`/messages/conversations/${conversationId}/assign`);
      
      console.log('✅ Réponse assignConversation:', response.data);
      
      if (response.data.success) {
        // Rafraîchir les conversations
        await fetchConversations();
        return response.data.conversation;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('❌ Erreur assignConversation:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'assignation');
      throw err;
    }
  }, [createAxiosInstance, fetchConversations]);

  // Récupérer les utilisateurs sans conversations
  const fetchUsersWithoutConversations = useCallback(async () => {
    try {
      console.log('👥 fetchUsersWithoutConversations appelé');
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get('/messages/users/without-conversations');
      
      console.log('✅ Réponse fetchUsersWithoutConversations:', response.data);
      
      return response.data.success ? response.data.users : [];
    } catch (err) {
      console.error('❌ Erreur fetchUsersWithoutConversations:', err);
      return [];
    }
  }, [createAxiosInstance]);

  // Créer une conversation avec un utilisateur spécifique
  const createConversationWithUser = useCallback(async (userId) => {
    try {
      console.log('➕ createConversationWithUser appelé:', userId);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.post('/messages/admin/conversations', {
        user_id: userId
      });
      
      console.log('📝 Réponse création conversation admin:', response.data);
      
      if (response.data.success) {
        // Rafraîchir les conversations
        await fetchConversations();
        
        // Charger les messages de la nouvelle conversation
        if (response.data.conversation?.id) {
          await fetchMessages(response.data.conversation.id);
        }
        
        return response.data.conversation;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('❌ Erreur createConversationWithUser:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création');
      throw err;
    }
  }, [createAxiosInstance, fetchConversations, fetchMessages]);

  // Épingler/désépingler une conversation
  const togglePinConversation = useCallback(async (conversationId) => {
    try {
      console.log('📌 togglePinConversation appelé:', conversationId);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.post(`/messages/conversations/${conversationId}/toggle-pin`);
      
      if (response.data.success) {
        // Mettre à jour localement
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return { ...conv, is_pinned: response.data.is_pinned };
          }
          return conv;
        }));
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => ({
            ...prev,
            is_pinned: response.data.is_pinned
          }));
        }
        
        return response.data.is_pinned;
      }
      
      throw new Error(response.data.message);
    } catch (err) {
      console.error('❌ Erreur togglePinConversation:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du changement d\'état');
      throw err;
    }
  }, [createAxiosInstance, currentConversation]);

  // Mettre à jour le statut d'une conversation
  const updateConversationStatus = useCallback(async (conversationId, status) => {
    try {
      console.log('🔄 updateConversationStatus appelé:', { conversationId, status });
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.put(`/messages/conversations/${conversationId}/status`, {
        status: status
      });
      
      if (response.data.success) {
        // Mettre à jour localement
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return { ...conv, status: status };
          }
          return conv;
        }));
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => ({
            ...prev,
            status: status
          }));
        }
        
        return response.data.conversation;
      }
      
      throw new Error(response.data.message);
    } catch (err) {
      console.error('❌ Erreur updateConversationStatus:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  }, [createAxiosInstance, currentConversation]);

  // Archiver/désarchiver une conversation
  const toggleArchiveConversation = useCallback(async (conversationId) => {
    try {
      console.log('🗃️ toggleArchiveConversation appelé:', conversationId);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.post(`/messages/conversations/${conversationId}/toggle-archive`);
      
      if (response.data.success) {
        // Mettre à jour localement
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return { 
              ...conv, 
              is_archived: response.data.is_archived,
              status: response.data.is_archived ? 'archived' : 'open'
            };
          }
          return conv;
        }));
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => ({
            ...prev,
            is_archived: response.data.is_archived,
            status: response.data.is_archived ? 'archived' : 'open'
          }));
        }
        
        return response.data.is_archived;
      }
      
      throw new Error(response.data.message);
    } catch (err) {
      console.error('❌ Erreur toggleArchiveConversation:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du changement d\'état');
      throw err;
    }
  }, [createAxiosInstance, currentConversation]);

  // Rechercher des conversations
  const searchConversations = useCallback(async (searchTerm) => {
    try {
      console.log('🔍 searchConversations appelé:', searchTerm);
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.get('/messages/conversations/search', {
        params: { q: searchTerm }
      });
      
      if (response.data.success) {
        return response.data.conversations || [];
      }
      
      return [];
    } catch (err) {
      console.error('❌ Erreur searchConversations:', err);
      return [];
    }
  }, [createAxiosInstance]);

  // Obtenir les statistiques
  const getStats = useCallback(async () => {
    try {
      console.log('📊 getStats appelé');
      const axiosInstance = createAxiosInstance();
      
      const response = await axiosInstance.get('/messages/stats');
      
      if (response.data.success) {
        return response.data.stats || {};
      }
      
      return {};
    } catch (err) {
      console.error('❌ Erreur getStats:', err);
      return {};
    }
  }, [createAxiosInstance]);

  // Rafraîchir périodiquement les conversations (pour admin)
  const startAutoRefresh = useCallback((interval = 30000) => {
    const refreshInterval = setInterval(() => {
      fetchConversations();
    }, interval);
    
    return () => clearInterval(refreshInterval);
  }, [fetchConversations]);

  // Initialisation
  useEffect(() => {
    const token = getToken();
    if (token) {
      console.log('🔄 Initialisation useMessages avec token');
      fetchConversations();
    } else {
      console.log('❌ Pas de token trouvé pour useMessages');
      setError('Veuillez vous connecter pour accéder aux messages');
    }
  }, [getToken, fetchConversations]);

  return {
    // États
    conversations,
    messages,
    currentConversation,
    loading,
    error,
    
    // Setters
    setError,
    setCurrentConversation,
    setMessages,
    
    // Fonctions principales
    fetchConversations,
    fetchMessages,
    sendMessage,
    getOrCreateConversation,
    markMessagesAsRead,
    
    // Fonctions admin
    fetchAdmins,
    fetchAvailableAdmins,
    assignConversation,
    fetchUsersWithoutConversations,
    createConversationWithUser,
    togglePinConversation,
    updateConversationStatus,
    toggleArchiveConversation,
    
    // Fonctions utilitaires
    searchConversations,
    getStats,
    startAutoRefresh
  };
};

export default useMessages;