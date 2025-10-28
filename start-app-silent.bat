@echo off
REM Start Electron app without console window
start /B npx electron . >nul 2>&1
