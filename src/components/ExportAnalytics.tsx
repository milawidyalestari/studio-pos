import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  BarChart3,
  Calendar,
  Trash2,
  Eye
} from 'lucide-react';

interface ExportHistory {
  id: string;
  fileName: string;
  format: string;
  size: string;
  date: string;
  status: 'completed' | 'failed';
  downloadCount: number;
}

interface ExportAnalyticsProps {
  className?: string;
}

const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({ className }) => {
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);

  // Simulate export history
  useEffect(() => {
    const mockHistory: ExportHistory[] = [
      {
        id: '1',
        fileName: 'finance-data-2024-12-19.xlsx',
        format: 'excel',
        size: '245 KB',
        date: '2024-12-19 14:30',
        status: 'completed',
        downloadCount: 3
      },
      {
        id: '2',
        fileName: 'monthly-report-dec-2024.pdf',
        format: 'pdf',
        size: '1.2 MB',
        date: '2024-12-19 10:15',
        status: 'completed',
        downloadCount: 1
      },
      {
        id: '3',
        fileName: 'backup-data-2024-12-18.json',
        format: 'json',
        size: '89 KB',
        date: '2024-12-18 16:45',
        status: 'completed',
        downloadCount: 0
      },
      {
        id: '4',
        fileName: 'weekly-transactions.csv',
        format: 'csv',
        size: '34 KB',
        date: '2024-12-17 09:20',
        status: 'failed',
        downloadCount: 0
      }
    ];

    setExportHistory(mockHistory);
  }, []);

  const formatIcons = {
    json: FileText,
    csv: FileText,
    excel: FileSpreadsheet,
    pdf: File
  };

  const formatColors = {
    json: 'bg-blue-100 text-blue-800',
    csv: 'bg-green-100 text-green-800',
    excel: 'bg-emerald-100 text-emerald-800',
    pdf: 'bg-red-100 text-red-800'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Gagal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDeleteHistory = (id: string) => {
    setExportHistory(prev => prev.filter(item => item.id !== id));
  };

  const totalExports = exportHistory.length;
  const successfulExports = exportHistory.filter(item => item.status === 'completed').length;
  const totalDownloads = exportHistory.reduce((sum, item) => sum + item.downloadCount, 0);
  const totalSize = exportHistory
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => {
      const sizeNum = parseFloat(item.size);
      const unit = item.size.includes('MB') ? 1024 : 1;
      return sum + (sizeNum * unit);
    }, 0);

  return (
    <div className={className}>
      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalExports}</div>
                <div className="text-xs text-gray-600">Total Export</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{successfulExports}</div>
                <div className="text-xs text-gray-600">Berhasil</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{totalDownloads}</div>
                <div className="text-xs text-gray-600">Download</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {totalSize > 1024 
                    ? `${(totalSize / 1024).toFixed(1)} MB`
                    : `${Math.round(totalSize)} KB`
                  }
                </div>
                <div className="text-xs text-gray-600">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riwayat Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada riwayat export</p>
              <p className="text-sm">Export data akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exportHistory.map((item) => {
                const Icon = formatIcons[item.format as keyof typeof formatIcons] || FileText;
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${formatColors[item.format as keyof typeof formatColors] || 'bg-gray-100 text-gray-800'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.fileName}</div>
                        <div className="text-xs text-gray-500">
                          {item.date} • {item.size}
                          {item.downloadCount > 0 && ` • ${item.downloadCount} download`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHistory(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportAnalytics;