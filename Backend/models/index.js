const mongoose = require('mongoose');

// Import des modèles
const User = require('./userModel');
const TextAnalysis = require('./textAnalysisModel');
const ImageAnalysis = require('./imageAnalysisModel');
const VideoAnalysis = require('./videoAnalysisModel');
const AnalysisHistory = require('./analysisHistoryModel');

// Connexion à MongoDB (optionnelle si vous voulez stocker les analyses)
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connecté avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
  }
};

module.exports = {
  connectDB,
  User,
  TextAnalysis,
  ImageAnalysis,
  VideoAnalysis,
  AnalysisHistory
};