const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = 'uploads/';

// Créer le dossier d'upload s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de stockage sécurisée[citation:7]
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier sécurisé et unique[citation:7]
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return cb(err);
      }
      const uniqueSuffix = buf.toString('hex');
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, uniqueSuffix + extension);
    });
  }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
};

// Middleware Multer configuré
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB[citation:3]
    files: 1
  },
  fileFilter
});

// Gestionnaire d'erreur Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 5MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur upload: ${err.message}`
    });
  }
  next(err);
};

module.exports = { upload, handleMulterError, uploadDir };