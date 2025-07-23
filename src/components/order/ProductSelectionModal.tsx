
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
  onSelectProduct: (product: any) => void;
  title: string;
  filterType?: 'Material' | 'Service' | 'all';
  items?: Array<{ id: string; kode: string; nama: string; satuan?: string; stok_opname?: number }>;
}

const ProductSelectionModal = ({ 
  open, 
  onClose, 
  onSelectProduct, 
  title,
  filterType = 'all',
  items
}: ProductSelectionModalProps) => {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products or items based on search term
  let filteredList: any[] = [];
  let isLoadingList = false;
  if (items) {
    filteredList = items.filter(item =>
      (item.kode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.nama?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  } else {
    isLoadingList = isLoading;
    filteredList = products?.filter(product => {
      const matchesSearch = 
        product.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nama.toLowerCase().includes(searchTerm.toLowerCase());
      if (title === 'Pilih Bahan/Material') {
        return matchesSearch && product.jenis === 'Bahan';
      }
      const notBahan = product.jenis !== 'Bahan';
      if (filterType === 'all') return matchesSearch && notBahan;
      return matchesSearch && product.jenis === filterType && notBahan;
    }) || [];
  }

  const handleSelect = (item: any) => {
    onSelectProduct(item);
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {/* Search Input */}
          <div className="relative ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={items ? "Cari berdasarkan kode atau nama bahan/material..." : "Cari berdasarkan kode atau nama produk..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          {/* List */}
          <div className="border rounded-lg">
            <div className={`grid ${items ? 'grid-cols-5' : 'grid-cols-6'} gap-2 p-3 bg-gray-50 border-b font-semibold text-sm`}>
              <span className="w-32">Kode</span>
              <span className="flex-1 min-w-0">Nama</span>
              {items ? <span className="w-24 text-center">Satuan</span> : <span>Jenis</span>}
              {items ? <span className="w-24 text-center">Stok Akhir</span> : <span>Satuan</span>}
              {items ? null : <span>Harga Jual</span>}
              <span className="w-32 text-center">Aksi</span>
            </div>
            <ScrollArea className="h-[400px]">
              {isLoadingList ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredList.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? (items ? 'Tidak ada bahan/material yang ditemukan' : 'Tidak ada produk yang ditemukan') : (items ? 'Tidak ada data bahan/material' : 'Tidak ada data produk')}
                </div>
              ) : (
                filteredList.map((item) => (
                  <div 
                    key={item.id} 
                    className={`grid ${items ? 'grid-cols-5' : 'grid-cols-6'} gap-2 p-3 border-b hover:bg-gray-50 text-sm`}
                  >
                    <span className="w-32 font-medium text-blue-600 truncate">{item.kode}</span>
                    <span className="flex-1 min-w-0 break-words whitespace-pre-line">{item.nama}</span>
                    {items ? <span className="w-24 text-center">{item.satuan ?? '-'}</span> : <span><span className={`px-2 py-1 rounded-full text-xs ${item.jenis === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.jenis}</span></span>}
                    {items ? <span className="w-24 text-center">{item.stok_opname ?? '-'}</span> : <span>{item.satuan}</span>}
                    {items ? null : <span className="text-green-600 font-medium">{formatCurrency(item.harga_jual || 0)}</span>}
                    <span className="w-32 flex justify-center">
                      <Button
                        size="sm"
                        onClick={() => handleSelect(item)}
                        className="h-7 text-xs bg-[#0050C8] hover:bg-[#003a9b]"
                      >
                        Pilih
                      </Button>
                    </span>
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
