const mongoose = require('mongoose');

const videoAnalysisSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  session_id: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  original_filename: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  video_metadata: {
    mimetype: String,
    size: Number,
    size_mb: Number,
    duration: Number,
    format: String,
    dimensions: {
      width: Number,
      height: Number
    },
    frame_rate: Number,
    bit_rate: Number,
    codec: String,
    has_audio: Boolean,
    audio_codec: String
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
  has_manipulation: {
    type: Boolean,
    default: false
  },
  manipulation_types: [{
    type: String,
    enum: [
      'deepfake_video',
      'face_swap',
      'lip_sync',
      'voice_cloning',
      'scene_insertion',
      'speed_manipulation',
      'audio_tampering',
      'context_alteration'
    ]
  }],
  deepfake_confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  audio_analysis: {
    has_audio: Boolean,
    transcription: String,
    sentiment_score: Number,
    keywords: [String],
    speaker_count: Number,
    background_noise_level: Number
  },
  keyframes_analysis: [{
    timestamp: Number,
    frame_path: String,
    objects_detected: [{
      label: String,
      confidence: Number
    }],
    faces_detected: [{
      bounding_box: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      confidence: Number
    }],
    scene_description: String
  }],
  text_overlays: [{
    text: String,
    timestamp_start: Number,
    timestamp_end: Number,
    bounding_box: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    language: String
  }],
  video_category: {
    type: String,
    enum: [
      'news', 'interview', 'speech', 'documentary', 'social_media',
      'tutorial', 'entertainment', 'propaganda', 'advertisement', 'other'
    ],
    default: 'other'
  },
  source_verification: {
    original_source_found: Boolean,
    original_source_url: String,
    publication_date: Date,
    author: String,
    platform: String,
    views_count: Number,
    upload_date: Date
  },
  fact_check_verdict: {
    type: String,
    enum: ['authentic', 'manipulated', 'out_of_context', 'misleading', 'satire', 'unverified'],
    default: 'unverified'
  },
  summary_malagasy: String,
  summary_french: String,
  summary_english: String,
  detailed_explanation_malagasy: String,
  detailed_explanation_french: String,
  detailed_explanation_english: String,
  key_insights: [String],
  timeline_analysis: [{
    timestamp: Number,
    event: String,
    reliability_score: Number,
    notes: String
  }],
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
videoAnalysisSchema.index({ user_id: 1, created_at: -1 });
videoAnalysisSchema.index({ reliability_score: 1 });
videoAnalysisSchema.index({ has_manipulation: 1 });
videoAnalysisSchema.index({ video_category: 1 });

// Méthode pour vérifier si la vidéo est un deepfake
videoAnalysisSchema.methods.isDeepfake = function() {
  return this.deepfake_confidence > 0.75;
};

// Méthode pour obtenir les segments à problèmes
videoAnalysisSchema.methods.getProblematicSegments = function(minRisk = 'medium') {
  const riskLevels = {
    'very_low': 0,
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };
  
  const minRiskLevel = riskLevels[minRisk];
  
  return this.timeline_analysis.filter(segment => {
    const segmentRiskLevel = riskLevels[segment.risk_level] || 0;
    return segmentRiskLevel >= minRiskLevel;
  });
};

// Méthode pour générer un rapport vidéo
videoAnalysisSchema.methods.generateVideoReport = function() {
  return {
    id: this._id,
    filename: this.filename,
    duration: this.video_metadata.duration,
    reliability_score: this.reliability_score,
    risk_level: this.risk_level,
    fact_check_verdict: this.fact_check_verdict,
    has_manipulation: this.has_manipulation,
    manipulation_types: this.manipulation_types,
    deepfake_detected: this.isDeepfake(),
    deepfake_confidence: this.deepfake_confidence,
    keyframes_analyzed: this.keyframes_analysis.length,
    has_audio: this.audio_analysis?.has_audio || false,
    video_category: this.video_category,
    summary: {
      mg: this.summary_malagasy,
      fr: this.summary_french,
      en: this.summary_english
    },
    analysis_date: this.created_at,
    model_used: this.model_used
  };
};

const VideoAnalysis = mongoose.model('VideoAnalysis', videoAnalysisSchema);
module.exports = VideoAnalysis;