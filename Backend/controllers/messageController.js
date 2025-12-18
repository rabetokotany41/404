const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Créer une conversation
exports.createConversation = async (req, res) => {
    try {
        const { admin_id, title } = req.body;
        const userId = req.user.id;

        console.log('📝 Création conversation pour user:', userId, 'admin:', admin_id);

        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }

        // Si l'utilisateur est admin, il ne peut pas créer de conversation
        if (user.role === 'admin') {
            return res.status(400).json({ 
                success: false, 
                message: 'Les administrateurs ne peuvent pas créer de conversations' 
            });
        }

        // Vérifier si une conversation ouverte existe déjà
        const existingConvs = await Conversation.findByUserId(userId);
        const existingOpenConv = existingConvs.find(c => c.status === 'open' || c.status === 'pending');
        
        if (existingOpenConv) {
            console.log('✅ Conversation existante trouvée:', existingOpenConv.id);
            return res.json({ 
                success: true, 
                conversation: existingOpenConv,
                message: 'Conversation existante récupérée'
            });
        }

        // Créer une nouvelle conversation
        const conversationTitle = title || `Conversation avec ${user.first_name} ${user.last_name}`;
        const conversation = await Conversation.create(userId, admin_id, conversationTitle);

        console.log('✅ Nouvelle conversation créée:', conversation.id);

        // Envoyer un message de bienvenue automatique
        let welcomeMessage = null;
        if (conversation.admin_id) {
            welcomeMessage = await Message.create(
                conversation.id,
                conversation.admin_id,
                `Bonjour ${user.first_name} ! Je suis votre conseiller. Comment puis-je vous aider ?`
            );
            await Conversation.updateLastMessage(conversation.id, welcomeMessage.content);
        } else {
            welcomeMessage = await Message.create(
                conversation.id,
                userId,
                `Bonjour ! Je souhaite contacter un conseiller.`
            );
            await Conversation.updateLastMessage(conversation.id, welcomeMessage.content);
        }

        res.status(201).json({ 
            success: true, 
            conversation,
            welcome_message: welcomeMessage,
            message: 'Conversation créée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur création conversation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de la conversation',
            error: error.message 
        });
    }
};

// Obtenir les conversations
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        console.log('📥 Récupération conversations pour:', { userId, role });

        let conversations;
        let stats = {};
        
        if (role === 'admin') {
            // Pour admin: toutes les conversations
            conversations = await Conversation.findAllForAdmins();
            stats = await Conversation.getStats(userId);
            
            // Ajouter les utilisateurs sans conversations
            const usersWithoutConvs = await Conversation.getUsersWithoutConversations(50);
            
            usersWithoutConvs.forEach(user => {
                conversations.push({
                    id: `user_${user.id}`,
                    user_id: user.id,
                    user_first_name: user.first_name,
                    user_last_name: user.last_name,
                    user_email: user.email,
                    user_avatar: user.avatar,
                    user_role: user.role,
                    user_created_at: user.created_at,
                    conversation_id: null,
                    conversation_status: 'no_conversation',
                    status: 'no_conversation',
                    title: `${user.first_name} ${user.last_name}`,
                    created_at: user.created_at,
                    updated_at: user.created_at,
                    last_message: "Pas encore de conversation",
                    last_message_time: user.created_at,
                    admin_id: null,
                    admin_first_name: null,
                    admin_last_name: null,
                    is_user_without_conversation: true,
                    unread_count: 0,
                    messages_count: 0
                });
            });
        } else {
            // Pour utilisateur normal
            conversations = await Conversation.findByUserId(userId);
        }

        // Ajouter les détails supplémentaires
        const conversationsWithDetails = await Promise.all(
            conversations.map(async conv => {
                try {
                    // Si c'est un utilisateur sans conversation
                    if (conv.is_user_without_conversation) {
                        return {
                            ...conv,
                            unread_count: 0,
                            messages_count: 0,
                            last_message_preview: "Pas encore de conversation"
                        };
                    }

                    const unreadCount = await Message.countUnread(conv.id, userId);
                    const messages = await Message.findByConversationId(conv.id);
                    const lastMessage = await Message.getConversationLastMessage(conv.id);
                    
                    return {
                        ...conv,
                        unread_count: unreadCount,
                        messages_count: messages.length,
                        last_message_preview: lastMessage ? 
                            (lastMessage.content.length > 50 ? 
                                lastMessage.content.substring(0, 47) + '...' : 
                                lastMessage.content) : 
                            "Commencez la conversation...",
                        last_message_sender: lastMessage ? 
                            `${lastMessage.sender_first_name} ${lastMessage.sender_last_name}` : 
                            null
                    };
                } catch (error) {
                    console.error(`Erreur traitement conversation ${conv.id}:`, error);
                    return {
                        ...conv,
                        unread_count: 0,
                        messages_count: 0,
                        last_message_preview: "Erreur de chargement"
                    };
                }
            })
        );

        // Trier
        conversationsWithDetails.sort((a, b) => {
            // D'abord les épinglés
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            
            // Ensuite les utilisateurs sans conversations (pour admin)
            if (a.is_user_without_conversation && !b.is_user_without_conversation) return -1;
            if (!a.is_user_without_conversation && b.is_user_without_conversation) return 1;
            
            // Puis les non assignés (pour admin)
            if (!a.admin_id && b.admin_id) return -1;
            if (a.admin_id && !b.admin_id) return 1;
            
            // Ensuite par date
            const dateA = new Date(a.updated_at || a.created_at || 0);
            const dateB = new Date(b.updated_at || b.created_at || 0);
            return dateB - dateA;
        });

        res.json({ 
            success: true, 
            conversations: conversationsWithDetails,
            stats,
            total: conversationsWithDetails.length
        });

    } catch (error) {
        console.error('❌ Erreur récupération conversations:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des conversations',
            error: error.message 
        });
    }
};

