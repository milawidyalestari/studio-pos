@echo off
echo Setting up Studio POS Icons...
echo.

cd /d "%~dp0.."

echo Creating build directory...
if not exist "build" mkdir "build"

echo.
echo Please place your icon files in the following locations:
echo.
echo Windows: build\icon.ico (256x256 pixels)
echo macOS:   build\icon.icns (512x512 pixels)  
echo Linux:   build\icon.png (512x512 pixels)
echo.

echo If you have a PNG file, you can:
echo 1. Copy it to build\icon.png for Linux
echo 2. Convert it to ICO format for Windows
echo 3. Convert it to ICNS format for macOS
echo.

echo Online converters:
echo - ICO: https://convertio.co/png-ico/
echo - ICNS: https://cloudconvert.com/png-to-icns
echo.

echo Current build directory contents:
if exist "build" (
    dir build
) else (
    echo Build directory not found.
)

echo.
echo After placing the icon files, run:
echo npm run build:installer
echo.
pause

