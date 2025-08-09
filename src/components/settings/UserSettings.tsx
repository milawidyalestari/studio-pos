
import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User, X, Eye, EyeOff, ChevronRight, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Switch as Toggle } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { RoleAccessContext } from '@/context/RoleAccessContext';

const MENU_TREE = [
  {
    menu: 'Dashboard',
    label: 'Dashboard',
    children: [
      { action: 'view_stats', label: 'Lihat Statistik' },
      { action: 'view_orders', label: 'Lihat Pesanan' },
      { action: 'view_income', label: 'Lihat Pendapatan' },
      { action: 'view_calendar', label: 'Lihat Kalender' },
      { action: 'view_inbox', label: 'Lihat Kotak Masuk' }
    ]
  },
  {
    menu: 'Orderan',
    label: 'Manajemen Pesanan',
    children: [
      {
        label: 'Operasi Pesanan',
        children: [
          { action: 'view_orders', label: 'Lihat Pesanan' },
          { action: 'create_order', label: 'Buat Pesanan' },
          { action: 'edit_order', label: 'Edit Pesanan' },
          { action: 'delete_order', label: 'Hapus Pesanan' }
        ]
      },
      {
        label: 'Pencetakan',
        children: [
          { action: 'print_spk', label: 'Cetak SPK' },
          { action: 'print_nota', label: 'Cetak Nota' }
        ]
      },
      {
        label: 'Manajemen Status',
        children: [
          { action: 'change_status', label: 'Ubah Status' }
        ]
      }
    ]
  },
  {
    menu: 'Transaction',
    label: 'Manajemen Transaksi',
    children: [
      { action: 'view_transactions', label: 'Lihat Transaksi' },
      { action: 'print_receipt', label: 'Cetak Struk' },
      { action: 'export_data', label: 'Ekspor Data' },
      { action: 'filter_data', label: 'Filter Data' }
    ]
  },
  {
    menu: 'Finance',
    label: 'Manajemen Keuangan',
    children: [
      {
        label: 'Ikhtisar Keuangan',
        children: [
          { action: 'view_finance', label: 'Lihat Keuangan' },
          { action: 'view_profit_loss', label: 'Lihat Laba Rugi' },
          { action: 'view_cash_flow', label: 'Lihat Arus Kas' }
        ]
      },
      {
        label: 'Manajemen Pengeluaran',
        children: [
          { action: 'manage_expenses', label: 'Kelola Pengeluaran' }
        ]
      },
      {
        label: 'Analisis Keuangan',
        children: [
          { action: 'financial_analysis', label: 'Analisis Keuangan' }
        ]
      },
      {
        label: 'Laporan Keuangan',
        children: [
          { action: 'financial_reports', label: 'Laporan Keuangan' }
        ]
      }
    ]
  },
  {
    menu: 'Inventory',
    label: 'Manajemen Inventori',
    children: [
      {
        label: 'Ikhtisar Inventori',
        children: [
          { action: 'view_inventory', label: 'Lihat Inventori' },
          { action: 'view_materials', label: 'Lihat Bahan' }
        ]
      },
      {
        label: 'Manajemen Stok',
        children: [
          { action: 'add_stock', label: 'Tambah Stok' },
          { action: 'adjust_stock', label: 'Sesuaikan Stok' },
          { action: 'manage_stock_minimum', label: 'Kelola Stok Minimum' }
        ]
      }
    ]
  },
  {
    menu: 'Master Data',
    label: 'Manajemen Data Master',
    children: [
      {
        label: 'Manajemen Produk',
        children: [
          { action: 'view_products', label: 'Lihat Produk' },
          { action: 'manage_products', label: 'Kelola Produk' }
        ]
      },
      {
        label: 'Manajemen Pelanggan',
        children: [
          { action: 'view_customers', label: 'Lihat Pelanggan' },
          { action: 'manage_customers', label: 'Kelola Pelanggan' }
        ]
      },
      {
        label: 'Manajemen Supplier',
        children: [
          { action: 'view_suppliers', label: 'Lihat Supplier' },
          { action: 'manage_suppliers', label: 'Kelola Supplier' }
        ]
      },
      {
        label: 'Manajemen Karyawan',
        children: [
          { action: 'view_employees', label: 'Lihat Karyawan' },
          { action: 'manage_employees', label: 'Kelola Karyawan' }
        ]
      }
    ]
  },
  {
    menu: 'Report',
    label: 'Laporan & Analitik',
    children: [
      {
        label: 'Laporan Dasar',
        children: [
          { action: 'view_reports', label: 'Lihat Laporan' },
          { action: 'daily_reports', label: 'Laporan Harian' },
          { action: 'monthly_reports', label: 'Laporan Bulanan' }
        ]
      },
      {
        label: 'Analitik Lanjutan',
        children: [
          { action: 'export_reports', label: 'Ekspor Laporan' }
        ]
      }
    ]
  },
  {
    menu: 'Settings',
    label: 'Pengaturan Sistem',
    children: [
      { action: 'view_settings', label: 'Lihat Pengaturan' },
      {
        label: 'Konfigurasi',
        children: [
          { action: 'program_settings', label: 'Pengaturan Program' },
          { action: 'database_settings', label: 'Pengaturan Database' },
          { action: 'hardware_settings', label: 'Pengaturan Hardware' }
        ]
      },
      {
        label: 'Manajemen Pengguna',
        children: [
          { action: 'user_management', label: 'Kelola Pengguna' },
          { action: 'role_management', label: 'Kelola Role' }
        ]
      },
      {
        label: 'Tool Sistem',
        children: [
          { action: 'system_tools', label: 'Tool Sistem' }
        ]
      }
    ]
  }
];

