const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// -------------------- Utilisateurs -------------------- //
// Récupérer un utilisateur par son ID
router.get('/:id', protect, userController.getUserById);

// Récupérer tous les utilisateurs (admin uniquement)
router.get('/', protect, authorize('admin'), userController.getAllUsers);

// -------------------- Admins -------------------- //
// Récupérer tous les admins
router.get('/admins', protect, userController.getAllAdmins);

module.exports = router;
