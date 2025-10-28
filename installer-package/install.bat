@echo off
echo Installing Studio POS...
echo.

set "INSTALL_DIR=C:\Program Files\Studio POS"

echo Creating installation directory...
if not exist "" mkdir ""

echo Copying files...
xcopy "C:\Users\Pongo\studio-post\studio-pos\scripts\*" "\" /E /I /Y

echo Creating desktop shortcut...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('C:\Users\Pongo\Desktop\Studio POS.lnk'^); $Shortcut.TargetPath = '\electron\main.js'; $Shortcut.Save()"

echo Creating start menu shortcut...
if not exist "C:\Users\Pongo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Studio POS" mkdir "C:\Users\Pongo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Studio POS"
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('C:\Users\Pongo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Studio POS\Studio POS.lnk'^); $Shortcut.TargetPath = '\electron\main.js'; $Shortcut.Save()"

echo Installation completed!
echo Studio POS has been installed to: 
echo.
echo You can now start Studio POS from:
echo - Desktop shortcut
echo - Start Menu
echo.
pause
