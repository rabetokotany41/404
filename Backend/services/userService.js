const pool = require('../config/database');
const crypto = require('crypto');

class UserService {
  // Créer un utilisateur
  async createUser(userData) {
    const {
      email,
      password_hash,
      full_name,
      phone = null,
      company = null,
      position = null,
      language_preference = 'mg',
      region = null,
      education_level = null,
      school_name = null,
      user_type = 'student'
    } = userData;

    const uuid = crypto.randomUUID();

    const [result] = await pool.query(
      `INSERT INTO users (
        uuid, email, password_hash, full_name, phone, company, position,
        language_preference, region, education_level, school_name,
        user_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid, email, password_hash, full_name, phone, company, position,
        language_preference, region, education_level, school_name, user_type
      ]
    );

    return this.findById(result.insertId);
  }

  // Trouver par ID
  async findById(id) {
    const [result] = await pool.query(
      `SELECT 
        id, uuid, email, full_name, phone, company, position,
        user_type, language_preference, education_level, school_name,
        region, total_checks, correct_guesses, learning_score,
        streak_days, email_verified, receive_alerts, share_public_data,
        theme, last_login, created_at, updated_at
      FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result[0];
  }

  // Trouver par email
  async findByEmail(email) {
    const [result] = await pool.query(
      `SELECT 
        id, uuid, email, password_hash, full_name, phone, company, position,
        user_type, language_preference, education_level, school_name,
        region, total_checks, correct_guesses, learning_score,
        streak_days, email_verified, receive_alerts, share_public_data,
        theme, last_login, created_at, updated_at
      FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );
    return result[0];
  }

  // Mettre à jour
  async update(id, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    
    await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  // Mettre à jour le score
  async updateScore(userId, isCorrect) {
    const user = await this.findById(userId);
    
    let total_checks = user.total_checks + 1;
    let correct_guesses = user.correct_guesses;
    let learning_score = user.learning_score;
    let streak_days = user.streak_days;

    if (isCorrect) {
      correct_guesses += 1;
      learning_score += 10;
      streak_days += 1;
    } else {
      learning_score = Math.max(0, learning_score - 5);
      streak_days = 0;
    }

    await this.update(userId, {
      total_checks,
      correct_guesses,
      learning_score,
      streak_days
    });

    return {
      total_checks,
      correct_guesses,
      accuracy: this.calculateAccuracy(total_checks, correct_guesses),
      learning_score,
      streak_days
    };
  }

  // Calculer l'accuracy
  calculateAccuracy(totalChecks, correctGuesses) {
    if (totalChecks === 0) return 0;
    return Math.round((correctGuesses / totalChecks) * 100);
  }
}

module.exports = new UserService();