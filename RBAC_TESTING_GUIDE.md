# 🧪 Panduan Testing Role-Based Access Control (RBAC)

## ✅ Sistem RBAC Sekarang Aktif!

Sistem Role-Based Access Control telah diimplementasikan di seluruh aplikasi Studio POS. Sekarang tampilan dan fitur akan menyesuaikan dengan hak role yang diberikan.

## 🔧 Komponen yang Telah Diimplementasikan

### **📱 Pages dengan RBAC Protection:**
- ✅ **Dashboard** - Stats, Orders, Calendar, Inbox sections
- ✅ **Orderan** - View, Create, Edit, Delete orders
- ✅ **Transaction** - View transactions, Export data
- ✅ **Finance** - View finance, Manage expenses, Reports
- ✅ **Master Data** - View/Manage Products, Customers, etc
- ✅ **Inventory** - View inventory, Stock management
- ✅ **Report** - View/Export reports, Analysis
- ✅ **Settings** - View settings, User/Role management

### **🗂️ Sidebar Navigation:**
- ✅ **Menu Filtering** - Menu items hidden if no access
- ✅ **Permission Mapping** - Each menu tied to specific permission

### **🔐 Access Control Levels:**
1. **Page Level** - Entire page access denied
2. **Feature Level** - Specific buttons/sections hidden
3. **Data Level** - Export/management functions restricted

## 🧪 Testing Workflow

### **Step 1: Setup Test Roles**

#### **1.1 Create Test Users dengan Different Roles:**
```sql
-- Pastikan role permissions sudah ada di database
-- Check existing roles
SELECT * FROM roles ORDER BY name;

-- Check existing permissions for Owner role
SELECT role, menu, action, allowed 
FROM role_permissions 
WHERE role = 'Owner'
ORDER BY menu, action;
```

#### **1.2 Buat User untuk Testing:**
1. **Login sebagai Administrator**
2. **Go to Settings > User tab**
3. **Buat user dengan role berbeda:**
   - User A: Role "Administrator" 
   - User B: Role "Owner" (atau role lain)
   - User C: Role "Cashier"

### **Step 2: Set Role Permissions**

#### **2.1 Configure Owner Role:**
1. **Settings > User > Klik "Hak Role"**
2. **Pilih role "Owner"**
3. **Set permissions sesuai test scenario:**
   ```
   ✅ Dashboard:
      ☑️ Lihat Statistik
      ☑️ Lihat Pesanan
      ☐ Lihat Pendapatan
      ☑️ Lihat Kalender
      ☐ Lihat Kotak Masuk
   
   ✅ Manajemen Pesanan:
      ☑️ Lihat Pesanan
      ☐ Buat Pesanan
      ☐ Edit Pesanan
      ☐ Hapus Pesanan
      ☑️ Cetak SPK
      ☑️ Cetak Nota
   
   ✅ Manajemen Keuangan:
      ☑️ Lihat Keuangan
      ☑️ Lihat Laba Rugi
      ☐ Kelola Pengeluaran
      ☑️ Laporan Keuangan
   ```
4. **Klik "Simpan"**

#### **2.2 Configure Cashier Role:**
1. **Pilih role "Cashier"**
2. **Set permissions minimal:**
   ```
   ✅ Dashboard:
      ☐ Lihat Statistik
      ☑️ Lihat Pesanan
      ☐ Lihat Pendapatan
      ☑️ Lihat Kalender
      ☐ Lihat Kotak Masuk
   
   ✅ Manajemen Pesanan:
      ☑️ Lihat Pesanan
      ☑️ Buat Pesanan
      ☐ Edit Pesanan
      ☐ Hapus Pesanan
      ☐ Cetak SPK
      ☑️ Cetak Nota
   
   ✅ Manajemen Transaksi:
      ☑️ Lihat Transaksi
      ☑️ Cetak Struk
      ☐ Ekspor Data
   ```
3. **Klik "Simpan"**

### **Step 3: Test Login Scenarios**

#### **3.1 Test Administrator (Full Access):**
1. **Login sebagai Administrator**
2. **Expected Results:**
   - ✅ All menu items visible in sidebar
   - ✅ All pages accessible
   - ✅ All buttons/features visible
   - ✅ No access denied messages

#### **3.2 Test Owner (Limited Access):**
1. **Logout dan login sebagai Owner**
2. **Expected Results:**
   - **Sidebar:** Only menus with granted permissions
   - **Dashboard:** Stats + Orders + Calendar (no Inbox)
   - **Orderan:** View orders + Print buttons (no Create/Edit/Delete)
   - **Finance:** View + Reports (no Add Transaction)
   - **Other pages:** Depends on permissions set

#### **3.3 Test Cashier (Minimal Access):**
1. **Logout dan login sebagai Cashier**
2. **Expected Results:**
   - **Sidebar:** Very limited menu items
   - **Dashboard:** Only Orders + Calendar
   - **Orderan:** View + Create + Print Nota only
   - **Transaction:** View + Print Receipt only
   - **Finance/Report:** Access denied or not in sidebar