// Untuk backward compatibility, tetap eksport MENU_ACTIONS
const MENU_ACTIONS = MENU_TREE.map(menu => ({
  menu: menu.menu,
  actions: extractActionsFromTree(menu)
}));

function extractActionsFromTree(menuItem: any): string[] {
  const actions: string[] = [];
  
  function traverse(item: any) {
    if (item.action) {
      actions.push(item.action);
    }
    if (item.children) {
      item.children.forEach(traverse);
    }
  }
  
  traverse(menuItem);
  return actions;
}

const ROLES = ['Administrator', 'Manager', 'Supervisor', 'Cashier', 'Designer', 'Staff', 'Viewer'];

// Preset permissions untuk setiap role
const ROLE_PRESETS = {
  'Administrator': {
    'Dashboard': ['view_stats', 'view_orders', 'view_income', 'view_calendar', 'view_inbox'],
    'Orderan': ['view_orders', 'create_order', 'edit_order', 'delete_order', 'print_spk', 'print_nota', 'change_status'],
    'Transaction': ['view_transactions', 'print_receipt', 'export_data', 'filter_data'],
    'Finance': ['view_finance', 'view_profit_loss', 'view_cash_flow', 'manage_expenses', 'financial_analysis', 'financial_reports'],
    'Inventory': ['view_inventory', 'add_stock', 'adjust_stock', 'view_materials', 'manage_stock_minimum'],
    'Master Data': ['view_products', 'manage_products', 'view_customers', 'manage_customers', 'view_suppliers', 'manage_suppliers', 'view_employees', 'manage_employees'],
    'Report': ['view_reports', 'daily_reports', 'monthly_reports', 'export_reports'],
    'Settings': ['view_settings', 'program_settings', 'database_settings', 'hardware_settings', 'user_management', 'role_management', 'system_tools']
  },
  'Manager': {
    'Dashboard': ['view_stats', 'view_orders', 'view_income', 'view_calendar', 'view_inbox'],
    'Orderan': ['view_orders', 'create_order', 'edit_order', 'delete_order', 'print_spk', 'print_nota', 'change_status'],
    'Transaction': ['view_transactions', 'print_receipt', 'export_data', 'filter_data'],
    'Finance': ['view_finance', 'view_profit_loss', 'view_cash_flow', 'financial_analysis', 'financial_reports'],
    'Inventory': ['view_inventory', 'add_stock', 'adjust_stock', 'view_materials', 'manage_stock_minimum'],
    'Master Data': ['view_products', 'manage_products', 'view_customers', 'manage_customers', 'view_suppliers', 'manage_suppliers'],
    'Report': ['view_reports', 'daily_reports', 'monthly_reports', 'export_reports'],
    'Settings': ['view_settings', 'program_settings']
  },
  'Supervisor': {
    'Dashboard': ['view_stats', 'view_orders', 'view_calendar'],
    'Orderan': ['view_orders', 'create_order', 'edit_order', 'print_spk', 'print_nota', 'change_status'],
    'Transaction': ['view_transactions', 'print_receipt'],
    'Inventory': ['view_inventory', 'add_stock', 'adjust_stock', 'view_materials'],
    'Master Data': ['view_products', 'view_customers', 'manage_customers'],
    'Report': ['view_reports', 'daily_reports'],
    'Settings': ['view_settings']
  },
  'Cashier': {
    'Dashboard': ['view_orders', 'view_calendar'],
    'Orderan': ['view_orders', 'create_order', 'print_nota'],
    'Transaction': ['view_transactions', 'print_receipt'],
    'Master Data': ['view_products', 'view_customers', 'manage_customers'],
    'Settings': ['view_settings']
  },
  'Designer': {
    'Dashboard': ['view_orders', 'view_calendar'],
    'Orderan': ['view_orders', 'edit_order', 'print_spk', 'change_status'],
    'Master Data': ['view_products'],
    'Settings': ['view_settings']
  },
  'Staff': {
    'Dashboard': ['view_orders'],
    'Orderan': ['view_orders', 'print_spk'],
    'Inventory': ['view_inventory', 'view_materials'],
    'Master Data': ['view_products'],
    'Settings': ['view_settings']
  },
  'Viewer': {
    'Dashboard': ['view_orders'],
    'Orderan': ['view_orders'],
    'Transaction': ['view_transactions'],
    'Master Data': ['view_products', 'view_customers'],
    'Report': ['view_reports'],
    'Settings': ['view_settings']
  }
};

