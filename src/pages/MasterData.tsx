import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users,
  Package,
  Truck
} from 'lucide-react';
import { MasterDataOverlay, TableColumn, MasterDataItem } from '@/components/MasterDataOverlay';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits';
import { usePaymentTypes, useCreatePaymentType, useUpdatePaymentType, useDeletePaymentType } from '@/hooks/usePaymentTypes';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ProductForm } from '@/components/ProductForm';
import CustomerModal from '@/components/CustomerModal';
import { useToast } from '@/hooks/use-toast';
import { useMasterDataState } from '@/hooks/useMasterDataState';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import { MasterDataHeader } from '@/components/master-data/MasterDataHeader';
import { ProductsTab } from '@/components/master-data/ProductsTab';
import { SuppliersTab } from '@/components/master-data/SuppliersTab';
import { CustomersTab } from '@/components/master-data/CustomersTab';
import { EmployeesTab } from '@/components/master-data/EmployeesTab';

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Product hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  // Database Categories hooks
  const { data: dbCategories = [], isLoading: dbCategoriesLoading } = useCategories();
  const createDbCategoryMutation = useCreateCategory();
  const updateDbCategoryMutation = useUpdateCategory();
  const deleteDbCategoryMutation = useDeleteCategory();
  
  // Groups hooks
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  
  // Units hooks
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit();
  const deleteUnitMutation = useDeleteUnit();
  
  // Payment Types hooks
  const { data: paymentTypes = [], isLoading: paymentTypesLoading } = usePaymentTypes();
  const createPaymentTypeMutation = useCreatePaymentType();
  const updatePaymentTypeMutation = useUpdatePaymentType();
  const deletePaymentTypeMutation = useDeletePaymentType();
  
  // Customers hooks
  const { customers = [], isLoading: customersLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  
  // Suppliers hooks
  const { suppliers = [], isLoading: suppliersLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  
  // Master data state
  const {
    sampleGroups,
    setSampleGroups,
    sampleUnits,
    setSampleUnits,
    samplePaymentTypes,
    setSamplePaymentTypes,
  } = useMasterDataState();
  
  const [overlayConfig, setOverlayConfig] = useState<{
    isOpen: boolean;
    type: string;
    title: string;
    columns: TableColumn[];
    data: MasterDataItem[];
    formFields: Array<{
      key: string;
      label: string;
      type: 'text' | 'select';
      options?: Array<{ value: string; label: string }>;
      required?: boolean;
    }>;
  }>({
    isOpen: false,
    type: '',
    title: '',
    columns: [],
    data: [],
    formFields: []
  });

  const [positions, setPositions] = useState<{ id: number, name: string }[]>([]);
  // Fetch positions
  const fetchPositions = async () => {
    const { data, error } = await supabase.from('positions').select('*').order('name');
    if (!error && data) setPositions(data);
  };
  React.useEffect(() => { fetchPositions(); }, []);

  const handleAddProduct = () => {
    console.log('Opening product form for new product');
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    console.log('Opening product form for editing:', product);
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    console.log('Requesting product deletion:', id);
    setDeleteProductId(id);
  };

  const handleProductFormSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Submitting product form:', productData);
      
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          ...productData
        });
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createProductMutation.mutateAsync(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (deleteProductId) {
      try {
        console.log('Confirming product deletion:', deleteProductId);
        await deleteProductMutation.mutateAsync(deleteProductId);
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        setDeleteProductId(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  const handleOverlayOpen = (type: string) => {
    let config;
    
    switch (type) {
      case 'categories':
        console.log('Opening Database Categories with data:', dbCategories);
        config = {
          isOpen: true,
          type: 'categories',
          title: 'Category Data Management',
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'group_name', label: 'Group' },
            { key: 'category_name', label: 'Category' }
          ],
          data: dbCategories.map(cat => ({
            id: cat.id,
            kode: cat.code,
            code: cat.code,
            group_name: cat.group_name,
            category_name: cat.category_name
          })),
          formFields: [
            { key: 'code', label: 'Code', type: 'text' as const, required: true },
            { key: 'group_name', label: 'Group', type: 'select' as const, required: true, options: groups.map(g => ({ value: g.name, label: g.name })) },
            { key: 'category_name', label: 'Category', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'groups':
        config = {
          isOpen: true,
          type: 'groups',
          title: 'Group Data Management',
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' }
          ],
          data: groups.map(group => ({
            id: group.id,
            kode: group.code,
            code: group.code,
            name: group.name
          })),
          formFields: [
            { key: 'code', label: 'Code', type: 'text' as const, required: true },
            { key: 'name', label: 'Name', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'units':
        config = {
          isOpen: true,
          type: 'units',
          title: 'Unit Data Management',
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Unit' }
          ],
          data: units.map(unit => ({
            id: unit.id,
            kode: unit.code,
            code: unit.code,
            name: unit.name
          })),
          formFields: [
            { key: 'code', label: 'Code', type: 'text' as const, required: true },
            { key: 'name', label: 'Unit', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'payments':
        config = {
          isOpen: true,
          type: 'payments',
          title: 'Non-Cash Payment Types',
          columns: [
            { key: 'code', label: 'Code' },
            { key: 'type', label: 'Type' },
            { key: 'payment_method', label: 'Payment Method' }
          ],
          data: paymentTypes.map(payment => ({
            id: payment.id,
            kode: payment.code,
            code: payment.code,
            type: payment.type,
            payment_method: payment.payment_method
          })),
          formFields: [
            { key: 'code', label: 'Code', type: 'text' as const, required: true },
            { key: 'type', label: 'Type', type: 'select' as const, required: true, options: [
              { value: 'Digital', label: 'Digital' },
              { value: 'Card', label: 'Card' }
            ]},
            { key: 'payment_method', label: 'Payment Method', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'positions':
        config = {
          isOpen: true,
          type: 'positions',
          title: 'Data Posisi',
          columns: [
            { key: 'name', label: 'Nama Posisi' }
          ],
          data: positions.map(pos => ({ id: pos.id, name: pos.name })),
          formFields: [
            { key: 'name', label: 'Nama Posisi', type: 'text' as const, required: true }
          ]
        };
        break;
      case 'customers':
        config = {
          isOpen: true,
          type: 'customers',
          title: 'Customer Data Management',
          columns: [
            { key: 'kode', label: 'Code' },
            { key: 'nama', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'whatsapp', label: 'WhatsApp' },
            { key: 'level', label: 'Level' }
          ],
          data: customers.map(customer => ({
            id: customer.id,
            kode: customer.kode,
            nama: customer.nama,
            email: customer.email || '',
            whatsapp: customer.whatsapp || '',
            level: customer.level || 'Regular',
            address: customer.address || ''
          })),
          formFields: [
            { key: 'nama', label: 'Name', type: 'text' as const, required: true },
            { key: 'email', label: 'Email', type: 'text' as const },
            { key: 'whatsapp', label: 'WhatsApp', type: 'text' as const },
            { key: 'address', label: 'Address', type: 'text' as const },
            { key: 'level', label: 'Level', type: 'select' as const, options: [
              { value: 'Regular', label: 'Regular' },
              { value: 'Premium', label: 'Premium' },
              { value: 'VIP', label: 'VIP' }
            ]}
          ]
        };
        break;
      case 'suppliers':
        config = {
          isOpen: true,
          type: 'suppliers',
          title: 'Supplier Data Management',
          columns: [
            { key: 'name', label: 'Name' },
            { key: 'contact_person', label: 'Contact Person' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'address', label: 'Address' }
          ],
          data: suppliers.map(supplier => ({
            id: supplier.id,
            kode: supplier.id, // Use id as kode since suppliers don't have kode
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            payment_terms: supplier.payment_terms || ''
          })),
          formFields: [
            { key: 'name', label: 'Name', type: 'text' as const, required: true },
            { key: 'contact_person', label: 'Contact Person', type: 'text' as const },
            { key: 'phone', label: 'Phone', type: 'text' as const },
            { key: 'email', label: 'Email', type: 'text' as const },
            { key: 'address', label: 'Address', type: 'text' as const },
            { key: 'payment_terms', label: 'Payment Terms', type: 'text' as const }
          ]
        };
        break;
      default:
        return;
    }
    
    setOverlayConfig(config);
  };

  const handleOverlayClose = () => {
    setOverlayConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleAdd = async (item: MasterDataItem) => {
    try {
      console.log('handleAdd called with type:', overlayConfig.type, 'item:', item);
      
      if (overlayConfig.type === 'categories') {
        console.log('Creating database category:', item);
        await createDbCategoryMutation.mutateAsync({
          code: item.code as string,
          group_name: item.group_name as string,
          category_name: item.category_name as string
        });
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      } else if (overlayConfig.type === 'groups') {
        console.log('Creating group:', item);
        await createGroupMutation.mutateAsync({
          code: item.code as string,
          name: item.name as string
        });
        toast({
          title: "Success",
          description: "Group created successfully",
        });
      } else if (overlayConfig.type === 'units') {
        console.log('Creating unit:', item);
        await createUnitMutation.mutateAsync({
          code: item.code as string,
          name: item.name as string
        });
        toast({
          title: "Success",
          description: "Unit created successfully",
        });
      } else if (overlayConfig.type === 'payments') {
        console.log('Creating payment type:', item);
        await createPaymentTypeMutation.mutateAsync({
          code: item.code as string,
          type: item.type as string,
          payment_method: item.payment_method as string
        });
        toast({
          title: "Success",
          description: "Payment type created successfully",
        });
      } else if (overlayConfig.type === 'positions') {
        await supabase.from('positions').insert([{ name: item.name }]);
        fetchPositions();
        toast({ title: 'Success', description: 'Posisi berhasil ditambahkan' });
        return;
      } else if (overlayConfig.type === 'customers') {
        // Generate customer code automatically
        const { data: customerCode } = await supabase.rpc('generate_customer_code');
        await createCustomer({
          kode: customerCode,
          nama: item.nama as string,
          email: item.email as string || null,
          whatsapp: item.whatsapp as string || null,
          address: item.address as string || null,
          level: item.level as 'Regular' | 'Premium' | 'VIP' || 'Regular'
        });
        return;
      } else if (overlayConfig.type === 'suppliers') {
        await createSupplier({
          name: item.name as string,
          contact_person: item.contact_person as string || null,
          phone: item.phone as string || null,
          email: item.email as string || null,
          address: item.address as string || null,
          payment_terms: item.payment_terms as string || null
        });
        return;
      }
    } catch (error) {
      console.error('Error in handleAdd:', error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (item: MasterDataItem) => {
    try {
      console.log('handleEdit called with type:', overlayConfig.type, 'item:', item);
      
      if (overlayConfig.type === 'categories') {
        console.log('Updating database category:', item);
        await updateDbCategoryMutation.mutateAsync({
          id: item.id!,
          code: item.code as string,
          group_name: item.group_name as string,
          category_name: item.category_name as string
        });
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else if (overlayConfig.type === 'groups') {
        console.log('Updating group:', item);
        await updateGroupMutation.mutateAsync({
          id: item.id!,
          code: item.code as string,
          name: item.name as string
        });
        toast({
          title: "Success",
          description: "Group updated successfully",
        });
      } else if (overlayConfig.type === 'units') {
        console.log('Updating unit:', item);
        await updateUnitMutation.mutateAsync({
          id: item.id!,
          code: item.code as string,
          name: item.name as string
        });
        toast({
          title: "Success",
          description: "Unit updated successfully",
        });
      } else if (overlayConfig.type === 'payments') {
        console.log('Updating payment type:', item);
        await updatePaymentTypeMutation.mutateAsync({
          id: item.id!,
          code: item.code as string,
          type: item.type as string,
          payment_method: item.payment_method as string
        });
        toast({
          title: "Success",
          description: "Payment type updated successfully",
        });
      } else if (overlayConfig.type === 'positions') {
        await supabase.from('positions').update({ name: item.name }).eq('id', item.id);
        fetchPositions();
        toast({ title: 'Success', description: 'Posisi berhasil diupdate' });
        return;
      } else if (overlayConfig.type === 'customers') {
        await updateCustomer({
          id: item.id!,
          nama: item.nama as string,
          email: item.email as string || null,
          whatsapp: item.whatsapp as string || null,
          address: item.address as string || null,
          level: item.level as 'Regular' | 'Premium' | 'VIP' || 'Regular'
        });
        return;
      } else if (overlayConfig.type === 'suppliers') {
        await updateSupplier({
          id: item.id!,
          name: item.name as string,
          contact_person: item.contact_person as string || null,
          phone: item.phone as string || null,
          email: item.email as string || null,
          address: item.address as string || null,
          payment_terms: item.payment_terms as string || null
        });
        return;
      }
    } catch (error) {
      console.error('Error in handleEdit:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('handleDelete called with type:', overlayConfig.type, 'id:', id);
      
      if (overlayConfig.type === 'categories') {
        console.log('Deleting database category:', id);
        await deleteDbCategoryMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      } else if (overlayConfig.type === 'groups') {
        console.log('Deleting group:', id);
        await deleteGroupMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Group deleted successfully",
        });
      } else if (overlayConfig.type === 'units') {
        console.log('Deleting unit:', id);
        await deleteUnitMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Unit deleted successfully",
        });
      } else if (overlayConfig.type === 'payments') {
        console.log('Deleting payment type:', id);
        await deletePaymentTypeMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Payment type deleted successfully",
        });
      } else if (overlayConfig.type === 'positions') {
        await supabase.from('positions').delete().eq('id', id);
        fetchPositions();
        toast({ title: 'Success', description: 'Posisi berhasil dihapus' });
        return;
      } else if (overlayConfig.type === 'customers') {
        await deleteCustomer(id);
        return;
      } else if (overlayConfig.type === 'suppliers') {
        await deleteSupplier(id);
        return;
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleAction = (action: string, item?: any) => {
    // Handle other actions like view, edit, delete for main tables
    console.log('Action:', action, 'Item:', item);
    
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
    <div className="p-6 space-y-6">
      <MasterDataHeader />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products & Services
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab
            products={products}
            productsLoading={productsLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            sampleGroups={groups}
            sampleCategories={dbCategories}
            sampleUnits={units}
            samplePaymentTypes={paymentTypes}
            categoriesLoading={dbCategoriesLoading || groupsLoading || unitsLoading || paymentTypesLoading}
            onOverlayOpen={handleOverlayOpen}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAction={handleAction}
          />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAction={handleAction}
          />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeesTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAction={handleAction}
          />
        </TabsContent>
      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleProductFormSubmit}
            onCancel={() => setIsProductFormOpen(false)}
            isEditing={!!editingProduct}
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Master Data Overlay */}
      <MasterDataOverlay
        isOpen={overlayConfig.isOpen}
        onClose={handleOverlayClose}
        title={overlayConfig.title}
        columns={overlayConfig.columns}
        data={overlayConfig.data}
        formFields={overlayConfig.formFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MasterData;
