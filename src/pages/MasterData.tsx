import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Search, Filter, Download, Upload, Settings, Eye, MoreHorizontal } from 'lucide-react';
import MasterDataOverlay from '@/components/MasterDataOverlay';
import { MasterDataHeader } from '@/components/master-data/MasterDataHeader';
import { SearchAndFilter } from '@/components/master-data/SearchAndFilter';
import { ActionButtons } from '@/components/master-data/ActionButtons';
import { TableHeader } from '@/components/master-data/TableHeader';
import { ProductsTab } from '@/components/master-data/ProductsTab';
import { CustomersTab } from '@/components/master-data/CustomersTab';
import { SuppliersTab } from '@/components/master-data/SuppliersTab';
import { EmployeesTab } from '@/components/master-data/EmployeesTab';
import { ProductOverlayCards } from '@/components/master-data/ProductOverlayCards';
import { Product } from '@/hooks/useProducts';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ProductForm } from '@/components/ProductForm';
import CustomerModal from '@/components/CustomerModal';
import { useToast } from '@/hooks/use-toast';
import { useMasterDataState } from '@/hooks/useMasterDataState';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  kode: string;
  nama: string;
  posisi: string | null;
  status: 'Active' | 'Inactive' | null;
}

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId) ? prev.filter(id => id !== supplierId) : [...prev, supplierId]
    );
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
    );
  };

  const {
    overlayType,
    selectedData,
    showOverlay,
    handleOverlayOpen,
    handleOverlayClose,
    setSelectedData
  } = useMasterDataState();

  const { data: products, isLoading: productsLoading } = useProducts();
  const { customers, isLoading: customersLoading } = useCustomers();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('nama');
        
        if (error) throw error;
        setEmployees(data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, [toast]);

  const handleEdit = (type: string, id: string) => {
    if (type === 'products') {
      const product = products?.find(p => p.id === id);
      if (product) {
        setEditingProduct(product);
        setIsProductFormOpen(true);
      }
    } else {
      setSelectedData({ type, id });
      handleOverlayOpen(type);
    }
  };

  const handleDelete = (type: string, id: string) => {
    if (type === 'products') {
      setDeleteProductId(id);
    }
  };

  const handleView = (type: string, id: string) => {
    setSelectedData({ type, id });
    handleOverlayOpen(type);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProductId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleProductSaved = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleAction = (action: string) => {
    if (action === 'add') {
      // Determine which type of data to add based on current tab
      if (activeTab === 'customers') {
        setIsCustomerModalOpen(true);
      } else if (activeTab === 'suppliers') {
        handleOverlayOpen('suppliers');
      }
    }
  };

  const handleCustomerCreated = (customer: any) => {
    console.log('Customer created:', customer);
    toast({
      title: "Success",
      description: "Customer created successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <MasterDataHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <SearchAndFilter 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeTab={activeTab}
            />
            
            <ActionButtons onAction={handleAction} />

            <TabsContent value="products" className="space-y-4">
              <ProductsTab
                products={products || []}
                isLoading={productsLoading}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                setIsProductFormOpen={setIsProductFormOpen}
              />
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <CustomersTab
                customers={customers || []}
                isLoading={customersLoading}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <SuppliersTab
                suppliers={suppliers || []}
                isLoading={suppliersLoading}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </TabsContent>

            <TabsContent value="employees" className="space-y-4">
              <EmployeesTab
                employees={employees}
                isLoading={employeesLoading}
                searchTerm={searchTerm}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </TabsContent>
          </div>

          <ProductOverlayCards />
        </div>
      </Tabs>

      {/* Product Form Modal */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={editingProduct} 
            onSave={handleProductSaved}
            onCancel={() => {
              setIsProductFormOpen(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Customer Modal */}
      <CustomerModal
        open={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Master Data Overlay */}
      <MasterDataOverlay 
        isOpen={showOverlay}
        onClose={handleOverlayClose}
        type={overlayType}
        selectedData={selectedData}
      />
    </div>
  );
};

export default MasterData;
