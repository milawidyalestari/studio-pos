@echo off
echo ========================================
echo    Fix Suppliers Table Columns
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

echo 🔧 Fixing suppliers table columns...
echo.

REM Run the fix script
node scripts/fix-suppliers-columns.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Suppliers table fix completed successfully!
    echo.
    echo 📋 Next steps:
    echo    1. Try creating a supplier again in Studio POS
    echo    2. The payment_terms column should now be available
    echo    3. All supplier operations should work correctly
    echo.
) else (
    echo.
    echo ❌ Fix failed!
    echo.
    echo 💡 Troubleshooting:
    echo    - Make sure PostgreSQL is running
    echo    - Check your connection details
    echo    - Ensure the database exists
    echo    - Verify username and password
    echo.
)

pause
