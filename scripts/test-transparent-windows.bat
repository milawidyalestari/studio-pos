@echo off
echo Testing Studio POS Transparent Windows...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo.
echo Step 2: Testing transparent splash screen...
echo Starting Electron with transparent windows...

REM Set environment variable for transparent windows
set WINDOW_TYPE=transparent

echo.
echo Starting Studio POS with transparent windows...
echo - Splash screen: Transparent
echo - Database setup: Transparent  
echo - Login page: Transparent
echo - Main window: Transparent
echo.

call npm run electron:dev

echo.
echo Test completed!
pause

