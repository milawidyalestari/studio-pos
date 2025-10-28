@echo off
echo Testing Studio POS Transparent UI Components...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo.
echo Step 2: Testing transparent UI components...
echo Starting Electron with transparent UI...

REM Set environment variable for transparent windows
set WINDOW_TYPE=transparent

echo.
echo Starting Studio POS with transparent UI...
echo - Window: Transparent
echo - Cards: Transparent with glassmorphism
echo - Database Status: Transparent
echo - Login Page: Transparent
echo - Database Setup: Transparent
echo.

call npm run electron:dev

echo.
echo Test completed!
echo.
echo Check that all UI components now have transparent backgrounds
echo with glassmorphism effects instead of solid white backgrounds.
pause

