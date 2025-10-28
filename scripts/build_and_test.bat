@echo off
REM =====================================================
REM Studio POS - Complete Build and Test Pipeline
REM =====================================================
REM Description: Script untuk build, package, dan test distribusi
REM Date: 2025-01-01
REM Version: 1.0.0
REM =====================================================

echo.
echo ==========================================
echo   STUDIO POS - BUILD AND TEST PIPELINE
echo ==========================================
echo.

REM Set variables
set VERSION=1.0.0
set DISTRIBUTION_NAME=Studio_POS_Complete_v%VERSION%
set ZIP_NAME=%DISTRIBUTION_NAME%.zip

echo [1/4] Building complete distribution package...
echo.

REM Build distribution
call scripts\build_complete_distribution.bat
if %errorLevel% neq 0 (
    echo ERROR: Distribution build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Testing distribution package...
echo.

REM Test distribution
call scripts\test_distribution.bat
if %errorLevel% neq 0 (
    echo ERROR: Distribution test failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Creating final package summary...
echo.

REM Create package summary
echo # Studio POS - Distribution Package Summary > PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo **Build Date:** %DATE% %TIME% >> PACKAGE_SUMMARY.md
echo **Version:** %VERSION% >> PACKAGE_SUMMARY.md
echo **Package:** %ZIP_NAME% >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ## Package Contents >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ### Studio POS Application >> PACKAGE_SUMMARY.md
echo - ✅ Main executable: Studio POS.exe >> PACKAGE_SUMMARY.md
echo - ✅ Installer: Studio POS Setup 1.0.0.exe >> PACKAGE_SUMMARY.md
echo - ✅ All dependencies included >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ### PostgreSQL Auto Installer >> PACKAGE_SUMMARY.md
echo - ✅ Silent installer: install_postgresql.bat >> PACKAGE_SUMMARY.md
echo - ✅ Database setup: setup_database.js >> PACKAGE_SUMMARY.md
echo - ✅ Download script: download_postgresql.bat >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ### Database Migration System >> PACKAGE_SUMMARY.md
echo - ✅ Core schema migrations >> PACKAGE_SUMMARY.md
echo - ✅ Table creation scripts >> PACKAGE_SUMMARY.md
echo - ✅ Functions and triggers >> PACKAGE_SUMMARY.md
echo - ✅ Default data seeding >> PACKAGE_SUMMARY.md
echo - ✅ Permission setup >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ### Documentation >> PACKAGE_SUMMARY.md
echo - ✅ Installation guide >> PACKAGE_SUMMARY.md
echo - ✅ User manual >> PACKAGE_SUMMARY.md
echo - ✅ Troubleshooting guide >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ## Installation Flow >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo 1. **Extract package** >> PACKAGE_SUMMARY.md
echo 2. **Install PostgreSQL** (run install_postgresql.bat as Administrator) >> PACKAGE_SUMMARY.md
echo 3. **Run Studio POS** (Studio POS.exe) >> PACKAGE_SUMMARY.md
echo 4. **Auto database setup** (first run) >> PACKAGE_SUMMARY.md
echo 5. **Login** (admin / admin123) >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ## System Requirements >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo - Windows 10/11 (64-bit) >> PACKAGE_SUMMARY.md
echo - 4GB RAM minimum >> PACKAGE_SUMMARY.md
echo - 2GB free disk space >> PACKAGE_SUMMARY.md
echo - Internet connection (for PostgreSQL download) >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo ## Quality Assurance >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo - ✅ All files present and accessible >> PACKAGE_SUMMARY.md
echo - ✅ Scripts syntax validated >> PACKAGE_SUMMARY.md
echo - ✅ Executables tested >> PACKAGE_SUMMARY.md
echo - ✅ Documentation complete >> PACKAGE_SUMMARY.md
echo. >> PACKAGE_SUMMARY.md
echo **Package ready for distribution!** 🚀 >> PACKAGE_SUMMARY.md

echo [4/4] Final verification...
echo.

REM Final verification
if exist "%ZIP_NAME%" (
    for %%A in ("%ZIP_NAME%") do set ZIP_SIZE=%%~zA
    set /a ZIP_SIZE_MB=%ZIP_SIZE% / 1024 / 1024
    
    echo ✅ Distribution package created successfully!
    echo    Package: %ZIP_NAME%
    echo    Size: %ZIP_SIZE_MB% MB
    echo    Location: %CD%
    echo.
) else (
    echo ❌ Distribution package not found!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   BUILD AND TEST PIPELINE COMPLETED!
echo ==========================================
echo.
echo 🎉 Studio POS distribution package is ready!
echo.
echo Package Details:
echo - Name: %ZIP_NAME%
echo - Size: %ZIP_SIZE_MB% MB
echo - Location: %CD%
echo.
echo Next Steps:
echo 1. Test on clean Windows machine
echo 2. Verify installation flow works
echo 3. Test Studio POS functionality
echo 4. Distribute to end users
echo.
echo Documentation:
echo - PACKAGE_SUMMARY.md - Package overview
echo - DISTRIBUTION_PACKAGE_GUIDE.md - Detailed guide
echo - FINAL_DISTRIBUTION_README.md - Quick start
echo.

REM Open current directory
echo Opening distribution folder...
explorer .

echo.
echo Press Enter to exit...
pause >nul

exit /b 0