### **Step 4: Detailed Feature Testing**

#### **4.1 Dashboard Testing:**
```
Login sebagai Owner dengan partial permissions:

Expected Behavior:
- ✅ Stats section visible (if view_stats granted)
- ✅ Orders table visible (if view_orders granted)  
- ❌ Income section hidden (if view_income not granted)
- ✅ Calendar visible (if view_calendar granted)
- ❌ Inbox section hidden (if view_inbox not granted)
```

#### **4.2 Orderan Testing:**
```
Login sebagai Cashier:

Expected Behavior:
- ✅ Order list visible
- ✅ "Order Baru" button visible (if create_order granted)
- ❌ Edit buttons hidden (if edit_order not granted)
- ❌ Delete buttons hidden (if delete_order not granted)
- ✅ Print Nota visible (if print_nota granted)
- ❌ Print SPK hidden (if print_spk not granted)
```

#### **4.3 Finance Testing:**
```
Login sebagai Owner dengan view only:

Expected Behavior:
- ✅ Page accessible (if view_finance granted)
- ✅ Summary cards visible
- ❌ "Tambah Transaksi" hidden (if manage_expenses not granted)
- ✅ Export button visible (if financial_reports granted)
```

#### **4.4 Sidebar Testing:**
```
Login sebagai different roles:

Administrator: All menu items (10+ items)
Owner: Subset based on permissions
Cashier: Minimal items (2-3 items)
Viewer: Read-only items only
```

### **Step 5: Permission Change Testing**

#### **5.1 Live Permission Update:**
1. **Login sebagai Owner di tab A**
2. **Login sebagai Administrator di tab B**
3. **Tab B: Modify Owner permissions**
4. **Tab A: Logout dan login ulang**
5. **Verify:** Changes reflected immediately

#### **5.2 Database Verification:**
```sql
-- Verify permissions saved correctly
SELECT role, menu, action, allowed, created_at 
FROM role_permissions 
WHERE role = 'Owner'
ORDER BY menu, action;

-- Should show only permissions that were checked
```

## 🎯 Expected Test Results

### **✅ Success Criteria:**

#### **Navigation:**
- Sidebar shows only authorized menu items
- Unauthorized menus completely hidden
- No broken links or empty menus

#### **Page Access:**
- Authorized pages load normally
- Unauthorized pages show "Akses Ditolak" message
- No console errors or crashes

#### **Feature Control:**
- Buttons appear/disappear based on permissions
- Functions work only with proper permissions
- UI remains functional with partial access

#### **Data Consistency:**
- Permissions save correctly to database
- Settings reload properly after save
- Changes persist across login sessions

### **❌ Failure Indicators:**

#### **Permission Not Working:**
- Unauthorized menus still visible
- Access denied not showing
- Buttons visible but non-functional

#### **Database Issues:**
- Console errors about missing tables
- Permissions not saving
- Settings not loading correctly

#### **UI Problems:**
- Broken layouts with hidden elements
- Empty sections without graceful handling
- Console permission check errors

## 🔧 Troubleshooting

### **Issue: Menu Items Not Hiding**
```
Debug Steps:
1. Check browser console for permission check logs
2. Verify role_permissions table has data
3. Check user role in employees table
4. Verify RoleAccessContext loading correctly
```

### **Issue: Permissions Not Saving**
```
Debug Steps:
1. Check console logs during save
2. Verify database table exists
3. Check for foreign key constraints
4. Test manual SQL insert
```

### **Issue: Access Denied Not Showing**
```
Debug Steps:
1. Check hasAccess() implementation
2. Verify permission check logic
3. Test with console.log in useHasAccess
4. Check component render conditions
```

## 📊 Test Results Template

```
RBAC Testing Results:

✅ Administrator Role:
- Sidebar: All 10 menu items visible
- Dashboard: All sections visible
- All pages: Full access granted
- All features: Available and functional

✅ Owner Role (Custom Permissions):
- Sidebar: X menu items visible  
- Dashboard: Partial sections based on settings
- Finance: View access, no management features
- Orderan: View + Print only

❌ Issues Found:
- [List any problems encountered]
- [Console errors or broken functionality]
- [Suggestions for improvement]

🎯 Overall Assessment:
- RBAC system working: Yes/No
- Permissions enforced correctly: Yes/No  
- UI responsive to role changes: Yes/No
- Ready for production: Yes/No
```

## 🚀 Production Readiness

Setelah testing berhasil, sistem RBAC siap untuk production dengan:
- ✅ **Complete page protection**
- ✅ **Feature-level access control** 
- ✅ **Dynamic sidebar filtering**
- ✅ **Database-driven permissions**
- ✅ **User-friendly management UI**

**Sistem sekarang akan menampilkan dan mengaktifkan fitur sesuai dengan hak role yang tersimpan di database!** 🎉
