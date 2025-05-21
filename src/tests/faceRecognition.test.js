const Jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;
const { FaceRecognitionService } = require('../services/faceRecognition');

// Initialize Jimp
Jimp.prototype.preprocessImage = async function() {
    return this
        .resize(224, 224)
        .quality(100)
        .normalize();
};

async function runTests() {
    console.log('Starting Face Recognition Tests...\n');

    try {
        // Test 1: Image Preprocessing
        console.log('Test 1: Image Preprocessing');
        const testImagePath = path.join(__dirname, 'test-images', 'test_sketch.jpg');
        const image = await Jimp.read(testImagePath);
        const preprocessedImage = await image.preprocessImage();
        
        // Verify preprocessing results
        const width = preprocessedImage.getWidth();
        const height = preprocessedImage.getHeight();
        
        if (width === 224 && height === 224) {
            console.log('✓ Image preprocessing successful');
        } else {
            throw new Error(`Image dimensions incorrect. Expected 224x224, got ${width}x${height}`);
        }

        // Test 2: Face Detection
        console.log('\nTest 2: Face Detection');
        const faceRecognition = new FaceRecognitionService();
        const detectionResult = await faceRecognition.detectFace(testImagePath);
        
        if (detectionResult.success) {
            console.log('✓ Face detection successful');
        } else {
            throw new Error('Face detection failed');
        }

        // Test 3: Feature Extraction
        console.log('\nTest 3: Feature Extraction');
        const features = await faceRecognition.extractFeatures(testImagePath);
        
        if (features && features.length > 0) {
            console.log('✓ Feature extraction successful');
        } else {
            throw new Error('Feature extraction failed');
        }

        console.log('\nAll tests completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

runTests(); 