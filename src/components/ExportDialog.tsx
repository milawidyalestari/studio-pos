import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  Filter,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ExportService, ExportOptions, ExportData } from '@/services/exportService';
import { Category } from '@/lib/database';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  categories: Category[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  data,
  categories
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeSummary: true,
    includeChart: false
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportService = new ExportService();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsExporting(false);
      setExportComplete(false);
      setExportOptions({
        format: 'json',
        includeSummary: true,
        includeChart: false
      });
      setSelectedCategories([]);
      setDateRange({ start: '', end: '' });
    }
  }, [isOpen]);

  const formatIcons = {
    json: FileText,
    csv: FileText,
    excel: FileSpreadsheet,
    pdf: File
  };

  const formatLabels = {
    json: 'JSON',
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF'
  };

  const formatDescriptions = {
    json: 'Format data mentah untuk backup dan import',
    csv: 'Format spreadsheet sederhana untuk analisis',
    excel: 'Format Excel dengan multiple sheets',
    pdf: 'Format laporan siap cetak'
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(
      selectedCategories.length === categories.length 
        ? [] 
        : categories.map(c => c.name)
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        ...exportOptions,
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined
      };

      switch (options.format) {
        case 'json':
          await exportService.exportToJSON(data, options);
          break;
        case 'csv':
          await exportService.exportToCSV(data, options);
          break;
        case 'excel':
          await exportService.exportToExcel(data, options);
          break;
        case 'pdf':
          const chartElement = options.includeChart 
            ? document.querySelector('[data-chart-export]') as HTMLElement
            : undefined;
          await exportService.exportToPDF(data, options, chartElement);
          break;
      }
      
      setExportComplete(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export gagal. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate preview
  const preview = exportService.generateExportPreview(data, {
    ...exportOptions,
    dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined
  });

  if (exportComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Berhasil!</h3>
            <p className="text-gray-600 mb-4">
              File telah berhasil didownload
            </p>
            <Button onClick={onClose}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data Keuangan
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Options */}
          <div className="space-y-6">
            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Format Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(formatLabels).map(([format, label]) => {
                  const Icon = formatIcons[format as keyof typeof formatIcons];
                  return (
                    <div
                      key={format}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        exportOptions.format === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format as any }))}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-gray-500">
                            {formatDescriptions[format as keyof typeof formatDescriptions]}
                          </div>
                        </div>
                        {exportOptions.format === format && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rentang Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-date" className="text-xs">Dari</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs">Sampai</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="text-xs"
                >
                  Reset
                </Button>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Kategori
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {selectedCategories.length} dari {categories.length} kategori dipilih
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllCategories}
                    className="text-xs"
                  >
                    {selectedCategories.length === categories.length ? 'Batal Semua' : 'Pilih Semua'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => handleCategoryToggle(category.name)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <label htmlFor={category.id} className="text-sm cursor-pointer">
                          {category.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Opsi Tambahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-summary"
                    checked={exportOptions.includeSummary}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeSummary: !!checked }))
                    }
                  />
                  <label htmlFor="include-summary" className="text-sm cursor-pointer">
                    Sertakan ringkasan keuangan
                  </label>
                </div>
                {exportOptions.format === 'pdf' && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-chart"
                      checked={exportOptions.includeChart}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeChart: !!checked }))
                      }
                    />
                    <label htmlFor="include-chart" className="text-sm cursor-pointer flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Sertakan grafik
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Format</div>
                    <div className="font-medium">{formatLabels[exportOptions.format]}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Jumlah Transaksi</div>
                    <div className="font-medium">{preview.transactionCount}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-xs text-gray-500 mb-1">Rentang Tanggal</div>
                  <div className="text-sm">{preview.dateRange}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-2">Kategori</div>
                  <div className="flex flex-wrap gap-1">
                    {preview.categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Estimasi Ukuran</div>
                    <div className="text-sm font-medium">{preview.estimatedSize}</div>
                  </div>
                  {exportOptions.includeSummary && (
                    <Badge variant="outline" className="text-xs">
                      +Ringkasan
                    </Badge>
                  )}
                </div>

                {exportOptions.format === 'pdf' && exportOptions.includeChart && (
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <BarChart3 className="h-3 w-3" />
                      Grafik akan disertakan dalam PDF
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning/Info */}
            {preview.transactionCount === 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Tidak ada transaksi yang sesuai dengan filter
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || preview.transactionCount === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengexport...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {formatLabels[exportOptions.format]}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;