import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Calendar, BarChart3, PieChart, FileText, RefreshCw } from 'lucide-react';
import { useChartOfAccounts, useCashAccounts } from '@/hooks/useAccounting';
import { formatCurrency } from '@/utils/formatters';

const AccountingReportsTab = () => {
  const { chartOfAccounts, isLoading: chartLoading } = useChartOfAccounts();
  const { cashAccounts, isLoading: cashLoading } = useCashAccounts();
  const [selectedReport, setSelectedReport] = useState('trial-balance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const isLoading = chartLoading || cashLoading;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleExportReport = () => {
    // Simulate export functionality
    console.log('Exporting report:', selectedReport);
  };

  // Calculate trial balance
  const trialBalance = chartOfAccounts.map(account => {
    // This is a simplified calculation - in real implementation, 
    // you would calculate actual balances from journal entries
    const balance = Math.random() * 1000000; // Mock data
    return {
      ...account,
      debit_balance: account.account_type === 'asset' || account.account_type === 'expense' ? balance : 0,
      credit_balance: account.account_type === 'liability' || account.account_type === 'equity' || account.account_type === 'income' ? balance : 0
    };
  });

  const totalDebit = trialBalance.reduce((sum, account) => sum + account.debit_balance, 0);
  const totalCredit = trialBalance.reduce((sum, account) => sum + account.credit_balance, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Laporan Akuntansi</h2>
          <p className="text-gray-600">Buat dan ekspor laporan keuangan</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-[#0050C8] hover:bg-[#003a9b]"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Membuat Laporan...' : 'Buat Laporan'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor</span>
          </Button>
        </div>
      </div>

      {/* Report Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-type">Jenis Laporan</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis laporan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial-balance">Neraca Saldo</SelectItem>
                  <SelectItem value="balance-sheet">Neraca</SelectItem>
                  <SelectItem value="profit-loss">Laba Rugi</SelectItem>
                  <SelectItem value="cash-flow">Arus Kas</SelectItem>
                  <SelectItem value="general-ledger">Buku Besar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-range">Periode</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {selectedReport === 'trial-balance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Neraca Saldo</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Periode: {new Date(dateRange.startDate).toLocaleDateString('id-ID')} - {new Date(dateRange.endDate).toLocaleDateString('id-ID')}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Akun</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Kredit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono text-sm">
                      {account.account_code}
                    </TableCell>
                    <TableCell>{account.account_name}</TableCell>
                    <TableCell className="text-right">
                      {account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold border-t">
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'balance-sheet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">ASET</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance
                    .filter(account => account.account_type === 'asset')
                    .map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.account_name}</div>
                            <div className="text-sm text-gray-500">{account.account_code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.debit_balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Liabilities & Equity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">KEWAJIBAN & MODAL</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance
                    .filter(account => account.account_type === 'liability' || account.account_type === 'equity')
                    .map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.account_name}</div>
                            <div className="text-sm text-gray-500">{account.account_code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.credit_balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'profit-loss' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">PENDAPATAN</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance
                    .filter(account => account.account_type === 'income')
                    .map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.account_name}</div>
                            <div className="text-sm text-gray-500">{account.account_code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.credit_balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">BIAYA</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Akun</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance
                    .filter(account => account.account_type === 'expense')
                    .map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.account_name}</div>
                            <div className="text-sm text-gray-500">{account.account_code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.debit_balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'cash-flow' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Arus Kas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cashAccounts.map((account) => (
                <div key={account.id} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(account.current_balance)}
                  </div>
                  <div className="text-sm text-gray-600">{account.account_name}</div>
                  <div className="text-xs text-gray-500">{account.currency}</div>
                  {account.is_primary && (
                    <Badge className="mt-2">Utama</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'general-ledger' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Buku Besar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {chartOfAccounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">{account.account_name}</h3>
                      <p className="text-sm text-gray-500">{account.account_code}</p>
                    </div>
                    <Badge variant="outline">
                      {account.account_type}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Tidak ada transaksi untuk periode ini
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingReportsTab;
