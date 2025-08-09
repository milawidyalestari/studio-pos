# 🔐 Panduan Implementasi Role-Based Access Control (RBAC)

## 📋 Overview Sistem Role

Sistem role Studio POS menggunakan pendekatan granular dengan tree structure untuk memberikan kontrol akses yang detail pada setiap fungsi aplikasi.

### 🏗️ Arsitektur Sistem

```
Database (role_permissions) 
    ↓
RoleAccessContext 
    ↓
useHasAccess() Hook 
    ↓
Page Components (UI Protection)
```

## 🗄️ Database Schema

### Tabel `role_permissions`
```sql
CREATE TABLE role_permissions (
  id serial PRIMARY KEY,
  role varchar(50) NOT NULL,        -- Administrator, Manager, Cashier, dll
  menu varchar(50) NOT NULL,        -- Dashboard, Orderan, Finance, dll  
  action varchar(50) NOT NULL,      -- view_orders, create_order, dll
  allowed boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  UNIQUE(role, menu, action)
);
```

### Contoh Data:
```sql
-- Manager dapat melihat dan membuat pesanan
INSERT INTO role_permissions (role, menu, action, allowed) VALUES
('Manager', 'Orderan', 'view_orders', true),
('Manager', 'Orderan', 'create_order', true),
('Manager', 'Orderan', 'edit_order', true);

-- Cashier hanya bisa melihat dan membuat
INSERT INTO role_permissions (role, menu, action, allowed) VALUES  
('Cashier', 'Orderan', 'view_orders', true),
('Cashier', 'Orderan', 'create_order', true);
```

## 🔑 Login Flow & Permission Loading

### 1. Login Process (Login.tsx)
```tsx
const handleLogin = async (e: React.FormEvent) => {
  // 1. Validasi user credentials
  const { data } = await supabase
    .from('employees')
    .select('id, nama, username, password, role')
    .eq('username', username)
    .single();

  // 2. Simpan user ke localStorage  
  localStorage.setItem('studio_pos_user', JSON.stringify({
    id: data.id,
    nama: data.nama,
    role: data.role
  }));

  // 3. Load permissions berdasarkan role
  await refresh(data.role); // Fetch dari role_permissions table
  
  navigate('/');
};
```

### 2. Permission Loading (RoleAccessContext.tsx)
```tsx
const refresh = async (role: string) => {
  setUserRole(role);
  
  // Fetch permissions dari database
  const { data } = await supabase
    .from('role_permissions')
    .select('menu, action, allowed')
    .eq('role', role)
    .eq('allowed', true);
    
  setPermissions(data || []);
};
```

## 🛡️ Page Protection Implementation

### 1. Import Hook
```tsx
import { useHasAccess } from '@/context/RoleAccessContext';
```

### 2. Initialize Hook
```tsx
const hasAccess = useHasAccess();
```

### 3. Conditional Rendering
```tsx
// Tombol hanya muncul jika user punya akses
{hasAccess('Orderan', 'create_order') && (
  <Button onClick={() => setShowModal(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Order Baru
  </Button>
)}

// Proteksi komponen
{hasAccess('Finance', 'view_finance') ? (
  <FinanceComponent />
) : (
  <div>Anda tidak memiliki akses ke halaman ini</div>
)}
```

## 📄 Implementasi Per Halaman

### 🏠 Dashboard.tsx
```tsx
const Dashboard = () => {
  const hasAccess = useHasAccess();
  
  return (
    <div className="space-y-6">
      {/* Stats hanya muncul jika ada akses */}
      {hasAccess('Dashboard', 'view_stats') && (
        <DashboardStats />
      )}
      
      {/* Orders overview */}
      {hasAccess('Dashboard', 'view_orders') && (
        <OrdersOverview />
      )}
      
      {/* Income chart */}
      {hasAccess('Dashboard', 'view_income') && (
        <IncomeChart />
      )}
    </div>
  );
};
```

