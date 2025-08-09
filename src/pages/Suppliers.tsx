import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import SupplierModal from '@/components/SupplierModal';
import { useSuppliers } from '@/hooks/useSuppliers';
import { formatCurrency } from '@/utils/formatters';
import { PAGINATION } from '@/utils/constants';
import type { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

const Suppliers = () => {
  const { suppliers = [], isLoading, createSupplier, updateSupplier, deleteSupplier, isCreatingSupplier, isUpdatingSupplier, isDeletingSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleDeleteSupplier = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handleSaveSupplier = async (supplierData: any) => {
    try {
      if (editingSupplier) {
        await updateSupplier({ id: editingSupplier.id, ...supplierData });
      } else {
        await createSupplier(supplierData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Nama Supplier',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'contact_person',
      label: 'Whatsapps',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'phone',
      label: 'Telepon',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'payment_terms',
      label: 'Pembayaran',
      render: (value) => <span>{value || '-'}</span>
    },
    {
      key: 'outstanding_balance',
      label: 'Sisa Tagihan',
      render: (value) => (
        <span className={value && value > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
          {formatCurrency(value || 0)}
        </span>
      )
    },
    {
      key: 'address',
      label: 'Alamat',
      render: (value) => <span className="text-sm text-gray-600">{value || '-'}</span>
    },
    {
      key: 'id',
      label: 'Aksi',
      render: (_, supplier) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditSupplier(supplier);
            }}
            disabled={isCreatingSupplier || isUpdatingSupplier || isDeletingSupplier}
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
            disabled={isCreatingSupplier || isUpdatingSupplier || isDeletingSupplier}
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
           <div>
             <h1 className="text-3xl font-bold text-gray-800">Managemen Supplier</h1>
             <p className="text-gray-600 mb-6">Manajemen stok & inventaris</p>
           </div>
           <Button 
             onClick={handleAddSupplier} 
             className="bg-[#0050C8] hover:bg-[#0040A0]"
             disabled={isCreatingSupplier || isUpdatingSupplier || isDeletingSupplier}
           >
             <Plus className="h-4 w-4 mr-2" />
             Tambah Baru
           </Button>
         </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Cari supplier berdasarkan nama, contact person, atau email..."
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={paginatedSuppliers}
              columns={columns}
              loading={isLoading}
              pagination={{
                currentPage,
                totalPages,
                pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
                totalItems: filteredSuppliers.length,
                onPageChange: setCurrentPage
              }}
              emptyMessage={searchTerm ? 'Tidak ada supplier yang ditemukan sesuai pencarian.' : 'Tidak ada supplier yang ditemukan.'}
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