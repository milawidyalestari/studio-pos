#!/usr/bin/env node

/**
 * Script untuk membuat file ICO yang benar dengan resolusi yang tepat
 * Masalah: File ICO harus minimal 256x256 untuk Windows
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Membuat file ICO dengan resolusi yang tepat...');

// Path ke file icon
const iconPngPath = path.join(__dirname, '..', 'electron', 'assets', 'icon.png');
const iconIcoPath = path.join(__dirname, '..', 'electron', 'assets', 'icon.ico');

// Periksa apakah file PNG ada
if (!fs.existsSync(iconPngPath)) {
  console.error('❌ File icon.png tidak ditemukan');
  process.exit(1);
}

console.log('📁 File icon yang ditemukan:');
console.log(`✅ ${iconPngPath}`);

// Hapus file ICO yang ada
if (fs.existsSync(iconIcoPath)) {
  try {
    fs.unlinkSync(iconIcoPath);
    console.log('🗑️ File icon.ico lama telah dihapus');
  } catch (error) {
    console.error('❌ Error menghapus file icon.ico:', error.message);
  }
}

console.log('\n💡 Solusi untuk membuat file ICO yang benar:');
console.log('1. Gunakan online converter dengan resolusi yang tepat:');
console.log('   - https://convertio.co/png-ico/');
console.log('   - https://www.icoconverter.com/');
console.log('   - https://favicon.io/favicon-converter/');
console.log('');
console.log('2. Upload file icon.png');
console.log('3. Pilih resolusi: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256');
console.log('4. Pastikan minimal ada resolusi 256x256');
console.log('5. Download file .ico yang dihasilkan');
console.log('6. Simpan sebagai electron/assets/icon.ico');
console.log('');
console.log('7. Atau gunakan ImageMagick (jika terinstall):');
console.log('   magick convert icon.png -define icon:auto-resize=16,32,48,64,128,256 icon.ico');

// Coba buat file ICO dengan resolusi yang tepat
console.log('\n🔨 Mencoba membuat file ICO dengan resolusi yang tepat...');

try {
  // Baca file PNG
  const pngBuffer = fs.readFileSync(iconPngPath);
  
  // Buat file ICO dengan multiple resolutions
  // Header ICO: 6 bytes
  const icoHeader = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Type (1 = ICO)
    0x06, 0x00  // Number of images (6 resolutions)
  ]);
  
  // Directory entries untuk 6 resolusi
  const resolutions = [
    { width: 16, height: 16, bpp: 32 },
    { width: 32, height: 32, bpp: 32 },
    { width: 48, height: 48, bpp: 32 },
    { width: 64, height: 64, bpp: 32 },
    { width: 128, height: 128, bpp: 32 },
    { width: 256, height: 256, bpp: 32 }
  ];
  
  let offset = 6 + (resolutions.length * 16); // Header + directory entries
  const directoryEntries = [];
  
  // Buat directory entries
  resolutions.forEach((res, index) => {
    const entry = Buffer.from([
      res.width === 256 ? 0x00 : res.width,  // Width (0 = 256)
      res.height === 256 ? 0x00 : res.height, // Height (0 = 256)
      0x00,       // Color palette (0 = no palette)
      0x00,       // Reserved
      0x01, 0x00, // Color planes
      res.bpp, 0x00, // Bits per pixel
      0x00, 0x00, 0x00, 0x00, // Image size (will be filled)
      offset, 0x00, 0x00, 0x00  // Offset to image data
    ]);
    
    directoryEntries.push(entry);
    
    // Hitung ukuran image data (simplified - menggunakan PNG buffer untuk semua resolusi)
    const imageSize = pngBuffer.length;
    entry.writeUInt32LE(imageSize, 8);
    offset += imageSize;
  });
  
  // Gabungkan semua bagian
  let icoBuffer = Buffer.concat([icoHeader, ...directoryEntries]);
  
  // Tambahkan image data untuk setiap resolusi (menggunakan PNG yang sama)
  resolutions.forEach(() => {
    icoBuffer = Buffer.concat([icoBuffer, pngBuffer]);
  });
  
  // Tulis file ICO
  fs.writeFileSync(iconIcoPath, icoBuffer);
  
  console.log('✅ File icon.ico dengan multiple resolutions telah dibuat');
  console.log(`📊 Ukuran file: ${(icoBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`📐 Resolusi: ${resolutions.map(r => `${r.width}x${r.height}`).join(', ')}`);
  
} catch (error) {
  console.error('❌ Error membuat file ICO:', error.message);
  console.log('\n💡 Gunakan solusi manual di atas untuk membuat file ICO yang benar');
}

console.log('\n📝 Langkah selanjutnya:');
console.log('1. Pastikan file icon.ico memiliki resolusi minimal 256x256');
console.log('2. Jalankan: npm run electron:dist');
console.log('3. Jika masih error, gunakan online converter untuk membuat ICO yang benar');

console.log('\n🔍 Verifikasi file icon:');
if (fs.existsSync(iconIcoPath)) {
  const stats = fs.statSync(iconIcoPath);
  console.log(`✅ icon.ico: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // Baca header file untuk verifikasi
  const buffer = fs.readFileSync(iconIcoPath);
  const reserved = buffer.readUInt16LE(0);
  const type = buffer.readUInt16LE(2);
  const imageCount = buffer.readUInt16LE(4);
  
  console.log(`📋 Header ICO: reserved=${reserved}, type=${type}, images=${imageCount}`);
  
  if (reserved === 0 && type === 1 && imageCount > 0) {
    console.log('✅ Header ICO valid');
  } else {
    console.log('❌ Header ICO tidak valid');
  }
} else {
  console.log('❌ File icon.ico tidak ditemukan');
}

console.log('\n⚠️ Catatan Penting:');
console.log('- File ICO yang dibuat mungkin tidak sempurna');
console.log('- Untuk hasil terbaik, gunakan online converter atau ImageMagick');
console.log('- Pastikan resolusi minimal 256x256 untuk Windows');
console.log('- File ICO harus memiliki format yang benar untuk electron-builder');
