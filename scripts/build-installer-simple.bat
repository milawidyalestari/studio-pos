@echo off
echo ========================================
echo Studio POS - Building Installer
echo ========================================

echo.
echo Step 1: Cleaning previous builds...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"

echo.
echo Step 2: Building React application...
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Building Electron installer...
call npx electron-builder --win --publish=never
if errorlevel 1 (
    echo ERROR: Electron build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Installer location: build-output\Studio POS Setup 1.0.0.exe
echo Portable version: build-output\win-unpacked\Studio POS.exe
echo.
pause


