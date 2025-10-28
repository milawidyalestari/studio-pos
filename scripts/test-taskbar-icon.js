#!/usr/bin/env node

/**
 * Script untuk test build dan verifikasi icon taskbar
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing build dan verifikasi icon taskbar...');

// Function untuk menjalankan command
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Menjalankan: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command berhasil: ${command}`);
        resolve();
      } else {
        console.error(`❌ Command gagal: ${command} (exit code: ${code})`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      console.error(`❌ Error menjalankan command: ${error.message}`);
      reject(error);
    });
  });
}

// Function untuk memeriksa file
function checkFile(filePath) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${filePath} (${(stats.size / 1024).toFixed(2)} KB)`);
    return true;
  } else {
    console.log(`❌ ${filePath} tidak ditemukan`);
    return false;
  }
}

async function main() {
  try {
    console.log('📋 Langkah 1: Memeriksa file icon...');
    
    const iconFiles = [
      'electron/assets/icon.png',
      'electron/assets/icon.ico',
      'electron/assets/icon.icns'
    ];
    
    let allIconsExist = true;
    iconFiles.forEach(iconFile => {
      if (!checkFile(iconFile)) {
        allIconsExist = false;
      }
    });
    
    if (!allIconsExist) {
      console.error('❌ Beberapa file icon tidak ditemukan. Harap perbaiki terlebih dahulu.');
      process.exit(1);
    }
    
    console.log('\n📋 Langkah 2: Memeriksa konfigurasi...');
    
    // Periksa electron-builder.json
    const electronBuilderPath = 'electron-builder.json';
    if (checkFile(electronBuilderPath)) {
      const config = JSON.parse(fs.readFileSync(electronBuilderPath, 'utf8'));
      
      if (config.icon && config.win && config.win.icon) {
        console.log('✅ Konfigurasi electron-builder.json sudah benar');
      } else {
        console.log('❌ Konfigurasi electron-builder.json belum lengkap');
        console.log('💡 Jalankan: npm run fix:taskbar-icon');
        process.exit(1);
      }
    }
    
    // Periksa main.js
    const mainJsPath = 'electron/main.js';
    if (checkFile(mainJsPath)) {
      const content = fs.readFileSync(mainJsPath, 'utf8');
      if (content.includes("icon: path.join(__dirname, 'assets', 'icon.ico')")) {
        console.log('✅ Konfigurasi main.js sudah benar');
      } else {
        console.log('❌ Konfigurasi main.js belum benar');
        console.log('💡 Jalankan: npm run fix:taskbar-icon');
        process.exit(1);
      }
    }
    
    console.log('\n📋 Langkah 3: Build aplikasi...');
    
    // Clean build output
    console.log('🧹 Membersihkan build output...');
    if (fs.existsSync('build-output')) {
      fs.rmSync('build-output', { recursive: true, force: true });
    }
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    
    // Build aplikasi
    await runCommand('npm', ['run', 'build']);
    await runCommand('npm', ['run', 'electron:dist']);
    
    console.log('\n📋 Langkah 4: Memeriksa hasil build...');
    
    // Periksa apakah build berhasil
    const buildOutputPath = 'build-output';
    if (fs.existsSync(buildOutputPath)) {
      const files = fs.readdirSync(buildOutputPath);
      console.log('📁 File build yang dihasilkan:');
      files.forEach(file => {
        const filePath = path.join(buildOutputPath, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      });
      
      console.log('\n🎯 Build berhasil!');
      console.log('\n📝 Langkah selanjutnya:');
      console.log('1. Install aplikasi dari file di build-output/');
      console.log('2. Pin aplikasi ke taskbar');
      console.log('3. Buka/tutup aplikasi beberapa kali');
      console.log('4. Verifikasi icon tetap konsisten');
      
      console.log('\n💡 Tips testing:');
      console.log('- Jika icon masih berubah, coba unpin dan pin ulang');
      console.log('- Restart Windows Explorer jika diperlukan');
      console.log('- Pastikan tidak ada aplikasi lain yang menggunakan icon yang sama');
      
    } else {
      console.error('❌ Build gagal - folder build-output tidak ditemukan');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Jalankan script
main().catch(error => {
  console.error('❌ Script gagal:', error.message);
  process.exit(1);
});
