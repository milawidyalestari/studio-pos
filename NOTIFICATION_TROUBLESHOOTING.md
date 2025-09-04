# Troubleshooting Sistem Notifikasi

## Masalah: Notifikasi Tidak Muncul Saat Perubahan Order

### 🔍 Langkah Diagnostik

#### 1. Cek Browser Console
Buka Developer Tools (F12) dan lihat di tab Console:
- Cari pesan error yang dimulai dengan `🔍`, `📡`, `📝`, `❌`
- Pastikan tidak ada error koneksi ke Supabase

#### 2. Test Manual Notification
1. Klik tombol inbox di Dashboard Admin
2. Klik tombol test tube (🧪) di pojok kanan atas popover
3. Lihat apakah notifikasi test muncul

#### 3. Cek Database Setup
Pastikan tabel notifications sudah dibuat di Supabase:

```sql
-- Jalankan di Supabase SQL Editor
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
);
```

### 🛠️ Solusi Berdasarkan Error

#### Error: "Failed to fetch notifications"
**Penyebab:** Tabel notifications belum dibuat atau RLS policies salah

**Solusi:**
1. Jalankan SQL setup di Supabase:
```sql
-- Copy dari file database/notifications-setup.sql
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
```

2. Enable RLS dan buat policies:
```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');
```

#### Error: "Real-time notifications not available"
**Penyebab:** Real-time subscriptions tidak berfungsi

**Solusi:**
1. Cek Supabase Dashboard → Settings → API
2. Pastikan "Realtime" diaktifkan
3. Cek apakah ada rate limiting

#### Error: "employee_id field not found"
**Penyebab:** Field employee_id tidak ada di tabel orders

**Solusi:**
1. Cek struktur tabel orders:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
```

2. Jika employee_id tidak ada, tambahkan:
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id);
```

### 🔧 Debugging Steps

#### Step 1: Cek Environment Variables
Pastikan file `.env` berisi:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 2: Test Database Connection
Buka browser console dan jalankan:
```javascript
// Test koneksi ke Supabase
const { data, error } = await supabase
  .from('notifications')
  .select('count(*)', { count: 'exact', head: true });

console.log('Connection test:', { data, error });
```

#### Step 3: Test Real-time Subscription
Di browser console:
```javascript
const channel = supabase
  .channel('test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
    (payload) => console.log('Real-time event:', payload)
  )
  .subscribe((status) => console.log('Subscription status:', status));
```

#### Step 4: Test Manual Order Creation
1. Buat order baru melalui aplikasi
2. Cek apakah ada log di console: `📡 Real-time event received`
3. Jika tidak ada, berarti real-time tidak berfungsi

### 🎯 Common Issues & Solutions

#### Issue 1: Notifikasi tidak muncul saat create order
**Checklist:**
- [ ] Tabel notifications sudah dibuat
- [ ] RLS policies sudah benar
- [ ] Real-time enabled di Supabase
- [ ] Field employee_id ada di orders table
- [ ] User sudah login/authenticated

#### Issue 2: Notifikasi muncul tapi tidak real-time
**Solusi:**
- Refresh halaman untuk reconnect real-time
- Cek network connection
- Restart aplikasi

#### Issue 3: Error "fetch failed"
**Solusi:**
- Cek internet connection
- Cek Supabase URL dan API key
- Cek apakah Supabase service down

#### Issue 4: Notifikasi duplikat
**Solusi:**
- Clear browser cache
- Restart aplikasi
- Cek apakah ada multiple subscriptions

### 📋 Testing Checklist

#### Manual Testing
- [ ] Klik tombol inbox → popover muncul
- [ ] Klik tombol test → notifikasi test muncul
- [ ] Buat order baru → notifikasi muncul
- [ ] Update status order → notifikasi status change muncul
- [ ] Delete order → notifikasi deletion muncul

#### Console Logs
- [ ] `🔍 Setting up real-time notifications...`
- [ ] `📡 Real-time subscription status: SUBSCRIBED`
- [ ] `✅ Real-time notifications enabled`
- [ ] `📡 Real-time event received` (saat ada perubahan order)
- [ ] `📝 Creating notification: ...`

### 🚨 Emergency Fixes

#### Jika semua gagal, gunakan fallback:
1. Disable real-time temporarily
2. Gunakan polling untuk fetch notifications setiap 30 detik
3. Integrate dengan NotificationService untuk manual triggers

#### Quick Database Reset:
```sql
-- Hapus dan buat ulang tabel notifications
DROP TABLE IF EXISTS notifications CASCADE;
-- Jalankan ulang setup script
```

### 📞 Support

Jika masalah masih berlanjut:
1. Cek Supabase status: https://status.supabase.com
2. Cek browser console untuk error details
3. Cek network tab untuk failed requests
4. Restart development server

---

**Note:** Sistem notifikasi membutuhkan setup database yang benar dan real-time subscriptions yang berfungsi. Pastikan semua dependencies terpenuhi sebelum testing.



