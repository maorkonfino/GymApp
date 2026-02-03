const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { input: 'public/halal1.webp', output: 'public/halal1-opt.webp', quality: 70 },
  { input: 'public/halal2.webp', output: 'public/halal2-opt.webp', quality: 70 },
  { input: 'public/halal3.webp', output: 'public/halal3-opt.webp', quality: 70 }
];

async function compressImages() {
  console.log('🔄 Compressing halal images...\n');

  for (const img of images) {
    try {
      const inputPath = path.join(__dirname, img.input);
      const outputPath = path.join(__dirname, img.output);

      const originalSize = fs.statSync(inputPath).size;

      await sharp(inputPath)
        .webp({ quality: img.quality })
        .toFile(outputPath);

      const newSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${img.input}`);
      console.log(`   Before: ${(originalSize / 1024).toFixed(0)} KB`);
      console.log(`   After: ${(newSize / 1024).toFixed(0)} KB`);
      console.log(`   Savings: ${savings}%\n`);
    } catch (error) {
      console.error(`❌ Error compressing ${img.input}:`, error.message);
    }
  }

  console.log('✨ Compression complete!');
}

compressImages();

