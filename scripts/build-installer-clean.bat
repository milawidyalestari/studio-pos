@echo off
echo Building Studio POS Installer with Desktop Shortcut...

REM Kill any running Studio POS processes
taskkill /f /im "Studio POS.exe" 2>nul
taskkill /f /im "electron.exe" 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Clean build output
if exist "build-output" (
    echo Cleaning build output...
    rmdir /s /q "build-output" 2>nul
    if exist "build-output" (
        echo Build output still exists, trying to force delete...
        takeown /f "build-output" /r /d y 2>nul
        icacls "build-output" /grant administrators:F /t 2>nul
        rmdir /s /q "build-output" 2>nul
    )
)

REM Clean dist folder
if exist "dist" (
    echo Cleaning dist folder...
    rmdir /s /q "dist" 2>nul
)

REM Build the application
echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

REM Build installer with NSIS
echo Building NSIS installer...
call npx electron-builder --win nsis --publish=never
if %errorlevel% neq 0 (
    echo Installer build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Installer built successfully!
echo 📁 Check build-output folder for the installer
echo 🖥️  Desktop shortcut will be created during installation
echo.
pause

