# 🔧 Debugging Role Permissions - Panduan Lengkap

## 🚨 Masalah yang Dilaporkan
- Setting role permissions tidak benar-benar berlaku setelah disimpan
- User dengan role "Owner" yang sudah diedit tidak memiliki akses yang diizinkan saat login

## 🔍 Debug Tools yang Sudah Ditambahkan

### 1. **DatabaseSetupHelper Component**
- Lokasi: `src/components/settings/DatabaseSetupHelper.tsx`
- Fungsi: Mengecek apakah tabel `role_permissions` dan `roles` ada
- Akses: Muncul di bagian atas halaman Settings > User

### 2. **Enhanced Logging di `saveRoleAccessToDb`**
```tsx
// Console logs yang ditambahkan:
🔄 Saving role permissions...
Role: [role_name]
Access State: [object]
🗑️ Deleting old permissions for role: [role_name]
✅ Old permissions deleted
📋 New permissions to insert: [array]
💾 Inserting new permissions...
✅ New permissions inserted successfully
🔍 Verifying saved permissions...
✅ Verified permissions in database: [array]
```

### 3. **Enhanced Logging di `RoleAccessContext`**
```tsx
// Console logs yang ditambahkan:
🔄 RoleAccessContext: Refreshing permissions for role: [role_name]
✅ Fetched permissions from database: [array]
❌ Error fetching permissions: [error]
```

### 4. **Enhanced Logging di `useHasAccess`**
```tsx
// Console logs yang ditambahkan:
🔍 Checking access: [menu].[action] for role: [role_name]
Available permissions: [array]
✅ Access granted for [menu].[action]
❌ Access denied for [menu].[action]
```

## 🧪 Langkah-langkah Debugging

### **Step 1: Check Database Setup**

1. **Buka aplikasi dan masuk ke Settings > User**
2. **Lihat DatabaseSetupHelper di bagian atas**
3. **Check status tabel:**
   - ✅ Roles Table: Exists
   - ✅ Role Permissions Table: Exists

**Jika tabel tidak ada:**
- Klik tombol "Create Role Permissions Table"
- Atau jalankan SQL manual di Supabase Dashboard

### **Step 2: Verify Role "Owner" Exists**

**Jalankan query di Supabase SQL Editor:**
```sql
-- Check if Owner role exists
SELECT * FROM roles WHERE name = 'Owner';
```

**Jika tidak ada, insert:**
```sql
INSERT INTO roles (name, description) 
VALUES ('Owner', 'Pemilik dengan akses monitoring dan laporan')
ON CONFLICT (name) DO NOTHING;
```

### **Step 3: Test Save Function**

1. **Login sebagai Administrator**
2. **Buka Browser Console (F12 > Console)**
3. **Pergi ke Settings > User > Klik "Hak Role"**
4. **Pilih role "Owner"**
5. **Set beberapa permissions (centang beberapa checkbox)**
6. **Klik "Simpan"**
7. **Perhatikan console logs:**

**Expected logs:**
```
🔄 Saving role permissions...
Role: Owner
Access State: {Dashboard: {view_stats: true, ...}, ...}
🗑️ Deleting old permissions for role: Owner
✅ Old permissions deleted
📋 New permissions to insert: [{role: "Owner", menu: "Dashboard", action: "view_stats", allowed: true}, ...]
💾 Inserting new permissions...
✅ New permissions inserted successfully
🔍 Verifying saved permissions...
✅ Verified permissions in database: [array dengan data]
```

**Jika ada error:**
- Error saat delete: Tabel mungkin tidak ada
- Error saat insert: Foreign key constraint atau data type issue
- Error saat verify: Query permission issue

### **Step 4: Verify Data in Database**

**Jalankan query di Supabase:**
```sql
-- Check saved permissions for Owner
SELECT role, menu, action, allowed, created_at 
FROM role_permissions 
WHERE role = 'Owner'
ORDER BY menu, action;
```

**Expected result:**
```
role   | menu      | action     | allowed | created_at
-------|-----------|------------|---------|------------
Owner  | Dashboard | view_stats | true    | 2025-...
Owner  | Orderan   | view_orders| true    | 2025-...
...
```

### **Step 5: Test Load Function**

