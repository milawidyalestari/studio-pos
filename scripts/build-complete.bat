@echo off
echo ========================================
echo Studio POS - Complete Build Process
echo ========================================

echo.
echo Step 1: Cleaning previous builds...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"

echo.
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Building React application (Production mode)...
set NODE_ENV=production
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Verifying build files...
if not exist "dist\index.html" (
    echo ERROR: dist\index.html not found!
    pause
    exit /b 1
)
echo ✓ React build verified

echo.
echo Step 5: Building Electron application (Production mode)...
set NODE_ENV=production
call npx electron-builder --win --publish=never
if errorlevel 1 (
    echo ERROR: Electron build failed!
    pause
    exit /b 1
)

echo.
echo Step 6: Verifying installer...
if exist "build-output\Studio POS Setup 1.0.0.exe" (
    echo ✓ Installer created successfully!
) else (
    echo ERROR: Installer not found!
    pause
    exit /b 1
)

echo.
echo Step 7: Testing portable version...
if exist "build-output\win-unpacked\Studio POS.exe" (
    echo ✓ Portable version created successfully!
    echo Testing portable version...
    start "" "build-output\win-unpacked\Studio POS.exe"
    timeout /t 3 /nobreak >nul
    echo Portable version test completed.
) else (
    echo WARNING: Portable version not found!
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Files created:
echo - Installer: build-output\Studio POS Setup 1.0.0.exe
echo - Portable: build-output\win-unpacked\Studio POS.exe
echo.
echo You can now distribute the installer!
echo.
pause
