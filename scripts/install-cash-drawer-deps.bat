@echo off
echo Installing Cash Drawer Dependencies...
echo.

REM Install serialport package
echo Installing serialport package...
npm install serialport@^12.0.0

REM Check if installation was successful
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install serialport package
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo Installing additional dependencies for Electron...
npm install @serialport/parser-readline

REM Rebuild for Electron
echo.
echo Rebuilding for Electron...
npm run electron:build

if %errorlevel% neq 0 (
    echo.
    echo WARNING: Electron rebuild failed
    echo You may need to rebuild manually: npm run electron:build
)

echo.
echo Cash Drawer Dependencies Installation Complete!
echo.
echo Next steps:
echo 1. Connect your cash drawer to a serial port (COM1, COM2, etc.)
echo 2. Open the Cashier page in the application
echo 3. Click Settings to configure the cash drawer
echo 4. Test the connection
echo.
pause

