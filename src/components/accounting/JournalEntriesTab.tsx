import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useJournalEntries, useChartOfAccounts } from '@/hooks/useAccounting';
import { JournalEntry, JournalEntryLine } from '@/services/accountingService';
import { formatCurrency } from '@/utils/formatters';

const JournalEntriesTab = () => {
  const { journalEntries, isLoading, createJournalEntry, postJournalEntry, cancelJournalEntry } = useJournalEntries();
  const { chartOfAccounts } = useChartOfAccounts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    entry_number: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    reference_type: '' as 'sale' | 'purchase' | 'cash_in' | 'cash_out' | 'transfer' | 'adjustment',
    reference_id: '',
    journal_lines: [] as Omit<JournalEntryLine, 'id' | 'journal_entry_id' | 'created_at'>[]
  });

  const [newLine, setNewLine] = useState({
    account_id: '',
    debit_amount: '',
    credit_amount: '',
    description: ''
  });

  const statusLabels = {
    draft: 'Draft',
    posted: 'Diposting',
    cancelled: 'Dibatalkan'
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    posted: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const referenceTypeLabels = {
    sale: 'Penjualan',
    purchase: 'Pembelian',
    cash_in: 'Masuk Kas',
    cash_out: 'Keluar Kas',
    transfer: 'Transfer',
    adjustment: 'Penyesuaian'
  };

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddLine = () => {
    if (!newLine.account_id || (!newLine.debit_amount && !newLine.credit_amount)) {
      alert('Harap isi akun dan salah satu dari debit atau kredit');
      return;
    }

    const line = {
      account_id: newLine.account_id,
      debit_amount: parseFloat(newLine.debit_amount) || 0,
      credit_amount: parseFloat(newLine.credit_amount) || 0,
      description: newLine.description
    };

    setFormData({
      ...formData,
      journal_lines: [...formData.journal_lines, line]
    });

    setNewLine({
      account_id: '',
      debit_amount: '',
      credit_amount: '',
      description: ''
    });
  };

  const handleRemoveLine = (index: number) => {
    setFormData({
      ...formData,
      journal_lines: formData.journal_lines.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.journal_lines.length === 0) {
      alert('Harap tambahkan minimal satu baris jurnal');
      return;
    }

    const totalDebit = formData.journal_lines.reduce((sum, line) => sum + line.debit_amount, 0);
    const totalCredit = formData.journal_lines.reduce((sum, line) => sum + line.credit_amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert('Total debit dan kredit harus sama');
      return;
    }

    const entryData = {
      ...formData,
      entry_number: formData.entry_number || `JE${Date.now()}`
    };

    await createJournalEntry(entryData);
    
    setShowAddModal(false);
    setFormData({
      entry_number: '',
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
      reference_type: '' as any,
      reference_id: '',
      journal_lines: []
    });
  };

  const handlePost = async (entry: JournalEntry) => {
    if (window.confirm(`Apakah Anda yakin ingin memposting jurnal ${entry.entry_number}?`)) {
      await postJournalEntry(entry.id);
    }
  };

  const handleCancel = async (entry: JournalEntry) => {
    if (window.confirm(`Apakah Anda yakin ingin membatalkan jurnal ${entry.entry_number}?`)) {
      await cancelJournalEntry(entry.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Jurnal Umum</h2>
          <p className="text-gray-600">Kelola pencatatan transaksi keuangan</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setFormData({
                  entry_number: '',
                  transaction_date: new Date().toISOString().split('T')[0],
                  description: '',
                  reference_type: '' as any,
                  reference_id: '',
                  journal_lines: []
                });
              }}
              className="bg-[#0050C8] hover:bg-[#003a9b]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jurnal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Jurnal Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entry_number">Nomor Jurnal</Label>
                  <Input
                    id="entry_number"
                    value={formData.entry_number}
                    onChange={(e) => setFormData({ ...formData, entry_number: e.target.value })}
                    placeholder="Auto-generated jika kosong"
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_date">Tanggal Transaksi</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi transaksi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_type">Jenis Referensi</Label>
                  <Select
                    value={formData.reference_type}
                    onValueChange={(value) => setFormData({ ...formData, reference_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis referensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Penjualan</SelectItem>
                      <SelectItem value="purchase">Pembelian</SelectItem>
                      <SelectItem value="cash_in">Masuk Kas</SelectItem>
                      <SelectItem value="cash_out">Keluar Kas</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="adjustment">Penyesuaian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reference_id">ID Referensi (Opsional)</Label>
                  <Input
                    id="reference_id"
                    value={formData.reference_id}
                    onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                    placeholder="ID referensi"
                  />
                </div>
              </div>

              {/* Journal Lines */}
              <div>
                <Label>Baris Jurnal</Label>
                <div className="space-y-4">
                  {formData.journal_lines.map((line, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Select
                          value={line.account_id}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih akun" />
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
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.debit_amount}
                          disabled
                          placeholder="Debit"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.credit_amount}
                          disabled
                          placeholder="Kredit"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={line.description}
                          disabled
                          placeholder="Deskripsi"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveLine(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Add New Line */}
                  <div className="flex items-center space-x-2 p-3 border-2 border-dashed rounded-lg">
                    <div className="flex-1">
                      <Select
                        value={newLine.account_id}
                        onValueChange={(value) => setNewLine({ ...newLine, account_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih akun" />
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
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        value={newLine.debit_amount}
                        onChange={(e) => setNewLine({ ...newLine, debit_amount: e.target.value })}
                        placeholder="Debit"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        value={newLine.credit_amount}
                        onChange={(e) => setNewLine({ ...newLine, credit_amount: e.target.value })}
                        placeholder="Kredit"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={newLine.description}
                        onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                        placeholder="Deskripsi"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddLine}
                      className="bg-[#0050C8] hover:bg-[#003a9b]"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">
                  Simpan Jurnal
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
                  placeholder="Cari jurnal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Total Debit</TableHead>
                <TableHead>Total Kredit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">
                    {entry.entry_number}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.transaction_date).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {entry.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.reference_type && (
                      <Badge variant="outline">
                        {referenceTypeLabels[entry.reference_type]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.total_debit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(entry.total_credit)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[entry.status]}>
                      {statusLabels[entry.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {entry.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePost(entry)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(entry)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Journal Entry Detail Modal */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Jurnal - {selectedEntry.entry_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Tanggal:</Label>
                  <p>{new Date(selectedEntry.transaction_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status:</Label>
                  <Badge className={statusColors[selectedEntry.status]}>
                    {statusLabels[selectedEntry.status]}
                  </Badge>
                </div>
              </div>
              
              {selectedEntry.description && (
                <div>
                  <Label className="font-semibold">Deskripsi:</Label>
                  <p>{selectedEntry.description}</p>
                </div>
              )}

              <div>
                <Label className="font-semibold">Baris Jurnal:</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead>Deskripsi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.journal_entry_lines?.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          {line.chart_of_accounts?.account_code} - {line.chart_of_accounts?.account_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : '-'}
                        </TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="font-semibold">Total Debit: </span>
                  <span className="text-lg">{formatCurrency(selectedEntry.total_debit)}</span>
                </div>
                <div>
                  <span className="font-semibold">Total Kredit: </span>
                  <span className="text-lg">{formatCurrency(selectedEntry.total_credit)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JournalEntriesTab;
