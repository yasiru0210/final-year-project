// No mocks needed - using real modules
const { Canvas, Image, ImageData } = require('canvas');
global.Canvas = Canvas;
global.Image = Image;
global.ImageData = ImageData;

// Ensure face-api.js is not mocked
jest.unmock('face-api.js');
jest.unmock('jimp');
jest.unmock('canvas'); 