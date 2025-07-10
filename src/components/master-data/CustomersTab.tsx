
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ActionButtons } from './ActionButtons';
import { getLevelBadge } from '@/utils/masterDataHelpers';
import { useCustomers } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface CustomersTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: string, item?: any) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  searchTerm,
  onSearchChange,
  onAction
}) => {
  const { customers, isLoading } = useCustomers();

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No WhatsApp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level Pelanggan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No customers found matching your search.' : 'No customers found. Click "Add New" to create the first customer.'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.kode}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.nama}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.email || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.whatsapp || '-'}</td>
                      <td className="px-4 py-4">{getLevelBadge(customer.level || 'Regular')}</td>
                      <td className="px-4 py-4">
                        <ActionButtons item={customer} onAction={onAction} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
