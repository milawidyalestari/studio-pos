# Script to display instructions for fixing payment_update trigger
# This script helps guide you through fixing the payment date issue

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX PAYMENT UPDATE TRIGGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "MASALAH:" -ForegroundColor Yellow
Write-Host "Tanggal pembayaran di Tab Transaksi berubah setiap kali order diedit,"
Write-Host "bukan hanya saat DP atau Pelunasan diedit."
Write-Host ""

Write-Host "SOLUSI:" -ForegroundColor Green
Write-Host ""

Write-Host "1. Frontend Code (SUDAH DIPERBAIKI OTOMATIS) ✓" -ForegroundColor Green
Write-Host "   - File: src/hooks/useOrders.ts"
Write-Host "   - Logika manual update payment_update sudah dihapus"
Write-Host ""

Write-Host "2. Database Trigger (PERLU DIPERBAIKI MANUAL) !" -ForegroundColor Yellow
Write-Host "   Anda perlu menjalankan migrasi SQL ke database Supabase"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LANGKAH-LANGKAH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPSI A: Menggunakan Supabase Dashboard (RECOMMENDED)" -ForegroundColor Green
Write-Host "1. Buka browser dan pergi ke: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Login dan pilih project Studio POS Anda" -ForegroundColor White
Write-Host "3. Klik 'SQL Editor' di sidebar kiri" -ForegroundColor White
Write-Host "4. Klik 'New Query'" -ForegroundColor White
Write-Host "5. Copy SELURUH isi file:" -ForegroundColor White
Write-Host "   supabase\migrations\20250117000000_fix_payment_update_trigger.sql" -ForegroundColor Yellow
Write-Host "6. Paste ke SQL Editor" -ForegroundColor White
Write-Host "7. Klik tombol 'RUN' (atau tekan Ctrl+Enter)" -ForegroundColor White
Write-Host "8. Tunggu hingga muncul 'Success' ✓" -ForegroundColor White
Write-Host ""

Write-Host "OPSI B: Menggunakan Supabase CLI" -ForegroundColor Green
Write-Host "1. Install Supabase CLI (jika belum):" -ForegroundColor White
Write-Host "   npm install -g supabase" -ForegroundColor Yellow
Write-Host "2. Login:" -ForegroundColor White
Write-Host "   supabase login" -ForegroundColor Yellow
Write-Host "3. Link project:" -ForegroundColor White
Write-Host "   supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor Yellow
Write-Host "4. Push migration:" -ForegroundColor White
Write-Host "   supabase db push" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFIKASI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setelah menjalankan migrasi, test dengan cara:" -ForegroundColor White
Write-Host "1. Buka aplikasi Studio POS" -ForegroundColor White
Write-Host "2. Edit sebuah order (ubah customer name saja)" -ForegroundColor White
Write-Host "3. Cek Report > Transaksi - tanggal pembayaran TIDAK berubah ✓" -ForegroundColor White
Write-Host "4. Edit order yang sama (ubah nilai DP/Pelunasan)" -ForegroundColor White
Write-Host "5. Cek Report > Transaksi - tanggal pembayaran BERUBAH ✓" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask user if they want to open the migration file
$response = Read-Host "Apakah Anda ingin membuka file migrasi SQL sekarang? (Y/N)"

if ($response -eq "Y" -or $response -eq "y") {
    $migrationFile = Join-Path $PSScriptRoot "..\supabase\migrations\20250117000000_fix_payment_update_trigger.sql"
    
    if (Test-Path $migrationFile) {
        Write-Host ""
        Write-Host "Membuka file migrasi..." -ForegroundColor Green
        Start-Process notepad.exe $migrationFile
    } else {
        Write-Host ""
        Write-Host "Error: File migrasi tidak ditemukan!" -ForegroundColor Red
        Write-Host "Path: $migrationFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Untuk instruksi lengkap, baca file:" -ForegroundColor Cyan
Write-Host "FIX_PAYMENT_DATE_INSTRUCTIONS.md" -ForegroundColor Yellow
Write-Host ""

# Ask user if they want to open the instructions
$response2 = Read-Host "Apakah Anda ingin membuka file instruksi lengkap? (Y/N)"

if ($response2 -eq "Y" -or $response2 -eq "y") {
    $instructionsFile = Join-Path $PSScriptRoot "..\FIX_PAYMENT_DATE_INSTRUCTIONS.md"
    
    if (Test-Path $instructionsFile) {
        Write-Host ""
        Write-Host "Membuka file instruksi..." -ForegroundColor Green
        Start-Process $instructionsFile
    } else {
        Write-Host ""
        Write-Host "Error: File instruksi tidak ditemukan!" -ForegroundColor Red
        Write-Host "Path: $instructionsFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Selesai! Good luck! 🚀" -ForegroundColor Green
Write-Host ""

