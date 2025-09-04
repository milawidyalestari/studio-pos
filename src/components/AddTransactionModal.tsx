import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Transaction, Category } from '@/lib/database';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/formatters';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<Transaction>) => Promise<void>;
  editingTransaction?: Transaction | null;
  categories: Category[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  open,
  onClose,
  onSave,
  editingTransaction,
  categories
}) => {
  const [formData, setFormData] = useState({
    transaction_type: 'expense' as 'income' | 'expense' | 'transfer' | 'adjustment',
    amount: '',
    formattedAmount: '', // For display
    description: '',
    category_id: '',
    transaction_date: new Date(),
    notes: '',
    payment_method: 'Cash',
    status: 'completed' as 'completed' | 'pending' | 'cancelled' | 'rejected',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    currency: 'IDR',
    recurring: false
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or editing transaction changes
  useEffect(() => {
    if (open) {
      if (editingTransaction) {
        const formattedAmount = formatCurrencyInput(editingTransaction.amount.toString());
        setFormData({
          transaction_type: editingTransaction.transaction_type || (editingTransaction.type as any) || 'expense',
          amount: editingTransaction.amount.toString(),
          formattedAmount: formattedAmount,
          description: editingTransaction.description || '',
          category_id: editingTransaction.category_id || editingTransaction.category || '',
          transaction_date: editingTransaction.transaction_date ? new Date(editingTransaction.transaction_date) : 
                          (editingTransaction.date ? new Date(editingTransaction.date) : new Date()),
          notes: editingTransaction.notes || '',
          payment_method: editingTransaction.payment_method || 'Cash',
          status: editingTransaction.status || 'completed',
          priority: editingTransaction.priority || 'normal',
          currency: editingTransaction.currency || 'IDR',
          recurring: editingTransaction.recurring || false
        });
      } else {
        setFormData({
          transaction_type: 'expense',
          amount: '',
          formattedAmount: '',
          description: '',
          category_id: '',
          transaction_date: new Date(),
          notes: '',
          payment_method: 'Cash',
          status: 'completed',
          priority: 'normal',
          currency: 'IDR',
          recurring: false
        });
      }
    }
  }, [open, editingTransaction]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmountChange = (value: string) => {
    // Format the input value for display
    const formatted = formatCurrencyInput(value);
    // Parse the formatted value to get the actual numeric value
    const numericValue = parseCurrencyInput(value);
    
    setFormData(prev => ({
      ...prev,
      formattedAmount: formatted,
      amount: numericValue.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category_id) {
      alert('Harap isi semua field yang wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        transaction_type: formData.transaction_type,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date.toISOString().split('T')[0],
        description: formData.description,
        category_id: formData.category_id,
        payment_method: formData.payment_method,
        notes: formData.notes,
        status: formData.status,
        priority: formData.priority,
        currency: formData.currency,
        recurring: formData.recurring
      });
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Gagal menyimpan transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const availableCategories = formData.transaction_type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <RadioGroup 
              value={formData.transaction_type} 
              onValueChange={(value) => handleInputChange('transaction_type', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">
                  Pengeluaran
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">
                  Pemasukan
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                {formData.currency}
              </span>
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={formData.formattedAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-12"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Input
              id="description"
              placeholder="Deskripsi transaksi"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleInputChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => handleInputChange('payment_method', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="QRIS">QRIS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioritas</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Rendah</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Mata Uang</Label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata uang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                <SelectItem value="USD">USD (Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal *</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.transaction_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.transaction_date ? (
                    format(formData.transaction_date, 'PPP', { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.transaction_date}
                  onSelect={(date) => {
                    if (date) {
                      handleInputChange('transaction_date', date);
                      setDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan (opsional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Menyimpan...' : (editingTransaction ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
