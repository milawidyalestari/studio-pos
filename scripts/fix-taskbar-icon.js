#!/usr/bin/env node

/**
 * Script untuk memperbaiki masalah icon taskbar di Windows
 * Masalah: Icon berubah kembali ke icon Electron default ketika di-pin ke taskbar
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki konfigurasi icon taskbar...');

// Path ke file konfigurasi
const electronBuilderPath = path.join(__dirname, '..', 'electron-builder.json');
const mainJsPath = path.join(__dirname, '..', 'electron', 'main.js');

// Baca konfigurasi electron-builder
let electronBuilderConfig;
try {
  electronBuilderConfig = JSON.parse(fs.readFileSync(electronBuilderPath, 'utf8'));
  console.log('✅ Berhasil membaca electron-builder.json');
} catch (error) {
  console.error('❌ Error membaca electron-builder.json:', error.message);
  process.exit(1);
}

// Pastikan icon dikonfigurasi dengan benar
const iconConfig = {
  // Icon global
  icon: 'electron/assets/icon.png',
  
  // Icon untuk Windows
  win: {
    icon: 'electron/assets/icon.ico',
    requestedExecutionLevel: 'asInvoker',
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },
  
  // Icon untuk macOS
  mac: {
    icon: 'electron/assets/icon.icns'
  },
  
  // Icon untuk Linux
  linux: {
    icon: 'electron/assets/icon.png'
  },
  
  // Icon untuk NSIS installer
  nsis: {
    installerIcon: 'electron/assets/icon.ico',
    uninstallerIcon: 'electron/assets/icon.ico'
  }
};

// Update konfigurasi
Object.assign(electronBuilderConfig, iconConfig);

// Pastikan konfigurasi Windows sudah benar
if (!electronBuilderConfig.win) {
  electronBuilderConfig.win = {};
}
Object.assign(electronBuilderConfig.win, iconConfig.win);

// Pastikan konfigurasi macOS sudah benar
if (!electronBuilderConfig.mac) {
  electronBuilderConfig.mac = {};
}
Object.assign(electronBuilderConfig.mac, iconConfig.mac);

// Pastikan konfigurasi Linux sudah benar
if (!electronBuilderConfig.linux) {
  electronBuilderConfig.linux = {};
}
Object.assign(electronBuilderConfig.linux, iconConfig.linux);

// Pastikan konfigurasi NSIS sudah benar
if (!electronBuilderConfig.nsis) {
  electronBuilderConfig.nsis = {};
}
Object.assign(electronBuilderConfig.nsis, iconConfig.nsis);

// Tulis kembali konfigurasi
try {
  fs.writeFileSync(electronBuilderPath, JSON.stringify(electronBuilderConfig, null, 2));
  console.log('✅ Berhasil memperbarui electron-builder.json');
} catch (error) {
  console.error('❌ Error menulis electron-builder.json:', error.message);
  process.exit(1);
}

// Periksa file main.js
try {
  let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
  
  // Pastikan icon menggunakan format .ico untuk Windows
  if (mainJsContent.includes("icon: path.join(__dirname, 'assets', 'icon.png')")) {
    mainJsContent = mainJsContent.replace(
      "icon: path.join(__dirname, 'assets', 'icon.png')",
      "icon: path.join(__dirname, 'assets', 'icon.ico')"
    );
    
    fs.writeFileSync(mainJsPath, mainJsContent);
    console.log('✅ Berhasil memperbarui main.js untuk menggunakan icon.ico');
  } else {
    console.log('ℹ️ main.js sudah menggunakan icon yang benar');
  }
} catch (error) {
  console.error('❌ Error memperbarui main.js:', error.message);
}

// Periksa apakah file icon ada
const iconFiles = [
  'electron/assets/icon.png',
  'electron/assets/icon.ico',
  'electron/assets/icon.icns'
];

console.log('\n📁 Memeriksa file icon:');
iconFiles.forEach(iconFile => {
  const fullPath = path.join(__dirname, '..', iconFile);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${iconFile} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${iconFile} tidak ditemukan`);
  }
});

console.log('\n🎯 Konfigurasi icon taskbar telah diperbaiki!');
console.log('📝 Langkah selanjutnya:');
console.log('1. Jalankan: npm run electron:dist');
console.log('2. Install aplikasi yang baru di-build');
console.log('3. Pin aplikasi ke taskbar');
console.log('4. Icon seharusnya tidak berubah kembali ke icon Electron default');

console.log('\n💡 Tips tambahan:');
console.log('- Pastikan icon.ico memiliki resolusi yang tepat (16x16, 32x32, 48x48, 256x256)');
console.log('- Jika masih bermasalah, coba hapus aplikasi dari taskbar dan pin ulang');
console.log('- Restart Windows Explorer jika diperlukan');
