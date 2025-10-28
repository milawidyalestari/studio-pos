@echo off
echo ========================================
echo Studio POS - Clean and Rebuild
echo ========================================

echo.
echo Step 1: Stopping any running processes...
taskkill /f /im "Studio POS.exe" 2>nul
taskkill /f /im "electron.exe" 2>nul

echo.
echo Step 2: Cleaning all build artifacts...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"
if exist "node_modules" rmdir /s /q "node_modules"

echo.
echo Step 3: Cleaning npm cache...
call npm cache clean --force

echo.
echo Step 4: Reinstalling dependencies...
call npm install

echo.
echo Step 5: Building application...
call scripts\build-complete.bat

echo.
echo ========================================
echo Clean rebuild completed!
echo ========================================
pause


