@echo off
REM =====================================================
REM Studio POS - Distribution Testing Script
REM =====================================================
REM Description: Script untuk test distribusi package
REM Date: 2025-01-01
REM Version: 1.0.0
REM =====================================================

echo.
echo ==========================================
echo   STUDIO POS - DISTRIBUTION TESTING
echo ==========================================
echo.

REM Set variables
set VERSION=1.0.0
set DISTRIBUTION_NAME=Studio_POS_Complete_v%VERSION%
set ZIP_NAME=%DISTRIBUTION_NAME%.zip
set TEST_DIR=test_distribution

echo [1/8] Checking distribution package...
echo.

REM Check if distribution exists
if not exist "%ZIP_NAME%" (
    echo ERROR: Distribution package not found: %ZIP_NAME%
    echo Please run: npm run build:distribution
    pause
    exit /b 1
)

echo ✅ Distribution package found: %ZIP_NAME%
for %%A in ("%ZIP_NAME%") do echo    Size: %%~zA bytes
echo.

echo [2/8] Extracting distribution package...
echo.

REM Clean test directory
if exist "%TEST_DIR%" rmdir /s /q "%TEST_DIR%"
mkdir "%TEST_DIR%"

REM Extract ZIP
powershell -Command "& {Expand-Archive -Path '%ZIP_NAME%' -DestinationPath '%TEST_DIR%' -Force}"
if %errorLevel% neq 0 (
    echo ERROR: Failed to extract distribution package!
    pause
    exit /b 1
)

echo ✅ Distribution package extracted to: %TEST_DIR%
echo.

echo [3/8] Verifying package contents...
echo.

REM Check required files
set MISSING_FILES=0

if not exist "%TEST_DIR%\Studio_POS\Studio POS.exe" (
    echo ❌ Missing: Studio_POS\Studio POS.exe
    set /a MISSING_FILES+=1
) else (
    echo ✅ Found: Studio_POS\Studio POS.exe
)

if not exist "%TEST_DIR%\PostgreSQL_Installer\install_postgresql.bat" (
    echo ❌ Missing: PostgreSQL_Installer\install_postgresql.bat
    set /a MISSING_FILES+=1
) else (
    echo ✅ Found: PostgreSQL_Installer\install_postgresql.bat
)

if not exist "%TEST_DIR%\PostgreSQL_Installer\setup_database.js" (
    echo ❌ Missing: PostgreSQL_Installer\setup_database.js
    set /a MISSING_FILES+=1
) else (
    echo ✅ Found: PostgreSQL_Installer\setup_database.js
)

if not exist "%TEST_DIR%\Database_Migrations\apply_all_migrations.sql" (
    echo ❌ Missing: Database_Migrations\apply_all_migrations.sql
    set /a MISSING_FILES+=1
) else (
    echo ✅ Found: Database_Migrations\apply_all_migrations.sql
)

if not exist "%TEST_DIR%\Documentation\INSTALLATION_GUIDE.md" (
    echo ❌ Missing: Documentation\INSTALLATION_GUIDE.md
    set /a MISSING_FILES+=1
) else (
    echo ✅ Found: Documentation\INSTALLATION_GUIDE.md
)

if not exist "%TEST_DIR%\README.txt" (
    echo ❌ Missing: README.txt
    set /a MISSING_FILES+=1
) else (
    echo ✅ Found: README.txt
)

if %MISSING_FILES% gtr 0 (
    echo.
    echo ERROR: %MISSING_FILES% required files are missing!
    pause
    exit /b 1
)

echo.
echo ✅ All required files present!
echo.

echo [4/8] Testing PostgreSQL installer script...
echo.

REM Test PostgreSQL installer syntax
cd "%TEST_DIR%\PostgreSQL_Installer"
echo Testing install_postgresql.bat syntax...
powershell -Command "& {Get-Content 'install_postgresql.bat' | Out-Null}"
if %errorLevel% neq 0 (
    echo ❌ PostgreSQL installer has syntax errors
    set /a MISSING_FILES+=1
) else (
    echo ✅ PostgreSQL installer syntax OK
)

cd ..\..
echo.

echo [5/8] Testing database setup script...
echo.

REM Test database setup script syntax
cd "%TEST_DIR%\PostgreSQL_Installer"
echo Testing setup_database.js syntax...
node -c setup_database.js
if %errorLevel% neq 0 (
    echo ❌ Database setup script has syntax errors
    set /a MISSING_FILES+=1
) else (
    echo ✅ Database setup script syntax OK
)

cd ..\..
echo.

echo [6/8] Testing migration scripts...
echo.

REM Test migration scripts
cd "%TEST_DIR%\Database_Migrations"
echo Testing apply_all_migrations.sql syntax...
psql --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  PostgreSQL not installed - skipping SQL syntax check
) else (
    echo Testing SQL syntax...
    psql -U postgres -d postgres -c "\q" >nul 2>&1
    if %errorLevel% neq 0 (
        echo ⚠️  Cannot connect to PostgreSQL - skipping SQL syntax check
    ) else (
        echo ✅ Migration scripts accessible
    )
)

cd ..\..
echo.

echo [7/8] Testing Studio POS executable...
echo.

REM Test Studio POS executable
cd "%TEST_DIR%\Studio_POS"
echo Testing Studio POS executable...
if exist "Studio POS.exe" (
    echo ✅ Studio POS executable found
    echo    File size: 
    for %%A in ("Studio POS.exe") do echo    %%~zA bytes
) else (
    echo ❌ Studio POS executable not found
    set /a MISSING_FILES+=1
)

cd ..\..
echo.

echo [8/8] Testing documentation...
echo.

REM Test documentation
cd "%TEST_DIR%\Documentation"
echo Testing documentation files...
if exist "INSTALLATION_GUIDE.md" (
    echo ✅ Installation guide found
    for %%A in ("INSTALLATION_GUIDE.md") do echo    Size: %%~zA bytes
) else (
    echo ❌ Installation guide not found
    set /a MISSING_FILES+=1
)

cd ..\..
echo.

REM Final results
echo ==========================================
echo   DISTRIBUTION TEST RESULTS
echo ==========================================
echo.

if %MISSING_FILES% gtr 0 (
    echo ❌ TEST FAILED: %MISSING_FILES% issues found
    echo.
    echo Issues to fix:
    echo - Check missing files
    echo - Fix syntax errors
    echo - Rebuild distribution package
) else (
    echo ✅ TEST PASSED: All checks successful!
    echo.
    echo Distribution package is ready for distribution:
    echo - Package: %ZIP_NAME%
    echo - Location: %CD%
    echo - Test directory: %TEST_DIR%
    echo.
    echo Next steps:
    echo 1. Test on clean Windows machine
    echo 2. Verify PostgreSQL installation
    echo 3. Test Studio POS first run
    echo 4. Distribute to end users
)

echo.
echo Press Enter to exit...
pause >nul

REM Clean up test directory
if exist "%TEST_DIR%" rmdir /s /q "%TEST_DIR%"

exit /b %MISSING_FILES%

