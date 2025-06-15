
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';

interface TableHeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onAdd: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ title, icon: Icon, onAdd }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-[#0050C8]" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="gap-2">
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
