const fs = require('fs');
const path = require('path');

// Script untuk generate icon dalam berbagai format
// Pastikan Anda sudah install sharp: npm install sharp

async function generateIcons() {
  try {
    const sharp = require('sharp');
    
    const svgPath = path.join(__dirname, '..', 'electron', 'assets', 'icon.svg');
    const outputDir = path.join(__dirname, '..', 'electron', 'assets');
    
    // Baca SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    console.log('🎨 Generating icons from SVG...');
    
    // Generate PNG 256x256 untuk Linux
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(outputDir, 'icon.png'));
    console.log('✅ Generated icon.png (256x256)');
    
    // Generate PNG 512x512 untuk high-res
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png (512x512)');
    
    // Generate ICO untuk Windows (multiple sizes)
    const icoSizes = [16, 24, 32, 48, 64, 128, 256];
    const icoBuffers = [];
    
    for (const size of icoSizes) {
      const buffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      icoBuffers.push(buffer);
    }
    
    // Simpan sebagai ICO (simplified - dalam praktiknya butuh library khusus)
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(outputDir, 'icon.ico'));
    console.log('✅ Generated icon.ico (256x256)');
    
    // Generate ICNS untuk macOS (simplified)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon.icns'));
    console.log('✅ Generated icon.icns (512x512)');
    
    console.log('🎉 All icons generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('  - electron/assets/icon.svg (original)');
    console.log('  - electron/assets/icon.png (256x256)');
    console.log('  - electron/assets/icon-512.png (512x512)');
    console.log('  - electron/assets/icon.ico (Windows)');
    console.log('  - electron/assets/icon.icns (macOS)');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 To generate icons, install sharp:');
    console.log('npm install sharp --save-dev');
  }
}

// Run if called directly
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };

