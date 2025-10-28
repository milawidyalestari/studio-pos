@echo off
echo Testing Studio POS - Thermal Printer Settings...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Starting application...
echo.
echo Testing Thermal Printer Settings in Struk tab:
echo - Settings > Struk tab should show Thermal Printer Settings
echo - Connection type selection (USB, Network, Bluetooth)
echo - Connection settings based on selected type
echo - Printer settings (paper width, print density, auto cut)
echo - Test print functionality
echo.

echo Starting application...
set WINDOW_TYPE=transparent
start "Studio POS - Thermal Printer Test" cmd /c "npm run electron:dev"

echo.
echo ✅ Application started!
echo.
echo Test steps:
echo 1. Wait for application to load completely
echo 2. Navigate to Settings page
echo 3. Click on Struk tab
echo 4. Scroll down to see "Pengaturan Printer Thermal" section
echo 5. Test connection type selection (USB, Network, Bluetooth)
echo 6. Test connection settings for each type
echo 7. Test printer settings (paper width, print density, auto cut)
echo 8. Test "Test Print" button functionality
echo 9. Test "Simpan Printer" button
echo 10. Test "Simpan Semua" button
echo.
echo Expected behavior:
echo - Thermal Printer Settings section visible in Struk tab
echo - 3 connection types: USB, Network, Bluetooth
echo - Dynamic form fields based on selected connection type
echo - Printer settings: paper width, print density, auto cut toggle
echo - Test Print button with loading state
echo - Separate save buttons for printer settings and all settings
echo - Settings saved to localStorage
echo.
echo Features added:
echo - Connection type selection with visual cards
echo - USB: Printer name input
echo - Network: IP address and port inputs
echo - Bluetooth: MAC address input
echo - Paper width setting (default 80mm)
echo - Print density selection (light, normal, dark)
echo - Auto cut toggle switch
echo - Test print functionality with loading state
echo - Separate save buttons for printer and all settings
echo - Settings persistence in localStorage
echo.
pause

