const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Please authenticate' 
    });
  }
};

const adminAuth = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
};

module.exports = { auth, adminAuth }; 