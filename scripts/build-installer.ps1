# Studio POS Installer Build Script
# PowerShell script for building Studio POS installer

param(
    [switch]$Clean = $false,
    [switch]$SkipTests = $false,
    [string]$Version = "1.0.0"
)

Write-Host "🚀 Building Studio POS Installer v$Version" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Stop"

try {
    # Step 1: Clean previous builds
    if ($Clean) {
        Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
        if (Test-Path "build-output") {
            Remove-Item -Recurse -Force "build-output"
        }
        if (Test-Path "dist") {
            Remove-Item -Recurse -Force "dist"
        }
        Write-Host "✅ Clean completed" -ForegroundColor Green
    }

    # Step 2: Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green

    # Step 3: Run tests (optional)
    if (-not $SkipTests) {
        Write-Host "🧪 Running tests..." -ForegroundColor Yellow
        npm run test 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Tests failed, but continuing..." -ForegroundColor Yellow
        } else {
            Write-Host "✅ Tests passed" -ForegroundColor Green
        }
    }

    # Step 4: Build React application
    Write-Host "⚛️ Building React application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build React application"
    }
    
    # Verify build files
    if (-not (Test-Path "dist\index.html")) {
        throw "React build failed - index.html not found"
    }
    Write-Host "✅ React build completed" -ForegroundColor Green

    # Step 5: Create build resources
    Write-Host "🎨 Creating build resources..." -ForegroundColor Yellow
    if (-not (Test-Path "build")) {
        New-Item -ItemType Directory -Path "build" | Out-Null
    }
    
    # Copy icon if it doesn't exist
    if (-not (Test-Path "build\icon.ico")) {
        if (Test-Path "public\favicon.ico") {
            Copy-Item "public\favicon.ico" "build\icon.ico"
            Write-Host "✅ Icon copied" -ForegroundColor Green
        } else {
            Write-Host "⚠️ No icon found, using default" -ForegroundColor Yellow
        }
    }

    # Step 6: Build Electron application
    Write-Host "⚡ Building Electron application..." -ForegroundColor Yellow
    npm run electron:dist
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build Electron application"
    }

    # Step 7: Verify installer
    Write-Host "🔍 Verifying installer..." -ForegroundColor Yellow
    $installerPath = "build-output\Studio POS-$Version-x64.exe"
    
    if (Test-Path $installerPath) {
        $fileSize = (Get-Item $installerPath).Length / 1MB
        Write-Host ""
        Write-Host "🎉 Installer created successfully!" -ForegroundColor Green
        Write-Host "📁 Location: $installerPath" -ForegroundColor Cyan
        Write-Host "📊 Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✨ Installer features:" -ForegroundColor Magenta
        Write-Host "   • Windows NSIS installer" -ForegroundColor White
        Write-Host "   • Desktop shortcut creation" -ForegroundColor White
        Write-Host "   • Start menu integration" -ForegroundColor White
        Write-Host "   • Uninstaller included" -ForegroundColor White
        Write-Host "   • Transparent windows support" -ForegroundColor White
        Write-Host "   • Splash screen included" -ForegroundColor White
        Write-Host "   • Database setup wizard" -ForegroundColor White
        Write-Host "   • Professional UI with glassmorphism" -ForegroundColor White
        Write-Host ""
        
        # List all build outputs
        Write-Host "📦 Build outputs:" -ForegroundColor Magenta
        Get-ChildItem "build-output" | ForEach-Object {
            Write-Host "   • $($_.Name)" -ForegroundColor White
        }
        
    } else {
        throw "Installer not found at expected location"
    }

    Write-Host ""
    Write-Host "🎯 Build completed successfully!" -ForegroundColor Green
    Write-Host "You can now distribute the installer to users." -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the output above for details." -ForegroundColor Yellow
    exit 1
}
