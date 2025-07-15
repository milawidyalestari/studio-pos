import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import SupplierModal from '@/components/SupplierModal';
import { Supplier } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { PAGINATION } from '@/utils/constants';

const initialSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'ABC Printing Supplies',
    contactPerson: 'John Smith',
    email: 'john@abcprinting.com',
    phone: '+1-555-0123',
    paymentTerms: 'Net 30',
    outstandingBalance: 2500.00,
    address: '123 Industrial Ave, City, State 12345'
  },
  {
    id: '2',
    name: 'Digital Media Corp',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@digitalmedia.com',
    phone: '+1-555-0456',
    paymentTerms: 'Net 15',
    outstandingBalance: 1750.50,
    address: '456 Tech Blvd, City, State 12345'
  },
  {
    id: '3',
    name: 'Quality Papers Ltd',
    contactPerson: 'Mike Wilson',
    email: 'mike@qualitypapers.com',
    phone: '+1-555-0789',
    paymentTerms: 'COD',
    outstandingBalance: 0.00,
    address: '789 Paper Mill Rd, City, State 12345'
  }
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGINATION.DEFAULT_PAGE_SIZE;
    return filteredSuppliers.slice(startIndex, startIndex + PAGINATION.DEFAULT_PAGE_SIZE);
  }, [filteredSuppliers, currentPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / PAGINATION.DEFAULT_PAGE_SIZE);

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    }
  };

  const handleSaveSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    if (editingSupplier) {
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === editingSupplier.id 
          ? { ...supplierData, id: editingSupplier.id }
          : supplier
      ));
    } else {
      const newSupplier: Supplier = {
        ...supplierData,
        id: Date.now().toString()
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Supplier Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'contactPerson',
      label: 'Contact Person'
    },
    {
      key: 'email',
      label: 'Email'
    },
    {
      key: 'phone',
      label: 'Phone'
    },
    {
      key: 'paymentTerms',
      label: 'Payment Terms'
    },
    {
      key: 'outstandingBalance',
      label: 'Outstanding Balance',
      render: (value) => (
        <span className={value > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, supplier) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditSupplier(supplier);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSupplier(supplier.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-p4">
          <h1 className="text-3xl font-bold text-gray-800">Managemen Supplier</h1>
          <p className="text-gray-600">Manajemen stok & inventaris</p>
          <Button onClick={handleAddSupplier} className="bg-[#0050C8] hover:bg-[#0040A0]">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search suppliers by name, contact person, or email..."
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={paginatedSuppliers}
              columns={columns}
              pagination={{
                currentPage,
                totalPages,
                pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
                totalItems: filteredSuppliers.length,
                onPageChange: setCurrentPage
              }}
              emptyMessage={searchTerm ? 'No suppliers found matching your search.' : 'No suppliers found.'}
            />
          </CardContent>
        </Card>

        <SupplierModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSupplier}
          supplier={editingSupplier}
        />
      </div>
    </div>
  );
};

export default Suppliers;