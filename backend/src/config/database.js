const mongoose = require('mongoose');
require('dotenv').config();
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/face-recognition';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    setTimeout(() => {
      logger.info('Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

module.exports = connectDB; 