@echo off
REM =====================================================
REM Studio POS - Complete Distribution Builder
REM =====================================================
REM Description: Script untuk build complete distribution package
REM Date: 2025-01-01
REM Version: 1.0.0
REM =====================================================

echo.
echo ==========================================
echo   STUDIO POS - COMPLETE DISTRIBUTION
echo ==========================================
echo.

REM Set variables
set VERSION=1.0.0
set DISTRIBUTION_NAME=Studio_POS_Complete_v%VERSION%
set ZIP_NAME=%DISTRIBUTION_NAME%.zip

echo [1/6] Cleaning previous builds...
echo.

REM Clean previous builds
if exist "build-output" rmdir /s /q "build-output"
if exist "distribution" rmdir /s /q "distribution"
if exist "%ZIP_NAME%" del "%ZIP_NAME%"

echo [2/6] Installing dependencies...
echo.

REM Install dependencies
call npm install
if %errorLevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo [3/6] Building Studio POS application...
echo.

REM Build the application
call npm run build:production
if %errorLevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [4/6] Creating distribution package...
echo.

REM Run distribution creator
call scripts\create_distribution.bat
if %errorLevel% neq 0 (
    echo ERROR: Distribution creation failed!
    pause
    exit /b 1
)

echo [5/6] Verifying package contents...
echo.

REM Check if ZIP file exists
if not exist "%ZIP_NAME%" (
    echo ERROR: Distribution ZIP not created!
    pause
    exit /b 1
)

REM Get file size
for %%A in ("%ZIP_NAME%") do set ZIP_SIZE=%%~zA
set /a ZIP_SIZE_MB=%ZIP_SIZE% / 1024 / 1024

echo Package created: %ZIP_NAME%
echo Size: %ZIP_SIZE% bytes (%ZIP_SIZE_MB% MB)
echo.

echo [6/6] Creating final documentation...
echo.

REM Create final README
echo # Studio POS - Complete Distribution Package > FINAL_DISTRIBUTION_README.md
echo. >> FINAL_DISTRIBUTION_README.md
echo ## Package Information >> FINAL_DISTRIBUTION_README.md
echo - **Version:** %VERSION% >> FINAL_DISTRIBUTION_README.md
echo - **Package:** %ZIP_NAME% >> FINAL_DISTRIBUTION_README.md
echo - **Size:** %ZIP_SIZE_MB% MB >> FINAL_DISTRIBUTION_README.md
echo - **Created:** %DATE% %TIME% >> FINAL_DISTRIBUTION_README.md
echo. >> FINAL_DISTRIBUTION_README.md
echo ## Quick Installation >> FINAL_DISTRIBUTION_README.md
echo 1. Extract %ZIP_NAME% >> FINAL_DISTRIBUTION_README.md
echo 2. Run PostgreSQL_Installer\install_postgresql.bat (as Administrator) >> FINAL_DISTRIBUTION_README.md
echo 3. Run Studio_POS\Studio POS.exe >> FINAL_DISTRIBUTION_README.md
echo 4. Login with: admin / admin123 >> FINAL_DISTRIBUTION_README.md
echo. >> FINAL_DISTRIBUTION_README.md
echo ## Contents >> FINAL_DISTRIBUTION_README.md
echo - Studio POS Application (Ready to run) >> FINAL_DISTRIBUTION_README.md
echo - PostgreSQL Auto Installer (Silent installation) >> FINAL_DISTRIBUTION_README.md
echo - Database Migration Scripts (Auto setup) >> FINAL_DISTRIBUTION_README.md
echo - Complete Documentation (Installation guide) >> FINAL_DISTRIBUTION_README.md
echo. >> FINAL_DISTRIBUTION_README.md
echo ## System Requirements >> FINAL_DISTRIBUTION_README.md
echo - Windows 10/11 (64-bit) >> FINAL_DISTRIBUTION_README.md
echo - 4GB RAM minimum >> FINAL_DISTRIBUTION_README.md
echo - 2GB free disk space >> FINAL_DISTRIBUTION_README.md
echo - Internet connection (for PostgreSQL download) >> FINAL_DISTRIBUTION_README.md
echo. >> FINAL_DISTRIBUTION_README.md
echo For detailed instructions, see Documentation\INSTALLATION_GUIDE.md >> FINAL_DISTRIBUTION_README.md

echo.
echo ==========================================
echo   DISTRIBUTION BUILD COMPLETED!
echo ==========================================
echo.
echo Package: %ZIP_NAME%
echo Size: %ZIP_SIZE_MB% MB
echo.
echo Contents:
echo ✅ Studio POS Application
echo ✅ PostgreSQL Auto Installer  
echo ✅ Database Migration Scripts
echo ✅ Complete Documentation
echo.
echo Ready for distribution!
echo.

REM Open distribution folder
if exist "%ZIP_NAME%" (
    echo Opening distribution folder...
    explorer .
)

echo.
echo Press Enter to exit...
pause >nul

exit /b 0

