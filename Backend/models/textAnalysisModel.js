const mongoose = require('mongoose');

const textAnalysisSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  session_id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['mg', 'fr', 'en'],
    default: 'mg'
  },
  category: {
    type: String,
    enum: [
      'news', 'social', 'science', 'health', 'politics',
      'education', 'economics', 'entertainment', 'sports', 'other'
    ],
    default: 'other'
  },
  reliability_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  risk_level: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'critical'],
    required: true
  },
  risk_color: {
    type: String,
    enum: ['green', 'blue', 'yellow', 'orange', 'red'],
    required: true
  },
  has_bias: {
    type: Boolean,
    default: false
  },
  bias_types: [{
    type: String,
    enum: [
      'urgence_trompeuse',
      'promesse_medicale',
      'complotisme',
      'arnaque_financiere',
      'phishing_spam',
      'hate_speech',
      'misinformation',
      'disinformation',
      'propaganda',
      'clickbait'
    ]
  }],
  warnings_found: {
    type: Number,
    default: 0
  },
  warning_patterns: [String],
  word_count: {
    type: Number,
    required: true
  },
  character_count: {
    type: Number,
    required: true
  },
  summary_malagasy: String,
  summary_french: String,
  summary_english: String,
  detailed_explanation_malagasy: String,
  detailed_explanation_french: String,
  detailed_explanation_english: String,
  fact_check_verdict: {
    type: String,
    enum: ['true', 'partially_true', 'false', 'unverified'],
    required: true
  },
  emotion_detected: {
    type: String,
    enum: [
      'neutral', 'alarm', 'fear', 'anger', 'joy',
      'sadness', 'surprise', 'trust', 'anticipation'
    ],
    default: 'neutral'
  },
  sentiment_score: {
    type: Number,
    default: 0,
    min: -1,
    max: 1
  },
  complexity_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  topics_detected: [String],
  key_phrases: [String],
  source_analysis: {
    has_source: Boolean,
    source_reliability: Number,
    source_type: String,
    source_url: String
  },
  recommendations: [String],
  model_used: {
    type: String,
    required: true
  },
  processing_time_ms: {
    type: Number,
    required: true
  },
  metadata: {
    ip_address: String,
    user_agent: String,
    device_type: String,
    browser: String,
    platform: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches
textAnalysisSchema.index({ user_id: 1, created_at: -1 });
textAnalysisSchema.index({ reliability_score: 1 });
textAnalysisSchema.index({ category: 1 });
textAnalysisSchema.index({ language: 1 });

// Méthode pour déterminer le niveau de sévérité
textAnalysisSchema.methods.getSeverityLevel = function() {
  if (this.reliability_score >= 80) return 'info';
  if (this.reliability_score >= 60) return 'low';
  if (this.reliability_score >= 40) return 'medium';
  if (this.reliability_score >= 20) return 'high';
  return 'critical';
};

// Méthode pour générer un rapport JSON
textAnalysisSchema.methods.generateReport = function(format = 'json') {
  const report = {
    id: this._id,
    content_preview: this.content.substring(0, 200) + (this.content.length > 200 ? '...' : ''),
    reliability_score: this.reliability_score,
    risk_level: this.risk_level,
    fact_check_verdict: this.fact_check_verdict,
    warnings_count: this.warnings_found,
    bias_types: this.bias_types,
    summary: {
      mg: this.summary_malagasy,
      fr: this.summary_french,
      en: this.summary_english
    },
    analysis_date: this.created_at,
    model_used: this.model_used
  };

  if (format === 'json') return report;
  if (format === 'text') {
    return `
=== RAPPORT D'ANALYSE DE TEXTE ===
ID: ${this._id}
Date: ${this.created_at.toLocaleString('fr-FR')}
Score de fiabilité: ${this.reliability_score}%
Niveau de risque: ${this.risk_level}
Verdict: ${this.fact_check_verdict}
Modèle utilisé: ${this.model_used}

Résumé:
- Malgache: ${this.summary_malagasy}
- Français: ${this.summary_french}
- Anglais: ${this.summary_english}

${this.warnings_found > 0 ? `⚠️ ${this.warnings_found} avertissement(s) détecté(s): ${this.bias_types.join(', ')}` : '✅ Aucun avertissement détecté'}
    `.trim();
  }
  return report;
};

const TextAnalysis = mongoose.model('TextAnalysis', textAnalysisSchema);
module.exports = TextAnalysis;