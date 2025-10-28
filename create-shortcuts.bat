@echo off
REM =====================================================
REM Studio POS - Shortcut Creator
REM =====================================================
REM This script creates desktop and start menu shortcuts

echo Creating shortcuts for Studio POS...

REM Get the directory where the exe is located
set "APP_DIR=%~dp0"
set "EXE_PATH=%APP_DIR%Studio POS 1.0.0.exe"

REM Create Desktop Shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Studio POS.lnk'); $Shortcut.TargetPath = '%EXE_PATH%'; $Shortcut.WorkingDirectory = '%APP_DIR%'; $Shortcut.Save()"

REM Create Start Menu Shortcut
echo Creating start menu shortcut...
if not exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS" mkdir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS"
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Studio POS\Studio POS.lnk'); $Shortcut.TargetPath = '%EXE_PATH%'; $Shortcut.WorkingDirectory = '%APP_DIR%'; $Shortcut.Save()"

echo.
echo ✓ Shortcuts created successfully!
echo   - Desktop: Studio POS.lnk
echo   - Start Menu: Studio POS\Studio POS.lnk
echo.
pause
