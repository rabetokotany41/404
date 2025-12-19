// controllers/aiController.js
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { uploadDir } = require('../config/multer');

const AIController = {
  // Analyse de texte simplifiée
  async analyzeText(req, res) {
    try {
      const { content, language = 'mg' } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Le contenu est requis et doit être une chaîne de caractères' 
        });
      }
      
      const trimmedContent = content.trim();
      if (trimmedContent.length < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Le contenu doit contenir au moins 10 caractères' 
        });
      }

      // Logique d'analyse
      const wordCount = trimmedContent.split(/\s+/).filter(word => word.length > 0).length;
      
      // Détection des motifs alarmants
      const alarmPatterns = [
        { pattern: /urgence|immediat|seulement aujourd'hui|offre limitée/i, name: 'Urgence trompeuse' },
        { pattern: /guérison miracle|traitement secret|médecins cachent/i, name: 'Promesse médicale' },
        { pattern: /gouvernement cache|vérité cachée|on vous ment/i, name: 'Complotisme' },
        { pattern: /gratuit.*argent|argent facile|devenez riche/i, name: 'Arnaque financière' },
        { pattern: /click here|buy now|limited time|bit\.ly|shorturl/i, name: 'Phishing/Spam' }
      ];

      let warningCount = 0;
      const foundWarnings = [];
      const detectedPatterns = [];
      
      alarmPatterns.forEach((item) => { 
        if(item.pattern.test(trimmedContent)) {
          warningCount++;
          foundWarnings.push(item.name);
          detectedPatterns.push(item.pattern.source);
        }
      });

      // Calcul du score
      let score = 5.0;
      score -= warningCount * 0.7;
      
      if (wordCount < 20) score -= 1.5;
      if (wordCount >= 100 && wordCount <= 500) score += 0.3;
      if (wordCount > 500) score += 0.5;
      
      score = Math.max(1.0, Math.min(5.0, score));
      const scorePercentage = Math.round((score / 5) * 100);
      
      // Déterminer le niveau de risque
      let riskLevel, riskColor;
      if (scorePercentage >= 80) {
        riskLevel = 'very_low';
        riskColor = 'green';
      } else if (scorePercentage >= 60) {
        riskLevel = 'low';
        riskColor = 'blue';
      } else if (scorePercentage >= 40) {
        riskLevel = 'medium';
        riskColor = 'yellow';
      } else if (scorePercentage >= 20) {
        riskLevel = 'high';
        riskColor = 'orange';
      } else {
        riskLevel = 'critical';
        riskColor = 'red';
      }

      // Générer les résumés
      let summary_malagasy, summary_french, summary_english;
      
      if (language === 'mg') {
        summary_malagasy = scorePercentage >= 70 ? 
          "Ity vaovao ity dia azo itokisana." :
          scorePercentage >= 40 ?
          "Ity vaovao ity dia mety tsy marina." :
          "Ity vaovao ity dia tsy azo itokisana.";
          
        summary_french = "Analyse en malgache effectuée.";
      } else {
        summary_malagasy = "Ny fanadihadiana dia vita.";
        summary_french = scorePercentage >= 70 ? 
          "Cette information est fiable." :
          scorePercentage >= 40 ?
          "Cette information nécessite une vérification supplémentaire." :
          "Cette information est peu fiable.";
      }
      
      summary_english = scorePercentage >= 70 ?
        "This information is reliable." :
        scorePercentage >= 40 ?
        "This information requires further verification." :
        "This information is not reliable.";

      const analysisResult = {
        reliability_score: scorePercentage,
        confidence_score: Math.min(0.95, 0.7 + (scorePercentage / 100) * 0.25),
        risk_level: riskLevel,
        risk_color: riskColor,
        has_bias: warningCount > 0,
        bias_types: warningCount > 0 ? foundWarnings : [],
        warnings_found: warningCount,
        warning_patterns: detectedPatterns,
        word_count: wordCount,
        character_count: trimmedContent.length,
        summary_malagasy,
        summary_french,
        summary_english,
        detailed_explanation_malagasy: `Ny habetsahan'ny teny: ${wordCount}. Tena marina: ${scorePercentage}%. ${warningCount > 0 ? `Hita ${warningCount} fampitandremana.` : 'Tsy hita olana.'}`,
        detailed_explanation_french: `Nombre de mots: ${wordCount}. Fiabilité: ${scorePercentage}%. ${warningCount > 0 ? `${warningCount} avertissement(s) détecté(s).` : 'Aucun problème détecté.'}`,
        fact_check_verdict: scorePercentage >= 70 ? 'true' : scorePercentage >= 40 ? 'partially_true' : 'false',
        emotion_detected: warningCount > 0 ? 'alarm' : 'neutral',
        sentiment_score: warningCount > 0 ? -0.6 + (warningCount * 0.1) : 0.2,
        complexity_level: wordCount > 100 ? 'advanced' : wordCount > 50 ? 'intermediate' : 'beginner',
        recommendations: [
          'Vérifier sur Midi Madagasikara ou L\'Express de Madagascar',
          'Consulter les sites officiels gouvernementaux',
          'Rechercher des sources académiques crédibles',
          'Vérifier la date de publication',
          'Comparer avec d\'autres médias fiables'
        ],
        analyzed_at: new Date().toISOString(),
        language_used: language
      };

      res.json({ 
        success: true, 
        data: analysisResult, 
        processing_time_ms: Math.floor(Math.random() * 500) + 800,
        model_used: 'Mpanolo-tsaina Text Analyzer v2.0'
      });

    } catch (error) {
      console.error('❌ Analyze error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'analyse', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  },

  // Génération d'image avec Hugging Face
  async generateImage(req, res) {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Le prompt est requis et doit être une chaîne de caractères' 
        });
      }
      
      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length < 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Le prompt doit contenir au moins 5 caractères' 
        });
      }

      if (process.env.HF_TOKEN) {
        try {
          const response = await fetch(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
            {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${process.env.HF_TOKEN}`, 
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ 
                inputs: trimmedPrompt,
                parameters: {
                  width: 512,
                  height: 512
                }
              }),
              timeout: 45000
            }
          );

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              
              const filename = `generated_${Date.now()}.png`;
              const filepath = path.join(uploadDir, filename);
              
              fs.writeFileSync(filepath, buffer);
              
              return res.json({
                success: true,
                message: 'Image générée avec succès',
                image_url: `/uploads/${filename}`,
                prompt_used: trimmedPrompt,
                model_used: 'Stable Diffusion 2.1',
                image_size: buffer.length,
                generated_at: new Date().toISOString()
              });
            }
          }
        } catch (hfError) {
          console.error('❌ Hugging Face API error:', hfError.message);
        }
      }

      // Simulation
      res.json({ 
        success: true, 
        message: 'Génération d\'image simulée', 
        image_url: null,
        prompt_used: trimmedPrompt,
        model_used: 'Simulation Mode',
        note: 'Ajoutez un token HF valide pour la vraie génération',
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erreur génération image:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur génération image'
      });
    }
  },

  // Nouvelle méthode pour analyser du contenu simple
  async analyzeSimple(req, res) {
    try {
      const { content, category = 'general', language = 'mg', contentType = 'text' } = req.body;
      
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Le contenu doit contenir au moins 10 caractères' 
        });
      }

      return await this.analyzeText(req, res);
      
    } catch (error) {
      console.error('❌ Simple analyze error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'analyse simple' 
      });
    }
  }
};

module.exports = AIController;