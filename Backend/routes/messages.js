const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

console.log('🔄 routes/messages.js est en cours de chargement');

// Route pour envoyer un message
router.post('/', protect, (req, res) => {
  console.log('✅ POST /messages appelé via routes/messages.js');
  console.log('📦 Body reçu:', req.body);
  console.log('👤 User:', req.user);
  
  // Appeler le contrôleur
  return messageController.sendMessage(req, res);
});

// Routes pour les conversations
router.post('/conversations', protect, messageController.createConversation);
router.get('/conversations', protect, messageController.getConversations);
router.get('/conversations/:id/messages', protect, messageController.getMessages);
router.put('/conversations/:id/status', protect, messageController.updateConversationStatus);

// Routes pour les admins
router.get('/admins', protect, messageController.getAdmins);
router.get('/admins/available', protect, messageController.getAvailableAdmins);
router.post('/conversations/:id/assign', protect, messageController.assignConversation);
router.get('/users/without-conversations', protect, messageController.getUsersWithoutConversations);
router.post('/admin/conversations', protect, messageController.createConversationWithUser);

// Autres routes
router.get('/unread', protect, messageController.getUnreadCount);
router.post('/read', protect, messageController.markMessagesAsRead);

// Route pour épingler/désépingler une conversation
router.post('/conversations/:id/toggle-pin', protect, async (req, res) => {
  try {
    const conversationId = req.params.id;
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
    
    const isPinned = await Conversation.togglePin(conversationId);
    
    res.json({
      success: true,
      message: isPinned ? 'Conversation épinglée' : 'Conversation désépinglée',
      is_pinned: isPinned
    });
    
  } catch (error) {
    console.error('❌ Erreur togglePin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement d\'état d\'épingle',
      error: error.message
    });
  }
});

console.log('✅ Toutes les routes de messages.js sont enregistrées');

module.exports = router;