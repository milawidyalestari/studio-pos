import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Trash2, ShoppingCart } from 'lucide-react';
  import { useCategories } from '@/hooks/useCategories';
  import { useProducts } from '@/hooks/useProducts';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CategorySectionProps {
  onAddItem?: (name: string, price: number) => void;
  onRemoveItem?: (id: string) => void;
  onUpdateQuantity?: (id: string, qty: number) => void;
  items?: CartItem[];
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  items = [],
  onCategorySelect,
  selectedCategory: externalSelectedCategory = ''
}) => {
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>('');
  
  // Use external selected category if provided, otherwise use internal state
  const selectedCategory = externalSelectedCategory || internalSelectedCategory;

  // Fetch categories from database
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Fetch products from database
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const categoryId = product.category_id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Loading products...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (categoriesError || productsError) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="h-full flex items-center justify-center">
              <p className="text-red-500">Error loading data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddItem = (name: string, price: number) => {
    if (onAddItem) {
      onAddItem(name, price);
    }
  };

  const handleRemoveItem = (id: string) => {
    if (onRemoveItem) {
      onRemoveItem(id);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      setInternalSelectedCategory(categoryId);
    }
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, newQty);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Category & Sub Total List */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Category & Sub Total List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-full overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No items added yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded bg-white text-sm min-h-[40px]">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-xs leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.qty} × {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.qty - 1)}
                          className="h-5 w-5 p-0 text-xs"
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-xs">{item.qty}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.qty + 1)}
                          className="h-5 w-5 p-0 text-xs"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-xs">{formatCurrency(item.price * item.qty)}</p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Category List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-full overflow-hidden min-h-[400px] flex flex-col">
            {/* Category Table */}
            <div className="border rounded-lg overflow-hidden h-[300px] flex flex-col">
              <div className="bg-gray-50 border-b flex-shrink-0">
                <div className="flex">
                  <div className="px-3 py-2 text-left font-medium text-gray-700 flex-1">Category Name</div>
                  <div className="px-3 py-2 text-center font-medium text-gray-700 w-20">Action</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {categories.map((category) => {
                      const categoryProducts = productsByCategory[category.id] || [];
                      return (
                        <tr 
                          key={category.id}
                          className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                            selectedCategory === category.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {category.category_name || 'Unnamed Category'}
                          </td>
                          <td className="px-3 py-2 text-center w-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategorySelect(category.id);
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                selectedCategory === category.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {selectedCategory === category.id ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Products for Selected Category */}
            {selectedCategory && productsByCategory[selectedCategory] && (
              <div className="mt-4 border rounded-lg overflow-hidden h-[200px]">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <h4 className="font-medium text-sm text-gray-700">
                    Products in {categories.find(c => c.id === selectedCategory)?.category_name || 'Selected Category'}
                  </h4>
                </div>
                <div className="h-[calc(200px-40px)] overflow-y-auto">
                  <table className="w-full text-xs h-full">
                    <thead className="bg-gray-25 border-b">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium text-gray-600">Product</th>
                        <th className="px-2 py-1 text-right font-medium text-gray-600">Price</th>
                        <th className="px-2 py-1 text-center font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="h-full">
                      {Array.isArray(productsByCategory[selectedCategory]) && productsByCategory[selectedCategory].map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="px-2 py-1 font-medium text-gray-900">
                            {product.name || product.product_name || 'Unnamed Product'}
                          </td>
                          <td className="px-2 py-1 text-right text-green-600 font-semibold">
                            {formatCurrency(product.price || 0)}
                          </td>
                          <td className="px-2 py-1 text-center">
                            <button
                              onClick={() => handleAddItem(product.name || product.product_name || 'Unnamed Product', product.price || 0)}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategorySection;
