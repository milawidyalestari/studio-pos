import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, DollarSign, Star } from 'lucide-react';
import { useCashAccounts, useChartOfAccounts } from '@/hooks/useAccounting';
import { CashAccount } from '@/services/accountingService';
import { formatCurrency } from '@/utils/formatters';

const CashAccountsTab = () => {
  const { cashAccounts, isLoading, createCashAccount, updateCashAccount } = useCashAccounts();
  const { chartOfAccounts } = useChartOfAccounts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    account_id: '',
    account_name: '',
    initial_balance: '',
    currency: 'IDR',
    is_primary: false,
    description: ''
  });

  const filteredAccounts = cashAccounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      initial_balance: parseFloat(formData.initial_balance) || 0
    };
    
    if (editingAccount) {
      await updateCashAccount(editingAccount.id, submitData);
    } else {
      await createCashAccount(submitData);
    }
    
    setShowAddModal(false);
    setEditingAccount(null);
    setFormData({
      account_id: '',
      account_name: '',
      initial_balance: '',
      currency: 'IDR',
      is_primary: false,
      description: ''
    });
  };

  const handleEdit = (account: CashAccount) => {
    setEditingAccount(account);
    setFormData({
      account_id: account.account_id,
      account_name: account.account_name,
      initial_balance: account.initial_balance.toString(),
      currency: account.currency,
      is_primary: account.is_primary,
      description: account.description || ''
    });
    setShowAddModal(true);
  };

  const handleSetPrimary = async (account: CashAccount) => {
    // First, unset all other primary accounts
    for (const acc of cashAccounts) {
      if (acc.is_primary && acc.id !== account.id) {
        await updateCashAccount(acc.id, { is_primary: false });
      }
    }
    // Then set this account as primary
    await updateCashAccount(account.id, { is_primary: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat cash accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Akun Kas</h2>
          <p className="text-gray-600">Kelola akun kas dan saldo</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingAccount(null);
                setFormData({
                  account_id: '',
                  account_name: '',
                  initial_balance: '',
                  currency: 'IDR',
                  is_primary: false,
                  description: ''
                });
              }}
              className="bg-[#0050C8] hover:bg-[#003a9b]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Akun Kas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Akun Kas' : 'Tambah Akun Kas Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account_id">Akun dari Chart of Accounts</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun dari chart of accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartOfAccounts
                      .filter(account => account.account_type === 'asset')
                      .map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_code} - {account.account_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account_name">Nama Akun Kas</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="Contoh: Kas Utama"
                  required
                />
              </div>
              <div>
                <Label htmlFor="initial_balance">Saldo Awal</Label>
                <Input
                  id="initial_balance"
                  type="number"
                  step="0.01"
                  value={formData.initial_balance}
                  onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="currency">Mata Uang</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                    <SelectItem value="USD">USD - Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_primary">Akun Kas Utama</Label>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi akun kas (opsional)"
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari akun kas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>{account.account_name}</span>
                    {account.is_primary && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {account.chart_of_accounts?.account_code} - {account.chart_of_accounts?.account_name}
                  </p>
                </div>
                <Badge variant={account.is_primary ? "default" : "secondary"}>
                  {account.is_primary ? "Utama" : "Sekunder"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saldo Saat Ini:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(account.current_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saldo Awal:</span>
                  <span className="text-sm">
                    {formatCurrency(account.initial_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mata Uang:</span>
                  <span className="text-sm font-mono">{account.currency}</span>
                </div>
                {account.description && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">{account.description}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!account.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(account)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table View for Mobile */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle>Daftar Akun Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.account_name}</div>
                      <div className="text-sm text-gray-500">{account.currency}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(account.current_balance)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.is_primary ? "default" : "secondary"}>
                      {account.is_primary ? "Utama" : "Sekunder"}
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
                      {!account.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(account)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
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

export default CashAccountsTab;
