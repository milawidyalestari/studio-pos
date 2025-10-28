@echo off
echo Testing Studio POS - Hamburger Menu Removal...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing navigation without hamburger menu:
echo - Sidebar should not have hamburger menu button
echo - Navigation should still work normally
echo - Only minimize button should be visible
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - No Hamburger Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Check the sidebar - no hamburger menu button should be visible
echo 3. Check that only minimize button (-) is visible in the header
echo 4. Verify navigation still works by clicking menu items
echo 5. Test minimize functionality
echo.
echo Expected behavior:
echo - No hamburger menu button in sidebar
echo - Only minimize button in header
echo - Navigation items still clickable
echo - Sidebar can still be minimized with minimize button
echo - Clean, simplified navigation interface
echo.
echo Changes made:
echo - Removed hamburger menu button from expanded sidebar
echo - Removed hamburger menu button from collapsed sidebar
echo - Removed unused Menu import
echo - Kept minimize button functionality
echo.
pause

