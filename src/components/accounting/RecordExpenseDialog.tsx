/**
 * Record Expense Dialog Component
 * 
 * Dialog untuk mencatat pengeluaran/biaya
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePOSAccounting } from '@/hooks/usePOSAccounting';

interface RecordExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPENSE_ACCOUNTS = [
  { code: '5100', name: 'Harga Pokok Penjualan' },
  { code: '5210', name: 'Biaya Gaji' },
  { code: '5220', name: 'Biaya Sewa' },
  { code: '5230', name: 'Biaya Listrik' },
  { code: '5240', name: 'Biaya Internet' },
  { code: '5300', name: 'Biaya Administrasi' },
];

export const RecordExpenseDialog = ({ open, onOpenChange }: RecordExpenseDialogProps) => {
  const { recordExpense } = usePOSAccounting();
  const [accountCode, setAccountCode] = useState('5300');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Jumlah pengeluaran tidak valid');
      return;
    }

    if (!description.trim()) {
      alert('Deskripsi harus diisi');
      return;
    }

    recordExpense.mutate({
      expense_account_code: accountCode,
      amount: amountNum,
      description: description.trim(),
      payment_method: paymentMethod,
    }, {
      onSuccess: () => {
        setAccountCode('5300');
        setAmount('');
        setDescription('');
        setPaymentMethod('cash');
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    setAccountCode('5300');
    setAmount('');
    setDescription('');
    setPaymentMethod('cash');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Catat Pengeluaran</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense Category */}
          <div className="space-y-2">
            <Label htmlFor="account">Kategori Biaya</Label>
            <Select value={accountCode} onValueChange={setAccountCode}>
              <SelectTrigger id="account">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_ACCOUNTS.map((account) => (
                  <SelectItem key={account.code} value={account.code}>
                    {account.code} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              min="1"
              step="0.01"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan pengeluaran..."
              required
              rows={4}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Pengeluaran akan otomatis mengurangi saldo kas
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={recordExpense.isPending}
            >
              {recordExpense.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

