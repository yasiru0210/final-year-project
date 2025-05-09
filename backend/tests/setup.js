// Mock canvas
const { Canvas, Image, ImageData } = require('canvas');
global.Canvas = Canvas;
global.Image = Image;
global.ImageData = ImageData;

// Mock face-api.js
global.faceapi = {
    nets: {
        ssdMobilenetv1: {
            loadFromDisk: jest.fn().mockResolvedValue(true)
        },
        faceLandmark68Net: {
            loadFromDisk: jest.fn().mockResolvedValue(true)
        },
        faceRecognitionNet: {
            loadFromDisk: jest.fn().mockResolvedValue(true)
        }
    },
    detectAllFaces: jest.fn(),
    detectSingleFace: jest.fn(),
    bufferToImage: jest.fn(),
    euclideanDistance: jest.fn().mockReturnValue(0.5)
}; 