@echo off
echo Cleaning previous builds...

REM Clean build outputs
if exist "build-output" rmdir /s /q "build-output"
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "dist" rmdir /s /q "dist"

echo.
echo Building React application...
call npm run build

echo.
echo Building Electron application...
call npx electron-builder --win --publish=never

echo.
echo Build completed! Check build-output folder for installer.
pause


