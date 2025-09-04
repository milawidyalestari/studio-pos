@echo off
echo 🚀 Starting Studio POS Electron Development...
echo.

echo 📦 Installing dependencies if needed...
call npm install

echo.
echo 🔧 Starting Vite dev server...
start "Vite Dev Server" cmd /k "npm run dev:electron"

echo.
echo ⏳ Waiting for Vite server to start...
timeout /t 5 /nobreak >nul

echo.
echo ⚡ Starting Electron app...
start "Electron App" cmd /k "npm run electron:dev:hot"

echo.
echo ✅ Development environment started!
echo.
echo 📱 Vite Dev Server: http://localhost:5173
echo 🖥️  Electron App: Running in separate window
echo.
echo 💡 Tips:
echo    - Edit files in src/ folder
echo    - Changes will auto-reload
echo    - DevTools available in Electron window
echo    - Press Ctrl+C in each terminal to stop
echo.
pause
