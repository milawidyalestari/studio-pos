@echo off
echo ========================================
echo    Fix All Schema Issues
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

echo 🔧 Fixing all schema issues...
echo This will fix:
echo   - suppliers table (payment_terms, credit_limit, is_active)
echo   - journal_entries table (entry_number, transaction_date, etc.)
echo   - cash_accounts table (account_id, initial_balance, etc.)
echo   - users table (username, password, etc.)
echo   - Create missing tables and indexes
echo   - Insert default data
echo.

REM Run the comprehensive fix script
node scripts/fix-all-schema-issues.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ All schema issues fixed successfully!
    echo.
    echo 📋 Next steps:
    echo    1. Try creating a supplier again in Studio POS
    echo    2. Try using accounting features
    echo    3. All database operations should work correctly
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
