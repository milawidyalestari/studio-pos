# Sistem Notifikasi Otomatis Dashboard Admin

## Overview
Sistem notifikasi otomatis telah dibuat untuk halaman Dashboard Admin yang akan menampilkan semua update pada orderan secara real-time di inbox yang berada di bawah calendar.

## Fitur Notifikasi

### Jenis Notifikasi yang Ditampilkan:
1. **🆕 Userxxx - Menambahkan Orderan Baru** - Ketika order baru dibuat
2. **🗑️ Userxxx - Menghapus Orderan** - Ketika order dihapus
3. **✏️ Userxxx - Update Orderan -> Status** - Ketika status order berubah
4. **⚡ Userxxx - Orderan Di Proses** - Ketika status berubah ke "processing"
5. **✅ Userxxx - Orderan Selesai** - Ketika status berubah ke "completed"

## Komponen yang Telah Dibuat

### 1. Hook useNotifications (`src/hooks/useNotifications.ts`)
- Mengelola state notifikasi
- Real-time listening untuk perubahan order
- Fungsi untuk mark as read/unread
- Auto-fetch notifikasi dari database

### 2. Komponen InboxSection (`src/components/dashboard/InboxSection.tsx`)
- UI untuk menampilkan notifikasi
- Collapsible design
- Badge untuk notifikasi unread
- Icon yang berbeda untuk setiap jenis notifikasi
- Timestamp dengan format Indonesia

### 3. DashboardHeader (`src/components/dashboard/DashboardHeader.tsx`)
- Tombol Inbox dengan badge notifikasi
- Toggle untuk show/hide inbox

### 4. NotificationService (`src/services/notificationService.ts`)
- Service untuk membuat notifikasi otomatis
- Integrasi dengan order operations
- Fungsi helper untuk berbagai jenis notifikasi

### 5. OrderService Integration (`src/services/orderService.ts`)
- Notifikasi otomatis saat create order
- Notifikasi otomatis saat update order
- Notifikasi otomatis saat delete order
- Notifikasi khusus untuk perubahan status

## Setup Database

### Tabel Notifications
```sql
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

### Indexes
- `idx_notifications_timestamp` - Untuk sorting berdasarkan waktu
- `idx_notifications_is_read` - Untuk filter unread notifications
- `idx_notifications_order_id` - Untuk relasi dengan orders

### Row Level Security
- Policy untuk SELECT, INSERT, UPDATE
- Hanya user yang authenticated yang bisa akses

## Cara Kerja

### 1. Real-time Listening
- Menggunakan Supabase real-time subscriptions
- Listen untuk semua perubahan pada tabel `orders`
- Otomatis membuat notifikasi berdasarkan event type

### 2. Auto-notification Creation
- **INSERT**: Order baru dibuat → Notifikasi "Menambahkan Orderan Baru"
- **UPDATE**: Order diupdate → Notifikasi "Update Orderan" atau status-specific
- **DELETE**: Order dihapus → Notifikasi "Menghapus Orderan"

### 3. Status Change Detection
- Monitor perubahan pada field `status_id`
- Notifikasi khusus untuk status "processing" dan "completed"
- Format: "Userxxx - Orderan Di Proses" / "Userxxx - Orderan Selesai"

## Integrasi dengan Order System

### Create Order
```typescript
// Di createNewOrder function
if (orderFields.employee_id) {
  await NotificationService.createOrderCreatedNotification(
    savedOrder.id.toString(),
    orderFields.employee_id
  );
}
```

### Update Order
```typescript
// Di updateExistingOrder function
if (orderFields.employee_id) {
  const newStatus = orderFields.status_id;
  if (oldStatus !== newStatus) {
    // Status changed
    await NotificationService.createOrderStatusUpdateNotification(
      orderId.toString(),
      orderFields.employee_id,
      oldStatus || '',
      newStatus || ''
    );
  } else {
    // General update
    await NotificationService.createOrderUpdateNotification(
      orderId.toString(),
      orderFields.employee_id
    );
  }
}
```

### Delete Order
```typescript
// Di deleteOrder function
await NotificationService.createOrderDeletedNotification(
  orderId.toString(),
  employeeId
);
```

## UI Features

### Inbox Header
- Title "Inbox" dengan badge unread count
- Tombol refresh untuk manual fetch
- Tombol "Tandai Semua Dibaca"
- Collapse/expand functionality

### Notification Items
- Icon yang berbeda untuk setiap jenis notifikasi
- Message dengan format yang diminta
- Nama user yang melakukan action
- Timestamp relatif (e.g., "2 menit yang lalu")
- Badge "Baru" untuk unread notifications
- Tombol check untuk mark as read

### Responsive Design
- Collapsible untuk mobile view
- Scrollable content area
- Proper spacing dan typography

## Dependencies

### NPM Packages
- `date-fns` - Untuk formatting timestamp
- `@supabase/supabase-js` - Untuk database operations

### UI Components
- `@/components/ui/card` - Card layout
- `@/components/ui/button` - Buttons
- `@/components/ui/badge` - Badge untuk unread count
- `@/components/ui/separator` - Visual separation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install date-fns
```

### 2. Create Database Table
Jalankan migration SQL untuk membuat tabel notifications:
```bash
# Copy SQL dari file migration ke Supabase dashboard
# Atau jalankan script setup-notifications.js
```

### 3. Environment Variables
Pastikan environment variables untuk Supabase sudah diset:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test Notifications
- Buat order baru → Lihat notifikasi di inbox
- Update status order → Lihat notifikasi status change
- Delete order → Lihat notifikasi deletion

## Troubleshooting

### Notifikasi Tidak Muncul
1. Check database connection
2. Verify RLS policies
3. Check browser console untuk errors
4. Verify real-time subscriptions

### Performance Issues
1. Check database indexes
2. Monitor real-time connection
3. Limit notification history (default: 50 notifications)

## Future Enhancements

### Fitur yang Bisa Ditambahkan:
1. **Email Notifications** - Kirim notifikasi via email
2. **Push Notifications** - Browser push notifications
3. **Notification Preferences** - User bisa set jenis notifikasi yang diinginkan
4. **Notification Groups** - Group berdasarkan jenis atau user
5. **Advanced Filtering** - Filter berdasarkan date range, user, type
6. **Bulk Actions** - Mark multiple notifications as read

### Database Optimizations:
1. **Partitioning** - Partition berdasarkan tanggal untuk performance
2. **Archiving** - Archive old notifications
3. **Aggregation** - Summary notifications untuk multiple events

## Security Considerations

### Row Level Security (RLS)
- Hanya authenticated users yang bisa akses
- Users hanya bisa lihat notifikasi yang relevan
- Proper validation untuk input data

### Data Validation
- Check constraint untuk notification types
- Foreign key constraints untuk order_id
- Input sanitization untuk user input

## Monitoring & Maintenance

### Cleanup Jobs
- Otomatis hapus notifikasi lama (>30 hari)
- Monitor database size
- Performance monitoring untuk real-time subscriptions

### Error Handling
- Graceful fallback jika real-time connection gagal
- Retry mechanism untuk failed operations
- Logging untuk debugging

---

**Note**: Sistem ini sudah siap digunakan dan akan otomatis menampilkan notifikasi untuk semua operasi order. Pastikan database table sudah dibuat dan environment variables sudah diset dengan benar.


