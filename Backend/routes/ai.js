const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');

// Routes d'analyse IA
router.post('/analyze', AIController.analyzeText);
router.post('/generate-image', AIController.generateImage);

// Nouvelle route pour analyse simple (compatible avec le frontend)
router.post('/simple', AIController.analyzeSimple);

module.exports = router;