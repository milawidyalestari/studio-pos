@echo off
echo Studio POS - Window Mode Launcher
echo ================================
echo.
echo Select window mode:
echo 1. Standard Window (Default)
echo 2. Transparent Window
echo 3. Frameless Window
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Starting with Standard Window...
    set WINDOW_TYPE=standard
    npm run electron:dev
) else if "%choice%"=="2" (
    echo Starting with Transparent Window...
    set WINDOW_TYPE=transparent
    npm run electron:dev
) else if "%choice%"=="3" (
    echo Starting with Frameless Window...
    set WINDOW_TYPE=frameless
    npm run electron:dev
) else if "%choice%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
    pause
)

