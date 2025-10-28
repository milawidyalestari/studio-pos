@echo off
echo Building Studio POS Installer...
echo.

cd /d "%~dp0.."

echo Step 1: Cleaning previous builds...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist" rmdir /s /q "dist"

echo Step 2: Installing dependencies...
call npm install

echo Step 3: Building React application...
call npm run build

echo Step 4: Verifying build files...
if not exist "dist\index.html" (
    echo ERROR: React build failed!
    pause
    exit /b 1
)

echo Step 5: Creating build resources...
if not exist "build\icon.ico" (
    echo Creating default icon...
    copy "public\favicon.ico" "build\icon.ico" 2>nul || echo "Warning: Could not copy favicon.ico"
)

echo Step 6: Building Electron application...
call npm run electron:dist

echo Step 7: Verifying installer...
if exist "build-output\Studio POS-1.0.0-x64.exe" (
    echo.
    echo ✅ Installer created successfully!
    echo 📁 Location: build-output\Studio POS-1.0.0-x64.exe
    echo.
    echo Installer features:
    echo - Windows NSIS installer
    echo - Desktop shortcut creation
    echo - Start menu integration
    echo - Uninstaller included
    echo - Transparent windows support
    echo - Splash screen included
    echo.
) else (
    echo ❌ Installer creation failed!
    echo Check the output above for errors.
)

echo.
echo Build completed!
pause

