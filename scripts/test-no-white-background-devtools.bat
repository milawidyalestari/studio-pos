@echo off
echo Testing Studio POS - Remove White Background and DevTools...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing fixes:
echo - Database Status should have transparent background (no white)
echo - DevTools should not open automatically
echo - Alert components should be transparent
echo - All backgrounds should be glassmorphism effect
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - No White Background & DevTools Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Check Database Status window
echo 3. Verify no white background visible
echo 4. Verify DevTools console is NOT open
echo 5. Check Alert components are transparent
echo 6. Verify glassmorphism effect on all components
echo.
echo Expected behavior:
echo - Database Status has transparent background
echo - No white background anywhere
echo - DevTools console does NOT open automatically
echo - Alert components use transparent backgrounds
echo - All components have glassmorphism effect
echo - Clean, transparent interface
echo.
echo Changes made:
echo - Added backdrop-blur-sm to Alert components
echo - Disabled DevTools by default (devTools: false)
echo - Changed DevTools opening condition to require --devtools flag
echo - Enhanced transparency of all UI components
echo.
echo To enable DevTools manually (if needed):
echo npm run electron:dev -- --devtools
echo.
pause