// Deskripsi untuk setiap role
const ROLE_DESCRIPTIONS = {
  'Administrator': 'Akses penuh ke semua fitur sistem dan pengaturan',
  'Manager': 'Kontrol operasional lengkap, laporan keuangan, dan akses pengaturan',
  'Supervisor': 'Manajemen pesanan, kontrol inventori, dan pelaporan dasar',
  'Cashier': 'Layanan pelanggan, pembuatan pesanan, dan pemrosesan transaksi',
  'Designer': 'Pemrosesan pesanan, pencetakan SPK, dan update status desain',
  'Staff': 'Melihat pesanan dasar dan tugas terkait produksi',
  'Viewer': 'Akses hanya baca untuk melihat data di seluruh sistem'
};

// Label yang lebih mudah dibaca untuk action
const ACTION_LABELS = {
  'view_stats': 'Lihat Statistik',
  'view_orders': 'Lihat Pesanan',
  'view_income': 'Lihat Pendapatan',
  'view_calendar': 'Lihat Kalender',
  'view_inbox': 'Lihat Kotak Masuk',
  'create_order': 'Buat Pesanan',
  'edit_order': 'Edit Pesanan',
  'delete_order': 'Hapus Pesanan',
  'print_spk': 'Cetak SPK',
  'print_nota': 'Cetak Nota',
  'change_status': 'Ubah Status',
  'view_transactions': 'Lihat Transaksi',
  'print_receipt': 'Cetak Struk',
  'export_data': 'Ekspor Data',
  'filter_data': 'Filter Data',
  'view_finance': 'Lihat Keuangan',
  'view_profit_loss': 'Lihat Laba Rugi',
  'view_cash_flow': 'Lihat Arus Kas',
  'manage_expenses': 'Kelola Pengeluaran',
  'financial_reports': 'Laporan Keuangan',
  'view_inventory': 'Lihat Inventori',
  'add_stock': 'Tambah Stok',
  'adjust_stock': 'Sesuaikan Stok',
  'view_materials': 'Lihat Bahan',
  'manage_stock_minimum': 'Kelola Stok Minimum',
  'view_products': 'Lihat Produk',
  'manage_products': 'Kelola Produk',
  'view_customers': 'Lihat Pelanggan',
  'manage_customers': 'Kelola Pelanggan',
  'view_suppliers': 'Lihat Supplier',
  'manage_suppliers': 'Kelola Supplier',
  'view_employees': 'Lihat Karyawan',
  'manage_employees': 'Kelola Karyawan',
  'view_reports': 'Lihat Laporan',
  'daily_reports': 'Laporan Harian',
  'monthly_reports': 'Laporan Bulanan',
  'export_reports': 'Ekspor Laporan',
  'financial_analysis': 'Analisis Keuangan',
  'view_settings': 'Lihat Pengaturan',
  'program_settings': 'Pengaturan Program',
  'database_settings': 'Pengaturan Database',
  'hardware_settings': 'Pengaturan Hardware',
  'user_management': 'Kelola Pengguna',
  'role_management': 'Kelola Role',
  'system_tools': 'Tool Sistem'
};

