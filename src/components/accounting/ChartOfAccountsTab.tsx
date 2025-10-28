import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useChartOfAccounts } from '@/hooks/useAccounting';
import { ChartOfAccount } from '@/services/accountingService';
import { formatCurrency } from '@/utils/formatters';

const ChartOfAccountsTab = () => {
  const { chartOfAccounts, isLoading, createChartOfAccount, updateChartOfAccount, deleteChartOfAccount } = useChartOfAccounts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: '' as 'asset' | 'liability' | 'equity' | 'income' | 'expense',
    parent_account_id: '',
    description: ''
  });

  const accountTypeLabels = {
    asset: 'Aset',
    liability: 'Kewajiban',
    equity: 'Modal',
    income: 'Pendapatan',
    expense: 'Biaya'
  };

  const accountTypeColors = {
    asset: 'bg-green-100 text-green-800',
    liability: 'bg-red-100 text-red-800',
    equity: 'bg-blue-100 text-blue-800',
    income: 'bg-yellow-100 text-yellow-800',
    expense: 'bg-orange-100 text-orange-800'
  };

  const filteredAccounts = chartOfAccounts.filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.account_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      await updateChartOfAccount(editingAccount.id, formData);
    } else {
      await createChartOfAccount(formData);
    }
    
    setShowAddModal(false);
    setEditingAccount(null);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: '' as any,
      parent_account_id: '',
      description: ''
    });
  };

  const handleEdit = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      parent_account_id: account.parent_account_id || '',
      description: account.description || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (account: ChartOfAccount) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${account.account_name}?`)) {
      await deleteChartOfAccount(account.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat chart of accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Daftar Akun</h2>
          <p className="text-gray-600">Kelola daftar akun keuangan</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingAccount(null);
                setFormData({
                  account_code: '',
                  account_name: '',
                  account_type: '' as any,
                  parent_account_id: '',
                  description: ''
                });
              }}
              className="bg-[#0050C8] hover:bg-[#003a9b]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Akun
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account_code">Kode Akun</Label>
                <Input
                  id="account_code"
                  value={formData.account_code}
                  onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                  placeholder="Contoh: 1110"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account_name">Nama Akun</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="Contoh: Kas"
                  required
                />
              </div>
              <div>
                <Label htmlFor="account_type">Jenis Akun</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData({ ...formData, account_type: value as any })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Aset</SelectItem>
                    <SelectItem value="liability">Kewajiban</SelectItem>
                    <SelectItem value="equity">Modal</SelectItem>
                    <SelectItem value="income">Pendapatan</SelectItem>
                    <SelectItem value="expense">Biaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="parent_account_id">Akun Induk (Opsional)</Label>
                <Select
                  value={formData.parent_account_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun induk" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartOfAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi akun (opsional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">
                  {editingAccount ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari akun..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="asset">Aset</SelectItem>
                  <SelectItem value="liability">Kewajiban</SelectItem>
                  <SelectItem value="equity">Modal</SelectItem>
                  <SelectItem value="income">Pendapatan</SelectItem>
                  <SelectItem value="expense">Biaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Akun ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono text-sm">
                    {account.account_code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.account_name}</div>
                      {account.description && (
                        <div className="text-sm text-gray-500">{account.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={accountTypeColors[account.account_type]}>
                      {accountTypeLabels[account.account_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(account)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccountsTab;
