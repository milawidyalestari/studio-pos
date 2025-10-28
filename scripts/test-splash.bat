@echo off
echo Testing Studio POS Splash Screen...
echo.

cd /d "%~dp0.."

echo Starting splash screen test...
node scripts/test-splash-screen.js

echo.
echo Test completed!
pause
