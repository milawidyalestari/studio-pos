@echo off
echo Uninstalling Studio POS...
echo.

set "INSTALL_DIR=C:\Program Files\Studio POS"

echo Removing files...
if exist "" rmdir /s /q ""

echo Removing desktop shortcut...
if exist "C:\Users\Pongo\Desktop\Studio POS.lnk" del "C:\Users\Pongo\Desktop\Studio POS.lnk"

echo Removing start menu shortcut...
if exist "C:\Users\Pongo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Studio POS" rmdir /s /q "C:\Users\Pongo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Studio POS"

echo Uninstallation completed!
pause
