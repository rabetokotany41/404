const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const shareAlertValidation = [
  body('resultId').isUUID().withMessage('ID de résultat invalide'),
  body('platform').isIn(['whatsapp', 'facebook', 'twitter', 'telegram', 'instagram', 'tiktok', 'email', 'other']).withMessage('Plateforme invalide'),
  body('shareIntent').optional().isIn(['inform', 'warn', 'ask', 'educate', 'other']).withMessage('Intention de partage invalide')
];

// @route   POST /api/share-alerts/check
// @desc    Check if sharing alert should be shown
// @access  Private
router.post('/check', protect, shareAlertValidation, async (req, res) => {
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

    const { resultId, platform, shareIntent = 'inform' } = req.body;

    // Get the check result
    const resultQuery = await pool.query(
      `SELECT
        cr.reliability_score,
        cr.risk_level,
        cr.has_bias,
        cr.summary_malagasy,
        cr.summary_french,
        cr.summary_english
      FROM check_results cr
      WHERE cr.id = $1`,
      [resultId]
    );

    if (resultQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Résultat d\'analyse non trouvé'
      });
    }

    const result = resultQuery.rows[0];

    // Determine if alert should be triggered
    let alertTriggered = false;
    let alertType = null;
    let alertMessageMalagasy = '';
    let alertMessageFrench = '';

    // Alert conditions based on reliability score and risk level
    if (result.reliability_score < 2.5) {
      alertTriggered = true;
      alertType = 'low_reliability';

      if (req.user.language_preference === 'mg') {
        alertMessageMalagasy = `⚠️ TANDREMO: Ity votoaty ity dia tsy azo itokisana loatra (naoty ${result.reliability_score}/5). Azonao zaraina ihany nefa azafady mba ampio fanazavana na fanamarinana.`;
        alertMessageFrench = `⚠️ AVERTISSEMENT: Ce contenu n'est pas très fiable (note ${result.reliability_score}/5). Vous pouvez le partager mais veuillez ajouter des explications ou des vérifications.`;
      } else {
        alertMessageFrench = `⚠️ AVERTISSEMENT: Ce contenu n'est pas très fiable (note ${result.reliability_score}/5). Vous pouvez le partager mais veuillez ajouter des explications ou des vérifications.`;
        alertMessageMalagasy = `⚠️ TANDREMO: Ity votoaty ity dia tsy azo itokisana loatra (naoty ${result.reliability_score}/5). Azonao zaraina ihany nefa azafady mba ampio fanazavana na fanamarinana.`;
      }
    } else if (result.risk_level === 'high' || result.risk_level === 'very_high') {
      alertTriggered = true;
      alertType = 'high_risk';

      if (req.user.language_preference === 'mg') {
        alertMessageMalagasy = `🚨 TANDREMO MAHASOA: Ity votoaty ity dia misy risika ambony (naoty ${result.reliability_score}/5). Tsara raha jerena alohan'ny zaraina.`;
        alertMessageFrench = `🚨 AVERTISSEMENT IMPORTANT: Ce contenu présente un risque élevé (note ${result.reliability_score}/5). Il est recommandé de le vérifier avant de le partager.`;
      } else {
        alertMessageFrench = `🚨 AVERTISSEMENT IMPORTANT: Ce contenu présente un risque élevé (note ${result.reliability_score}/5). Il est recommandé de le vérifier avant de le partager.`;
        alertMessageMalagasy = `🚨 TANDREMO MAHASOA: Ity votoaty ity dia misy risika ambony (naoty ${result.reliability_score}/5). Tsara raha jerena alohan'ny zaraina.`;
      }
    } else if (result.has_bias) {
      alertTriggered = true;
      alertType = 'bias_detected';

      if (req.user.language_preference === 'mg') {
        alertMessageMalagasy = `⚠️ TANDREMO: Ity votoaty ity dia mety misy fiheverana mangina (bias). Azonao zaraina ihany nefa azafady mba ampio loharano samihafa.`;
        alertMessageFrench = `⚠️ AVERTISSEMENT: Ce contenu peut contenir des biais. Vous pouvez le partager mais veuillez ajouter d'autres sources.`;
      } else {
        alertMessageFrench = `⚠️ AVERTISSEMENT: Ce contenu peut contenir des biais. Vous pouvez le partager mais veuillez ajouter d'autres sources.`;
        alertMessageMalagasy = `⚠️ TANDREMO: Ity votoaty ity dia mety misy fiheverana mangina (bias). Azonao zaraina ihany nefa azafady mba ampio loharano samihafa.`;
      }
    }

    // Save alert record
    await pool.query(
      `INSERT INTO share_alerts (
        result_id, user_id, platform, share_intent, alert_triggered,
        alert_type, alert_message_malagasy, alert_message_french
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        resultId, req.user.id, platform, shareIntent, alertTriggered,
        alertType, alertMessageMalagasy, alertMessageFrench
      ]
    );

    res.json({
      success: true,
      data: {
        alert_triggered: alertTriggered,
        alert_type: alertType,
        alert_message: req.user.language_preference === 'mg' ? alertMessageMalagasy : alertMessageFrench,
        reliability_score: result.reliability_score,
        risk_level: result.risk_level,
        has_bias: result.has_bias
      }
    });

  } catch (error) {
    console.error('Check share alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/share-alerts/:alertId/action
// @desc    Record user action on share alert
// @access  Private
router.post('/:alertId/action', protect, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { action, feedback } = req.body;

    const validActions = ['shared_anyway', 'modified_content', 'cancelled_share', 'saved_for_later', 'reported_content'];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action invalide'
      });
    }

    // Update alert with user action
    await pool.query(
      'UPDATE share_alerts SET user_action = $1, user_feedback = $2 WHERE id = $3 AND user_id = $4',
      [action, feedback || null, alertId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Action enregistrée avec succès'
    });

  } catch (error) {
    console.error('Record share alert action error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/share-alerts/stats
// @desc    Get user's share alert statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN alert_triggered = true THEN 1 END) as alerts_triggered,
        COUNT(CASE WHEN user_action = 'shared_anyway' THEN 1 END) as shared_anyway,
        COUNT(CASE WHEN user_action = 'cancelled_share' THEN 1 END) as cancelled_shares,
        COUNT(CASE WHEN user_action = 'modified_content' THEN 1 END) as modified_content
      FROM share_alerts
      WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: stats.rows[0]
    });

  } catch (error) {
    console.error('Get share alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;