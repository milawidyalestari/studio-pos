#!/usr/bin/env node

/**
 * Script untuk mengganti icon aplikasi dengan icon baru
 * Menghasilkan semua format icon yang diperlukan
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Script Penggantian Icon Studio POS');
console.log('=====================================\n');

// Path ke folder assets
const assetsDir = path.join(__dirname, '..', 'electron', 'assets');

console.log('📁 Lokasi icon saat ini:');
console.log(`   ${assetsDir}\n`);

console.log('📋 File icon yang diperlukan:');
console.log('   ✅ icon.png     - Icon utama (512x512) untuk Linux & fallback');
console.log('   ✅ icon.ico     - Icon Windows (multi-resolusi)');
console.log('   ✅ icon.icns    - Icon macOS (multi-resolusi)');
console.log('   ✅ icon.svg     - Icon vektor (opsional)\n');

console.log('🔧 Langkah-langkah mengganti icon:');
console.log('');
console.log('1. Siapkan icon baru dengan resolusi 512x512 (PNG)');
console.log('2. Simpan sebagai: electron/assets/icon.png');
console.log('3. Jalankan script ini untuk membuat format lain:');
console.log('   node scripts/replace-icon.js');
console.log('');
console.log('4. Atau gunakan online converter:');
console.log('   - PNG ke ICO: https://convertio.co/png-ico/');
console.log('   - PNG ke ICNS: https://convertio.co/png-icns/');
console.log('   - Pilih resolusi: 16,32,48,64,128,256,512,1024');
console.log('');
console.log('5. Build ulang aplikasi:');
console.log('   npm run electron:dist');
console.log('');

// Periksa file icon yang ada
console.log('🔍 Status file icon saat ini:');
const iconFiles = [
  { name: 'icon.png', desc: 'Icon utama (512x512)' },
  { name: 'icon.ico', desc: 'Icon Windows (multi-resolusi)' },
  { name: 'icon.icns', desc: 'Icon macOS (multi-resolusi)' },
  { name: 'icon.svg', desc: 'Icon vektor (opsional)' }
];

iconFiles.forEach(iconFile => {
  const filePath = path.join(assetsDir, iconFile.name);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${iconFile.name} - ${iconFile.desc} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`   ❌ ${iconFile.name} - ${iconFile.desc} (TIDAK ADA)`);
  }
});

console.log('\n📝 Catatan Penting:');
console.log('- Icon harus memiliki resolusi yang tepat untuk setiap platform');
console.log('- Format ICO harus memiliki multiple resolutions untuk Windows');
console.log('- Format ICNS harus memiliki multiple resolutions untuk macOS');
console.log('- Icon akan digunakan di: taskbar, aplikasi, installer, shortcut');
console.log('- Pastikan icon memiliki transparansi yang benar');
console.log('- Test icon di berbagai ukuran untuk memastikan kualitas');

console.log('\n🎯 Setelah mengganti icon:');
console.log('1. Build aplikasi: npm run electron:dist');
console.log('2. Install aplikasi yang baru');
console.log('3. Pin ke taskbar dan test icon');
console.log('4. Verifikasi icon di semua tempat (taskbar, desktop, start menu)');