// Obtenir les messages d'une conversation
exports.getMessages = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.id;

        console.log('📨 Récupération messages conversation:', conversationId, 'user:', userId);

        // Vérifier si la conversation existe
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Conversation non trouvée' 
            });
        }

        // Vérifier les permissions
        const isParticipant = conversation.user_id === userId || 
                             conversation.admin_id === userId || 
                             req.user.role === 'admin';
        
        if (!isParticipant) {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès non autorisé à cette conversation' 
            });
        }

        // Marquer les messages comme lus (sauf si c'est l'utilisateur sans conversation)
        if (!conversation.is_user_without_conversation) {
            await Message.markAllAsRead(conversationId, userId);
        }

        // Récupérer les messages
        const messages = await Message.findByConversationId(conversationId);

        // Mettre à jour le statut de la conversation si nécessaire
        if (conversation.status === 'pending' && req.user.role === 'admin') {
            await Conversation.updateStatus(conversationId, 'open');
            conversation.status = 'open';
        }

        res.json({ 
            success: true, 
            messages,
            conversation,
            total_messages: messages.length
        });

    } catch (error) {
        console.error('❌ Erreur récupération messages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des messages',
            error: error.message 
        });
    }
};

// Envoyer un message - VERSION SIMPLIFIÉE
exports.sendMessage = async (req, res) => {
    try {
        console.log('📤 sendMessage appelé via controller');
        console.log('📦 Body:', req.body);
        console.log('👤 User:', req.user);

        const { conversation_id, content } = req.body;
        const userId = req.user.id;

        // Validation
        if (!content || !conversation_id) {
            console.log('❌ Validation échouée:', { content, conversation_id });
            return res.status(400).json({ 
                success: false, 
                message: 'Le contenu du message et l\'ID de conversation sont requis' 
            });
        }

        // Vérifier si la conversation existe
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            console.log('❌ Conversation non trouvée:', conversation_id);
            return res.status(404).json({ 
                success: false, 
                message: 'Conversation non trouvée' 
            });
        }

        // Vérifier les permissions
        const isParticipant = conversation.user_id === userId || 
                             conversation.admin_id === userId || 
                             req.user.role === 'admin';
        
        if (!isParticipant) {
            console.log('❌ Accès non autorisé:', { user: userId, conversation: conversation_id });
            return res.status(403).json({ 
                success: false, 
                message: 'Accès non autorisé à cette conversation' 
            });
        }

        console.log('✅ Validation OK, création du message...');

        // Créer le message
        const message = await Message.create(conversation_id, userId, content.trim());

        // Mettre à jour la conversation
        await Conversation.updateLastMessage(conversation_id, content.trim());
        
        // Si la conversation est en attente, l'ouvrir
        if (conversation.status === 'pending') {
            await Conversation.updateStatus(conversation_id, 'open');
            conversation.status = 'open';
        }

        console.log('✅ Message créé:', message.id);

        // Préparer la réponse
        const response = {
            success: true,
            message: message,
            conversation: {
                ...conversation,
                status: conversation.status === 'pending' ? 'open' : conversation.status
            }
        };

        console.log('📨 Réponse envoyée:', response);

        res.status(201).json(response);

    } catch (error) {
        console.error('❌ Erreur envoi message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi du message',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Obtenir le nombre de messages non lus
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        let totalUnread = 0;
        let conversations;

        if (role === 'admin') {
            conversations = await Conversation.findByAdminId(userId);
        } else {
            conversations = await Conversation.findByUserId(userId);
        }

        // Compter les messages non lus dans chaque conversation
        for (const conv of conversations) {
            if (conv.id && !conv.is_user_without_conversation) {
                const unread = await Message.countUnread(conv.id, userId);
                totalUnread += unread;
            }
        }

        res.json({ 
            success: true, 
            unread_count: totalUnread,
            conversations_count: conversations.length
        });

    } catch (error) {
        console.error('❌ Erreur compteur non lus:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors du calcul des messages non lus',
            error: error.message 
        });
    }
};

