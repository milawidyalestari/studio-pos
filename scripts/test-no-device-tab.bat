@echo off
echo Testing Studio POS - Remove Device Tab from Program Settings...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing Program Settings without Device tab:
echo - Settings > Program tab should only show Transactions
echo - No Device tab visible
echo - Clean interface with only Transactions content
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - No Device Tab Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Navigate to Settings page
echo 3. Click on Program tab
echo 4. Verify only Transactions content is shown
echo 5. Check that there is no Device tab
echo 6. Verify Transactions functionality works normally
echo.
echo Expected behavior:
echo - Program Settings shows only Transactions content
echo - No Device tab visible
echo - No tabs navigation (since only one content)
echo - Clean, simplified interface
echo - Transactions functionality works normally
echo.
echo Changes made:
echo - Removed Tabs, TabsList, TabsTrigger, TabsContent imports
echo - Removed DevicesTab import
echo - Removed entire tabs structure
echo - Direct rendering of TransactionsTab only
echo - Simplified component structure
echo.
pause

