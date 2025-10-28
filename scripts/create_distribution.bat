@echo off
REM =====================================================
REM Studio POS - Distribution Package Creator
REM =====================================================
REM Description: Script untuk membuat package distribusi lengkap
REM Date: 2025-01-01
REM Version: 1.0.0
REM =====================================================

echo.
echo ==========================================
echo   STUDIO POS - DISTRIBUTION CREATOR
echo ==========================================
echo.

REM Set variables
set DISTRIBUTION_NAME=Studio_POS_Distribution
set VERSION=1.0.0
set BUILD_DIR=build-output
set DIST_DIR=distribution
set ZIP_NAME=Studio_POS_Complete_v%VERSION%.zip

echo [1/8] Cleaning previous builds...
echo.

REM Clean previous distribution
if exist "%DIST_DIR%" rmdir /s /q "%DIST_DIR%"
if exist "%ZIP_NAME%" del "%ZIP_NAME%"

REM Clean build output
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"

echo [2/8] Building Studio POS application...
echo.

REM Build the application
call npm run build:production
if %errorLevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [3/8] Creating distribution directory...
echo.

REM Create distribution directory
mkdir "%DIST_DIR%"
mkdir "%DIST_DIR%\Studio_POS"
mkdir "%DIST_DIR%\PostgreSQL_Installer"
mkdir "%DIST_DIR%\Database_Migrations"
mkdir "%DIST_DIR%\Documentation"

echo [4/8] Copying Studio POS executable...
echo.

REM Copy Studio POS files
if exist "%BUILD_DIR%\win-unpacked" (
    xcopy "%BUILD_DIR%\win-unpacked\*" "%DIST_DIR%\Studio_POS\" /E /I /Y
) else (
    echo ERROR: Build output not found!
    pause
    exit /b 1
)

REM Copy installer if exists
if exist "%BUILD_DIR%\Studio POS Setup %VERSION%.exe" (
    copy "%BUILD_DIR%\Studio POS Setup %VERSION%.exe" "%DIST_DIR%\Studio_POS\"
)

echo [5/8] Copying PostgreSQL installer...
echo.

REM Copy PostgreSQL installer script
copy "scripts\install_postgresql.bat" "%DIST_DIR%\PostgreSQL_Installer\"
copy "scripts\setup_database.js" "%DIST_DIR%\PostgreSQL_Installer\"

REM Create PostgreSQL download script
echo @echo off > "%DIST_DIR%\PostgreSQL_Installer\download_postgresql.bat"
echo echo Downloading PostgreSQL installer... >> "%DIST_DIR%\PostgreSQL_Installer\download_postgresql.bat"
echo powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64.exe' -OutFile 'postgresql-15.4-1-windows-x64.exe' -UseBasicParsing}" >> "%DIST_DIR%\PostgreSQL_Installer\download_postgresql.bat"
echo echo Download completed! >> "%DIST_DIR%\PostgreSQL_Installer\download_postgresql.bat"
echo pause >> "%DIST_DIR%\PostgreSQL_Installer\download_postgresql.bat"

echo [6/8] Copying database migrations...
echo.

REM Copy database migration files
if exist "db-migrations" (
    xcopy "db-migrations\*" "%DIST_DIR%\Database_Migrations\" /E /I /Y
) else (
    echo WARNING: Database migrations not found!
)

REM Copy database schema files
if exist "database" (
    xcopy "database\*" "%DIST_DIR%\Database_Migrations\" /E /I /Y
)

echo [7/8] Creating installation documentation...
echo.

REM Create installation guide
echo # Studio POS - Installation Guide > "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo ## Quick Start >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo 1. **Install PostgreSQL** >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo    - Run `PostgreSQL_Installer\install_postgresql.bat` as Administrator >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo    - This will automatically download and install PostgreSQL >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo 2. **Install Studio POS** >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo    - Run `Studio_POS\Studio POS Setup %VERSION%.exe` >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo    - Or run `Studio_POS\Studio POS.exe` for portable version >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo 3. **First Run** >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo    - Studio POS will automatically setup database tables >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo    - Login with: admin / admin123 >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo ## System Requirements >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Windows 10/11 (64-bit) >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - 4GB RAM minimum >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - 2GB free disk space >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Internet connection (for PostgreSQL download) >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo ## Troubleshooting >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo ### PostgreSQL Installation Issues >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Make sure to run as Administrator >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Check Windows Firewall settings >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Ensure port 5432 is not in use >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo. >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo ### Studio POS Issues >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Make sure PostgreSQL is running >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Check database connection settings >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"
echo - Restart application if needed >> "%DIST_DIR%\Documentation\INSTALLATION_GUIDE.md"

REM Create README for distribution
echo # Studio POS - Complete Distribution Package > "%DIST_DIR%\README.txt"
echo. >> "%DIST_DIR%\README.txt"
echo This package contains everything needed to install and run Studio POS: >> "%DIST_DIR%\README.txt"
echo. >> "%DIST_DIR%\README.txt"
echo 📁 **Studio_POS/** - Main application files >> "%DIST_DIR%\README.txt"
echo 📁 **PostgreSQL_Installer/** - Database installer scripts >> "%DIST_DIR%\README.txt"
echo 📁 **Database_Migrations/** - Database schema and migration files >> "%DIST_DIR%\README.txt"
echo 📁 **Documentation/** - Installation and user guides >> "%DIST_DIR%\README.txt"
echo. >> "%DIST_DIR%\README.txt"
echo ## Quick Installation: >> "%DIST_DIR%\README.txt"
echo 1. Run PostgreSQL_Installer\install_postgresql.bat (as Administrator) >> "%DIST_DIR%\README.txt"
echo 2. Run Studio_POS\Studio POS.exe >> "%DIST_DIR%\README.txt"
echo 3. Login with: admin / admin123 >> "%DIST_DIR%\README.txt"
echo. >> "%DIST_DIR%\README.txt"
echo For detailed instructions, see Documentation\INSTALLATION_GUIDE.md >> "%DIST_DIR%\README.txt"

echo [8/8] Creating distribution ZIP file...
echo.

REM Create ZIP file using PowerShell
powershell -Command "& {Compress-Archive -Path '%DIST_DIR%\*' -DestinationPath '%ZIP_NAME%' -Force}"

if %errorLevel% neq 0 (
    echo ERROR: Failed to create ZIP file!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   DISTRIBUTION CREATED SUCCESSFULLY!
echo ==========================================
echo.
echo Package: %ZIP_NAME%
echo Size: 
for %%A in ("%ZIP_NAME%") do echo %%~zA bytes
echo.
echo Contents:
echo - Studio POS Application
echo - PostgreSQL Auto Installer
echo - Database Migration Scripts
echo - Complete Documentation
echo.
echo Ready for distribution!
echo.

REM Clean up temporary files
rmdir /s /q "%DIST_DIR%"

echo Press Enter to exit...
pause >nul

exit /b 0

