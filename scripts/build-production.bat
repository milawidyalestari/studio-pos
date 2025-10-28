@echo off
echo ========================================
echo Building Studio POS for Production
echo ========================================

echo.
echo [1/4] Cleaning previous builds...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist" rmdir /s /q "dist"

echo.
echo [2/4] Installing dependencies...
call npm install

echo.
echo [3/4] Building frontend...
call npm run build

echo.
echo [4/4] Building Electron app...
call npm run electron:build

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Installer location: build-output\Studio POS Setup 1.0.0.exe
echo.
pause



