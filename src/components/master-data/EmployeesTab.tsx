
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { TableHeader } from './TableHeader';
import { SearchAndFilter } from './SearchAndFilter';
import { ActionButtons } from './ActionButtons';
import { getStatusBadge } from '@/utils/masterDataHelpers';

interface EmployeesTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAction: (action: string, item?: any) => void;
}

const sampleEmployees = [
  { kode: 'EMP001', nama: 'Ahmad Rizki', posisi: 'Manager', status: 'Active' },
  { kode: 'EMP002', nama: 'Siti Nurhaliza', posisi: 'Designer', status: 'Active' },
  { kode: 'EMP003', nama: 'Budi Santoso', posisi: 'Operator', status: 'Inactive' },
];

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  searchTerm,
  onSearchChange,
  onAction
}) => {
  return (
    <Card>
      <CardHeader>
        <TableHeader 
          title="Data Karyawan" 
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleEmployees.map((employee) => (
                <tr key={employee.kode} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{employee.kode}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{employee.nama}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{employee.posisi}</td>
                  <td className="px-4 py-4">{getStatusBadge(employee.status)}</td>
                  <td className="px-4 py-4">
                    <ActionButtons item={employee} onAction={onAction} />
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
