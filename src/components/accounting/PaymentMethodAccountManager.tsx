/**
 * Payment Method Account Manager Component
 * 
 * UI untuk mengelola mapping tipe pembayaran ke akun akuntansi
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePaymentMethodAccounts, useAccountForPaymentMethod } from '@/hooks/usePaymentMethodAccounts';
import { useAccounting } from '@/hooks/useAccounting';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PaymentMethodAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: any;
  onSuccess?: () => void;
}

const PaymentMethodAccountForm = ({ open, onOpenChange, editingItem, onSuccess }: PaymentMethodAccountFormProps) => {
  const { createPaymentMethodAccount, updatePaymentMethodAccount } = usePaymentMethodAccounts();
  const { useChartOfAccounts } = useAccounting();
  const { data: accounts, isLoading: loadingAccounts } = useChartOfAccounts();
  
  const [paymentMethod, setPaymentMethod] = useState(editingItem?.payment_method || '');
  const [debitAccountCode, setDebitAccountCode] = useState(editingItem?.debit_account_code || '');
  const [creditAccountCode, setCreditAccountCode] = useState(editingItem?.credit_account_code || '');
  const [description, setDescription] = useState(editingItem?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod || !debitAccountCode || !creditAccountCode) {
      alert('Semua field wajib diisi');
      return;
    }

    const formData = {
      payment_method: paymentMethod,
      debit_account_code: debitAccountCode,
      credit_account_code: creditAccountCode,
      description: description || undefined,
    };

    try {
      if (editingItem) {
        await updatePaymentMethodAccount.mutateAsync({
          paymentMethod: editingItem.payment_method,
          data: formData
        });
      } else {
        await createPaymentMethodAccount.mutateAsync(formData);
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving payment method account:', error);
    }
  };

  const handleClose = () => {
    setPaymentMethod('');
    setDebitAccountCode('');
    setCreditAccountCode('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Mapping Pembayaran' : 'Tambah Mapping Pembayaran'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Tipe Pembayaran</Label>
            <Input
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="cash, transfer, credit, ewallet, qris"
              required
              disabled={!!editingItem}
            />
            <p className="text-xs text-gray-500">
              {editingItem ? 'Tipe pembayaran tidak dapat diubah' : 'Masukkan tipe pembayaran (huruf kecil)'}
            </p>
          </div>

          {/* Debit Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="debit-account">Akun Debit (Uang Masuk)</Label>
            {loadingAccounts ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={debitAccountCode} onValueChange={setDebitAccountCode}>
                <SelectTrigger id="debit-account">
                  <SelectValue placeholder="Pilih akun debit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.account_code} value={account.account_code}>
                      {account.account_code} - {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-500">
              Akun yang akan didebit saat menerima pembayaran
            </p>
          </div>

          {/* Credit Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="credit-account">Akun Credit (Pendapatan)</Label>
            {loadingAccounts ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={creditAccountCode} onValueChange={setCreditAccountCode}>
                <SelectTrigger id="credit-account">
                  <SelectValue placeholder="Pilih akun credit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.account_code} value={account.account_code}>
                      {account.account_code} - {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-500">
              Akun yang akan dikredit untuk mencatat pendapatan
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan mapping pembayaran..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={createPaymentMethodAccount.isPending || updatePaymentMethodAccount.isPending}
            >
              {createPaymentMethodAccount.isPending || updatePaymentMethodAccount.isPending 
                ? 'Menyimpan...' 
                : editingItem ? 'Update' : 'Simpan'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const PaymentMethodAccountManager = () => {
  const { 
    usePaymentMethodAccounts, 
    togglePaymentMethodAccountStatus, 
    deletePaymentMethodAccount 
  } = usePaymentMethodAccounts();
  
  const { data: paymentMethodAccounts, isLoading } = usePaymentMethodAccounts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setEditingItem(null);
  };

  const handleToggleStatus = async (paymentMethod: string) => {
    if (confirm('Yakin ingin mengubah status mapping ini?')) {
      await togglePaymentMethodAccountStatus.mutateAsync(paymentMethod);
    }
  };

  const handleDelete = async (paymentMethod: string) => {
    if (confirm('Yakin ingin menghapus mapping ini? Tindakan ini tidak dapat dibatalkan.')) {
      await deletePaymentMethodAccount.mutateAsync(paymentMethod);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Master Data - Mapping Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Master Data - Mapping Pembayaran
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Mapping
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!paymentMethodAccounts || paymentMethodAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Belum ada mapping pembayaran</p>
              <p className="text-sm text-gray-400 mt-2">
                Klik "Tambah Mapping" untuk membuat mapping pertama
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethodAccounts.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={item.is_active ? "default" : "secondary"}>
                  {item.payment_method}
                </Badge>
                <span className="text-sm text-gray-500">→</span>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Debit:</span>
                    <span className="font-medium ml-1">{item.debit_account_code}</span>
                    <span className="text-gray-500 ml-2">{item.debit_account_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Credit:</span>
                    <span className="font-medium ml-1">{item.credit_account_code}</span>
                    <span className="text-gray-500 ml-2">{item.credit_account_name}</span>
                  </div>
                </div>
              </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        {item.updated_at !== item.created_at && (
                          <span>Diupdate: {new Date(item.updated_at).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(item.payment_method)}
                        disabled={togglePaymentMethodAccountStatus.isPending}
                      >
                        {item.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.payment_method)}
                        disabled={deletePaymentMethodAccount.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PaymentMethodAccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingItem={editingItem}
        onSuccess={handleSuccess}
      />
    </>
  );
};
