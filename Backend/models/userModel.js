const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
    default: () => require('crypto').randomUUID()
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: null
  },
  company: {
    type: String,
    default: null
  },
  position: {
    type: String,
    default: null
  },
  language_preference: {
    type: String,
    enum: ['mg', 'fr', 'en'],
    default: 'mg'
  },
  region: {
    type: String,
    default: null
  },
  education_level: {
    type: String,
    enum: ['primary', 'secondary', 'bachelor', 'master', 'phd', 'other', null],
    default: null
  },
  school_name: {
    type: String,
    default: null
  },
  user_type: {
    type: String,
    enum: ['student', 'teacher', 'researcher', 'journalist', 'professional', 'citizen'],
    default: 'citizen'
  },
  total_checks: {
    type: Number,
    default: 0
  },
  correct_guesses: {
    type: Number,
    default: 0
  },
  learning_score: {
    type: Number,
    default: 0
  },
  streak_days: {
    type: Number,
    default: 0
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  receive_alerts: {
    type: Boolean,
    default: true
  },
  share_public_data: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  last_login: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Méthode pour obtenir l'accuracy
userSchema.virtual('accuracy').get(function() {
  if (this.total_checks === 0) return 0;
  return Math.round((this.correct_guesses / this.total_checks) * 100);
});

// Méthode pour mettre à jour le score
userSchema.methods.updateScore = function(isCorrect) {
  this.total_checks += 1;
  if (isCorrect) {
    this.correct_guesses += 1;
    this.learning_score += 10;
    this.streak_days += 1;
  } else {
    this.learning_score = Math.max(0, this.learning_score - 5);
    this.streak_days = 0;
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;