### 📦 Orderan.tsx  
```tsx
const Orderan = () => {
  const hasAccess = useHasAccess();
  
  return (
    <div>
      {/* Header dengan tombol conditional */}
      <div className="flex justify-between">
        <h1>Orderan</h1>
        
        {/* Tombol Order Baru - hanya jika ada akses create */}
        {hasAccess('Orderan', 'create_order') && (
          <Button onClick={() => setShowModal(true)}>
            Order Baru
          </Button>
        )}
      </div>
      
      {/* Tabel orders - hanya jika ada akses view */}
      {hasAccess('Orderan', 'view_orders') ? (
        <OrderTable 
          onEdit={hasAccess('Orderan', 'edit_order') ? handleEdit : undefined}
          onDelete={hasAccess('Orderan', 'delete_order') ? handleDelete : undefined}
          onPrint={hasAccess('Orderan', 'print_nota') ? handlePrint : undefined}
        />
      ) : (
        <div className="text-center py-8">
          <p>Anda tidak memiliki akses untuk melihat pesanan</p>
        </div>
      )}
    </div>
  );
};
```

### 💰 Finance.tsx
```tsx
const Finance = () => {
  const hasAccess = useHasAccess();
  
  // Redirect jika tidak ada akses sama sekali
  if (!hasAccess('Finance', 'view_finance')) {
    return (
      <div className="text-center py-12">
        <h2>Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk mengakses halaman keuangan</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Profit & Loss */}
      {hasAccess('Finance', 'view_profit_loss') && (
        <ProfitLossSection />
      )}
      
      {/* Cash Flow */}
      {hasAccess('Finance', 'view_cash_flow') && (
        <CashFlowSection />
      )}
      
      {/* Expense Management */}
      {hasAccess('Finance', 'manage_expenses') && (
        <ExpenseManagement />
      )}
      
      {/* Financial Reports */}
      {hasAccess('Finance', 'financial_reports') && (
        <FinancialReports />
      )}
    </div>
  );
};
```

### 📊 Inventory.tsx
```tsx
const Inventory = () => {
  const hasAccess = useHasAccess();
  
  return (
    <div>
      {/* Inventory Overview */}
      {hasAccess('Inventory', 'view_inventory') && (
        <InventoryOverview />
      )}
      
      {/* Materials Section */}
      {hasAccess('Inventory', 'view_materials') && (
        <MaterialsSection />
      )}
      
      {/* Stock Management */}
      <div className="flex gap-4">
        {hasAccess('Inventory', 'add_stock') && (
          <Button onClick={handleAddStock}>
            Tambah Stok
          </Button>
        )}
        
        {hasAccess('Inventory', 'adjust_stock') && (
          <Button onClick={handleAdjustStock}>
            Sesuaikan Stok
          </Button>
        )}
      </div>
    </div>
  );
};
```

### 📋 Master Data.tsx
```tsx
const MasterData = () => {
  const hasAccess = useHasAccess();
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {/* Tab hanya muncul jika ada akses view */}
        {hasAccess('Master Data', 'view_products') && (
          <TabsTrigger value="products">Produk</TabsTrigger>
        )}
        
        {hasAccess('Master Data', 'view_customers') && (
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
        )}
        
        {hasAccess('Master Data', 'view_suppliers') && (
          <TabsTrigger value="suppliers">Supplier</TabsTrigger>
        )}
      </TabsList>
      
      {/* Products Tab */}
      {hasAccess('Master Data', 'view_products') && (
        <TabsContent value="products">
          <ProductsTab 
            canManage={hasAccess('Master Data', 'manage_products')}
          />
        </TabsContent>
      )}
      
      {/* Customers Tab */}
      {hasAccess('Master Data', 'view_customers') && (
        <TabsContent value="customers">
          <CustomersTab 
            canManage={hasAccess('Master Data', 'manage_customers')}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};
```

## 🎯 Permission Actions Mapping

### Dashboard
- `view_stats` - Lihat statistik
- `view_orders` - Lihat overview pesanan  
- `view_income` - Lihat pendapatan
- `view_calendar` - Lihat kalender
- `view_inbox` - Lihat kotak masuk

### Orderan  
- `view_orders` - Lihat daftar pesanan
- `create_order` - Buat pesanan baru
- `edit_order` - Edit pesanan
- `delete_order` - Hapus pesanan
- `print_spk` - Cetak SPK
- `print_nota` - Cetak nota
- `change_status` - Ubah status pesanan

