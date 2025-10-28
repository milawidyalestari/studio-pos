#!/usr/bin/env node

/**
 * Script untuk mendiagnosis dan memperbaiki masalah icon taskbar
 * Masalah: Icon masih muncul sebagai icon Electron default ketika di-pin ke taskbar
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosa Masalah Icon Taskbar');
console.log('=================================\n');

// Path ke file yang relevan
const electronBuilderPath = path.join(__dirname, '..', 'electron-builder.json');
const mainJsPath = path.join(__dirname, '..', 'electron', 'main.js');
const assetsDir = path.join(__dirname, '..', 'electron', 'assets');

console.log('📋 Langkah 1: Memeriksa konfigurasi electron-builder.json...');

try {
  const config = JSON.parse(fs.readFileSync(electronBuilderPath, 'utf8'));
  
  console.log('✅ Konfigurasi electron-builder.json:');
  console.log(`   - Icon global: ${config.icon || 'TIDAK ADA'}`);
  console.log(`   - Windows icon: ${config.win?.icon || 'TIDAK ADA'}`);
  console.log(`   - NSIS installer icon: ${config.nsis?.installerIcon || 'TIDAK ADA'}`);
  console.log(`   - NSIS uninstaller icon: ${config.nsis?.uninstallerIcon || 'TIDAK ADA'}`);
  
  // Periksa apakah konfigurasi sudah benar
  const issues = [];
  if (!config.icon) issues.push('Icon global tidak dikonfigurasi');
  if (!config.win?.icon) issues.push('Windows icon tidak dikonfigurasi');
  if (!config.nsis?.installerIcon) issues.push('NSIS installer icon tidak dikonfigurasi');
  if (!config.nsis?.uninstallerIcon) issues.push('NSIS uninstaller icon tidak dikonfigurasi');
  
  if (issues.length > 0) {
    console.log('\n❌ Masalah ditemukan:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('\n✅ Konfigurasi electron-builder.json sudah benar');
  }
  
} catch (error) {
  console.error('❌ Error membaca electron-builder.json:', error.message);
}

console.log('\n📋 Langkah 2: Memeriksa konfigurasi main.js...');

try {
  const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
  
  if (mainJsContent.includes("icon: path.join(__dirname, 'assets', 'icon.ico')")) {
    console.log('✅ main.js menggunakan icon.ico untuk Windows');
  } else if (mainJsContent.includes("icon: path.join(__dirname, 'assets', 'icon.png')")) {
    console.log('⚠️ main.js menggunakan icon.png (seharusnya icon.ico untuk Windows)');
  } else {
    console.log('❌ main.js tidak memiliki konfigurasi icon yang jelas');
  }
  
} catch (error) {
  console.error('❌ Error membaca main.js:', error.message);
}

console.log('\n📋 Langkah 3: Memeriksa file icon...');

const iconFiles = [
  { name: 'icon.png', desc: 'Icon utama (512x512)' },
  { name: 'icon.ico', desc: 'Icon Windows (multi-resolusi)' },
  { name: 'icon.icns', desc: 'Icon macOS (multi-resolusi)' }
];

iconFiles.forEach(iconFile => {
  const filePath = path.join(assetsDir, iconFile.name);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${iconFile.name} - ${iconFile.desc} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    // Periksa header ICO untuk Windows
    if (iconFile.name === 'icon.ico') {
      try {
        const buffer = fs.readFileSync(filePath);
        const reserved = buffer.readUInt16LE(0);
        const type = buffer.readUInt16LE(2);
        const imageCount = buffer.readUInt16LE(4);
        
        console.log(`   📋 Header ICO: reserved=${reserved}, type=${type}, images=${imageCount}`);
        
        if (reserved === 0 && type === 1 && imageCount > 0) {
          console.log('   ✅ Header ICO valid');
        } else {
          console.log('   ❌ Header ICO tidak valid');
        }
      } catch (error) {
        console.log('   ❌ Error membaca header ICO:', error.message);
      }
    }
  } else {
    console.log(`❌ ${iconFile.name} - ${iconFile.desc} (TIDAK ADA)`);
  }
});

console.log('\n📋 Langkah 4: Memeriksa build output...');

const buildOutputDir = path.join(__dirname, '..', 'build-output');
if (fs.existsSync(buildOutputDir)) {
  const files = fs.readdirSync(buildOutputDir);
  console.log('✅ Build output ditemukan:');
  files.forEach(file => {
    const filePath = path.join(buildOutputDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });
} else {
  console.log('❌ Build output tidak ditemukan');
  console.log('💡 Jalankan: npm run electron:dist');
}

console.log('\n🔧 Solusi untuk Masalah Icon Taskbar:');
console.log('=====================================');

console.log('\n1. **Pastikan Build Terbaru:**');
console.log('   npm run electron:dist');

console.log('\n2. **Install Aplikasi yang Baru:**');
console.log('   - Uninstall aplikasi lama jika ada');
console.log('   - Install aplikasi yang baru di-build');

console.log('\n3. **Clear Taskbar Cache:**');
console.log('   - Unpin aplikasi dari taskbar');
console.log('   - Restart Windows Explorer:');
console.log('     - Tekan Ctrl+Shift+Esc (Task Manager)');
console.log('     - Cari "Windows Explorer"');
console.log('     - Klik "Restart"');

console.log('\n4. **Pin Ulang Aplikasi:**');
console.log('   - Jalankan aplikasi yang baru');
console.log('   - Pin ke taskbar');
console.log('   - Icon seharusnya sudah benar');

console.log('\n5. **Jika Masih Bermasalah:**');
console.log('   - Pastikan file icon.ico memiliki resolusi minimal 256x256');
console.log('   - Gunakan online converter untuk membuat ICO yang benar');
console.log('   - Cek Windows icon cache');

console.log('\n6. **Verifikasi Icon di Tempat Lain:**');
console.log('   - Desktop shortcut');
console.log('   - Start menu');
console.log('   - File Explorer (file .exe)');
console.log('   - About dialog aplikasi');

console.log('\n💡 Tips Tambahan:');
console.log('- Icon taskbar menggunakan icon dari executable file');
console.log('- Windows meng-cache icon, jadi perlu restart Explorer');
console.log('- Pastikan tidak ada aplikasi lain yang menggunakan icon yang sama');
console.log('- Icon harus memiliki resolusi yang tepat untuk Windows');

console.log('\n🎯 Langkah Selanjutnya:');
console.log('1. Jalankan: npm run electron:dist');
console.log('2. Install aplikasi yang baru');
console.log('3. Restart Windows Explorer');
console.log('4. Pin aplikasi ke taskbar');
console.log('5. Verifikasi icon sudah benar');

