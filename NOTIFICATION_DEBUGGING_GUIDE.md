# 🔍 Panduan Debugging Sistem Notifikasi

## 🎯 Masalah: Notifikasi Tidak Muncul Meskipun Database Terupdate

### 📋 Langkah-langkah Debugging

#### 1. **Cek Browser Console**
1. Buka aplikasi di browser
2. Tekan `F12` untuk membuka Developer Tools
3. Klik tab **Console**
4. Cari pesan yang dimulai dengan:
   - `🔍` - Setup notifications
   - `📡` - Real-time events
   - `📝` - Creating notifications
   - `❌` - Errors

#### 2. **Test Manual Notification**
1. Klik tombol **Inbox** di Dashboard Admin
2. Klik tombol **🧪** (test tube) di pojok kanan atas popover
3. Lihat apakah notifikasi test muncul
4. Cek console untuk log: `✅ Test notification created successfully`

#### 3. **Cek Real-time Status**
Di popover notifikasi, lihat status "Real-time":
- 🟢 **Connected** = Real-time berfungsi
- 🟡 **Connecting...** = Sedang mencoba koneksi
- 🔴 **Error/Timeout** = Ada masalah koneksi

#### 4. **Test Order Creation**
1. Buat order baru di aplikasi
2. Cek console untuk log:
   - `📡 Real-time event received`
   - `📝 Creating notification: ...`
3. Jika tidak ada log, berarti real-time tidak berfungsi

### 🛠️ Solusi Berdasarkan Gejala

#### **Gejala 1: Real-time Status = Error/Timeout**
**Penyebab:** Real-time subscriptions tidak berfungsi

**Solusi:**
1. Refresh halaman browser
2. Cek koneksi internet
3. Restart aplikasi
4. Cek Supabase Dashboard → Settings → API → Realtime

#### **Gejala 2: Test Button Tidak Berfungsi**
**Penyebab:** Masalah dengan tabel notifications

**Solusi:**
1. Jalankan SQL setup di Supabase:
```sql
-- Buat tabel notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order_created', 'order_deleted', 'order_updated', 'order_processing', 'order_completed')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  order_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Buat policies
CREATE POLICY "Allow authenticated users to read notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');
```

#### **Gejala 3: Real-time Events Tidak Muncul**
**Penyebab:** Field mapping tidak sesuai

**Solusi:**
1. Cek struktur tabel orders:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
```

2. Pastikan field employee ada:
```sql
-- Jika tidak ada, tambahkan
ALTER TABLE orders ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id);
```

#### **Gejala 4: Notifikasi Muncul Tapi Tidak Real-time**
**Penyebab:** Real-time subscription gagal

**Solusi:**
1. Cek Supabase Dashboard → Settings → API
2. Pastikan "Realtime" diaktifkan
3. Pastikan tabel `orders` ada di daftar real-time enabled tables

### 🔧 Debugging Lanjutan

#### **Cek Database Langsung**
Buka Supabase Dashboard → SQL Editor dan jalankan:

```sql
-- Cek apakah tabel notifications ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
);

-- Cek isi tabel notifications
SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 5;

-- Cek struktur tabel orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';

-- Cek RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';
```

#### **Test Manual di Browser Console**
Buka browser console dan jalankan:

```javascript
// Test koneksi ke Supabase
const { data, error } = await supabase
  .from('notifications')
  .select('count(*)', { count: 'exact', head: true });

console.log('Connection test:', { data, error });

// Test real-time subscription
const channel = supabase
  .channel('test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
    (payload) => console.log('Real-time event:', payload)
  )
  .subscribe((status) => console.log('Subscription status:', status));
```

### 📊 Checklist Debugging

- [ ] Browser console tidak ada error
- [ ] Test button berfungsi
- [ ] Real-time status = Connected
- [ ] Tabel notifications sudah dibuat
- [ ] RLS policies sudah benar
- [ ] Field employee_id ada di orders
- [ ] Real-time enabled di Supabase
- [ ] Order creation menghasilkan log real-time

### 🚨 Emergency Fix

Jika semua gagal, gunakan polling sebagai fallback:

```javascript
// Polling setiap 30 detik
setInterval(() => {
  fetchNotifications();
}, 30000);
```

### 📞 Support

Jika masalah masih berlanjut:
1. Screenshot browser console
2. Screenshot real-time status di popover
3. Screenshot error di Supabase Dashboard
4. Beri tahu saya hasil debugging di atas

---

**Note:** Sistem notifikasi membutuhkan setup yang benar di database dan real-time subscriptions yang berfungsi. Ikuti langkah-langkah di atas secara berurutan.



