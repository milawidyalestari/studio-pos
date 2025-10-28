@echo off
echo 🔧 Memperbaiki Masalah Icon Taskbar Windows
echo ==========================================
echo.

echo 📋 Langkah 1: Menghentikan Windows Explorer...
taskkill /f /im explorer.exe
echo ✅ Windows Explorer telah dihentikan

echo.
echo 📋 Langkah 2: Menghapus icon cache...
del /a /q "%localappdata%\Microsoft\Windows\Explorer\iconcache_*.db" 2>nul
del /a /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
echo ✅ Icon cache telah dihapus

echo.
echo 📋 Langkah 3: Menghapus thumbnail cache...
del /a /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache_*.db" 2>nul
echo ✅ Thumbnail cache telah dihapus

echo.
echo 📋 Langkah 4: Menghapus Windows icon cache...
ie4uinit.exe -show
echo ✅ Windows icon cache telah di-refresh

echo.
echo 📋 Langkah 5: Memulai ulang Windows Explorer...
start explorer.exe
echo ✅ Windows Explorer telah dimulai ulang

echo.
echo 🎯 Langkah selanjutnya:
echo 1. Install aplikasi Studio POS yang baru
echo 2. Pin aplikasi ke taskbar
echo 3. Icon seharusnya sudah benar
echo.
echo 💡 Jika masih bermasalah:
echo - Restart komputer
echo - Gunakan online converter untuk membuat ICO yang benar
echo - Pastikan tidak ada aplikasi lain yang menggunakan icon yang sama
echo.
pause

