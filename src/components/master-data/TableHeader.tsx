
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, FileText, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface TableHeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onAdd: () => void;
  onExportCSV?: () => void;
  onExportXLSX?: () => void;
  onImport?: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ title, icon: Icon, onAdd, onExportCSV, onExportXLSX, onImport }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-[#0050C8]" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportCSV} className="gap-2">
            <FileText className="h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportXLSX} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export as XLSX
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" className="gap-2" onClick={onImport}>
        <Upload className="h-4 w-4" />
        Import
      </Button>
      <Button onClick={onAdd} className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]">
        <Plus className="h-4 w-4" />
        Add New
      </Button>
    </div>
  </div>
);
