@echo off
echo Testing Studio POS Window Sizing...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Testing window configurations...
echo.
echo Available window types:
echo - standard: 1200x800 (centered)
echo - transparent: 1200x800 (centered, transparent)
echo - frameless: 1200x800 (centered, frameless)
echo.

echo Step 3: Starting application with different window types...
echo.

echo Testing standard window...
set WINDOW_TYPE=standard
start "Studio POS - Standard" cmd /c "npm run electron:dev"

timeout /t 3 /nobreak >nul

echo Testing transparent window...
set WINDOW_TYPE=transparent
start "Studio POS - Transparent" cmd /c "npm run electron:dev"

timeout /t 3 /nobreak >nul

echo Testing frameless window...
set WINDOW_TYPE=frameless
start "Studio POS - Frameless" cmd /c "npm run electron:dev"

echo.
echo ✅ All window types launched!
echo.
echo Check the taskbar for multiple Studio POS windows.
echo Each should be properly sized and centered.
echo.
echo Window improvements made:
echo - Reduced default size from 1400x900 to 1200x800
echo - Added center: true to all window configs
echo - Added show: false to prevent flash
echo - Set minimum size to 1024x600
echo - Added responsive CSS scaling
echo - Added minimum width/height to layout
echo.
echo If windows still appear small:
echo 1. Check your display scaling settings
echo 2. Try maximizing the window
echo 3. Check if DPI scaling is affecting the app
echo.
pause

