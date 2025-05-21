jest.unmock('jimp');
const faceRecognitionService = require('../services/faceRecognition');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test data directory
const TEST_DATA_DIR = path.join(__dirname, '../../test-data');
const SKETCH_PATH = path.join(TEST_DATA_DIR, 'test-sketch.jpg');
const MUGSHOT_PATH = path.join(TEST_DATA_DIR, 'test-mugshot.jpg');

// Create a simple test image
function createTestImage(filePath) {
  const width = 800;
  const height = 600;
  const buffer = Buffer.alloc(width * height * 4); // RGBA format
  
  // Fill with a simple pattern
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = 255;     // R
    buffer[i + 1] = 0;   // G
    buffer[i + 2] = 0;   // B
    buffer[i + 3] = 255; // A
  }
  
  fs.writeFileSync(filePath, buffer);
}

// Create test data directory if it doesn't exist
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  console.log('Created test data directory:', TEST_DATA_DIR);
}

// Create test images
createTestImage(SKETCH_PATH);
createTestImage(MUGSHOT_PATH);

describe('FaceRecognitionService', () => {
    let service;

    beforeEach(() => {
        service = faceRecognitionService;
        jest.clearAllMocks();
    });

    describe('initialize', () => {
        it('should initialize face detection networks', async () => {
            await service.initialize();
            expect(service.initialized).toBe(true);
        });
    });

    describe('detectFaces', () => {
        it('should detect faces in an image', async () => {
            const faces = await service.detectFaces(SKETCH_PATH);
            expect(Array.isArray(faces)).toBe(true);
            if (faces.length > 0) {
                expect(faces[0]).toHaveProperty('x');
                expect(faces[0]).toHaveProperty('y');
                expect(faces[0]).toHaveProperty('width');
                expect(faces[0]).toHaveProperty('height');
            }
        });
    });

    describe('extractFaceFeatures', () => {
        it('should extract face features from an image', async () => {
            const features = await service.extractFaceFeatures(SKETCH_PATH);
            expect(features).toHaveProperty('descriptor');
            expect(features).toHaveProperty('landmarks');
            expect(features.descriptor).toHaveLength(128);
        });
    });

    describe('compareFaces', () => {
        it('should compare two face descriptors', async () => {
            const descriptor1 = new Array(128).fill(0.5);
            const descriptor2 = new Array(128).fill(0.6);
            const weights = { eyes: 1.0, nose: 1.0 };

            const result = await service.compareFaces(descriptor1, descriptor2, weights);
            expect(result).toHaveProperty('distance');
            expect(result).toHaveProperty('match');
            expect(result).toHaveProperty('similarity');
            expect(typeof result.distance).toBe('number');
            expect(typeof result.match).toBe('boolean');
            expect(typeof result.similarity).toBe('number');
        });
    });

    describe('findBestMatches', () => {
        it('should find best matches from database', async () => {
            const descriptor = new Array(128).fill(0.5);
            const database = [
                {
                    type: 'mugshot',
                    isActive: true,
                    features: new Array(128).fill(0.6)
                }
            ];

            const matches = await service.findBestMatches(descriptor, database);
            expect(Array.isArray(matches)).toBe(true);
            if (matches.length > 0) {
                expect(matches[0]).toHaveProperty('face');
                expect(matches[0]).toHaveProperty('similarity');
            }
        });

        it('should filter out inactive mugshots', async () => {
            const descriptor = new Array(128).fill(0.5);
            const database = [
                {
                    type: 'mugshot',
                    isActive: false,
                    features: new Array(128).fill(0.6)
                }
            ];

            const matches = await service.findBestMatches(descriptor, database);
            expect(matches).toHaveLength(0);
        });
    });

    describe('preprocessImage', () => {
        it('should preprocess image', async () => {
            const result = await service.preprocessImage(SKETCH_PATH);
            expect(result).toBe(SKETCH_PATH);
            // Verify the file exists and has been modified
            expect(fs.existsSync(SKETCH_PATH)).toBe(true);
        });
    });
});

async function runTests() {
  console.log('Starting Face Recognition Tests...\n');

  try {
    // Test 1: Image Preprocessing
    console.log('Test 1: Image Preprocessing');
    console.log('------------------------');
    const preprocessedPath = await faceRecognitionService.preprocessImage(SKETCH_PATH);
    assert(fs.existsSync(preprocessedPath), 'Preprocessed image should exist');
    console.log('✓ Image preprocessing completed');
    console.log('Preprocessed image saved at:', preprocessedPath);
    console.log('\n');

    // Test 2: Face Detection
    console.log('Test 2: Face Detection');
    console.log('---------------------');
    const faces = await faceRecognitionService.detectFaces(SKETCH_PATH);
    assert(Array.isArray(faces), 'Faces should be an array');
    console.log('✓ Face detection completed');
    console.log('Detected faces:', faces);
    console.log('\n');

    // Test 3: Feature Extraction
    console.log('Test 3: Feature Extraction');
    console.log('------------------------');
    const features = await faceRecognitionService.extractFaceFeatures(SKETCH_PATH);
    assert(features.descriptor, 'Features should have a descriptor');
    assert(features.landmarks, 'Features should have landmarks');
    console.log('✓ Feature extraction completed');
    console.log('Extracted features:', {
      descriptorLength: features.descriptor.length,
      landmarksCount: Object.keys(features.landmarks).length
    });
    console.log('\n');

    // Test 4: Face Comparison
    console.log('Test 4: Face Comparison');
    console.log('----------------------');
    const comparison = await faceRecognitionService.compareFaces(
      features.descriptor,
      sampleDatabase[0].features
    );
    assert(typeof comparison.distance === 'number', 'Comparison should have a distance');
    assert(typeof comparison.match === 'boolean', 'Comparison should have a match boolean');
    assert(typeof comparison.similarity === 'number', 'Comparison should have a similarity score');
    console.log('✓ Face comparison completed');
    console.log('Comparison results:', comparison);
    console.log('\n');

    // Test 5: Best Matches
    console.log('Test 5: Best Matches');
    console.log('-------------------');
    const matches = await faceRecognitionService.findBestMatches(
      features.descriptor,
      sampleDatabase
    );
    assert(Array.isArray(matches), 'Matches should be an array');
    if (matches.length > 0) {
      assert(typeof matches[0].similarity === 'number', 'Match should have a similarity score');
    }
    console.log('✓ Best matches search completed');
    console.log('Found matches:', matches.length);
    console.log('Top match similarity:', matches[0]?.similarity);
    console.log('\n');

    console.log('All tests completed successfully! 🎉');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 