const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/logout', protect, authController.logout);

module.exports = router;