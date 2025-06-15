
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Layers, Tag, Scale, CreditCard } from 'lucide-react';

interface ProductOverlayCardsProps {
  productCategories: any[];
  sampleGroups: any[];
  sampleCategories: any[];
  sampleUnits: any[];
  samplePaymentTypes: any[];
  categoriesLoading: boolean;
  onOverlayOpen: (type: string) => void;
}

export const ProductOverlayCards: React.FC<ProductOverlayCardsProps> = ({
  productCategories,
  sampleGroups,
  sampleCategories,
  sampleUnits,
  samplePaymentTypes,
  categoriesLoading,
  onOverlayOpen
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('product-categories')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Product Categories</h3>
              <p className="text-sm text-gray-600">
                {categoriesLoading ? 'Loading...' : `${productCategories.length} categories`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('groups')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Data Kelompok</h3>
              <p className="text-sm text-gray-600">{sampleGroups.length} groups</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('categories')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Tag className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Data Kategori</h3>
              <p className="text-sm text-gray-600">
                {categoriesLoading ? 'Loading...' : `${sampleCategories.length} categories`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('units')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Data Satuan</h3>
              <p className="text-sm text-gray-600">{sampleUnits.length} units</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('payments')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Jenis Non Tunai</h3>
              <p className="text-sm text-gray-600">{samplePaymentTypes.length} types</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
