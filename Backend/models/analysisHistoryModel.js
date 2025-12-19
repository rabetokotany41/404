const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  session_id: {
    type: String,
    required: true
  },
  analysis_type: {
    type: String,
    enum: ['text', 'image', 'video'],
    required: true
  },
  analysis_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  analysis_model: {
    type: String,
    enum: ['TextAnalysis', 'ImageAnalysis', 'VideoAnalysis'],
    required: true
  },
  content_preview: {
    type: String,
    required: true
  },
  reliability_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  risk_level: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'critical'],
    required: true
  },
  fact_check_verdict: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  language: {
    type: String,
    enum: ['mg', 'fr', 'en'],
    default: 'mg'
  },
  model_used: String,
  processing_time_ms: Number,
  metadata: {
    ip_address: String,
    user_agent: String,
    device_type: String
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

// Index pour les recherches rapides
analysisHistorySchema.index({ user_id: 1, created_at: -1 });
analysisHistorySchema.index({ analysis_type: 1, created_at: -1 });
analysisHistorySchema.index({ reliability_score: 1 });
analysisHistorySchema.index({ category: 1 });

// Hook pour nettoyer l'historique (garder les 100 dernières entrées par utilisateur)
analysisHistorySchema.pre('save', async function(next) {
  if (this.user_id) {
    const count = await mongoose.model('AnalysisHistory').countDocuments({ user_id: this.user_id });
    if (count > 100) {
      const oldest = await mongoose.model('AnalysisHistory')
        .find({ user_id: this.user_id })
        .sort({ created_at: 1 })
        .limit(count - 100);
      
      const idsToDelete = oldest.map(doc => doc._id);
      await mongoose.model('AnalysisHistory').deleteMany({ _id: { $in: idsToDelete } });
    }
  }
  next();
});

// Méthode pour obtenir les statistiques d'analyse
analysisHistorySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$analysis_type',
        count: { $sum: 1 },
        avg_score: { $avg: '$reliability_score' },
        high_risk_count: {
          $sum: {
            $cond: [
              { $in: ['$risk_level', ['high', 'critical']] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const total = await this.countDocuments({ user_id: userId });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await this.countDocuments({
    user_id: userId,
    created_at: { $gte: today }
  });

  return {
    total_analyses: total,
    analyses_today: todayCount,
    by_type: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        avg_score: Math.round(stat.avg_score || 0),
        high_risk_percentage: Math.round((stat.high_risk_count / stat.count) * 100)
      };
      return acc;
    }, {}),
    last_analysis: await this.findOne({ user_id: userId })
      .sort({ created_at: -1 })
      .select('analysis_type reliability_score created_at')
  };
};

const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema);
module.exports = AnalysisHistory;