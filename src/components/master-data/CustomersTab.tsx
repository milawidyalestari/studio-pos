
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ActionButtons } from './ActionButtons';
import { getLevelBadge } from '@/utils/masterDataHelpers';

interface CustomersTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: string, item?: any) => void;
}

const sampleCustomers = [
  { kode: 'CUS001', nama: 'John Doe', whatsapp: '081234567890', level: 'Premium' },
  { kode: 'CUS002', nama: 'Jane Smith', whatsapp: '081987654321', level: 'Regular' },
  { kode: 'CUS003', nama: 'Bob Wilson', whatsapp: '081122334455', level: 'VIP' },
];

export const CustomersTab: React.FC<CustomersTabProps> = ({
  searchTerm,
  onSearchChange,
  onAction
}) => {
  return (
    <Card>
      <CardHeader>
        <TableHeader 
          title="Data Pelanggan" 
          icon={Users}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level Pelanggan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleCustomers.map((customer) => (
                <tr key={customer.kode} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.kode}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{customer.nama}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{customer.whatsapp}</td>
                  <td className="px-4 py-4">{getLevelBadge(customer.level)}</td>
                  <td className="px-4 py-4">
                    <ActionButtons item={customer} onAction={onAction} />
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
