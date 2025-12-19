const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur de la base de données
      const [result] = await pool.query(
        `SELECT 
          id, uuid, email, full_name, phone, company, position,
          user_type, language_preference, education_level, school_name,
          region, total_checks, correct_guesses, learning_score,
          streak_days, email_verified, receive_alerts, share_public_data,
          theme, last_login, created_at, updated_at
        FROM users WHERE id = ? AND deleted_at IS NULL`,
        [decoded.id]
      );

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      req.user = result[0];
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification manquant'
    });
  }
};

module.exports = { protect };