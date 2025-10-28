# 🚀 Quick Start: Integrasi POS-Accounting

## Setup dalam 3 Langkah

### 1️⃣ Jalankan Setup Script

Buka **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy dan paste isi file berikut, lalu klik **Run**:
```
scripts/setup-pos-accounting-integration.sql
```

### 2️⃣ Verifikasi Setup

Setelah script selesai, Anda akan melihat output:
```
✅ Setup Complete!

Accounts Check:
- Total Accounts: 3
- Kas (1110): ✓
- Piutang (1130): ✓
- Pendapatan (4100): ✓
```

### 3️⃣ Test Integrasi

1. Buat order baru di POS
2. Ubah status ke "Done"
3. Cek hasil:

```sql
SELECT * FROM v_order_journal_entries 
ORDER BY order_date DESC 
LIMIT 5;
```

## ✅ Selesai!

Sekarang sistem POS Anda sudah terintegrasi dengan akuntansi!

---

## 📊 Fitur yang Aktif

### Otomatis Tercatat
- ✅ Penjualan Tunai → Jurnal otomatis
- ✅ Penjualan Kredit → Piutang tercatat
- ✅ Uang Muka → Piutang tersisa tercatat
- ✅ Saldo Kas → Update real-time

### Fungsi Tersedia
- ✅ `record_payment_receipt()` - Catat pelunasan piutang
- ✅ `record_expense()` - Catat pengeluaran
- ✅ `validate_journal_entry()` - Validasi keseimbangan
- ✅ Views untuk monitoring

---

## 📝 Contoh Penggunaan

### Catat Pelunasan Piutang
```sql
SELECT record_payment_receipt(
  'order-uuid-here'::uuid,
  200000,
  'cash',
  'Pelunasan dari Customer A'
);
```

### Catat Pengeluaran
```sql
SELECT record_expense(
  '5210',  -- Kode akun Biaya Gaji
  500000,
  'Gaji Karyawan Januari 2025',
  'cash'
);
```

### Cek Piutang Outstanding
```sql
SELECT * FROM v_outstanding_receivables;
```

### Cek Saldo Kas
```sql
SELECT current_balance 
FROM cash_accounts 
WHERE is_primary = true;
```

---

## 🎯 Alur Kerja Harian

### Pagi (Buka Toko)
1. Cek saldo kas:
   ```sql
   SELECT current_balance FROM cash_accounts WHERE is_primary = true;
   ```

### Sepanjang Hari
- Terima order → System otomatis catat jurnal saat status "Done" ✅
- Terima pelunasan → Gunakan `record_payment_receipt()`
- Ada pengeluaran → Gunakan `record_expense()`

### Sore (Tutup Toko)
1. Cek total penjualan hari ini:
   ```sql
   SELECT * FROM v_sales_summary 
   WHERE date = CURRENT_DATE;
   ```

2. Cek piutang yang perlu ditagih:
   ```sql
   SELECT * FROM v_outstanding_receivables 
   WHERE days_outstanding > 7;
   ```

3. Rekonsiliasi kas (bandingkan sistem vs fisik)

---

## 🆘 Troubleshooting

### ❌ Error: "Required accounting accounts not found"
**Solusi:** Jalankan ulang setup script

### ❌ Journal entry tidak terbuat otomatis
**Solusi:** 
```sql
-- Cek trigger aktif atau tidak
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'create_journal_entry_on_order_completion';
```

### ❌ Saldo kas tidak update
**Solusi:**
```sql
-- Update manual saldo kas
UPDATE cash_accounts 
SET current_balance = (
  SELECT SUM(debit_amount - credit_amount) 
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  WHERE jel.account_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1110')
  AND je.status = 'posted'
)
WHERE is_primary = true;
```

---

## 📚 Dokumentasi Lengkap

Untuk panduan detail, baca:
- `POS_ACCOUNTING_INTEGRATION.md` - Dokumentasi lengkap
- `ACCOUNTING_IMPLEMENTATION.md` - Implementasi sistem akuntansi

---

## 💡 Tips

1. **Selalu cek saldo kas setiap hari** - Pastikan sesuai dengan kas fisik
2. **Monitor piutang** - Tagih piutang yang > 7 hari
3. **Backup regular** - Export data akuntansi secara berkala
4. **Training staff** - Pastikan semua staff tahu cara mencatat transaksi

---

## 📞 Support

Butuh bantuan? Dokumentasi lengkap tersedia di:
- `POS_ACCOUNTING_INTEGRATION.md`
- `src/services/posAccountingService.ts`

---

**Selamat! Sistem akuntansi Anda sudah siap digunakan! 🎉**