// Obtenir tous les admins
exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.getAllAdmins();
        
        const adminsWithStats = await Promise.all(
            admins.map(async admin => {
                const [conversations] = await pool.query(
                    `SELECT COUNT(*) as count FROM conversations 
                     WHERE admin_id = ? AND status IN ('pending', 'open')`,
                    [admin.id]
                );
                
                return {
                    id: admin.id,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                    email: admin.email,
                    avatar: admin.avatar,
                    is_active: admin.is_active,
                    conversation_count: conversations[0].count
                };
            })
        );
        
        res.json({
            success: true,
            admins: adminsWithStats,
            total: adminsWithStats.length
        });
    } catch (error) {
        console.error('❌ Erreur getAdmins:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des administrateurs',
            error: error.message
        });
    }
};

// Obtenir les admins disponibles
exports.getAvailableAdmins = async (req, res) => {
    try {
        const availableAdmins = await User.getAvailableAdmins();
        
        res.json({
            success: true,
            admins: availableAdmins.map(admin => ({
                id: admin.id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                avatar: admin.avatar,
                conversation_count: admin.conversation_count || 0,
                is_available: admin.is_active
            })),
            total: availableAdmins.length
        });
    } catch (error) {
        console.error('❌ Erreur getAvailableAdmins:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des administrateurs disponibles',
            error: error.message
        });
    }
};

// Marquer les messages comme lus
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { conversation_id } = req.body;
        const userId = req.user.id;

        if (!conversation_id) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID de conversation est requis'
            });
        }

        // Vérifier les permissions
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation non trouvée'
            });
        }

        const isParticipant = conversation.user_id === userId || 
                             conversation.admin_id === userId || 
                             req.user.role === 'admin';
        
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        // Marquer comme lus
        await Message.markAllAsRead(conversation_id, userId);

        res.json({
            success: true,
            message: 'Messages marqués comme lus',
            conversation_id: conversation_id
        });

    } catch (error) {
        console.error('❌ Erreur marquer comme lus:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du marquage des messages',
            error: error.message
        });
    }
};

// Assigner une conversation à un admin
exports.assignConversation = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const adminId = req.user.id;
        
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès réservé aux administrateurs'
            });
        }
        
        // Assigner la conversation
        const updatedConversation = await Conversation.assignAdmin(conversationId, adminId);
        
        res.json({
            success: true,
            message: 'Conversation assignée avec succès',
            conversation: updatedConversation
        });
        
    } catch (error) {
        console.error('❌ Erreur assignation conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'assignation de la conversation',
            error: error.message
        });
    }
};

// Récupérer les utilisateurs sans conversations
exports.getUsersWithoutConversations = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès réservé aux administrateurs'
            });
        }
        
        const users = await Conversation.getUsersWithoutConversations(50);
        
        res.json({
            success: true,
            users: users,
            count: users.length
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};

// Créer une conversation avec un utilisateur (pour admin)
exports.createConversationWithUser = async (req, res) => {
    try {
        const { user_id } = req.body;
        const adminId = req.user.id;
        
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès réservé aux administrateurs'
            });
        }
        
        // Vérifier si l'utilisateur existe
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Créer la conversation
        const conversation = await Conversation.create(user_id, adminId);
        
        // Envoyer un message de bienvenue
        const welcomeMessage = await Message.create(
            conversation.id,
            adminId,
            `Bonjour ${user.first_name} ! Je suis votre conseiller. Comment puis-je vous aider aujourd'hui ?`
        );
        
        await Conversation.updateLastMessage(conversation.id, welcomeMessage.content);
        
        res.status(201).json({
            success: true,
            conversation,
            welcome_message: welcomeMessage,
            message: 'Conversation créée avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur création conversation admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la conversation',
            error: error.message
        });
    }
};

// Mettre à jour le statut d'une conversation
exports.updateConversationStatus = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;

        // Vérifier si la conversation existe
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation non trouvée'
            });
        }

        // Vérifier les permissions
        const isParticipant = conversation.user_id === userId || 
                             conversation.admin_id === userId || 
                             req.user.role === 'admin';
        
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        // Mettre à jour le statut
        await Conversation.updateStatus(conversationId, status);
        conversation.status = status;

        res.json({
            success: true,
            message: `Statut de la conversation mis à jour: ${status}`,
            conversation
        });

    } catch (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
};