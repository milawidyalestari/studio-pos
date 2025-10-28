@echo off
echo Testing Studio POS - Remove Tools Tab from Settings...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing Settings page without Tools tab:
echo - Settings should not show Tools tab
echo - Only Program, Database, Users, and Struk tabs should be visible
echo - Grid layout should adjust properly
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - No Tools Tab Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Navigate to Settings page
echo 3. Check that Tools tab is not visible
echo 4. Verify only these tabs are shown: Program, Database, Users, Struk
echo 5. Test that all remaining tabs work properly
echo 6. Check that grid layout looks good with 4 tabs
echo.
echo Expected behavior:
echo - No Tools tab in Settings
echo - Only 4 tabs: Program, Database, Users, Struk
echo - Grid layout properly adjusted for 4 tabs
echo - All remaining tabs function normally
echo - Cleaner Settings interface
echo.
echo Changes made:
echo - Removed Tools TabsTrigger
echo - Removed Tools TabsContent
echo - Removed ProgramTools import
echo - Updated getTabGridCols() function
echo - Updated getFirstAccessibleTab() function
echo.
pause

