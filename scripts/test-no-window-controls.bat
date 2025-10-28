@echo off
echo Testing Studio POS - Remove Window Controls from Settings...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing Settings page without Window Controls:
echo - Settings page should not show Window Controls section
echo - Only SettingsTabs should be visible
echo - Settings should be cleaner and simpler
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - No Window Controls Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Navigate to Settings page
echo 3. Check that Window Controls section is not visible
echo 4. Verify only SettingsTabs are shown (Program, Database, Tools, Users, Struk)
echo 5. Confirm Settings page is cleaner without Window Controls
echo.
echo Expected behavior:
echo - No Window Controls card in Settings page
echo - Only SettingsTabs with their respective tabs
echo - Cleaner Settings interface
echo - No TransparentWindowControls component
echo.
echo Changes made:
echo - Removed TransparentWindowControls import
echo - Removed Window Controls section from Settings
echo - Simplified Settings page layout
echo.
pause

