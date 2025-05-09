const mongoose = require('mongoose');

const featureWeightsSchema = new mongoose.Schema({
  eyes: { type: Number, default: 1.0 },
  nose: { type: Number, default: 1.0 },
  mouth: { type: Number, default: 1.0 },
  faceShape: { type: Number, default: 1.0 },
  hair: { type: Number, default: 1.0 },
  facialHair: { type: Number, default: 1.0 },
  glasses: { type: Number, default: 1.0 }
});

const faceSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mugshot', 'sketch'],
    required: true
  },
  features: {
    type: [Number],
    required: true
  },
  featureWeights: {
    type: featureWeightsSchema,
    default: () => ({})
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    age: Number,
    gender: String,
    ethnicity: String,
    hairColor: String,
    eyeColor: String,
    facialHair: String,
    glasses: Boolean
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMatched: {
    type: Date
  },
  matchCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

faceSchema.index({ features: '2dsphere' });
faceSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Face', faceSchema); 