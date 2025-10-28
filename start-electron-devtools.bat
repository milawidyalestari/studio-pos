@echo off
echo Starting Electron with Dev Tools...
set NODE_ENV=development
electron . --dev --devtools --enable-logging
pause
