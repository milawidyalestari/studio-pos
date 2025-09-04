# Studio POS Electron Development Script
# PowerShell version

Write-Host "🚀 Starting Studio POS Electron Development..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📦 Installing dependencies if needed..." -ForegroundColor Blue
npm install

Write-Host ""
Write-Host "🔧 Starting Vite dev server..." -ForegroundColor Blue

# Start Vite dev server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:electron" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for Vite server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "⚡ Starting Electron app..." -ForegroundColor Blue

# Start Electron app in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run electron:dev:hot" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Vite Dev Server: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🖥️  Electron App: Running in separate window" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Edit files in src/ folder" -ForegroundColor White
Write-Host "   - Changes will auto-reload" -ForegroundColor White
Write-Host "   - DevTools available in Electron window" -ForegroundColor White
Write-Host "   - Press Ctrl+C in each terminal to stop" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Development commands:" -ForegroundColor Magenta
Write-Host "   npm run electron:dev:hot    - Hot reload development" -ForegroundColor Gray
Write-Host "   npm run electron:dev:debug  - Debug mode" -ForegroundColor Gray
Write-Host "   npm run electron:dev:reload - Enhanced logging" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
