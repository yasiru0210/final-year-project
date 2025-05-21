const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = require('canvas');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

// Initialize face-api.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class FaceRecognitionService {
  constructor() {
    this.faceDetectionNet = faceapi.nets.ssdMobilenetv1;
    this.faceLandmarkNet = faceapi.nets.faceLandmark68Net;
    this.faceRecognitionNet = faceapi.nets.faceRecognitionNet;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const modelPath = path.join(__dirname, '../../models');
    await this.faceDetectionNet.loadFromDisk(modelPath);
    await this.faceLandmarkNet.loadFromDisk(modelPath);
    await this.faceRecognitionNet.loadFromDisk(modelPath);

    this.initialized = true;
  }

  async detectFaces(imagePath) {
    if (!this.initialized) {
      await this.initialize();
    }

    const img = await faceapi.bufferToImage(fs.readFileSync(imagePath));
    const detections = await faceapi.detectAllFaces(img);

    return detections.map(det => ({
      x: det.box.x,
      y: det.box.y,
      width: det.box.width,
      height: det.box.height
    }));
  }

  async extractFaceFeatures(imagePath) {
    if (!this.initialized) {
      await this.initialize();
    }

    const img = await faceapi.bufferToImage(fs.readFileSync(imagePath));
    const detection = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in the image');
    }

    return {
      descriptor: detection.descriptor,
      landmarks: detection.landmarks
    };
  }

  async compareFaces(descriptor1, descriptor2, weights = {}) {
    const weightedDescriptor1 = this.applyWeights(descriptor1, weights);
    const weightedDescriptor2 = this.applyWeights(descriptor2, weights);

    const distance = faceapi.euclideanDistance(weightedDescriptor1, weightedDescriptor2);
    return {
      distance,
      match: distance < 0.6,
      similarity: 1 - (distance / 0.6)
    };
  }

  applyWeights(descriptor, weights) {
    const weightedDescriptor = [...descriptor];
    const defaultWeights = {
      eyes: 1.0,
      nose: 1.0,
      mouth: 1.0,
      faceShape: 1.0,
      hair: 1.0,
      facialHair: 1.0,
      glasses: 1.0
    };

    const finalWeights = { ...defaultWeights, ...weights };

    const ranges = {
      eyes: [0, 20],
      nose: [20, 40],
      mouth: [40, 60],
      faceShape: [60, 80],
      hair: [80, 100],
      facialHair: [100, 120],
      glasses: [120, 128]
    };

    for (const [feature, [start, end]] of Object.entries(ranges)) {
      const weight = finalWeights[feature];
      for (let i = start; i < end; i++) {
        weightedDescriptor[i] *= weight;
      }
    }

    return weightedDescriptor;
  }

  async preprocessImage(imagePath) {
    const image = await Jimp.read(imagePath);
    image
      .resize(800, Jimp.AUTO) // width 800, auto height
      .normalize()
      .write(imagePath); // overwrite the original file
    return imagePath;
  }

  async findBestMatches(descriptor, database, weights = {}) {
    const matches = [];

    for (const face of database) {
      if (face.type === 'mugshot' && face.isActive) {
        const comparison = await this.compareFaces(descriptor, face.features, weights);
        if (comparison.match) {
          matches.push({
            face,
            similarity: comparison.similarity
          });
        }
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }
}

module.exports = new FaceRecognitionService(); 