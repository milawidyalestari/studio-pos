
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ActionButtons } from './ActionButtons';

interface SuppliersTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: string, item?: any) => void;
}

const sampleSuppliers = [
  { kode: 'SUP001', nama: 'PT Vinyl Indonesia', kontak: '021-12345678', email: 'info@vinylindonesia.com', whatsapp: '081234567890' },
  { kode: 'SUP002', nama: 'CV Banner Jaya', kontak: '021-87654321', email: 'sales@bannerjaya.com', whatsapp: '081987654321' },
  { kode: 'SUP003', nama: 'Toko Sticker Murah', kontak: '021-11223344', email: 'order@stickermurah.com', whatsapp: '081122334455' },
];

export const SuppliersTab: React.FC<SuppliersTabProps> = ({
  searchTerm,
  onSearchChange,
  onAction
}) => {
  return (
    <Card>
      <CardHeader>
        <TableHeader 
          title="Data Supplier" 
          icon={Truck}
          onAdd={() => onAction('add')}
        />
        <SearchAndFilter 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleSuppliers.map((supplier) => (
                <tr key={supplier.kode} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{supplier.kode}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{supplier.nama}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{supplier.kontak}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{supplier.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{supplier.whatsapp}</td>
                  <td className="px-4 py-4">
                    <ActionButtons item={supplier} onAction={onAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
