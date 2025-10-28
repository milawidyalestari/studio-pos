@echo off
echo ========================================
echo Studio POS - Building Installer (Fixed)
echo ========================================

echo.
echo Step 1: Cleaning previous builds...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"

echo.
echo Step 2: Installing dependencies...
call npm install

echo.
echo Step 3: Building React application...
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
echo Step 5: Building Electron installer...
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
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Installer: build-output\Studio POS Setup 1.0.0.exe
echo Portable: build-output\win-unpacked\Studio POS.exe
echo.
echo Testing installer...
if exist "build-output\Studio POS Setup 1.0.0.exe" (
    echo Running installer test...
    "build-output\Studio POS Setup 1.0.0.exe" /S
    echo Installer test completed.
)
echo.
pause