### Transaction
- `view_transactions` - Lihat transaksi
- `print_receipt` - Cetak struk
- `export_data` - Ekspor data
- `filter_data` - Filter data

### Finance
- `view_finance` - Lihat halaman keuangan
- `view_profit_loss` - Lihat laba rugi
- `view_cash_flow` - Lihat arus kas  
- `manage_expenses` - Kelola pengeluaran
- `financial_reports` - Laporan keuangan

### Inventory
- `view_inventory` - Lihat inventori
- `add_stock` - Tambah stok
- `adjust_stock` - Sesuaikan stok
- `view_materials` - Lihat bahan
- `manage_stock_minimum` - Kelola stok minimum

### Master Data
- `view_products` - Lihat produk
- `manage_products` - Kelola produk
- `view_customers` - Lihat pelanggan
- `manage_customers` - Kelola pelanggan
- `view_suppliers` - Lihat supplier
- `manage_suppliers` - Kelola supplier
- `view_employees` - Lihat karyawan
- `manage_employees` - Kelola karyawan

### Report
- `view_reports` - Lihat laporan
- `daily_reports` - Laporan harian
- `monthly_reports` - Laporan bulanan
- `export_reports` - Ekspor laporan
- `financial_analysis` - Analisis keuangan

### Settings
- `view_settings` - Lihat pengaturan
- `program_settings` - Pengaturan program
- `database_settings` - Pengaturan database
- `hardware_settings` - Pengaturan hardware
- `user_management` - Kelola pengguna
- `role_management` - Kelola role
- `system_tools` - Tool sistem

## 🔧 Best Practices

### 1. ✅ Conditional Rendering
```tsx
// BENAR: Conditional rendering
{hasAccess('Menu', 'action') && <Component />}

// SALAH: Selalu render tapi disable
<Component disabled={!hasAccess('Menu', 'action')} />
```

### 2. ✅ Early Return Pattern
```tsx
// BENAR: Early return untuk akses penuh
if (!hasAccess('Finance', 'view_finance')) {
  return <AccessDenied />;
}

return <FinanceContent />;
```

### 3. ✅ Granular Permissions
```tsx
// BENAR: Permission granular
hasAccess('Orderan', 'create_order')
hasAccess('Orderan', 'edit_order') 
hasAccess('Orderan', 'delete_order')

// SALAH: Permission terlalu umum
hasAccess('Orderan', 'all')
```

### 4. ✅ Administrator Override
```tsx
// Administrator selalu punya akses (handled di useHasAccess)
const useHasAccess = () => {
  const { permissions, userRole } = useContext(RoleAccessContext);
  return (menu: string, action: string) => {
    if (userRole === 'Administrator') return true; // Override
    return permissions.some(p => p.menu === menu && p.action === action);
  };
};
```

## 🧪 Testing Role Permissions

### 1. Test dengan Different Roles
```tsx
// Test sebagai Administrator (full access)
localStorage.setItem('studio_pos_user', JSON.stringify({
  role: 'Administrator'
}));

// Test sebagai Cashier (limited access)  
localStorage.setItem('studio_pos_user', JSON.stringify({
  role: 'Cashier'
}));
```

### 2. Check Permission Database
```sql
-- Lihat semua permissions untuk role
SELECT menu, action, allowed 
FROM role_permissions 
WHERE role = 'Manager' 
ORDER BY menu, action;

-- Lihat permissions untuk menu tertentu
SELECT role, action, allowed
FROM role_permissions  
WHERE menu = 'Orderan'
ORDER BY role, action;
```

## 🚀 Deployment Checklist

- [ ] ✅ Tabel role_permissions dibuat  
- [ ] ✅ Default permissions diinsert
- [ ] ✅ RoleAccessContext terintegrasi
- [ ] ✅ Login system load permissions
- [ ] ✅ Setiap halaman menggunakan hasAccess()
- [ ] ✅ Tree UI untuk manage permissions
- [ ] ✅ Administrator override bekerja
- [ ] 🔄 Test dengan berbagai role
- [ ] 🔄 Validasi permission di production

Sistem role permissions Studio POS sekarang siap digunakan dengan kontrol akses yang detail dan UI management yang user-friendly dalam bahasa Indonesia! 🎉
