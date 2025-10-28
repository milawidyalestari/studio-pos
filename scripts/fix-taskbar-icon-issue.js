#!/usr/bin/env node

/**
 * Script untuk memperbaiki masalah icon taskbar yang masih muncul sebagai icon Electron default
 * Solusi: Clear Windows icon cache dan rebuild aplikasi
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Memperbaiki Masalah Icon Taskbar');
console.log('===================================\n');

// Function untuk menjalankan command
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Menjalankan: ${command} ${args.join(' ')}`);
    
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
        console.log(`⚠️ Command selesai dengan code: ${code}`);
        resolve(); // Tidak reject untuk command yang mungkin gagal
      }
    });

    process.on('error', (error) => {
      console.log(`⚠️ Error menjalankan command: ${error.message}`);
      resolve(); // Tidak reject untuk command yang mungkin gagal
    });
  });
}

async function main() {
  try {
    console.log('📋 Langkah 1: Membersihkan build output lama...');
    
    // Hapus build output lama
    const buildOutputDir = path.join(__dirname, '..', 'build-output');
    if (fs.existsSync(buildOutputDir)) {
      fs.rmSync(buildOutputDir, { recursive: true, force: true });
      console.log('✅ Build output lama telah dihapus');
    }
    
    console.log('\n📋 Langkah 2: Build aplikasi dengan konfigurasi icon yang benar...');
    
    // Build aplikasi
    await runCommand('npm', ['run', 'build']);
    await runCommand('npx', ['electron-builder', '--win', 'portable']);
    
    console.log('\n📋 Langkah 3: Memeriksa hasil build...');
    
    if (fs.existsSync(buildOutputDir)) {
      const files = fs.readdirSync(buildOutputDir);
      console.log('✅ Build berhasil! File yang dihasilkan:');
      files.forEach(file => {
        const filePath = path.join(buildOutputDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    } else {
      console.log('❌ Build gagal - folder build-output tidak ditemukan');
      return;
    }
    
    console.log('\n🔧 Langkah 4: Instruksi untuk memperbaiki icon taskbar...');
    
    console.log('\n📝 **LANGKAH-LANGKAH PENTING:**');
    console.log('');
    console.log('1. **Uninstall aplikasi lama (jika ada):**');
    console.log('   - Buka Control Panel > Programs > Uninstall a program');
    console.log('   - Cari "Studio POS" dan uninstall');
    console.log('');
    console.log('2. **Unpin dari taskbar (jika sudah di-pin):**');
    console.log('   - Klik kanan pada icon di taskbar');
    console.log('   - Pilih "Unpin from taskbar"');
    console.log('');
    console.log('3. **Restart Windows Explorer:**');
    console.log('   - Tekan Ctrl+Shift+Esc (buka Task Manager)');
    console.log('   - Cari "Windows Explorer"');
    console.log('   - Klik kanan > "Restart"');
    console.log('');
    console.log('4. **Install aplikasi yang baru:**');
    console.log(`   - Jalankan: ${path.join(buildOutputDir, 'Studio POS-1.0.0-x64.exe')}`);
    console.log('   - Ikuti proses instalasi');
    console.log('');
    console.log('5. **Pin aplikasi ke taskbar:**');
    console.log('   - Jalankan aplikasi Studio POS');
    console.log('   - Klik kanan pada icon di taskbar');
    console.log('   - Pilih "Pin to taskbar"');
    console.log('');
    console.log('6. **Verifikasi icon:**');
    console.log('   - Icon seharusnya tidak lagi berupa icon Electron default');
    console.log('   - Icon seharusnya sesuai dengan icon yang Anda buat');
    
    console.log('\n💡 **Jika masih bermasalah:**');
    console.log('');
    console.log('1. **Clear Windows icon cache:**');
    console.log('   - Buka Command Prompt sebagai Administrator');
    console.log('   - Jalankan: ie4uinit.exe -show');
    console.log('   - Restart komputer');
    console.log('');
    console.log('2. **Gunakan online converter untuk ICO:**');
    console.log('   - Upload icon.png ke https://convertio.co/png-ico/');
    console.log('   - Pilih resolusi: 16,32,48,64,128,256');
    console.log('   - Download dan ganti electron/assets/icon.ico');
    console.log('');
    console.log('3. **Periksa file executable:**');
    console.log('   - Buka File Explorer');
    console.log('   - Navigasi ke folder instalasi aplikasi');
    console.log('   - Cek icon file .exe (seharusnya sudah benar)');
    
    console.log('\n🎯 **Verifikasi di tempat-tempat berikut:**');
    console.log('- ✅ Taskbar (saat di-pin)');
    console.log('- ✅ Desktop shortcut');
    console.log('- ✅ Start menu');
    console.log('- ✅ File Explorer (file .exe)');
    console.log('- ✅ About dialog aplikasi');
    
    console.log('\n⚠️ **Catatan Penting:**');
    console.log('- Windows meng-cache icon, jadi perlu restart Explorer');
    console.log('- Icon taskbar menggunakan icon dari executable file');
    console.log('- Pastikan tidak ada aplikasi lain yang menggunakan icon yang sama');
    console.log('- Icon harus memiliki resolusi minimal 256x256 untuk Windows');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Jalankan script
main().catch(error => {
  console.error('❌ Script gagal:', error.message);
});

