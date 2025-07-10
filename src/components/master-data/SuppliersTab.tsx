
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ActionButtons } from './ActionButtons';
import { useSuppliers } from '@/hooks/useSuppliers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
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
    </Card>
  );
};
