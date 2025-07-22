
import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User, X, Eye, EyeOff } from 'lucide-react';
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

const MENU_ACTIONS = [
  { menu: 'Dashboard', actions: ['view_income', 'view_orders', 'view_unprocessed'] },
  { menu: 'Orderan', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Print Receipt', actions: ['create', 'read', 'update', 'delete'] },
  { menu: 'Price Summary', actions: ['create', 'read', 'update', 'delete'] },
  { menu: 'Transaction', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Cashier', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Inventory', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Suppliers', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Report', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Master Data', actions: ['read', 'create', 'update', 'delete'] },
  { menu: 'Settings', actions: ['read', 'create', 'update', 'delete'] },
];

const ROLES = ['Administrator', 'Manager', 'Cashier', 'Viewer'];

// Fungsi simpan hak akses ke database (hanya satu, di luar komponen)
async function saveRoleAccessToDb(role, accessState) {
  await supabase.from('role_permissions').delete().eq('role', role);
  const newPermissions = [];
  Object.entries(accessState).forEach(([menu, actions]) => {
    Object.entries(actions).forEach(([action, allowed]) => {
      if (allowed) {
        newPermissions.push({ role, menu, action, allowed: true });
      }
    });
  });
  if (newPermissions.length > 0) {
    await supabase.from('role_permissions').insert(newPermissions);
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
      const saved = localStorage.getItem('studio_pos_access_' + selectedUserName);
      setAccessState(saved ? JSON.parse(saved) : {});
    }
  }, [selectedUserName, accessOverlayOpen]);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.role || !newUser.password) {
      toast({
        title: "Validation Error",
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
    toast({ title: 'User added', description: `User ${employee.nama} berhasil ditambahkan.` });
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
    await saveRoleAccessToDb(selectedUserName || selectedRoleName, accessState);
    toast({ title: 'Akses disimpan', description: `Akses untuk role/user berhasil disimpan.` });
    setAccessOverlayOpen(false);
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
                  <div className="overflow-x-auto flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Menu</TableHead>
                          {Array.from(new Set(MENU_ACTIONS.flatMap(m => m.actions))).map((action) => (
                            <TableHead key={action} className="text-center">{action}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MENU_ACTIONS.map(({ menu, actions }) => (
                          <TableRow key={menu}>
                            <TableCell>{menu}</TableCell>
                            {Array.from(new Set(MENU_ACTIONS.flatMap(m => m.actions))).map((action) => (
                              <TableCell key={action} className="text-center">
                                {actions.includes(action) ? (
                                  <Toggle
                                    checked={user && user.role === 'Administrator' ? true : !!accessState?.[menu]?.[action]}
                                    disabled={user && user.role === 'Administrator'}
                                    onCheckedChange={() => user && user.role !== 'Administrator' && handleToggle(menu, action)}
                                  />
                                ) : null}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
            <h2 className="text-xl font-bold mb-2">Pengaturan Hak Role</h2>
            <div className="mb-4">
              <Label htmlFor="role-select">Pilih Role</Label>
              <Select
                value={selectedRoleName}
                onValueChange={setSelectedRoleName}
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  toast({ title: 'User updated', description: `User ${editUserData.nama} updated.` });
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
      const saved = localStorage.getItem('studio_pos_access_' + role);
      setAccessState(saved ? JSON.parse(saved) : {});
    }
  }, [role]);
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
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              {Array.from(new Set(menuActions.flatMap(m => m.actions))).map((action) => (
                <TableHead key={action} className="text-center">{action}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuActions.map(({ menu, actions }) => (
              <TableRow key={menu}>
                <TableCell>{menu}</TableCell>
                {Array.from(new Set(menuActions.flatMap(m => m.actions))).map((action) => (
                  <TableCell key={action} className="text-center">
                    {actions.includes(action) ? (
                      <Toggle
                        checked={isAdmin ? true : !!accessState?.[menu]?.[action]}
                        disabled={isAdmin}
                        onCheckedChange={() => !isAdmin && handleToggle(menu, action)}
                      />
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-900 text-white">Simpan</Button>
        <Button variant="outline" onClick={onClose}>Batal</Button>
      </div>
    </>
  );
}

export default UserSettings;
