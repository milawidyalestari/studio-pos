@echo off
echo ========================================
echo Studio POS - Manual Build Process
echo ========================================

echo.
echo Step 1: Clean previous builds
if exist "build-output" rmdir /s /q "build-output"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"

echo.
echo Step 2: Install dependencies
call npm install

echo.
echo Step 3: Build React app
call npm run build

echo.
echo Step 4: Build Electron app
call npx electron-builder --win --publish=never

echo.
echo Build completed! Check build-output folder.
pause


