const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Face = require('../models/Face');
const { logger } = require('../utils/logger');
const faceRecognitionService = require('../services/faceRecognition');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'mugshot';
    cb(null, `uploads/${type}s`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Admin uploads mugshots
router.post('/upload/mugshot', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can upload mugshots'
      });
    }

    const { description, metadata } = req.body;
    const imagePath = path.join(__dirname, '../../', req.file.path);

    await faceRecognitionService.preprocessImage(imagePath);
    const faces = await faceRecognitionService.detectFaces(imagePath);
    
    if (faces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No face detected in the image'
      });
    }

    const { descriptor } = await faceRecognitionService.extractFaceFeatures(imagePath);
    const imageUrl = `/uploads/mugshots/${req.file.filename}`;

    const face = new Face({
      imageUrl,
      type: 'mugshot',
      features: Array.from(descriptor),
      description,
      metadata: JSON.parse(metadata),
      uploadedBy: req.user.id
    });

    await face.save();

    res.status(201).json({
      success: true,
      face: {
        id: face._id,
        imageUrl: face.imageUrl,
        description: face.description,
        metadata: face.metadata
      }
    });
  } catch (error) {
    logger.error('Mugshot upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Error uploading mugshot'
    });
  }
});

// Witness uploads sketch
router.post('/upload/sketch', auth, upload.single('image'), async (req, res) => {
  try {
    const { description, metadata, featureWeights } = req.body;
    const imagePath = path.join(__dirname, '../../', req.file.path);

    await faceRecognitionService.preprocessImage(imagePath);
    const faces = await faceRecognitionService.detectFaces(imagePath);
    
    if (faces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No face detected in the sketch'
      });
    }

    const { descriptor } = await faceRecognitionService.extractFaceFeatures(imagePath);
    const imageUrl = `/uploads/sketches/${req.file.filename}`;

    const face = new Face({
      imageUrl,
      type: 'sketch',
      features: Array.from(descriptor),
      featureWeights: JSON.parse(featureWeights),
      description,
      metadata: JSON.parse(metadata),
      uploadedBy: req.user.id
    });

    await face.save();

    res.status(201).json({
      success: true,
      face: {
        id: face._id,
        imageUrl: face.imageUrl,
        description: face.description,
        metadata: face.metadata
      }
    });
  } catch (error) {
    logger.error('Sketch upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Error uploading sketch'
    });
  }
});

// Search for matches
router.post('/search', auth, async (req, res) => {
  try {
    const { sketchId } = req.body;
    const sketch = await Face.findById(sketchId);

    if (!sketch || sketch.type !== 'sketch') {
      return res.status(404).json({
        success: false,
        error: 'Sketch not found'
      });
    }

    const mugshots = await Face.find({ type: 'mugshot', isActive: true });
    const matches = await faceRecognitionService.findBestMatches(
      sketch.features,
      mugshots,
      sketch.featureWeights
    );

    // Update sketch's last matched time
    sketch.lastMatched = new Date();
    sketch.matchCount += 1;
    await sketch.save();

    res.json({
      success: true,
      matches: matches.map(match => ({
        id: match.face._id,
        imageUrl: match.face.imageUrl,
        description: match.face.description,
        metadata: match.face.metadata,
        similarity: match.similarity
      }))
    });
  } catch (error) {
    logger.error('Face search error:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching faces'
    });
  }
});

// Get sketch history
router.get('/history', auth, async (req, res) => {
  try {
    const sketches = await Face.find({
      type: 'sketch',
      uploadedBy: req.user.id
    })
    .sort({ createdAt: -1 })
    .select('imageUrl description createdAt lastMatched matchCount');

    res.json({
      success: true,
      sketches
    });
  } catch (error) {
    logger.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching history'
    });
  }
});

module.exports = router; 