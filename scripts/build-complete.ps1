Write-Host "========================================" -ForegroundColor Green
Write-Host "Studio POS - Complete Build Process" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "build-output") { Remove-Item -Recurse -Force "build-output" }
if (Test-Path "dist-electron") { Remove-Item -Recurse -Force "dist-electron" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 3: Building React application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: React build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 4: Verifying build files..." -ForegroundColor Yellow
if (-not (Test-Path "dist\index.html")) {
    Write-Host "ERROR: dist\index.html not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ React build verified" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Building Electron application..." -ForegroundColor Yellow
npx electron-builder --win --publish=never
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Electron build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 6: Verifying installer..." -ForegroundColor Yellow
if (Test-Path "build-output\Studio POS Setup 1.0.0.exe") {
    Write-Host "✓ Installer created successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Installer not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 7: Testing portable version..." -ForegroundColor Yellow
if (Test-Path "build-output\win-unpacked\Studio POS.exe") {
    Write-Host "✓ Portable version created successfully!" -ForegroundColor Green
    Write-Host "Testing portable version..."
    Start-Process "build-output\win-unpacked\Studio POS.exe"
    Start-Sleep -Seconds 3
    Write-Host "Portable version test completed."
} else {
    Write-Host "WARNING: Portable version not found!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "- Installer: build-output\Studio POS Setup 1.0.0.exe" -ForegroundColor White
Write-Host "- Portable: build-output\win-unpacked\Studio POS.exe" -ForegroundColor White
Write-Host ""
Write-Host "You can now distribute the installer!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"


