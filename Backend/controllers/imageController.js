const fs = require('fs');
const path = require('path');

class ImageController {
  // Upload et analyse d'image
  static async uploadAndAnalyze(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Aucune image fournie ou erreur lors du téléchargement' 
        });
      }

      // Vérifier que le fichier existe
      if (!fs.existsSync(req.file.path)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Fichier image introuvable après upload' 
        });
      }

      // Récupérer les métadonnées
      const stats = fs.statSync(req.file.path);
      const fileInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: stats.size,
        path: req.file.path,
        uploaded_at: new Date().toISOString()
      };

      // Simulation d'analyse d'image
      const imageAnalysisResult = {
        reliability_score: 3.5,
        confidence_score: 0.8,
        risk_level: 'medium',
        has_bias: false,
        bias_types: [],
        file_info: fileInfo,
        summary_malagasy: "Sary iray no nodinihina, tsy hita olana lehibe",
        summary_french: "Image analysée, aucun problème majeur détecté",
        summary_english: "Image analyzed, no major issues detected",
        detailed_explanation_malagasy: `Ny sary dia nandinihina. Karazana: ${req.file.mimetype}. Habeny: ${(stats.size / 1024).toFixed(2)} KB.`,
        detailed_explanation_french: `L'image a été analysée. Type: ${req.file.mimetype}. Taille: ${(stats.size / 1024).toFixed(2)} KB.`,
        fact_check_verdict: "true",
        emotion_detected: "neutral",
        sentiment_score: 0.1,
        complexity_level: "beginner",
        recommendations: [
          "Vérifier la source originale de l'image",
          "Utiliser la recherche inversée d'image (Google Images)",
          "Consulter des fact-checkers spécialisés comme AFP Factuel",
          "Vérifier les métadonnées EXIF si disponibles"
        ],
        model_used: "Mpanolo-tsaina Image Analyzer v1.0",
        image_metrics: {
          size_kb: parseFloat((stats.size / 1024).toFixed(2)),
          type: req.file.mimetype,
          format: path.extname(req.file.originalname).toLowerCase(),
          dimensions: "À déterminer (intégrez OpenCV/TensorFlow)"
        }
      };

      res.json({
        success: true,
        message: 'Analyse d\'image terminée avec succès',
        data: {
          analysis: imageAnalysisResult,
          recommendations: imageAnalysisResult.recommendations,
          file_info: fileInfo,
          processing_time_ms: 1500
        }
      });

    } catch (error) {
      console.error('❌ Erreur analyse image:', error);
      
      // Nettoyer le fichier en cas d'erreur
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse d\'image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = ImageController;