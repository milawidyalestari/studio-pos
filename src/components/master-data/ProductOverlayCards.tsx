import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Tag, Scale, CreditCard, Briefcase } from 'lucide-react';

interface ProductOverlayCardsProps {
  sampleGroups: any[];
  sampleCategories: any[];
  sampleUnits: any[];
  samplePaymentTypes: any[];
  samplePositions?: any[];
  categoriesLoading: boolean;
  onOverlayOpen: (type: string) => void;
}

export const ProductOverlayCards: React.FC<ProductOverlayCardsProps> = ({
  sampleGroups,
  sampleCategories,
  sampleUnits,
  samplePaymentTypes,
  samplePositions = [],
  categoriesLoading,
  onOverlayOpen
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('groups')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Data Kelompok</h3>
              <p className="text-sm text-gray-600">
                {categoriesLoading ? 'Loading...' : `${sampleGroups.length} groups`}
              </p>
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
              <p className="text-sm text-gray-600">
                {categoriesLoading ? 'Loading...' : `${sampleUnits.length} units`}
              </p>
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
              <p className="text-sm text-gray-600">
                {categoriesLoading ? 'Loading...' : `${samplePaymentTypes.length} types`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOverlayOpen('positions')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-[#0050C8]" />
            <div>
              <h3 className="font-semibold">Data Posisi</h3>
              <p className="text-sm text-gray-600">
                {categoriesLoading ? 'Loading...' : `${samplePositions.length} positions`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
