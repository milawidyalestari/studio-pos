@echo off
echo ========================================
echo    Studio POS PostgreSQL Schema Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PostgreSQL dependencies are installed
if not exist "node_modules\pg" (
    echo 📦 Installing PostgreSQL dependencies...
    npm install pg
    if %errorlevel% neq 0 (
        echo ❌ Failed to install PostgreSQL dependencies
        pause
        exit /b 1
    )
)

echo 🔧 Setting up PostgreSQL schema...
echo.

REM Set default database configuration
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=studio_pos
set DB_USER=postgres
set DB_PASSWORD=postgres

echo 📊 Database Configuration:
echo    Host: %DB_HOST%
echo    Port: %DB_PORT%
echo    Database: %DB_NAME%
echo    User: %DB_USER%
echo.

REM Ask user for database configuration
set /p DB_HOST="Enter PostgreSQL host [localhost]: "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Enter PostgreSQL port [5432]: "
if "%DB_PORT%"=="" set DB_PORT=5432

set /p DB_NAME="Enter database name [studio_pos]: "
if "%DB_NAME%"=="" set DB_NAME=studio_pos

set /p DB_USER="Enter PostgreSQL username [postgres]: "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_PASSWORD="Enter PostgreSQL password: "

echo.
echo 🚀 Starting schema setup...
echo.

REM Run the schema setup
node scripts/setup-postgresql-schema.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ PostgreSQL schema setup completed successfully!
    echo.
    echo 📋 Next steps:
    echo    1. Start your Studio POS application
    echo    2. Use the Database Setup Wizard to configure the connection
    echo    3. The application will automatically detect the existing schema
    echo.
) else (
    echo.
    echo ❌ Schema setup failed!
    echo.
    echo 💡 Troubleshooting:
    echo    - Make sure PostgreSQL is running
    echo    - Check your connection details
    echo    - Ensure the database exists
    echo    - Verify username and password
    echo.
)

pause
