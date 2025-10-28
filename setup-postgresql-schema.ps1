# Studio POS PostgreSQL Schema Setup Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Studio POS PostgreSQL Schema Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if PostgreSQL dependencies are installed
if (-not (Test-Path "node_modules\pg")) {
    Write-Host "📦 Installing PostgreSQL dependencies..." -ForegroundColor Yellow
    npm install pg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install PostgreSQL dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "🔧 Setting up PostgreSQL schema..." -ForegroundColor Yellow
Write-Host ""

# Set default database configuration
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "studio_pos"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres"

Write-Host "📊 Database Configuration:" -ForegroundColor Cyan
Write-Host "   Host: $($env:DB_HOST)" -ForegroundColor White
Write-Host "   Port: $($env:DB_PORT)" -ForegroundColor White
Write-Host "   Database: $($env:DB_NAME)" -ForegroundColor White
Write-Host "   User: $($env:DB_USER)" -ForegroundColor White
Write-Host ""

# Ask user for database configuration
$hostInput = Read-Host "Enter PostgreSQL host [localhost]"
if ($hostInput -ne "") { $env:DB_HOST = $hostInput }

$portInput = Read-Host "Enter PostgreSQL port [5432]"
if ($portInput -ne "") { $env:DB_PORT = $portInput }

$dbInput = Read-Host "Enter database name [studio_pos]"
if ($dbInput -ne "") { $env:DB_NAME = $dbInput }

$userInput = Read-Host "Enter PostgreSQL username [postgres]"
if ($userInput -ne "") { $env:DB_USER = $userInput }

$passInput = Read-Host "Enter PostgreSQL password" -AsSecureString
$env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($passInput))

Write-Host ""
Write-Host "🚀 Starting schema setup..." -ForegroundColor Yellow
Write-Host ""

# Run the schema setup
node scripts/setup-postgresql-schema.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ PostgreSQL schema setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start your Studio POS application" -ForegroundColor White
    Write-Host "   2. Use the Database Setup Wizard to configure the connection" -ForegroundColor White
    Write-Host "   3. The application will automatically detect the existing schema" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Schema setup failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   - Make sure PostgreSQL is running" -ForegroundColor White
    Write-Host "   - Check your connection details" -ForegroundColor White
    Write-Host "   - Ensure the database exists" -ForegroundColor White
    Write-Host "   - Verify username and password" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to exit"