// Fungsi simpan hak akses ke database (hanya satu, di luar komponen)
async function saveRoleAccessToDb(role, accessState) {
  console.log('🔄 Saving role permissions...');
  console.log('Role:', role);
  console.log('Access State:', accessState);
  
  try {
    // 1. Hapus permissions lama
    console.log('🗑️ Deleting old permissions for role:', role);
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);
    
    if (deleteError) {
      console.error('❌ Error deleting old permissions:', deleteError);
      throw deleteError;
    }
    console.log('✅ Old permissions deleted');
    
    // 2. Prepare new permissions
  const newPermissions = [];
  Object.entries(accessState).forEach(([menu, actions]) => {
    Object.entries(actions).forEach(([action, allowed]) => {
      if (allowed) {
        newPermissions.push({ role, menu, action, allowed: true });
      }
    });
  });
    
    console.log('📋 New permissions to insert:', newPermissions);
    
    // 3. Insert new permissions
  if (newPermissions.length > 0) {
      console.log('💾 Inserting new permissions...');
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(newPermissions);
      
      if (insertError) {
        console.error('❌ Error inserting new permissions:', insertError);
        throw insertError;
      }
      console.log('✅ New permissions inserted successfully');
    } else {
      console.log('⚠️ No permissions to insert');
    }
    
    // 4. Verify save
    console.log('🔍 Verifying saved permissions...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role', role);
    
    if (verifyError) {
      console.error('❌ Error verifying permissions:', verifyError);
    } else {
      console.log('✅ Verified permissions in database:', verifyData);
    }
    
  } catch (error) {
    console.error('❌ Fatal error in saveRoleAccessToDb:', error);
    throw error;
  }
}

