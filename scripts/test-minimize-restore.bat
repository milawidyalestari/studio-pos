@echo off
echo Testing Studio POS Minimize/Restore Functionality...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Instructions for testing:
echo 1. Application will start normally
echo 2. Click the minimize button (-) on the title bar
echo 3. Click the Studio POS icon in the taskbar
echo 4. Window should restore properly with correct size
echo 5. Repeat steps 2-4 several times
echo.

echo Starting application with transparent window...
set WINDOW_TYPE=transparent
start "Studio POS - Minimize Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Click minimize button (-) on title bar
echo 3. Click Studio POS icon in taskbar
echo 4. Window should restore with proper size (1200x800)
echo 5. If window appears small, try maximizing it
echo.
echo Expected behavior:
echo - Window should restore to 1200x800 size
echo - Window should be centered on screen
echo - Window should be focused and visible
echo - No content should appear too small
echo.
echo If issues persist:
echo - Check Windows display scaling settings
echo - Try different window types (standard, frameless)
echo - Restart the application
echo.
pause

