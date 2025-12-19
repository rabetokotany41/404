const mongoose = require('mongoose');

const imageAnalysisSchema = new mongoose.Schema({
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
  image_metadata: {
    mimetype: String,
    size: Number,
    size_kb: Number,
    format: String,
    dimensions: {
      width: Number,
      height: Number
    },
    has_exif: Boolean,
    exif_data: Object
  },
  content_description: String,
  ocr_extracted_text: String,
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
      'photoshop',
      'deepfake',
      'face_swap',
      'object_removal',
      'color_alteration',
      'composite_image',
      'context_misalignment',
      'metadata_tampering'
    ]
  }],
  deepfake_confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  contains_text: {
    type: Boolean,
    default: false
  },
  text_analysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TextAnalysis',
    default: null
  },
  objects_detected: [{
    label: String,
    confidence: Number,
    bounding_box: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  faces_detected: {
    count: Number,
    faces: [{
      bounding_box: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      confidence: Number,
      landmarks: [{
        type: { x: Number, y: Number },
        label: String
      }]
    }]
  },
  colors_dominant: [{
    color: String,
    percentage: Number,
    hex: String
  }],
  scene_description: String,
  image_category: {
    type: String,
    enum: [
      'nature', 'people', 'object', 'document', 'meme',
      'screenshot', 'infographic', 'chart', 'map', 'other'
    ],
    default: 'other'
  },
  source_verification: {
    reverse_search_results: [{
      source: String,
      url: String,
      similarity: Number,
      title: String
    }],
    original_source_found: Boolean,
    original_source_url: String,
    publication_date: Date,
    author: String
  },
  fact_check_verdict: {
    type: String,
    enum: ['authentic', 'manipulated', 'out_of_context', 'misleading_caption', 'satire', 'unverified'],
    default: 'unverified'
  },
  summary_malagasy: String,
  summary_french: String,
  summary_english: String,
  detailed_explanation_malagasy: String,
  detailed_explanation_french: String,
  detailed_explanation_english: String,
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
imageAnalysisSchema.index({ user_id: 1, created_at: -1 });
imageAnalysisSchema.index({ reliability_score: 1 });
imageAnalysisSchema.index({ has_manipulation: 1 });
imageAnalysisSchema.index({ deepfake_confidence: 1 });

// Méthode pour vérifier si l'image est un deepfake
imageAnalysisSchema.methods.isDeepfake = function() {
  return this.deepfake_confidence > 0.7;
};

// Méthode pour obtenir les objets détectés
imageAnalysisSchema.methods.getObjectsByConfidence = function(minConfidence = 0.5) {
  return this.objects_detected.filter(obj => obj.confidence >= minConfidence);
};

// Méthode pour générer un rapport d'image
imageAnalysisSchema.methods.generateImageReport = function() {
  return {
    id: this._id,
    filename: this.filename,
    reliability_score: this.reliability_score,
    risk_level: this.risk_level,
    fact_check_verdict: this.fact_check_verdict,
    has_manipulation: this.has_manipulation,
    manipulation_types: this.manipulation_types,
    deepfake_detected: this.isDeepfake(),
    deepfake_confidence: this.deepfake_confidence,
    objects_detected_count: this.objects_detected.length,
    faces_detected_count: this.faces_detected?.count || 0,
    image_category: this.image_category,
    scene_description: this.scene_description,
    summary: {
      mg: this.summary_malagasy,
      fr: this.summary_french,
      en: this.summary_english
    },
    analysis_date: this.created_at,
    model_used: this.model_used
  };
};

const ImageAnalysis = mongoose.model('ImageAnalysis', imageAnalysisSchema);
module.exports = ImageAnalysis;