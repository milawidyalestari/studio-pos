
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import SupplierModal from '@/components/SupplierModal';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTerms: string;
  outstandingBalance: number;
  address: string;
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
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
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      // Edit existing supplier
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === editingSupplier.id 
          ? { ...supplierData, id: editingSupplier.id }
          : supplier
      ));
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        ...supplierData,
        id: Date.now().toString()
      };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Suppliers Management</h1>
          <Button onClick={handleAddSupplier} className="bg-[#0050C8] hover:bg-[#0040A0]">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suppliers by name, contact person, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead className="text-right">Outstanding Balance</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.paymentTerms}</TableCell>
                    <TableCell className="text-right">
                      <span className={supplier.outstandingBalance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        ${supplier.outstandingBalance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No suppliers found matching your search.' : 'No suppliers found.'}
              </div>
            )}
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
