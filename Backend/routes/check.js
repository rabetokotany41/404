const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { protect } = require('../middleware/auth');
const OpenAI = require('openai');
const crypto = require('crypto');

const router = express.Router();

// Initialize OpenAI/Bytez
const openai = new OpenAI({
  apiKey: process.env.BYTEZ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.BYTEZ_API_KEY ? 'https://api.bytez.com/v1' : 'https://api.openai.com/v1'
});

// Validation rules
const checkValidation = [
  body('content').trim().isLength({ min: 10, max: 10000 }).withMessage('Le contenu doit contenir entre 10 et 10000 caractères'),
  body('contentType').optional().isIn(['text', 'image', 'video', 'audio', 'link', 'social']).withMessage('Type de contenu invalide'),
  body('category').optional().isIn(['education', 'health', 'politics', 'economy', 'environment', 'science', 'culture', 'other']).withMessage('Catégorie invalide'),
  body('sourceUrl').optional().isURL().withMessage('URL source invalide'),
  body('sourcePlatform').optional().isLength({ max: 50 }).withMessage('Plateforme source trop longue')
];

// System prompt for Madagascar context
const SYSTEM_PROMPT = `Vous êtes Mpanolo-tsaina AI, un assistant intelligent de littératie médiatique spécialisé dans le contexte malgache.

Votre mission est d'analyser le contenu éducatif viral et d'évaluer sa fiabilité pour les étudiants malgaches.

CONTEXTE MALGACHE IMPORTANT:
- Madagascar est une île de l'océan Indien avec des défis uniques: pauvreté, accès limité à internet, prévalence de la désinformation
- Les langues principales sont le malgache, français, et anglais
- Sources fiables: Midi Madagasikara, L'Express de Madagascar, BNGRC, INSTAT, Ministère de la Santé
- Biais courants: alarmisme sur les cyclones, désinformation sur les remèdes traditionnels, fake news politiques

ANALYSE REQUISE:
1. SCORE DE FIABILITÉ (1-5): Évaluez la crédibilité globale
2. DÉTECTION DE BIAIS: Identifiez les tons alarmistes, sources non citées, framing politique
3. EXPLICATIONS MULTILINGUES: Fournissez des explications en malgache, français, et anglais
4. RECOMMANDATIONS: Suggérez des sources fiables pour vérification

RÉPONDEZ UNIQUEMENT EN FORMAT JSON avec cette structure:
{
  "reliability_score": 3.5,
  "confidence_score": 0.85,
  "risk_level": "medium",
  "has_bias": false,
  "bias_types": [],
  "summary_malagasy": "Fomba famaritana...",
  "summary_french": "Comment déterminer...",
  "summary_english": "How to determine...",
  "detailed_explanation_malagasy": "Explication détaillée...",
  "detailed_explanation_french": "Explication détaillée...",
  "fact_check_verdict": "partially_true",
  "emotion_detected": "neutral",
  "sentiment_score": 0.2,
  "complexity_level": "intermediate",
  "recommendations": ["Vérifier sur le site officiel", "Consulter des experts"]
}`;

