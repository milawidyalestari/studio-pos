
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Package, Edit, Trash2, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ProductOverlayCards } from './ProductOverlayCards';
import { formatCurrency } from '@/utils/masterDataHelpers';
import { Product } from '@/hooks/useProducts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateProduct } from '@/hooks/useProducts';

interface ProductsTabProps {
  products: Product[];
  productsLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  sampleGroups: any[];
  sampleCategories: any[];
  sampleUnits: any[];
  samplePaymentTypes: any[];
  categoriesLoading: boolean;
  onOverlayOpen: (type: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  productsLoading,
  searchTerm,
  onSearchChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  sampleGroups,
  sampleCategories,
  sampleUnits,
  samplePaymentTypes,
  categoriesLoading,
  onOverlayOpen
}) => {
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<{ field: string; operator: string; value: string }[]>([]);
  const [filterField, setFilterField] = React.useState('name');
  const [filterOperator, setFilterOperator] = React.useState('contains');
  const [filterValue, setFilterValue] = React.useState('');
  const filterFields = [
    { value: 'kode', label: 'Kode' },
    { value: 'name', label: 'Nama' },
    { value: 'jenis', label: 'Jenis' },
    { value: 'satuan', label: 'Satuan' },
  ];
  const filterOperators = [
    { value: 'contains', label: 'berisi' },
    { value: 'equals', label: 'sama dengan' },
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
        // Only add new data, do not update existing
        await createProductMutation.mutateAsync(row);
      }
      setIsImportOpen(false);
      setImportedData([]);
      setImportError(null);
    } catch (err: any) {
      setImportError(err.message || 'Import failed');
    }
  };

  // Filter products based on search term and filters
  let filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.kode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (filters.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return filters.every(f => {
        const val = ((product as any)[f.field] || '').toLowerCase();
        const filterVal = f.value.toLowerCase();
        if (f.operator === 'contains') return val.includes(filterVal);
        if (f.operator === 'equals') return val === filterVal;
        return true;
      });
    });
  }

  // Export Handlers
  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredProducts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'products.xlsx');
  };

  const ProductActionButtons = ({ product }: { product: Product }) => (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onEditProduct(product)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onDeleteProduct(product.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const createProductMutation = useCreateProduct();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="sticky top-0 z-20 bg-white">
          <TableHeader 
            title="Data Produk & Jasa" 
            icon={Package}
            onAdd={onAddProduct}
            onExportCSV={handleExportCSV}
            onExportXLSX={handleExportXLSX}
            onImport={() => setIsImportOpen(true)}
          />
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Input 
                placeholder="Cari produk..." 
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
          {productsLoading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Opname</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{product.kode}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.jenis}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.nama}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.satuan}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(product.harga_beli || 0)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-[#0050C8]">{formatCurrency(product.harga_jual || 0)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.stok_opname}</td>
                      <td className="px-4 py-4">
                        <ProductActionButtons product={product} />
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        {searchTerm ? 'No products found matching your search.' : 'No products available. Click "Add New" to create your first product.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Produk (CSV/XLSX)</DialogTitle>
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
    </div>
  );
};
