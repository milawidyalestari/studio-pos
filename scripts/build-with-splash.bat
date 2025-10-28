@echo off
echo Building Studio POS with Splash Screen...
echo.

cd /d "%~dp0.."

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building application...
call npm run build

echo.
echo Step 3: Building Electron app...
call npm run build:electron

echo.
echo Step 4: Copying splash screen files...
if not exist "dist\electron\splash-professional.html" (
    copy "electron\splash-professional.html" "dist\electron\"
    echo ✅ Splash screen copied to dist
) else (
    echo ✅ Splash screen already exists in dist
)

echo.
echo Step 5: Building final executable...
call npm run dist

echo.
echo ✅ Build completed with splash screen!
echo.
echo The executable should be in the dist folder.
echo Splash screen will be displayed when you run the application.
echo.
pause
