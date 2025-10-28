@echo off
echo Testing Studio POS Window Controls Fix...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing window controls functionality:
echo - Minimize button should work without errors
echo - Maximize button should work without errors  
echo - Close button should work without errors
echo - No "setIsMaximized is not defined" errors
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - Window Controls Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Check console for any errors
echo 3. Click minimize button (-) - should work without errors
echo 4. Click maximize button (□) - should work without errors
echo 5. Click close button (X) - should work without errors
echo.
echo Expected behavior:
echo - No "setIsMaximized is not defined" errors
echo - Window controls work smoothly
echo - Animations play correctly
echo - Window state updates properly
echo.
echo If you see any errors:
echo - Check the console output
echo - Restart the application
echo - Check if all dependencies are installed
echo.
pause

