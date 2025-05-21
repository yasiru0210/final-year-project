const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');

async function generateTestImages() {
    try {
        // Create test-images directory if it doesn't exist
        const testImagesDir = path.join(__dirname, 'test-images');
        await fs.mkdir(testImagesDir, { recursive: true });

        // Generate a simple face sketch
        const sketch = new Jimp({ width: 400, height: 400, background: 0xffffffff });
        
        // Draw a simple face outline
        for (let x = 100; x < 300; x++) {
            for (let y = 100; y < 300; y++) {
                if (Math.pow(x - 200, 2) + Math.pow(y - 200, 2) < 10000) {
                    sketch.setPixelColor(0x000000ff, x, y);
                }
            }
        }

        // Draw eyes
        for (let x = 150; x < 180; x++) {
            for (let y = 150; y < 180; y++) {
                sketch.setPixelColor(0x000000ff, x, y);
            }
        }
        for (let x = 220; x < 250; x++) {
            for (let y = 150; y < 180; y++) {
                sketch.setPixelColor(0x000000ff, x, y);
            }
        }

        // Draw mouth
        for (let x = 180; x < 220; x++) {
            for (let y = 250; y < 270; y++) {
                sketch.setPixelColor(0x000000ff, x, y);
            }
        }

        // Save the sketch
        await writeImage(sketch, path.join(testImagesDir, 'test_sketch.jpg'));

        // Generate a variation of the sketch
        const sketch2 = sketch.clone();
        sketch2.rotate(15);
        await writeImage(sketch2, path.join(testImagesDir, 'test_sketch_rotated.jpg'));

        // Generate a darker version
        const sketch3 = sketch.clone();
        sketch3.brightness(-0.2);
        await writeImage(sketch3, path.join(testImagesDir, 'test_sketch_dark.jpg'));

        console.log('Test images generated successfully!');
    } catch (error) {
        console.error('Error generating test images:', error);
    }
}

// Promisify the write method
function writeImage(image, outPath) {
    return new Promise((resolve, reject) => {
        image.write(outPath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

generateTestImages(); 