1. **Buat user dengan role "Owner"**
2. **Logout dari Administrator**
3. **Login dengan user Owner**
4. **Perhatikan console logs saat login:**

**Expected logs:**
```
🔄 RoleAccessContext: Refreshing permissions for role: Owner
✅ Fetched permissions from database: [
  {menu: "Dashboard", action: "view_stats", allowed: true},
  {menu: "Orderan", action: "view_orders", allowed: true},
  ...
]
```

**Jika tidak ada data atau error:**
- Check apakah role name exact match (case sensitive)
- Check apakah query filtering bekerja

### **Step 6: Test Permission Check**

1. **Masih login sebagai Owner**
2. **Kunjungi halaman yang seharusnya ada akses (misal: Dashboard)**
3. **Perhatikan console logs:**

**Expected logs:**
```
🔍 Checking access: Dashboard.view_stats for role: Owner
Available permissions: [{menu: "Dashboard", action: "view_stats", allowed: true}, ...]
✅ Access granted for Dashboard.view_stats
```

**Jika access denied:**
- Check apakah permission ada di array
- Check apakah menu/action name exact match

## ❌ Common Issues & Solutions

### **Issue 1: Table Missing**
```
❌ Error: relation "role_permissions" does not exist
```
**Solution:**
- Gunakan DatabaseSetupHelper untuk create table
- Atau jalankan migration manual

### **Issue 2: Role Not Found**
```
❌ No permissions found for role: Owner
```
**Solution:**
```sql
INSERT INTO roles (name, description) 
VALUES ('Owner', 'Pemilik dengan akses monitoring dan laporan');
```

### **Issue 3: Case Sensitivity**
```
❌ Role mismatch: "owner" vs "Owner"
```
**Solution:**
- Pastikan role name consistent (capital O)
- Check di employees table: `SELECT DISTINCT role FROM employees;`

### **Issue 4: Foreign Key Constraint**
```
❌ Foreign key constraint violation
```
**Solution:**
- Pastikan role exists di roles table sebelum insert permissions

### **Issue 5: No Permissions Loaded**
```
🔄 RoleAccessContext: Refreshing permissions for role: Owner
✅ Fetched permissions from database: []
```
**Solution:**
- Check apakah data benar-benar tersimpan di database
- Check query filter `WHERE role = 'Owner' AND allowed = true`

## 🔧 Manual SQL Debug Queries

### **Check All Tables:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'role_permissions', 'employees');
```

### **Check All Roles:**
```sql
SELECT * FROM roles ORDER BY name;
```

### **Check All Permissions:**
```sql
SELECT role, menu, action, allowed, created_at 
FROM role_permissions 
ORDER BY role, menu, action;
```

### **Check Specific User:**
```sql
SELECT nama, role, username, status 
FROM employees 
WHERE role = 'Owner';
```

### **Insert Test Data:**
```sql
-- Insert Owner role
INSERT INTO roles (name, description) 
VALUES ('Owner', 'Test Owner Role') 
ON CONFLICT (name) DO NOTHING;

-- Insert test permissions
INSERT INTO role_permissions (role, menu, action, allowed) VALUES
('Owner', 'Dashboard', 'view_stats', true),
('Owner', 'Orderan', 'view_orders', true),
('Owner', 'Finance', 'view_finance', true)
ON CONFLICT (role, menu, action) DO NOTHING;
```

## 📝 Action Items

1. **Jalankan DatabaseSetupHelper** untuk verify table setup
2. **Test save function** dengan console logs
3. **Verify database data** dengan SQL queries
4. **Test load function** saat login Owner
5. **Check permission logic** di halaman aplikasi
6. **Report findings** dengan console logs dan SQL results

## 🎯 Success Criteria

✅ **Database Setup:**
- Tabel `roles` dan `role_permissions` ada
- Role "Owner" ada di tabel `roles`

✅ **Save Function:**
- Console logs menunjukkan save berhasil
- Data terverifikasi ada di database

✅ **Load Function:**
- Console logs menunjukkan fetch berhasil
- Permissions array terisi dengan benar

✅ **Permission Check:**
- `useHasAccess()` return `true` untuk permissions yang diset
- UI components muncul sesuai permissions

**Dengan debugging tools dan langkah-langkah ini, kita bisa identify exact issue dan fix secara targeted!** 🎉
