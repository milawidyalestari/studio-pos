@echo off
echo Testing Studio POS Installer...
echo.

cd /d "%~dp0.."

echo Step 1: Building installer...
call scripts\build-installer.bat

echo.
echo Step 2: Checking installer file...
if exist "build-output\Studio POS-1.0.0-x64.exe" (
    echo ✅ Installer found!
    echo 📁 Location: build-output\Studio POS-1.0.0-x64.exe
    
    echo.
    echo Step 3: Installer information...
    for %%F in ("build-output\Studio POS-1.0.0-x64.exe") do (
        echo 📊 Size: %%~zF bytes
        echo 📅 Created: %%~tF
    )
    
    echo.
    echo Step 4: Testing installer (dry run)...
    echo Running installer with /S flag for silent installation...
    echo Note: This will actually install the application!
    echo.
    set /p choice="Do you want to run the installer? (y/N): "
    if /i "%choice%"=="y" (
        echo Running installer...
        "build-output\Studio POS-1.0.0-x64.exe" /S
        echo.
        echo Installation completed!
        echo You can find Studio POS in:
        echo - Desktop shortcut
        echo - Start Menu
        echo - Program Files\Studio POS
    ) else (
        echo Installer test skipped.
    )
    
) else (
    echo ❌ Installer not found!
    echo Please run the build script first.
)

echo.
echo Test completed!
pause