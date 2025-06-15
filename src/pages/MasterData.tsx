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
import { useProductCategories, useCreateProductCategory, useUpdateProductCategory, useDeleteProductCategory } from '@/hooks/useProductCategories';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits';
import { usePaymentTypes, useCreatePaymentType, useUpdatePaymentType, useDeletePaymentType } from '@/hooks/usePaymentTypes';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { ProductForm } from '@/components/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { useMasterDataState } from '@/hooks/useMasterDataState';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Product hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  // Product Categories hooks
  const { data: productCategories = [], isLoading: categoriesLoading } = useProductCategories();
  const createCategoryMutation = useCreateProductCategory();
  const updateCategoryMutation = useUpdateProductCategory();
  const deleteCategoryMutation = useDeleteProductCategory();
  
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
      case 'product-categories':
        console.log('Opening Product Categories with data:', productCategories);
        config = {
          isOpen: true,
          type: 'product-categories',
          title: 'Product Categories Management',
          columns: [
            { key: 'name', label: 'Category Name' },
            { key: 'description', label: 'Description' }
          ],
          data: productCategories.map(cat => ({
            id: cat.id,
            kode: cat.id,
            name: cat.name,
            description: cat.description || ''
          })),
          formFields: [
            { key: 'name', label: 'Category Name', type: 'text' as const, required: true },
            { key: 'description', label: 'Description', type: 'text' as const }
          ]
        };
        break;
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
      
      if (overlayConfig.type === 'product-categories') {
        console.log('Creating product category:', item);
        await createCategoryMutation.mutateAsync({
          name: item.name as string,
          description: item.description as string
        });
        toast({
          title: "Success",
          description: "Product category created successfully",
        });
      } else if (overlayConfig.type === 'categories') {
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
      
      if (overlayConfig.type === 'product-categories') {
        console.log('Updating product category:', item);
        await updateCategoryMutation.mutateAsync({
          id: item.id!,
          name: item.name as string,
          description: item.description as string
        });
        toast({
          title: "Success",
          description: "Product category updated successfully",
        });
      } else if (overlayConfig.type === 'categories') {
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
      
      if (overlayConfig.type === 'product-categories') {
        console.log('Deleting product category:', id);
        await deleteCategoryMutation.mutateAsync(id);
        toast({
          title: "Success",
          description: "Product category deleted successfully",
        });
      } else if (overlayConfig.type === 'categories') {
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
            productCategories={productCategories}
            sampleGroups={groups}
            sampleCategories={dbCategories}
            sampleUnits={units}
            samplePaymentTypes={paymentTypes}
            categoriesLoading={categoriesLoading || dbCategoriesLoading || groupsLoading || unitsLoading || paymentTypesLoading}
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
