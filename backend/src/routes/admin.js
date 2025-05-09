const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Face = require('../models/Face');
const { logger } = require('../utils/logger');

const router = express.Router();

router.use(auth, adminAuth);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    logger.error('Admin users list error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching users'
    });
  }
});

router.get('/faces', async (req, res) => {
  try {
    const faces = await Face.find()
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      faces
    });
  } catch (error) {
    logger.error('Admin faces list error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching faces'
    });
  }
});

router.delete('/faces/:id', async (req, res) => {
  try {
    const face = await Face.findByIdAndDelete(req.params.id);
    if (!face) {
      return res.status(404).json({
        success: false,
        error: 'Face not found'
      });
    }

    res.json({
      success: true,
      message: 'Face deleted successfully'
    });
  } catch (error) {
    logger.error('Admin face delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting face'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaces = await Face.countDocuments();
    const recentFaces = await Face.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'username');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFaces,
        recentFaces
      }
    });
  } catch (error) {
    logger.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching stats'
    });
  }
});

module.exports = router; 