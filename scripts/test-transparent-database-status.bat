@echo off
echo Testing Studio POS - Transparent Database Status Background...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing Database Status with transparent background:
echo - Database Status window should have transparent background
echo - No opaque background visible
echo - Glassmorphism effect applied
echo - Content readable with proper contrast
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - Transparent Database Status Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Check Database Status window (if shown)
echo 3. Verify transparent background
echo 4. Check glassmorphism effect
echo 5. Verify content readability
echo 6. Test all states: detecting, error, success
echo.
echo Expected behavior:
echo - Database Status window has transparent background
echo - No opaque background visible
echo - Glassmorphism effect with backdrop-blur
echo - Content remains readable with proper contrast
echo - All states (detecting, error, success) are transparent
echo.
echo Changes made:
echo - Added TransparentWrapper import
echo - Wrapped all return statements with TransparentWrapper
echo - Applied transparent background to all states
echo - Maintained glassmorphism effect
echo - Preserved content readability
echo.
pause