export const UserSettings = () => {
  const { toast } = useToast();
  const [users] = useState([
    { id: 1, name: 'Admin User', username: 'admin@company.com', role: 'Administrator', status: 'Active' },
    { id: 2, name: 'John Manager', username: 'john@company.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Jane Cashier', username: 'jane@company.com', role: 'Cashier', status: 'Inactive' },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    role: '',
    password: ''
  });

  const [accessOverlayOpen, setAccessOverlayOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [accessState, setAccessState] = useState<any>({});
  const [positions, setPositions] = useState<{ id: number; name: string }[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [employees, setEmployees] = useState<{ id: string; nama: string; username: string; role: string; status: string }[]>([]);
  const [editUserOverlayOpen, setEditUserOverlayOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<any>(null);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [accessRoleOverlayOpen, setAccessRoleOverlayOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  React.useEffect(() => {
    supabase.from('positions').select('*').order('name').then(({ data }) => {
      setPositions(data || []);
    });
  }, []);

  // Ambil data employees dari Supabase
  React.useEffect(() => {
    supabase.from('employees').select('id, nama, username, role, status, password').order('nama').then(({ data }) => {
      setEmployees(data || []);
    });
  }, []);

  React.useEffect(() => {
    supabase.from('roles').select('id, name').order('name').then(({ data }) => {
      setRoles(data || []);
    });
  }, []);

  // Load akses dari localStorage jika ada
  React.useEffect(() => {
    if (selectedUserName) {
      // Get user role first, then load permissions for that role
      const user = employees.find(emp => emp.nama === selectedUserName);
      if (user && user.role) {
        loadUserRolePermissions(user.role);
      } else {
        setAccessState({});
      }
    }
  }, [selectedUserName, accessOverlayOpen, employees]);

  // Load permissions untuk user berdasarkan role-nya
  const loadUserRolePermissions = async (userRole: string) => {
    console.log('🔄 Loading permissions for user role:', userRole);
    
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('menu, action, allowed')
        .eq('role', userRole)
        .eq('allowed', true);

      if (error) {
        console.error('❌ Error loading user permissions:', error);
        setAccessState({});
        return;
      }

      console.log('✅ Loaded user permissions from database:', data);

      // Convert array format ke object format untuk UI
      const accessStateObject: any = {};
      data?.forEach((permission) => {
        if (!accessStateObject[permission.menu]) {
          accessStateObject[permission.menu] = {};
        }
        accessStateObject[permission.menu][permission.action] = permission.allowed;
      });

      console.log('🔄 Converted user permissions to accessState format:', accessStateObject);
      setAccessState(accessStateObject);

    } catch (error) {
      console.error('❌ Fatal error loading user permissions:', error);
      setAccessState({});
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.role || !newUser.password) {
      toast({
        title: "Gagal Validasi",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    // Validasi username unik
    const usernameExists = employees.some(emp => emp.username && emp.username.toLowerCase() === newUser.username.toLowerCase());
    if (usernameExists) {
      toast({
        title: "Username sudah digunakan",
        description: "Pilih username lain yang unik.",
        variant: "destructive"
      });
      return;
    }
    // Cari employee by name
    const employee = employees.find(emp => emp.nama === newUser.name);
    if (!employee) {
      toast({ title: 'Karyawan tidak ditemukan', variant: 'destructive' });
      return;
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    // Update employee di Supabase
    const { error } = await supabase.from('employees').update({
      username: newUser.username,
      role: newUser.role,
      password: hashedPassword
    }).eq('id', employee.id);
    if (error) {
      toast({ title: 'Gagal menambah user', description: error.message, variant: 'destructive' });
      return;
    }
            toast({ title: 'User Ditambahkan', description: `User ${employee.nama} berhasil ditambahkan.` });
    setNewUser({ name: '', username: '', role: '', password: '' });
    // Refresh data employees
    const { data } = await supabase.from('employees').select('id, nama, username, role, status, password').order('nama');
    setEmployees(data || []);
  };

  const handleToggle = (menu: string, action: string) => {
    setAccessState((prev: any) => ({
      ...prev,
      [menu]: {
        ...prev[menu],
        [action]: !prev[menu]?.[action],
      },
    }));
  };

  // handleSaveAccess untuk overlay akses user/role
  const handleSaveAccess = async () => {
    try {
      // Get user role for saving permissions
      const user = employees.find(emp => emp.nama === selectedUserName);
      const roleToSave = user?.role || selectedRoleName;
      
      if (!roleToSave) {
        toast({ 
          title: 'Error', 
          description: 'Role tidak ditemukan untuk user ini.', 
          variant: 'destructive' 
        });
        return;
      }

      await saveRoleAccessToDb(roleToSave, accessState);
      toast({ 
        title: 'Akses disimpan', 
        description: `Akses untuk role ${roleToSave} berhasil disimpan.` 
      });
    setAccessOverlayOpen(false);
    } catch (error) {
      console.error('Error saving access:', error);
      toast({ 
        title: 'Error', 
        description: 'Gagal menyimpan akses.', 
        variant: 'destructive' 
      });
    }
  };

  // Fungsi hapus user (set username, role, password = null)
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase.from('employees').update({ username: null, role: null, password: null }).eq('id', userToDelete.id);
    if (error) {
      toast({ title: 'Gagal menghapus user', description: error.message, variant: 'destructive' });
      setDeleteDialogOpen(false);
      return;
    }
    toast({ title: 'User dihapus', description: `User ${userToDelete.nama} berhasil dihapus.` });
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    // Refresh data employees
    const { data } = await supabase.from('employees').select('id, nama, username, role, status, password').order('nama');
    setEmployees(data || []);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Administrator': return 'destructive';
      case 'Manager': return 'default';
      case 'Cashier': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-medium">Tambahkan User</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Karyawan *</Label>
            <Select
              value={newUser.name}
              onValueChange={(value) => setNewUser(prev => ({ ...prev, name: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih karyawan" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.nama}>{emp.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Role *</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Username *</Label>
            <Input
              id="username"
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Masukan username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Password *</Label>
            <Input
              id="user-password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Masukan Password"
            />
          </div>

          <div className="col-span-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAccessRoleOverlayOpen(true);
                setSelectedRoleName('');
              }}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4 mr-1" />
              Hak Role
            </Button>
            <Button onClick={handleAddUser} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-900">
              <Plus className="h-4 w-4" />
              Tambah User
            </Button>
          </div>
        </div>

      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Role User</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.filter(user => user.username && user.password && user.role).map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nama}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditUserData({ ...user, password: '' });
                        setEditUserOverlayOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={deleteDialogOpen && userToDelete?.id === user.id} onOpenChange={open => { setDeleteDialogOpen(open); if (!open) setUserToDelete(null); }}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-2xl'>Hapus User Ini?</AlertDialogTitle>
                          <AlertDialogDescription>User tidak bisa login lagi setelah dihapus.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteUser} className="hover:bg-red-600 text-white">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Overlay Role Access */}
      {accessOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setAccessOverlayOpen(false)}
          />
          {/* panel */}
          <div className="relative bg-white shadow-xl rounded-lg p-6 w-full max-w-3xl min-w-[700px] mx-auto flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              onClick={() => setAccessOverlayOpen(false)}
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-2">Pengaturan Akses User</h2>
            <div className="mb-2 text-sm text-gray-500">Atur hak akses untuk user <b>{selectedUserName}</b>.</div>
            {/* Hapus dropdown pilih user */}
            {(() => {
              const user = employees.find(u => u.nama === selectedUserName);
              if (user && user.role === 'Administrator') {
                return <div className="text-green-700 font-semibold mb-4">Admin Memiliki kontrol penuh</div>;
              }
              return null;
            })()}
            {/* Tabel akses hanya tampil jika bukan Administrator */}
            {(() => {
              const user = employees.find(u => u.nama === selectedUserName);
              // Tabel akses selalu muncul, tapi jika Administrator, semua switch aktif dan disabled
              return (
                <>
                  <div className="flex-1 max-h-96 overflow-y-auto">
                    <TreeView
                      items={MENU_TREE}
                      accessState={accessState}
                      onToggle={handleToggle}
                      isAdmin={user && user.role === 'Administrator'}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSaveAccess} disabled={user && user.role === 'Administrator'}>Simpan</Button>
                    <Button variant="outline" onClick={() => setAccessOverlayOpen(false)}>Batal</Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Overlay Pengaturan Hak Role */}
      {accessRoleOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setAccessRoleOverlayOpen(false)} />
          <div className="relative bg-white shadow-xl rounded-lg p-6 w-full max-w-3xl min-w-[700px] mx-auto flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              onClick={() => setAccessRoleOverlayOpen(false)}
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Pengaturan Hak Role</h2>
            
            <div className="mb-4">
              <Label htmlFor="role-select" className="text-sm font-medium">Pilih Role</Label>
              <Select
                value={selectedRoleName}
                onValueChange={setSelectedRoleName}
              >
                <SelectTrigger id="role-select" className="mt-1">
                  <SelectValue placeholder="Pilih role untuk diatur" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role.name] || 'Role kustom'}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoleName && (
              <Card className="mb-4 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{selectedRoleName}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {ROLE_DESCRIPTIONS[selectedRoleName] || 'Custom role permissions'}
                  </p>
                </CardContent>
              </Card>
            )}
            {selectedRoleName && (
              <>
                <RoleAccessTable
                  role={selectedRoleName}
                  menuActions={MENU_ACTIONS}
                  onClose={() => setAccessRoleOverlayOpen(false)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay Edit User */}
      {editUserOverlayOpen && editUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setEditUserOverlayOpen(false)} />
          <div className="relative bg-white shadow-xl rounded-lg p-6 w-full max-w-lg mx-auto flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              onClick={() => setEditUserOverlayOpen(false)}
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employee">Karyawan *</Label>
                <Select
                  value={editUserData.nama}
                  onValueChange={(value) => {
                    const emp = employees.filter(emp => emp.username && emp.password && emp.role).find(emp => emp.nama === value);
                    if (emp) {
                      setEditUserData({ ...emp });
                    } else {
                      setEditUserData((prev: any) => ({ ...prev, nama: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih karyawan" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {employees.filter(emp => emp.username && emp.password && emp.role).map((emp) => (
                      <SelectItem key={emp.id} value={emp.nama}>{emp.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value) => setEditUserData((prev: any) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  type="text"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData((prev: any) => ({ ...prev, username: e.target.value }))}
                  placeholder="Masukan username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPasswordEdit ? 'text' : 'password'}
                    value={editUserData.password}
                    onChange={(e) => setEditUserData((prev: any) => ({ ...prev, password: e.target.value }))}
                    placeholder="Masukan Password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowPasswordEdit((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPasswordEdit ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button onClick={() => setEditUserOverlayOpen(false)} variant="outline">Batal</Button>
                <Button onClick={async () => {
                  // Update employee di Supabase
                  const updateData: any = {
                    username: editUserData.username,
                    role: editUserData.role
                  };
                  // Jika password diubah (tidak kosong), hash dan update
                  if (editUserData.password && editUserData.password.length < 50) {
                    updateData.password = await bcrypt.hash(editUserData.password, 10);
                  }
                  const { error } = await supabase.from('employees').update(updateData).eq('id', editUserData.id);
                  if (error) {
                    toast({ title: 'Gagal update user', description: error.message, variant: 'destructive' });
                    return;
                  }
                  toast({ title: 'User Diperbarui', description: `User ${editUserData.nama} berhasil diperbarui.` });
                  setEditUserOverlayOpen(false);
                  // Refresh data employees
                  const { data } = await supabase.from('employees').select('id, nama, username, role, status, password').order('nama');
                  setEmployees(data || []);
                }} className="bg-blue-700 hover:bg-blue-900 text-white">Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function RoleAccessTable({ role, menuActions, onClose }: { role: string, menuActions: any[], onClose: () => void }) {
  const { toast } = useToast();
  const { userRole, refresh } = useContext(RoleAccessContext);
  const [accessState, setAccessState] = React.useState<any>({});
  
  React.useEffect(() => {
    if (role) {
      loadRolePermissionsFromDb(role);
    }
  }, [role]);

  // Load permissions dari database untuk role yang dipilih
  const loadRolePermissionsFromDb = async (roleName: string) => {
    console.log('🔄 Loading permissions for role:', roleName);
    
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('menu, action, allowed')
        .eq('role', roleName)
        .eq('allowed', true);

      if (error) {
        console.error('❌ Error loading permissions:', error);
        setAccessState({});
        return;
      }

      console.log('✅ Loaded permissions from database:', data);

      // Convert array format ke object format untuk UI
      const accessStateObject: any = {};
      data?.forEach((permission) => {
        if (!accessStateObject[permission.menu]) {
          accessStateObject[permission.menu] = {};
        }
        accessStateObject[permission.menu][permission.action] = permission.allowed;
      });

      console.log('🔄 Converted to accessState format:', accessStateObject);
      setAccessState(accessStateObject);

    } catch (error) {
      console.error('❌ Fatal error loading permissions:', error);
      setAccessState({});
    }
  };

  // Fungsi untuk menerapkan preset role
  const applyRolePreset = () => {
    const preset = ROLE_PRESETS[role];
    if (preset) {
      setAccessState(preset);
      toast({
        title: "Preset Diterapkan",
        description: `Izin default untuk ${role} telah diterapkan.`,
      });
    }
  };

  // Fungsi untuk reset semua permission
  const resetPermissions = () => {
    setAccessState({});
    toast({
      title: "Izin Direset",
      description: `Semua izin untuk ${role} telah dihapus.`,
    });
  };
  const handleToggle = (menu: string, action: string) => {
    setAccessState((prev: any) => ({
      ...prev,
      [menu]: {
        ...prev[menu],
        [action]: !prev[menu]?.[action],
      },
    }));
  };
  // handleSave di RoleAccessTable
  const handleSave = async () => {
    await saveRoleAccessToDb(role, accessState);
    // Jika role yang diubah adalah role user yang sedang login, refresh context permission
    if (role === userRole) {
      await refresh(role);
    }
    toast({ title: 'Akses disimpan', description: `Akses untuk role ${role} berhasil disimpan.` });
    onClose();
  };
  const isAdmin = role === 'Administrator';
  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={applyRolePreset} 
          variant="outline" 
          size="sm"
          disabled={!ROLE_PRESETS[role]}
        >
          Terapkan Preset Default
        </Button>
        <Button 
          onClick={resetPermissions} 
          variant="outline" 
          size="sm"
        >
          Reset Semua
        </Button>
      </div>

      <div className="flex-1 max-h-96 overflow-y-auto">
        <TreeView
          items={MENU_TREE}
          accessState={accessState}
          onToggle={handleToggle}
          isAdmin={isAdmin}
        />
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-900 text-white">Simpan</Button>
        <Button variant="outline" onClick={onClose}>Batal</Button>
      </div>
    </>
  );
}

// Komponen TreeView untuk permission
interface TreeViewProps {
  items: any[];
  accessState: any;
  onToggle: (menu: string, action: string) => void;
  isAdmin?: boolean;
}

function TreeView({ items, accessState, onToggle, isAdmin = false }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  // Auto-expand all nodes initially
  React.useEffect(() => {
    const allNodeIds = new Set<string>();
    
    function collectNodeIds(item: any, parentId: string = '') {
      const nodeId = parentId ? `${parentId}-${item.label}` : item.label;
      if (item.children && item.children.length > 0) {
        allNodeIds.add(nodeId);
        item.children.forEach((child: any) => collectNodeIds(child, nodeId));
      }
    }
    
    items.forEach(menuItem => {
      menuItem.children.forEach((item: any) => collectNodeIds(item, menuItem.menu));
    });
    
    setExpandedNodes(allNodeIds);
  }, [items]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeCheckState = (item: any, menu: string): 'checked' | 'unchecked' | 'indeterminate' => {
    if (isAdmin) return 'checked';
    
    if (item.action) {
      return accessState?.[menu]?.[item.action] ? 'checked' : 'unchecked';
    }

    // For parent nodes, check children state
    if (item.children) {
      const childStates = item.children.map((child: any) => getNodeCheckState(child, menu));
      const checkedCount = childStates.filter(state => state === 'checked').length;
      const indeterminateCount = childStates.filter(state => state === 'indeterminate').length;
      
      if (checkedCount === childStates.length) return 'checked';
      if (checkedCount > 0 || indeterminateCount > 0) return 'indeterminate';
      return 'unchecked';
    }

    return 'unchecked';
  };

  const handleParentToggle = (item: any, menu: string, currentState: string) => {
    if (isAdmin) return;
    
    const shouldCheck = currentState !== 'checked';
    
    function toggleChildren(node: any) {
      if (node.action) {
        // Only toggle if the current state doesn't match what we want
        const currentlyChecked = accessState?.[menu]?.[node.action];
        if (currentlyChecked !== shouldCheck) {
          onToggle(menu, node.action);
        }
      }
      if (node.children) {
        node.children.forEach(toggleChildren);
      }
    }

    if (item.children) {
      item.children.forEach(toggleChildren);
    }
  };

  const renderTreeNode = (item: any, menu: string, level: number = 0, nodeId: string = '') => {
    const currentNodeId = nodeId ? `${nodeId}-${item.label}` : item.label;
    const isExpanded = expandedNodes.has(currentNodeId);
    const hasChildren = item.children && item.children.length > 0;
    const checkState = getNodeCheckState(item, menu);

    return (
      <div key={currentNodeId} className="select-none">
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-50 rounded"
          style={{ marginLeft: level * 20 }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(currentNodeId)}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          {/* Checkbox */}
          <Checkbox
            checked={checkState === 'checked'}
            ref={(ref) => {
              if (ref && checkState === 'indeterminate') {
                ref.indeterminate = true;
              }
            }}
            disabled={isAdmin}
            onCheckedChange={() => {
              if (item.action) {
                onToggle(menu, item.action);
              } else {
                handleParentToggle(item, menu, checkState);
              }
            }}
            className="mr-3"
          />
          
          {/* Label */}
          <span className={`text-sm ${level === 0 ? 'font-medium' : ''} ${item.action ? 'text-gray-700' : 'text-gray-900'}`}>
            {item.label}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {item.children.map((child: any, index: number) =>
              renderTreeNode(child, menu, level + 1, currentNodeId)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {items.map((menuItem) => (
        <div key={menuItem.menu} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">
            {menuItem.label}
          </h3>
          <div className="space-y-1">
            {menuItem.children.map((item: any) =>
              renderTreeNode(item, menuItem.menu, 0, menuItem.menu)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserSettings;
