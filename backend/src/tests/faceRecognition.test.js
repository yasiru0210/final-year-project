const faceRecognitionService = require('../services/faceRecognition');
const fs = require('fs');
const path = require('path');

// Mock the required modules
jest.mock('face-api.js');
jest.mock('canvas');
jest.mock('sharp');
jest.mock('fs');

describe('FaceRecognitionService', () => {
    let service;

    beforeEach(() => {
        service = new faceRecognitionService();
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('initialize', () => {
        it('should initialize face detection networks', async () => {
            await service.initialize();
            expect(service.faceDetectionNet.loadFromDisk).toHaveBeenCalled();
            expect(service.faceLandmarkNet.loadFromDisk).toHaveBeenCalled();
            expect(service.faceRecognitionNet.loadFromDisk).toHaveBeenCalled();
        });

        it('should set initialized flag to true after successful initialization', async () => {
            await service.initialize();
            expect(service.initialized).toBe(true);
        });
    });

    describe('detectFaces', () => {
        it('should detect faces in an image', async () => {
            const mockImagePath = 'test.jpg';
            const mockDetections = [{ box: { x: 0, y: 0, width: 100, height: 100 } }];
            
            faceapi.bufferToImage.mockResolvedValue('mockImage');
            faceapi.detectAllFaces.mockResolvedValue(mockDetections);
            
            const detections = await service.detectFaces(mockImagePath);
            
            expect(detections).toHaveLength(1);
            expect(detections[0]).toEqual({
                x: 0,
                y: 0,
                width: 100,
                height: 100
            });
        });

        it('should throw error if image cannot be read', async () => {
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File not found');
            });

            await expect(service.detectFaces('nonexistent.jpg'))
                .rejects
                .toThrow('File not found');
        });
    });

    describe('extractFaceFeatures', () => {
        it('should extract face features from an image', async () => {
            const mockImagePath = 'test.jpg';
            const mockDescriptor = new Array(128).fill(0);
            const mockLandmarks = { positions: [] };

            faceapi.bufferToImage.mockResolvedValue('mockImage');
            faceapi.detectSingleFace.mockReturnValue({
                withFaceLandmarks: jest.fn().mockReturnThis(),
                withFaceDescriptor: jest.fn().mockResolvedValue({
                    descriptor: mockDescriptor,
                    landmarks: mockLandmarks
                })
            });

            const features = await service.extractFaceFeatures(mockImagePath);
            
            expect(features).toHaveProperty('descriptor');
            expect(features).toHaveProperty('landmarks');
            expect(features.descriptor).toEqual(mockDescriptor);
        });

        it('should throw error if no face is detected', async () => {
            faceapi.detectSingleFace.mockReturnValue({
                withFaceLandmarks: jest.fn().mockReturnThis(),
                withFaceDescriptor: jest.fn().mockResolvedValue(null)
            });

            await expect(service.extractFaceFeatures('no_face.jpg'))
                .rejects
                .toThrow('No face detected in the image');
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

        it('should handle different weights for face features', async () => {
            const descriptor = new Array(128).fill(0.5);
            const weights = { eyes: 2.0, nose: 0.5 };

            const result = await service.compareFaces(descriptor, descriptor, weights);
            
            expect(result.distance).toBeLessThan(0.6); // Should be a match
            expect(result.match).toBe(true);
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
                },
                {
                    type: 'mugshot',
                    isActive: true,
                    features: new Array(128).fill(0.4)
                }
            ];
            const weights = { eyes: 1.0 };

            const matches = await service.findBestMatches(descriptor, database, weights);
            
            expect(matches).toHaveLength(2);
            expect(matches[0].similarity).toBeGreaterThanOrEqual(matches[1].similarity);
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
        it('should preprocess image using sharp', async () => {
            const mockImagePath = 'test.jpg';
            const mockProcessedPath = 'test.jpg_processed';

            sharp.mockImplementation(() => ({
                resize: jest.fn().mockReturnThis(),
                normalize: jest.fn().mockReturnThis(),
                toFile: jest.fn().mockResolvedValue(true)
            }));

            fs.renameSync.mockImplementation(() => {});

            await service.preprocessImage(mockImagePath);
            
            expect(sharp).toHaveBeenCalledWith(mockImagePath);
            expect(fs.renameSync).toHaveBeenCalledWith(mockProcessedPath, mockImagePath);
        });
    });
}); 