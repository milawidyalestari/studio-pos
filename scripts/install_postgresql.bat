@echo off
REM =====================================================
REM Studio POS - PostgreSQL Auto Installer
REM =====================================================
REM Description: Script untuk install PostgreSQL secara otomatis
REM Date: 2025-01-01
REM Version: 1.0.0
REM =====================================================

echo.
echo ==========================================
echo   STUDIO POS - POSTGRESQL INSTALLER
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Script ini harus dijalankan sebagai Administrator!
    echo Klik kanan pada file ini dan pilih "Run as administrator"
    pause
    exit /b 1
)

REM Set variables
set POSTGRES_VERSION=15.4
set POSTGRES_INSTALLER=postgresql-15.4-1-windows-x64.exe
set POSTGRES_URL=https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64.exe
set POSTGRES_INSTALL_DIR=C:\Program Files\PostgreSQL\15
set POSTGRES_DATA_DIR=C:\Program Files\PostgreSQL\15\data
set POSTGRES_PORT=5432
set POSTGRES_USERNAME=postgres
set POSTGRES_PASSWORD=StudioPOS2024!
set POSTGRES_DATABASE=studio_pos

echo [1/6] Checking system requirements...
echo.

REM Check if PostgreSQL is already installed
if exist "%POSTGRES_INSTALL_DIR%\bin\psql.exe" (
    echo PostgreSQL sudah terinstall di %POSTGRES_INSTALL_DIR%
    echo.
    set /p choice="Apakah Anda ingin menginstall ulang? (y/n): "
    if /i "%choice%" neq "y" (
        echo Instalasi dibatalkan.
        goto :setup_database
    )
    echo.
)

REM Check if installer exists
if not exist "%POSTGRES_INSTALLER%" (
    echo [2/6] Downloading PostgreSQL installer...
    echo.
    echo Mengunduh PostgreSQL %POSTGRES_VERSION%...
    echo URL: %POSTGRES_URL%
    echo.
    
    REM Download PostgreSQL installer using PowerShell
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%POSTGRES_URL%' -OutFile '%POSTGRES_INSTALLER%' -UseBasicParsing}"
    
    if %errorLevel% neq 0 (
        echo ERROR: Gagal mengunduh PostgreSQL installer!
        echo Silakan download manual dari: %POSTGRES_URL%
        pause
        exit /b 1
    )
    
    echo Download selesai!
    echo.
) else (
    echo [2/6] PostgreSQL installer sudah ada.
    echo.
)

echo [3/6] Installing PostgreSQL...
echo.

REM Create silent install response file
echo [GENERAL] > postgresql_installer_response.txt
echo INSTALLER_UI=SILENT >> postgresql_installer_response.txt
echo SELECTED_LANGUAGE=English >> postgresql_installer_response.txt
echo. >> postgresql_installer_response.txt
echo [SERVICE] >> postgresql_installer_response.txt
echo SERVICE_NAME=postgresql-x64-15 >> postgresql_installer_response.txt
echo SERVICE_ACCOUNT=postgres >> postgresql_installer_response.txt
echo SERVICE_PASSWORD=StudioPOS2024! >> postgresql_installer_response.txt
echo. >> postgresql_installer_response.txt
echo [SUPERUSER] >> postgresql_installer_response.txt
echo USERNAME=%POSTGRES_USERNAME% >> postgresql_installer_response.txt
echo PASSWORD=%POSTGRES_PASSWORD% >> postgresql_installer_response.txt
echo. >> postgresql_installer_response.txt
echo [DATABASE] >> postgresql_installer_response.txt
echo DATABASE=%POSTGRES_DATABASE% >> postgresql_installer_response.txt
echo PORT=%POSTGRES_PORT% >> postgresql_installer_response.txt
echo. >> postgresql_installer_response.txt
echo [INSTALLATION] >> postgresql_installer_response.txt
echo INSTALLATION_DIRECTORY=%POSTGRES_INSTALL_DIR% >> postgresql_installer_response.txt
echo DATA_DIRECTORY=%POSTGRES_DATA_DIR% >> postgresql_installer_response.txt
echo. >> postgresql_installer_response.txt
echo [LOCALE] >> postgresql_installer_response.txt
echo LOCALE=English_United States.1252 >> postgresql_installer_response.txt
echo. >> postgresql_installer_response.txt
echo [STACKBUILDER] >> postgresql_installer_response.txt
echo STACKBUILDER=0 >> postgresql_installer_response.txt

REM Run PostgreSQL installer silently
echo Menjalankan instalasi PostgreSQL...
echo Ini mungkin memakan waktu beberapa menit...
echo.

"%POSTGRES_INSTALLER%" --mode unattended --unattendedmodeui none --optionfile postgresql_installer_response.txt

if %errorLevel% neq 0 (
    echo ERROR: Instalasi PostgreSQL gagal!
    echo Silakan install manual dari: %POSTGRES_INSTALLER%
    pause
    exit /b 1
)

echo PostgreSQL berhasil diinstall!
echo.

REM Clean up response file
del postgresql_installer_response.txt

echo [4/6] Configuring PostgreSQL service...
echo.

REM Start PostgreSQL service
net start postgresql-x64-15
if %errorLevel% neq 0 (
    echo WARNING: Gagal start PostgreSQL service secara otomatis.
    echo Silakan start manual melalui Services.msc
    echo.
)

REM Wait for service to start
timeout /t 10 /nobreak >nul

echo [5/6] Adding PostgreSQL to PATH...
echo.

REM Add PostgreSQL to system PATH
setx PATH "%PATH%;%POSTGRES_INSTALL_DIR%\bin" /M
if %errorLevel% neq 0 (
    echo WARNING: Gagal menambahkan PostgreSQL ke PATH.
    echo Silakan tambahkan manual: %POSTGRES_INSTALL_DIR%\bin
    echo.
)

echo [6/6] Verifying installation...
echo.

REM Verify installation
"%POSTGRES_INSTALL_DIR%\bin\psql.exe" --version
if %errorLevel% neq 0 (
    echo ERROR: PostgreSQL tidak berfungsi dengan benar!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   POSTGRESQL INSTALLATION COMPLETED!
echo ==========================================
echo.
echo Database Details:
echo - Host: localhost
echo - Port: %POSTGRES_PORT%
echo - Username: %POSTGRES_USERNAME%
echo - Password: %POSTGRES_PASSWORD%
echo - Database: %POSTGRES_DATABASE%
echo.
echo PostgreSQL siap digunakan!
echo.

:setup_database
echo ==========================================
echo   SETTING UP STUDIO POS DATABASE
echo ==========================================
echo.

REM Set environment variables for psql
set PGPASSWORD=%POSTGRES_PASSWORD%

echo Membuat database studio_pos...
"%POSTGRES_INSTALL_DIR%\bin\psql.exe" -U %POSTGRES_USERNAME% -h localhost -p %POSTGRES_PORT% -c "CREATE DATABASE %POSTGRES_DATABASE%;"

if %errorLevel% neq 0 (
    echo WARNING: Database mungkin sudah ada atau ada masalah koneksi.
    echo.
)

echo Database setup selesai!
echo.

echo ==========================================
echo   INSTALLATION COMPLETED SUCCESSFULLY!
echo ==========================================
echo.
echo PostgreSQL dan database Studio POS sudah siap!
echo.
echo Langkah selanjutnya:
echo 1. Jalankan Studio POS.exe
echo 2. Aplikasi akan otomatis setup tabel dan data
echo 3. Login dengan: admin / admin123
echo.
echo Tekan Enter untuk keluar...
pause >nul

exit /b 0

