const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth');

// Routes pour les notifications
router.get('/', protect, notificationController.getNotifications);
router.post('/', protect, notificationController.createNotification);
router.patch('/:notificationId/read', protect, notificationController.markAsRead);
router.patch('/read-all', protect, notificationController.markAllAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);

module.exports = router;