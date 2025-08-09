import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Transaction, Category, FinancialSummary } from '@/lib/database';

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  includeChart?: boolean;
  includeSummary?: boolean;
}

export interface ExportData {
  transactions: Transaction[];
  categories: Category[];
  summary: FinancialSummary;
  metadata: {
    exportedAt: string;
    exportedBy: string;
    totalTransactions: number;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export class ExportService {
  private formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  private formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('id-ID');
  };

  private filterTransactions(
    transactions: Transaction[],
    options: ExportOptions
  ): Transaction[] {
    let filtered = [...transactions];

    // Filter by date range
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(t => options.categories!.includes(t.category));
    }

    return filtered;
  }

  async exportToJSON(
    data: ExportData,
    options: ExportOptions
  ): Promise<void> {
    const filteredTransactions = this.filterTransactions(data.transactions, options);
    
    const exportData = {
      ...data,
      transactions: filteredTransactions,
      metadata: {
        ...data.metadata,
        totalTransactions: filteredTransactions.length,
        dateRange: options.dateRange
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    this.downloadFile(blob, `finance-data-${this.getTimestamp()}.json`);
  }

  async exportToCSV(
    data: ExportData,
    options: ExportOptions
  ): Promise<void> {
    const filteredTransactions = this.filterTransactions(data.transactions, options);
    
    // CSV Headers
    const headers = [
      'Tanggal',
      'Tipe',
      'Kategori',
      'Deskripsi',
      'Jumlah',
      'Metode Pembayaran',
      'Status'
    ];

    // CSV Rows
    const rows = filteredTransactions.map(t => [
      this.formatDate(t.date),
      t.type === 'income' ? 'Pendapatan' : 'Pengeluaran',
      t.category,
      t.description,
      t.amount.toString(),
      t.paymentMethod,
      t.status === 'completed' ? 'Selesai' : t.status === 'pending' ? 'Pending' : 'Dibatalkan'
    ]);

    // Add summary if requested
    if (options.includeSummary) {
      rows.unshift([]);
      rows.unshift(['=== RINGKASAN KEUANGAN ===']);
      rows.unshift(['Total Pendapatan', '', '', '', data.summary.totalIncome.toString(), '', '']);
      rows.unshift(['Total Pengeluaran', '', '', '', data.summary.totalExpense.toString(), '', '']);
      rows.unshift(['Laba Bersih', '', '', '', data.summary.netProfit.toString(), '', '']);
      rows.unshift(['Pending', '', '', '', data.summary.pendingAmount.toString(), '', '']);
      rows.unshift([]);
      rows.unshift(['=== DATA TRANSAKSI ===']);
    }

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `finance-data-${this.getTimestamp()}.csv`);
  }

  async exportToExcel(
    data: ExportData,
    options: ExportOptions
  ): Promise<void> {
    const filteredTransactions = this.filterTransactions(data.transactions, options);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    if (options.includeSummary) {
      const summaryData = [
        ['RINGKASAN KEUANGAN'],
        [''],
        ['Total Pendapatan', this.formatCurrency(data.summary.totalIncome)],
        ['Total Pengeluaran', this.formatCurrency(data.summary.totalExpense)],
        ['Laba Bersih', this.formatCurrency(data.summary.netProfit)],
        ['Pending', this.formatCurrency(data.summary.pendingAmount)],
        ['Pendapatan Bulan Ini', this.formatCurrency(data.summary.thisMonthIncome)],
        ['Pengeluaran Bulan Ini', this.formatCurrency(data.summary.thisMonthExpense)],
        [''],
        ['Diekspor pada', new Date().toLocaleString('id-ID')],
        ['Total Transaksi', filteredTransactions.length.toString()]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
    }

    // Transactions Sheet
    const transactionData = [
      ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Metode Pembayaran', 'Status'],
      ...filteredTransactions.map(t => [
        this.formatDate(t.date),
        t.type === 'income' ? 'Pendapatan' : 'Pengeluaran',
        t.category,
        t.description,
        t.amount,
        t.paymentMethod,
        t.status === 'completed' ? 'Selesai' : t.status === 'pending' ? 'Pending' : 'Dibatalkan'
      ])
    ];

    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transaksi');

    // Categories Sheet
    const categoryData = [
      ['Nama Kategori', 'Tipe', 'Warna'],
      ...data.categories.map(c => [
        c.name,
        c.type === 'income' ? 'Pendapatan' : 'Pengeluaran',
        c.color
      ])
    ];

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Kategori');

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    this.downloadFile(blob, `finance-data-${this.getTimestamp()}.xlsx`);
  }

  async exportToPDF(
    data: ExportData,
    options: ExportOptions,
    chartElement?: HTMLElement
  ): Promise<void> {
    const filteredTransactions = this.filterTransactions(data.transactions, options);
    
    const pdf = new jsPDF();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('Laporan Keuangan', 20, yPosition);
    yPosition += 15;

    // Date
    pdf.setFontSize(12);
    pdf.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 20, yPosition);
    yPosition += 10;

    if (options.dateRange) {
      pdf.text(
        `Periode: ${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}`,
        20,
        yPosition
      );
      yPosition += 15;
    } else {
      yPosition += 10;
    }

    // Summary
    if (options.includeSummary) {
      pdf.setFontSize(16);
      pdf.text('Ringkasan Keuangan', 20, yPosition);
      yPosition += 10;

      const summaryData = [
        ['Total Pendapatan', this.formatCurrency(data.summary.totalIncome)],
        ['Total Pengeluaran', this.formatCurrency(data.summary.totalExpense)],
        ['Laba Bersih', this.formatCurrency(data.summary.netProfit)],
        ['Pending', this.formatCurrency(data.summary.pendingAmount)]
      ];

      (pdf as any).autoTable({
        startY: yPosition,
        head: [['Keterangan', 'Jumlah']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Chart
    if (options.includeChart && chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        
        const chartImgData = canvas.toDataURL('image/png');
        const chartWidth = 170;
        const chartHeight = (canvas.height * chartWidth) / canvas.width;
        
        // Check if we need a new page
        if (yPosition + chartHeight > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(chartImgData, 'PNG', 20, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 15;
      } catch (error) {
        console.error('Error adding chart to PDF:', error);
      }
    }

    // Transactions table
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text('Detail Transaksi', 20, yPosition);
    yPosition += 10;

    const tableData = filteredTransactions.map(t => [
      this.formatDate(t.date),
      t.type === 'income' ? 'Pendapatan' : 'Pengeluaran',
      t.category,
      t.description.length > 30 ? t.description.substring(0, 30) + '...' : t.description,
      this.formatCurrency(t.amount),
      t.status === 'completed' ? 'Selesai' : t.status === 'pending' ? 'Pending' : 'Dibatalkan'
    ]);

    (pdf as any).autoTable({
      startY: yPosition,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Status']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 }
      }
    });

    // Save PDF
    pdf.save(`finance-data-${this.getTimestamp()}.pdf`);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getTimestamp(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Generate export preview
  generateExportPreview(
    data: ExportData,
    options: ExportOptions
  ): {
    transactionCount: number;
    dateRange: string;
    categories: string[];
    estimatedSize: string;
  } {
    const filteredTransactions = this.filterTransactions(data.transactions, options);
    
    const dateRange = options.dateRange 
      ? `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}`
      : 'Semua tanggal';
    
    const categories = options.categories && options.categories.length > 0
      ? options.categories
      : ['Semua kategori'];
    
    // Estimate file size
    const dataSize = JSON.stringify(filteredTransactions).length;
    const estimatedSize = dataSize < 1024 
      ? `${dataSize} bytes`
      : dataSize < 1024 * 1024
      ? `${Math.round(dataSize / 1024)} KB`
      : `${Math.round(dataSize / (1024 * 1024))} MB`;

    return {
      transactionCount: filteredTransactions.length,
      dateRange,
      categories,
      estimatedSize
    };
  }
}

export const exportService = new ExportService();