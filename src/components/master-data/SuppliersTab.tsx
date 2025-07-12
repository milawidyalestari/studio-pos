
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ActionButtons } from './ActionButtons';
import { useSuppliers } from '@/hooks/useSuppliers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface SuppliersTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: string, item?: any) => void;
}

export const SuppliersTab: React.FC<SuppliersTabProps> = ({
  searchTerm,
  onSearchChange,
  onAction
}) => {
  const { suppliers, isLoading } = useSuppliers();
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<{ field: string; operator: string; value: string }[]>([]);
  const [filterField, setFilterField] = React.useState('name');
  const [filterOperator, setFilterOperator] = React.useState('contains');
  const [filterValue, setFilterValue] = React.useState('');
  const filterFields = [
    { value: 'name', label: 'Name' },
    { value: 'contact_person', label: 'Contact Person' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'address', label: 'Address' },
  ];
  const filterOperators = [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'equals' },
  ];
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importedData, setImportedData] = React.useState<any[]>([]);
  const [importError, setImportError] = React.useState<string | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setImportedData(results.data as any[]);
        },
        error: (err) => setImportError(err.message),
      });
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        setImportedData(json as any[]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setImportError('File type not supported. Please upload CSV or XLSX.');
    }
  };

  const handleImportData = async () => {
    try {
      for (const row of importedData) {
        await createSupplier(row);
      }
      setIsImportOpen(false);
      setImportedData([]);
      setImportError(null);
    } catch (err: any) {
      setImportError(err.message || 'Import failed');
    }
  };

  // Filter suppliers based on search term and filters
  let filteredSuppliers = suppliers?.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  if (filters.length > 0) {
    filteredSuppliers = filteredSuppliers.filter(supplier => {
      return filters.every(f => {
        const val = (supplier as any)[f.field]?.toLowerCase?.() || '';
        const filterVal = f.value.toLowerCase();
        if (f.operator === 'contains') return val.includes(filterVal);
        if (f.operator === 'equals') return val === filterVal;
        return true;
      });
    });
  }

  // Export Handlers
  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredSuppliers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'suppliers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSuppliers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');
    XLSX.writeFile(wb, 'suppliers.xlsx');
  };
  return (
    <Card>
      <CardHeader className="sticky top-0 z-20 bg-white">
        <TableHeader 
          title="Data Supplier" 
          icon={Truck}
          onAdd={() => onAction('add')}
          onImport={() => setIsImportOpen(true)}
          onExportCSV={handleExportCSV}
          onExportXLSX={handleExportXLSX}
        />
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Input 
              placeholder="Cari supplier..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                className={`gap-2 ${filters.length > 0 ? 'bg-blue-100 text-blue-700 border-blue-600 hover:bg-blue-200' : ''}`}
                variant={filters.length > 0 ? undefined : 'outline'}
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Select value={filterField} onValueChange={setFilterField}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterFields.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterOperator} onValueChange={setFilterOperator}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOperators.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input value={filterValue} onChange={e => setFilterValue(e.target.value)} placeholder="Nilai filter" />
                <Button
                  onClick={() => {
                    if (filterValue) {
                      setFilters([...filters, { field: filterField, operator: filterOperator, value: filterValue }]);
                      setFilterValue('');
                      setFilterPopoverOpen(false);
                    }
                  }}
                  disabled={!filterValue}
                  className="w-full"
                >
                  Add Filter
                </Button>
                {filters.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-500">Active Filters:</div>
                    {filters.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-gray-100 rounded px-2 py-1">
                        <span>{filterFields.find(ff => ff.value === f.field)?.label}</span>
                        <span>{filterOperators.find(oo => oo.value === f.operator)?.label}</span>
                        <span>"{f.value}"</span>
                        <Button size="icon" variant="ghost" className="h-4 w-4 p-0 ml-2" onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}>
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No suppliers found matching your search.' : 'No suppliers found. Click "Add New" to create the first supplier.'}
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.contact_person || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.phone || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.email || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.address || '-'}</td>
                      <td className="px-4 py-4">
                        <ActionButtons item={supplier} onAction={onAction} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Supplier (CSV/XLSX)</DialogTitle>
          </DialogHeader>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleImportFile}
            className="mb-4"
          />
          {importError && <div className="text-red-600 text-sm mb-2">{importError}</div>}
          {importedData.length > 0 && (
            <div className="max-h-48 overflow-auto border rounded mb-2">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    {Object.keys(importedData[0]).map((key) => (
                      <th key={key} className="px-2 py-1 border-b bg-gray-50">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importedData.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(importedData[0]).map((key) => (
                        <td key={key} className="px-2 py-1 border-b">{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImportData} disabled={importedData.length === 0}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
