
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/services/masterData';

interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  title: string;
  filterType?: 'Material' | 'Service' | 'all';
}

const ProductSelectionModal = ({ 
  open, 
  onClose, 
  onSelectProduct, 
  title,
  filterType = 'all'
}: ProductSelectionModalProps) => {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on type and search term
  const filteredProducts = products?.filter(product => {
    const matchesSearch = 
      product.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && product.jenis === filterType;
  }) || [];

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan kode atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 border-b font-semibold text-sm">
              <span>Kode</span>
              <span>Nama</span>
              <span>Jenis</span>
              <span>Satuan</span>
              <span>Harga Jual</span>
              <span>Aksi</span>
            </div>
            
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Tidak ada produk yang ditemukan' : 'Tidak ada data produk'}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="grid grid-cols-6 gap-2 p-3 border-b hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium text-blue-600">{product.kode}</span>
                    <span>{product.nama}</span>
                    <span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.jenis === 'Material' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.jenis}
                      </span>
                    </span>
                    <span>{product.satuan}</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(product.harga_jual || 0)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleSelectProduct(product)}
                      className="h-7 text-xs bg-[#0050C8] hover:bg-[#003a9b]"
                    >
                      Pilih
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectionModal;
