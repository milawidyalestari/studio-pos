@echo off
echo Creating Studio POS Installer...
echo.

cd /d "%~dp0.."

echo Step 1: Building application...
call npm run build

echo Step 2: Creating installer package...
if not exist "installer-package" mkdir "installer-package"

echo Copying files...
xcopy "dist\*" "installer-package\dist\" /E /I /Y
xcopy "electron\*" "installer-package\electron\" /E /I /Y
xcopy "database\*" "installer-package\database\" /E /I /Y
copy "package.json" "installer-package\"

echo Step 3: Creating installer script...
echo Creating install.bat...

(
echo @echo off
echo echo Installing Studio POS...
echo echo.
echo.
echo set "INSTALL_DIR=%PROGRAMFILES%\Studio POS"
echo.
echo echo Creating installation directory...
echo if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
echo.
echo echo Copying files...
echo xcopy "%~dp0*" "%INSTALL_DIR%\" /E /I /Y
echo.
echo echo Creating desktop shortcut...
echo powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Studio POS.lnk'^); $Shortcut.TargetPath = '%INSTALL_DIR%\electron\main.js'; $Shortcut.Save()"
echo.
echo echo Creating start menu shortcut...
echo if not exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS" mkdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS"
echo powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS\Studio POS.lnk'^); $Shortcut.TargetPath = '%INSTALL_DIR%\electron\main.js'; $Shortcut.Save()"
echo.
echo echo Installation completed!
echo echo Studio POS has been installed to: %INSTALL_DIR%
echo echo.
echo echo You can now start Studio POS from:
echo echo - Desktop shortcut
echo echo - Start Menu
echo echo.
echo pause
) > "installer-package\install.bat"

echo Step 4: Creating uninstaller script...
(
echo @echo off
echo echo Uninstalling Studio POS...
echo echo.
echo.
echo set "INSTALL_DIR=%PROGRAMFILES%\Studio POS"
echo.
echo echo Removing files...
echo if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"
echo.
echo echo Removing desktop shortcut...
echo if exist "%USERPROFILE%\Desktop\Studio POS.lnk" del "%USERPROFILE%\Desktop\Studio POS.lnk"
echo.
echo echo Removing start menu shortcut...
echo if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS" rmdir /s /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS"
echo.
echo echo Uninstallation completed!
echo pause
) > "installer-package\uninstall.bat"

echo Step 5: Creating README...
(
echo Studio POS - Installation Package
echo =================================
echo.
echo This package contains Studio POS application files.
echo.
echo Installation:
echo 1. Run install.bat as Administrator
echo 2. Follow the installation prompts
echo 3. Studio POS will be installed to Program Files
echo.
echo Uninstallation:
echo 1. Run uninstall.bat as Administrator
echo 2. All files and shortcuts will be removed
echo.
echo Features:
echo - Transparent windows with glassmorphism effects
echo - Splash screen on startup
echo - Database setup wizard
echo - Professional login interface
echo - Modern UI design
echo.
echo System Requirements:
echo - Windows 10/11 (x64)
echo - 4GB RAM minimum
echo - 500MB free disk space
echo.
echo For support, please contact the development team.
) > "installer-package\README.txt"

echo Step 6: Creating ZIP installer...
if exist "Studio-POS-Installer.zip" del "Studio-POS-Installer.zip"
powershell "Compress-Archive -Path 'installer-package\*' -DestinationPath 'Studio-POS-Installer.zip'"

echo.
echo ✅ Installer package created successfully!
echo 📁 Location: Studio-POS-Installer.zip
echo.
echo 📦 Package contents:
echo    • Application files
echo    • Database files
echo    • Installation script (install.bat)
echo    • Uninstallation script (uninstall.bat)
echo    • README documentation
echo.
echo 🚀 To install Studio POS:
echo    1. Extract Studio-POS-Installer.zip
echo    2. Run install.bat as Administrator
echo    3. Follow installation prompts
echo.
echo 🗑️ To uninstall Studio POS:
echo    1. Run uninstall.bat as Administrator
echo.
echo Build completed!
pause

