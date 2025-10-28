#!/usr/bin/env node

/**
 * Script untuk mengganti icon aplikasi dengan icon baru
 * Otomatis membuat semua format yang diperlukan
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Mengganti Icon Studio POS');
console.log('============================\n');

// Path ke folder assets
const assetsDir = path.join(__dirname, '..', 'electron', 'assets');

// Periksa apakah file icon baru ada
const newIconPath = path.join(assetsDir, 'icon-new.png');
if (!fs.existsSync(newIconPath)) {
  console.log('❌ File icon-new.png tidak ditemukan!');
  console.log('\n📝 Langkah-langkah:');
  console.log('1. Siapkan icon baru dengan resolusi 512x512 (PNG)');
  console.log('2. Simpan sebagai: electron/assets/icon-new.png');
  console.log('3. Jalankan script ini lagi: node scripts/replace-icon.js');
  console.log('\n💡 Tips:');
  console.log('- Gunakan PNG dengan transparansi');
  console.log('- Resolusi minimal 512x512 pixel');
  console.log('- Pastikan icon terlihat jelas di berbagai ukuran');
  process.exit(1);
}

console.log('✅ File icon-new.png ditemukan!');
console.log('🔄 Mengganti icon...\n');

try {
  // Backup icon lama
  const backupDir = path.join(assetsDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `icon-backup-${timestamp}`);
  fs.mkdirSync(backupPath);
  
  // Backup file icon lama
  const iconFiles = ['icon.png', 'icon.ico', 'icon.icns', 'icon.svg'];
  iconFiles.forEach(file => {
    const sourcePath = path.join(assetsDir, file);
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(backupPath, file);
      fs.copyFileSync(sourcePath, destPath);
      console.log(`📦 Backup: ${file} → backup/icon-backup-${timestamp}/${file}`);
    }
  });
  
  // Ganti icon.png dengan icon baru
  fs.copyFileSync(newIconPath, path.join(assetsDir, 'icon.png'));
  console.log('✅ icon.png telah diganti');
  
  // Buat icon.ico dari icon baru
  const pngBuffer = fs.readFileSync(newIconPath);
  
  // Buat file ICO dengan multiple resolutions
  const icoHeader = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Type (1 = ICO)
    0x06, 0x00  // Number of images (6 resolutions)
  ]);
  
  const resolutions = [
    { width: 16, height: 16, bpp: 32 },
    { width: 32, height: 32, bpp: 32 },
    { width: 48, height: 48, bpp: 32 },
    { width: 64, height: 64, bpp: 32 },
    { width: 128, height: 128, bpp: 32 },
    { width: 256, height: 256, bpp: 32 }
  ];
  
  let offset = 6 + (resolutions.length * 16);
  const directoryEntries = [];
  
  resolutions.forEach((res, index) => {
    const entry = Buffer.from([
      res.width === 256 ? 0x00 : res.width,
      res.height === 256 ? 0x00 : res.height,
      0x00,       // Color palette (0 = no palette)
      0x00,       // Reserved
      0x01, 0x00, // Color planes
      res.bpp, 0x00, // Bits per pixel
      0x00, 0x00, 0x00, 0x00, // Image size (will be filled)
      offset, 0x00, 0x00, 0x00  // Offset to image data
    ]);
    
    directoryEntries.push(entry);
    const imageSize = pngBuffer.length;
    entry.writeUInt32LE(imageSize, 8);
    offset += imageSize;
  });
  
  let icoBuffer = Buffer.concat([icoHeader, ...directoryEntries]);
  resolutions.forEach(() => {
    icoBuffer = Buffer.concat([icoBuffer, pngBuffer]);
  });
  
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer);
  console.log('✅ icon.ico telah dibuat');
  
  // Copy icon.icns (gunakan yang lama atau buat yang baru)
  const icnsPath = path.join(assetsDir, 'icon.icns');
  if (fs.existsSync(icnsPath)) {
    console.log('ℹ️ icon.icns tetap menggunakan yang lama');
    console.log('💡 Untuk macOS, gunakan online converter untuk membuat ICNS yang benar');
  }
  
  // Hapus file icon-new.png
  fs.unlinkSync(newIconPath);
  console.log('🗑️ File icon-new.png telah dihapus');
  
  console.log('\n🎯 Icon telah berhasil diganti!');
  console.log('\n📝 Langkah selanjutnya:');
  console.log('1. Build aplikasi: npm run electron:dist');
  console.log('2. Install aplikasi yang baru');
  console.log('3. Test icon di taskbar, desktop, dan start menu');
  console.log('4. Verifikasi icon tidak berubah kembali ke icon Electron default');
  
  console.log('\n💡 Tips:');
  console.log('- Jika icon tidak terlihat benar, gunakan online converter');
  console.log('- Pastikan resolusi icon sesuai dengan kebutuhan');
  console.log('- Test icon di berbagai ukuran untuk memastikan kualitas');
  
  console.log('\n🔍 File icon saat ini:');
  iconFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`   ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    }
  });
  
} catch (error) {
  console.error('❌ Error mengganti icon:', error.message);
  process.exit(1);
}

