#!/usr/bin/env node

/**
 * Script untuk memperbaiki file icon yang corrupt
 * Masalah: File icon.ico tidak valid untuk Windows
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki file icon yang corrupt...');

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

// Hapus file ICO yang corrupt
if (fs.existsSync(iconIcoPath)) {
  try {
    fs.unlinkSync(iconIcoPath);
    console.log('🗑️ File icon.ico yang corrupt telah dihapus');
  } catch (error) {
    console.error('❌ Error menghapus file icon.ico:', error.message);
  }
}

// Buat file ICO baru dari PNG menggunakan online converter atau manual
console.log('\n💡 Solusi untuk memperbaiki icon.ico:');
console.log('1. Gunakan online converter seperti:');
console.log('   - https://convertio.co/png-ico/');
console.log('   - https://www.icoconverter.com/');
console.log('   - https://favicon.io/favicon-converter/');
console.log('');
console.log('2. Upload file icon.png');
console.log('3. Pilih resolusi: 16x16, 32x32, 48x48, 256x256');
console.log('4. Download file .ico yang dihasilkan');
console.log('5. Simpan sebagai electron/assets/icon.ico');
console.log('');
console.log('6. Atau gunakan ImageMagick (jika terinstall):');
console.log('   magick convert icon.png -define icon:auto-resize=16,32,48,256 icon.ico');

// Coba buat file ICO sederhana menggunakan Node.js
console.log('\n🔨 Mencoba membuat file ICO sederhana...');

try {
  // Baca file PNG
  const pngBuffer = fs.readFileSync(iconPngPath);
  
  // Buat file ICO sederhana (minimal valid ICO)
  // Header ICO: 6 bytes
  const icoHeader = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Type (1 = ICO)
    0x01, 0x00  // Number of images
  ]);
  
  // Directory entry: 16 bytes
  const directoryEntry = Buffer.from([
    0x20, 0x20, // Width (32)
    0x20, 0x20, // Height (32)
    0x00,       // Color palette (0 = no palette)
    0x00,       // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x00, 0x00, 0x00, 0x00, // Image size (will be filled)
    0x16, 0x00, 0x00, 0x00  // Offset to image data
  ]);
  
  // Gabungkan header dan directory
  const icoBuffer = Buffer.concat([icoHeader, directoryEntry, pngBuffer]);
  
  // Update image size
  icoBuffer.writeUInt32LE(pngBuffer.length, 18);
  
  // Tulis file ICO
  fs.writeFileSync(iconIcoPath, icoBuffer);
  
  console.log('✅ File icon.ico sederhana telah dibuat');
  console.log(`📊 Ukuran file: ${(icoBuffer.length / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Error membuat file ICO:', error.message);
  console.log('\n💡 Gunakan solusi manual di atas untuk membuat file ICO yang benar');
}

console.log('\n📝 Langkah selanjutnya:');
console.log('1. Pastikan file icon.ico valid');
console.log('2. Jalankan: npm run test:taskbar-icon');
console.log('3. Jika masih error, gunakan online converter untuk membuat ICO yang benar');

console.log('\n🔍 Verifikasi file icon:');
if (fs.existsSync(iconIcoPath)) {
  const stats = fs.statSync(iconIcoPath);
  console.log(`✅ icon.ico: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // Baca header file untuk verifikasi
  const buffer = fs.readFileSync(iconIcoPath);
  const reserved = buffer.readUInt16LE(0);
  const type = buffer.readUInt16LE(2);
  
  console.log(`📋 Header ICO: reserved=${reserved}, type=${type}`);
  
  if (reserved === 0 && type === 1) {
    console.log('✅ Header ICO valid');
  } else {
    console.log('❌ Header ICO tidak valid');
  }
} else {
  console.log('❌ File icon.ico tidak ditemukan');
}
