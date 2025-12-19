// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');

// Appliquer l'authentification à toutes les routes
router.use(authenticate);

// Conversations
router.get('/conversations', MessageController.getConversations);
router.get('/conversations/:id', MessageController.getConversation);
router.post('/conversations', MessageController.createConversation);
router.put('/conversations/:id/read', MessageController.markAsRead);

// Messages
router.get('/conversations/:conversationId/messages', MessageController.getMessages);
router.post('/messages', MessageController.sendMessage);

// Admins
router.get('/admins/available', MessageController.getAvailableAdmins);

module.exports = router;