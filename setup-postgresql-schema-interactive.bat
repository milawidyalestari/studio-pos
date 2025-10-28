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

REM Run the interactive schema setup
node scripts/setup-postgresql-schema-interactive.js

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
