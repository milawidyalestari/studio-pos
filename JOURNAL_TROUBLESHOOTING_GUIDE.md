# Panduan Troubleshooting Jurnal Umum

## Masalah: Jurnal Umum Tidak Bisa Menambahkan Jurnal

### Penyebab Umum dan Solusi

#### 1. **Field Jenis Referensi Kosong**
**Gejala:** Form tidak bisa disubmit atau error saat menyimpan
**Solusi:** 
- Pastikan memilih jenis referensi (Penjualan, Pembelian, dll.)
- Field ini sekarang wajib diisi (required)

#### 2. **Tidak Ada Baris Jurnal**
**Gejala:** Error "Harap tambahkan minimal satu baris jurnal"
**Solusi:**
- Klik tombol "+" untuk menambahkan baris jurnal
- Isi akun, debit/kredit, dan deskripsi
- Pastikan total debit = total kredit

#### 3. **Total Debit dan Kredit Tidak Sama**
**Gejala:** Error "Total debit dan kredit harus sama"
**Solusi:**
- Periksa perhitungan di setiap baris jurnal
- Pastikan total debit = total kredit (toleransi 0.01)

#### 4. **Tidak Ada Akun di Chart of Accounts**
**Gejala:** Dropdown akun kosong
**Solusi:**
- Buat akun terlebih dahulu di tab "Daftar Akun"
- Minimal perlu 2 akun untuk membuat jurnal (1 debit, 1 kredit)

#### 5. **Error Database**
**Gejala:** Error saat menyimpan ke database
**Solusi:**
- Cek koneksi internet
- Pastikan database Supabase aktif
- Lihat console browser untuk detail error

### Langkah-langkah Debugging

#### 1. **Cek Console Browser**
```javascript
// Buka Developer Tools (F12)
// Lihat tab Console untuk error messages
```

#### 2. **Test Database Connection**
```bash
# Jalankan script test
node test-journal-creation.js
```

#### 3. **Validasi Form Data**
Pastikan data yang diisi:
- ✅ Tanggal transaksi
- ✅ Jenis referensi (wajib)
- ✅ Minimal 1 baris jurnal
- ✅ Total debit = total kredit
- ✅ Akun yang dipilih valid

### Perbaikan yang Sudah Dilakukan

1. **Validasi Form yang Lebih Ketat**
   - Field jenis referensi sekarang wajib
   - Validasi total debit = kredit
   - Error messages yang lebih jelas

2. **Error Handling yang Lebih Baik**
   - Console logging untuk debugging
   - Error messages yang informatif
   - Loading state saat menyimpan

3. **Database Validation**
   - Test script untuk verifikasi database
   - Validasi required fields di service layer
   - Rollback jika ada error

### Cara Menggunakan Jurnal Umum

1. **Buka Modul Akuntansi**
   - Klik menu "Akuntansi"
   - Pilih tab "Jurnal Umum"

2. **Tambah Jurnal Baru**
   - Klik tombol "Tambah Jurnal"
   - Isi form dengan lengkap:
     - Nomor jurnal (opsional, auto-generated)
     - Tanggal transaksi
     - Deskripsi
     - **Jenis referensi (WAJIB)**

3. **Tambah Baris Jurnal**
   - Pilih akun dari dropdown
   - Isi debit atau kredit (bukan keduanya)
   - Isi deskripsi baris
   - Klik tombol "+" untuk menambah

4. **Simpan Jurnal**
   - Pastikan total debit = total kredit
   - Klik "Simpan Jurnal"
   - Tunggu proses selesai

### Status Jurnal

- **Draft:** Jurnal belum diposting, bisa diedit
- **Posted:** Jurnal sudah diposting, tidak bisa diedit
- **Cancelled:** Jurnal dibatalkan

### Tips dan Best Practices

1. **Gunakan Deskripsi yang Jelas**
   - Deskripsi jurnal: "Pembelian bahan baku"
   - Deskripsi baris: "Kas - Pembelian bahan baku"

2. **Periksa Keseimbangan**
   - Selalu pastikan debit = kredit
   - Gunakan kalkulator jika perlu

3. **Backup Data**
   - Export jurnal secara berkala
   - Simpan backup database

### Kontak Support

Jika masalah masih berlanjut:
1. Screenshot error message
2. Cek console browser (F12)
3. Laporkan ke tim development

---

**Terakhir diperbarui:** $(date)
**Versi:** 1.0
