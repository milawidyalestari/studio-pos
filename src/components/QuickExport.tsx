import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { exportService, ExportData, ExportOptions } from '@/services/exportService';

interface QuickExportProps {
  data: ExportData;
}

const QuickExport: React.FC<QuickExportProps> = ({ data }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const quickExportOptions = [
    {
      id: 'monthly-excel',
      title: 'Laporan Bulanan',
      description: 'Excel dengan data bulan ini',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      format: 'excel' as const,
      getOptions: (): ExportOptions => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return {
          format: 'excel',
          dateRange: {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
          },
          includeSummary: true
        };
      }
    },
    {
      id: 'full-pdf',
      title: 'Laporan Lengkap',
      description: 'PDF dengan grafik',
      icon: File,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      format: 'pdf' as const,
      getOptions: (): ExportOptions => ({
        format: 'pdf',
        includeSummary: true,
        includeChart: true
      })
    },
    {
      id: 'backup-json',
      title: 'Backup Data',
      description: 'JSON untuk backup',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      format: 'json' as const,
      getOptions: (): ExportOptions => ({
        format: 'json',
        includeSummary: true
      })
    },
    {
      id: 'weekly-csv',
      title: 'Laporan Mingguan',
      description: 'CSV 7 hari terakhir',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      format: 'csv' as const,
      getOptions: (): ExportOptions => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return {
          format: 'csv',
          dateRange: {
            start: weekAgo.toISOString().split('T')[0],
            end: now.toISOString().split('T')[0]
          },
          includeSummary: true
        };
      }
    }
  ];

  const handleQuickExport = async (option: typeof quickExportOptions[0]) => {
    setIsExporting(option.id);
    
    try {
      const exportOptions = option.getOptions();
      
      switch (option.format) {
        case 'json':
          await exportService.exportToJSON(data, exportOptions);
          break;
        case 'csv':
          await exportService.exportToCSV(data, exportOptions);
          break;
        case 'excel':
          await exportService.exportToExcel(data, exportOptions);
          break;
        case 'pdf':
          const chartElement = document.querySelector('[data-chart-export]') as HTMLElement;
          await exportService.exportToPDF(data, exportOptions, chartElement);
          break;
      }
    } catch (error) {
      console.error('Quick export failed:', error);
      alert('Export gagal. Silakan coba lagi.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Quick Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickExportOptions.map((option) => {
            const Icon = option.icon;
            const isLoading = isExporting === option.id;
            
            return (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                onClick={() => handleQuickExport(option)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`p-2 rounded-md ${option.bgColor}`}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className={`h-4 w-4 ${option.color}`} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{option.title}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-600 text-center">
            Untuk opsi export lanjutan, gunakan tombol "Export" di header
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickExport;