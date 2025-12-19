const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../config/multer');
const ImageController = require('../controllers/imageController');

// Route d'upload et analyse d'image
router.post('/image', upload.single('image'), handleMulterError, ImageController.uploadAndAnalyze);

module.exports = router;