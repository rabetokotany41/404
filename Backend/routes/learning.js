const express = require('express');
const pool = require('../config/database');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/learning-modules
// @desc    Get all active learning modules
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, language = req.user.language_preference } = req.query;

    let query = `
      SELECT
        id, uuid, module_code, title_malagasy, title_french,
        description_malagasy, description_french,
        category, difficulty_level, estimated_minutes,
        video_url, image_url, total_completions, average_rating
      FROM learning_modules
      WHERE is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (difficulty) {
      query += ` AND difficulty_level = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Translate titles and descriptions based on user language
    const modules = result.rows.map(module => ({
      ...module,
      title: language === 'mg' ? module.title_malagasy : module.title_french,
      description: language === 'mg' ? module.description_malagasy : module.description_french
    }));

    res.json({
      success: true,
      data: {
        modules,
        total: modules.length
      }
    });

  } catch (error) {
    console.error('Get learning modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/learning-modules/:uuid
// @desc    Get specific learning module with content
// @access  Private
router.get('/:uuid', protect, async (req, res) => {
  try {
    const { uuid } = req.params;
    const { language = req.user.language_preference } = req.query;

    const result = await pool.query(
      `SELECT
        id, uuid, module_code, title_malagasy, title_french,
        description_malagasy, description_french,
        content_malagasy, content_french,
        category, difficulty_level, estimated_minutes,
        video_url, image_url, quiz_id, total_completions, average_rating
      FROM learning_modules
      WHERE uuid = $1 AND is_active = true`,
      [uuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module d\'apprentissage non trouvé'
      });
    }

    const module = result.rows[0];

    // Get user progress
    const progressResult = await pool.query(
      'SELECT status, progress_percentage, completed_at FROM user_learning_progress WHERE user_id = $1 AND module_id = $2',
      [req.user.id, module.id]
    );

    const progress = progressResult.rows[0] || {
      status: 'not_started',
      progress_percentage: 0,
      completed_at: null
    };

    // Translate content based on user language
    const translatedModule = {
      ...module,
      title: language === 'mg' ? module.title_malagasy : module.title_french,
      description: language === 'mg' ? module.description_malagasy : module.description_french,
      content: language === 'mg' ? module.content_malagasy : module.content_french,
      progress
    };

    res.json({
      success: true,
      data: {
        module: translatedModule
      }
    });

  } catch (error) {
    console.error('Get learning module error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/learning-modules/:uuid/start
// @desc    Start learning module
// @access  Private
router.post('/:uuid/start', protect, async (req, res) => {
  try {
    const { uuid } = req.params;

    // Get module
    const moduleResult = await pool.query(
      'SELECT id FROM learning_modules WHERE uuid = $1 AND is_active = true',
      [uuid]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module d\'apprentissage non trouvé'
      });
    }

    const moduleId = moduleResult.rows[0].id;

    // Check if progress already exists
    const existingProgress = await pool.query(
      'SELECT id, status FROM user_learning_progress WHERE user_id = $1 AND module_id = $2',
      [req.user.id, moduleId]
    );

    if (existingProgress.rows.length > 0) {
      // Update existing progress
      await pool.query(
        'UPDATE user_learning_progress SET status = $1, last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND module_id = $3',
        ['started', req.user.id, moduleId]
      );
    } else {
      // Create new progress
      await pool.query(
        'INSERT INTO user_learning_progress (user_id, module_id, status, started_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [req.user.id, moduleId, 'started']
      );
    }

    res.json({
      success: true,
      message: 'Module commencé avec succès'
    });

  } catch (error) {
    console.error('Start learning module error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   POST /api/learning-modules/:uuid/complete
// @desc    Complete learning module
// @access  Private
router.post('/:uuid/complete', protect, async (req, res) => {
  try {
    const { uuid } = req.params;
    const { quizScore } = req.body;

    // Get module
    const moduleResult = await pool.query(
      'SELECT id FROM learning_modules WHERE uuid = $1 AND is_active = true',
      [uuid]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Module d\'apprentissage non trouvé'
      });
    }

    const moduleId = moduleResult.rows[0].id;

    // Update or create progress
    await pool.query(
      `INSERT INTO user_learning_progress (
        user_id, module_id, status, progress_percentage, quiz_score, completed_at, last_accessed_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, module_id) DO UPDATE SET
        status = EXCLUDED.status,
        progress_percentage = EXCLUDED.progress_percentage,
        quiz_score = EXCLUDED.quiz_score,
        completed_at = CURRENT_TIMESTAMP,
        last_accessed_at = CURRENT_TIMESTAMP`,
      [req.user.id, moduleId, 'completed', 100, quizScore || null]
    );

    // Update module statistics
    await pool.query(
      'UPDATE learning_modules SET total_completions = total_completions + 1 WHERE id = $1',
      [moduleId]
    );

    // Update user learning score
    const userStats = await pool.query(
      'SELECT COUNT(*) as completed_modules FROM user_learning_progress WHERE user_id = $1 AND status = $2',
      [req.user.id, 'completed']
    );

    const completedCount = parseInt(userStats.rows[0].completed_modules);
    const newLearningScore = Math.min(100, completedCount * 10); // 10 points per module, max 100

    await pool.query(
      'UPDATE users SET learning_score = $1 WHERE id = $2',
      [newLearningScore, req.user.id]
    );

    res.json({
      success: true,
      message: 'Module terminé avec succès',
      data: {
        learning_score: newLearningScore
      }
    });

  } catch (error) {
    console.error('Complete learning module error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// @route   GET /api/learning-modules/progress/stats
// @desc    Get user's learning progress statistics
// @access  Private
router.get('/progress/stats', protect, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) as total_modules,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_modules,
        COUNT(CASE WHEN status = 'started' THEN 1 END) as started_modules,
        AVG(quiz_score) as avg_quiz_score,
        MAX(completed_at) as last_completion_date
      FROM user_learning_progress
      WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: stats.rows[0]
    });

  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;