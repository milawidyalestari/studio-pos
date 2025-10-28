@echo off
echo ========================================
echo Testing Studio POS Installation Flow
echo ========================================

echo.
echo [1/5] Cleaning previous builds...
if exist "build-output" rmdir /s /q "build-output"
if exist "dist" rmdir /s /q "dist"

echo.
echo [2/5] Installing dependencies...
call npm install

echo.
echo [3/5] Building frontend (Production mode)...
set NODE_ENV=production
call npm run build

echo.
echo [4/5] Building Electron app (Production mode)...
set NODE_ENV=production
call npm run electron:build

echo.
echo [5/5] Testing installation flow...
echo.
echo Expected flow:
echo 1. Database setup (if first run)
echo 2. Login screen with admin/admin123
echo 3. Dashboard after login
echo 4. No DevTools in production
echo.

if exist "build-output\Studio POS Setup 1.0.0.exe" (
    echo ✅ Installer created successfully!
    echo.
    echo Testing portable version...
    if exist "build-output\win-unpacked\Studio POS.exe" (
        echo ✅ Portable version found!
        echo Starting application...
        start "" "build-output\win-unpacked\Studio POS.exe"
        echo.
        echo Please check:
        echo - Does the app show database setup or login screen?
        echo - Can you login with admin/admin123?
        echo - Does it redirect to dashboard after login?
        echo - Are DevTools closed in production?
    ) else (
        echo ❌ Portable version not found!
    )
) else (
    echo ❌ Installer not created!
)

echo.
echo ========================================
echo Test completed!
echo ========================================
pause