// @route   POST /api/check
// @desc    Check content reliability using AI
// @access  Public (modifier en Private si besoin)
router.post('/', checkValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const {
      content,
      contentType = 'text',
      category = 'other',
      sourceUrl,
      sourcePlatform,
      authorName,
      authorUsername,
      contextMalagasy,
      contextFrench,
      language = 'mg'
    } = req.body;

    // Generate content hash for deduplication
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');

    // Check cache first
    const [cacheResult] = await pool.query(
      'SELECT * FROM content_cache WHERE cache_key = ? AND expires_at > NOW()',
      [contentHash]
    );

    if (cacheResult.length > 0) {
      const cachedData = JSON.parse(cacheResult[0].result_data);

      // Update cache access
      await pool.query(
        'UPDATE content_cache SET last_accessed_at = NOW(), access_count = access_count + 1 WHERE cache_key = ?',
        [contentHash]
      );

      return res.json({
        success: true,
        message: 'Résultat en cache',
        data: {
          ...cachedData,
          cached: true
        }
      });
    }

    // Create check request record (sans user_id pour l'instant)
    const [requestResult] = await pool.query(
      `INSERT INTO check_requests (
        content, content_hash, content_type, source_url, source_platform,
        author_name, author_username, category, context_malagasy, context_french, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        content, contentHash, contentType, sourceUrl, sourcePlatform,
        authorName, authorUsername, category, contextMalagasy, contextFrench, 'processing'
      ]
    );

    const requestId = requestResult.insertId;

    try {
      // Call OpenAI API
      const startTime = Date.now();
      
      // Si vous n'avez pas d'API Key, utilisez une simulation
      let aiResponse;
      if (process.env.BYTEZ_API_KEY || process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Analysez ce contenu: "${content}"\n\nContexte: ${contextMalagasy || contextFrench || 'Contenu éducatif malgache'}` }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });
        aiResponse = completion.choices[0].message.content;
      } else {
        // Simulation locale
        aiResponse = JSON.stringify({
          reliability_score: 3.0,
          confidence_score: 0.5,
          risk_level: 'medium',
          has_bias: false,
          bias_types: [],
          summary_malagasy: "Tsy voamarina tsara ny fahamarinan'ity votoaty ity",
          summary_french: "La fiabilité de ce contenu n'est pas bien établie",
          summary_english: "The reliability of this content is not well established",
          detailed_explanation_malagasy: "Mila fanamarinana fanampiny",
          detailed_explanation_french: "Nécessite une vérification supplémentaire",
          fact_check_verdict: "insufficient_info",
          emotion_detected: "neutral",
          sentiment_score: 0.0,
          complexity_level: "intermediate",
          recommendations: ["Vérifier les sources officielles"]
        });
      }

      const processingTime = Date.now() - startTime;

      // Parse AI response
      let analysisResult;
      try {
        analysisResult = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('AI response parsing error:', parseError);
        // Fallback analysis
        analysisResult = {
          reliability_score: 3.0,
          confidence_score: 0.5,
          risk_level: 'medium',
          has_bias: false,
          bias_types: [],
          summary_malagasy: "Tsy voamarina tsara ny fahamarinan'ity votoaty ity",
          summary_french: "La fiabilité de ce contenu n'est pas bien établie",
          summary_english: "The reliability of this content is not well established",
          detailed_explanation_malagasy: "Mila fanamarinana fanampiny",
          detailed_explanation_french: "Nécessite une vérification supplémentaire",
          fact_check_verdict: "insufficient_info",
          emotion_detected: "neutral",
          sentiment_score: 0.0,
          complexity_level: "intermediate",
          recommendations: ["Vérifier les sources officielles"]
        };
      }

      // Save analysis results
      const [resultInsert] = await pool.query(
        `INSERT INTO check_results (
          request_id, reliability_score, confidence_score, risk_level, has_bias,
          summary_malagasy, summary_french, summary_english,
          detailed_explanation_malagasy, detailed_explanation_french,
          fact_check_verdict, emotion_detected, sentiment_score, complexity_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId, analysisResult.reliability_score, analysisResult.confidence_score,
          analysisResult.risk_level, analysisResult.has_bias,
          analysisResult.summary_malagasy, analysisResult.summary_french, analysisResult.summary_english,
          analysisResult.detailed_explanation_malagasy, analysisResult.detailed_explanation_french,
          analysisResult.fact_check_verdict, analysisResult.emotion_detected,
          analysisResult.sentiment_score, analysisResult.complexity_level
        ]
      );

      const resultId = resultInsert.insertId;

      // Save detected biases if any
      if (analysisResult.bias_types && analysisResult.bias_types.length > 0) {
        for (const biasType of analysisResult.bias_types) {
          await pool.query(
            'INSERT INTO detected_biases (result_id, bias_type, confidence) VALUES (?, ?, ?)',
            [resultId, biasType, 0.8]
          );
        }
      }

      // Update request status
      await pool.query(
        'UPDATE check_requests SET status = ?, analyzed_at = NOW(), ai_model_used = ?, processing_time_ms = ? WHERE id = ?',
        ['completed', 'ai-model', processingTime, requestId]
      );

      // Cache the result
      const cacheData = {
        request_id: requestId,
        result_id: resultId,
        analysis: analysisResult,
        recommendations: analysisResult.recommendations || [],
        created_at: new Date().toISOString()
      };

      // Calculate expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await pool.query(
        `INSERT INTO content_cache (cache_key, content_hash, result_data, content_type, category, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           result_data = VALUES(result_data),
           last_accessed_at = NOW(),
           access_count = access_count + 1`,
        [contentHash, contentHash, JSON.stringify(cacheData), contentType, category, expiresAt]
      );

      res.json({
        success: true,
        message: 'Analyse terminée avec succès',
        data: {
          request_id: requestId,
          result_id: resultId,
          analysis: analysisResult,
          recommendations: analysisResult.recommendations || [],
          processing_time_ms: processingTime,
          cached: false
        }
      });

    } catch (aiError) {
      console.error('AI API error:', aiError);

      // Update request status to failed
      await pool.query(
        'UPDATE check_requests SET status = ? WHERE id = ?',
        ['failed', requestId]
      );

      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse IA',
        error: process.env.NODE_ENV === 'development' ? aiError.message : undefined
      });
    }

  } catch (error) {
    console.error('Check content error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'analyse du contenu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Version simple sans IA (pour test)
router.post('/simple', async (req, res) => {
  try {
    const { content, category = 'general', language = 'mg' } = req.body;
    
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu doit contenir au moins 10 caractères'
      });
    }

    // Analyse simple (simulation IA)
    const length = content.length;
    const wordCount = content.split(/\s+/).length;
    
    // Détecter des motifs courants
    const hasWarning = /urgence|immediat|seulement aujourd'hui|offre limitée|guérison miracle|traitement secret|gratuit.*argent|argent facile|devenez riche/i.test(content);
    const hasPolitical = /politique|gouvernement|président|ministre/i.test(content);
    const hasHealth = /santé|maladie|traitement|vaccin|médecin/i.test(content);
    
    // Calculer le score
    let score = 5.0;
    if (hasWarning) score -= 1.5;
    if (hasPolitical) score -= 0.5;
    if (wordCount < 50) score -= 0.5;
    
    score = Math.max(1.0, Math.min(5.0, score));
    
    // Déterminer le niveau de risque
    let riskLevel = 'medium';
    if (score <= 2.0) riskLevel = 'high';
    else if (score <= 3.0) riskLevel = 'medium';
    else riskLevel = 'low';
    
    // Générer les résumés
    const summary_malagasy = `Ny fanadihadiana dia naneho fa ity vaovao ity dia ${
      score >= 4.0 ? 'azo itokisana' : 
      score >= 3.0 ? 'mety tsy marina' : 
      'tsy azo itokisana'
    }.`;
    
    const summary_french = `Cette information est ${
      score >= 4.0 ? 'fiable' : 
      score >= 3.0 ? 'potentiellement trompeuse' : 
      'peu fiable'
    }.`;
    
    // Détecter les biais
    const bias_types = [];
    if (hasWarning) bias_types.push('alarmist');
    if (hasPolitical) bias_types.push('political');
    if (/gratuit|promo|offre/i.test(content)) bias_types.push('commercial');
    
    const analysisResult = {
      reliability_score: score,
      confidence_score: 0.75,
      risk_level: riskLevel,
      has_bias: bias_types.length > 0,
      bias_types: bias_types,
      summary_malagasy,
      summary_french,
      summary_english: `Analysis shows this information is ${score >= 4.0 ? 'reliable' : 'not reliable'}.`,
      detailed_explanation_malagasy: `Ny habetsahan'ny teny: ${wordCount}. Tena marina: ${score}/5.`,
      detailed_explanation_french: `Nombre de mots: ${wordCount}. Fiabilité: ${score}/5.`,
      fact_check_verdict: score >= 4.0 ? 'true' : score >= 3.0 ? 'partially_true' : 'false',
      emotion_detected: hasWarning ? 'alarm' : 'neutral',
      sentiment_score: hasWarning ? -0.3 : 0.1,
      complexity_level: wordCount > 100 ? 'advanced' : wordCount > 50 ? 'intermediate' : 'beginner',
      recommendations: [
        'Vérifier sur les sites officiels',
        'Consulter plusieurs sources médiatiques',
        'Rechercher des experts sur le sujet'
      ]
    };

    res.json({
      success: true,
      message: 'Analyse terminée',
      data: {
        analysis: analysisResult,
        recommendations: analysisResult.recommendations,
        processing_time_ms: 800,
        cached: false
      }
    });

  } catch (error) {
    console.error('Simple check error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/check/history
// @desc    Get user's check history
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [results] = await pool.query(
      `SELECT
        cr.uuid as request_id,
        LEFT(cr.content, 200) as content_preview,
        cr.content_type,
        cr.category,
        cr.created_at,
        cr.analyzed_at,
        cres.reliability_score,
        cres.risk_level,
        cres.summary_malagasy,
        cres.summary_french,
        cres.summary_english
      FROM check_requests cr
      LEFT JOIN check_results cres ON cr.id = cres.request_id
      WHERE cr.status = 'completed'
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Compter le total
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM check_requests WHERE status = "completed"');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        checks: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get check history error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/check/stats
// @desc    Get checking statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT
        COUNT(*) as total_checks,
        AVG(cres.reliability_score) as avg_reliability,
        COUNT(CASE WHEN cres.risk_level = 'high' THEN 1 END) as high_risk_checks,
        COUNT(CASE WHEN cres.has_bias = true THEN 1 END) as biased_content_found,
        MAX(cr.created_at) as last_check_date
      FROM check_requests cr
      LEFT JOIN check_results cres ON cr.id = cres.request_id
      WHERE cr.status = 'completed'`
    );

    res.json({
      success: true,
      data: stats[0] || {
        total_checks: 0,
        avg_reliability: 0,
        high_risk_checks: 0,
        biased_content_found: 0,
        last_check_date: null
      }
    });

  } catch (error) {
    console.error('Get check stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;