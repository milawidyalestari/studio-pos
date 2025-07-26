import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Plus,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { MasterDataForm } from './MasterDataForm';
import { cn } from '@/lib/utils';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

export interface MasterDataItem {
  id?: string;
  kode: string;
  nama?: string;
  [key: string]: any;
}

export interface MasterDataOverlayProps {
  isOpen: boolean;
  onClose: () => void;
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
  onAdd: (item: MasterDataItem) => void;
  onEdit: (item: MasterDataItem) => void;
  onDelete: (id: string) => void;
}

export const MasterDataOverlay: React.FC<MasterDataOverlayProps> = ({
  isOpen,
  onClose,
  title,
  columns,
  data,
  formFields,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debug logging for data changes
  useEffect(() => {
    if (isOpen) {
      console.log(`MasterDataOverlay - ${title} opened with data:`, data);
      console.log(`MasterDataOverlay - ${title} data length:`, data?.length || 0);
    }
  }, [isOpen, title, data]);

  // Reset state when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setIsFormOpen(false);
      setEditingItem(null);
      setDeleteConfirm(null);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleAdd = () => {
    console.log(`MasterDataOverlay - Adding new ${title} item`);
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item: MasterDataItem) => {
    console.log(`MasterDataOverlay - Editing ${title} item:`, item);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    console.log(`MasterDataOverlay - Deleting ${title} item with id:`, id);
    setDeleteConfirm(id);
  };

  const handleFormSubmit = (formData: MasterDataItem) => {
    console.log(`MasterDataOverlay - Form submitted for ${title}:`, formData);
    if (editingItem) {
      console.log(`MasterDataOverlay - Calling onEdit for ${title}`);
      onEdit({ ...editingItem, ...formData });
    } else {
      console.log(`MasterDataOverlay - Calling onAdd for ${title}`);
      onAdd(formData);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleFormCancel = () => {
    console.log(`MasterDataOverlay - Form cancelled for ${title}`);
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      console.log(`MasterDataOverlay - Confirming delete for ${title} with id:`, deleteConfirm);
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              <Badge variant="secondary" className="bg-[#0050C8]/10 text-[#0050C8]">
                {filteredData.length} Data
              </Badge>
            </div>
          </DialogHeader>

          {isFormOpen ? (
            <div className="p-6">
              <MasterDataForm
                fields={formFields}
                initialData={editingItem}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isEditing={!!editingItem}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Search and Add Section */}
              <div className="px-6 py-4 border-b space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Cari records..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleAdd} 
                    className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah
                  </Button>
                </div>
                
                {/* Debug information for empty data */}
                {data.length === 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    No {title.toLowerCase()} Data tidak ditemukan. Klik 'Tambah Baru' untuk membuat data pertama.
                  </div>
                )}
              </div>

              {/* Table Section */}
              <ScrollArea className="flex-1 overflow-y-auto max-h-[60vh]">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase w-16">
                            No
                          </th>
                          {columns.map((column) => (
                            <th 
                              key={column.key}
                              className={cn(
                                "px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase",
                                column.width && `w-${column.width}`
                              )}
                            >
                              {column.label}
                            </th>
                          ))}
                          <th className="px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase w-24">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((item, index) => (
                          <tr key={item.id || item.kode} className="hover:bg-gray-50">
                            <td className="px-4 py-1 text-sm text-gray-900">
                              {startIndex + index + 1}
                            </td>
                            {columns.map((column) => (
                              <td key={column.key} className="px-4 py-1 text-sm text-gray-900">
                                {item[column.key]}
                              </td>
                            ))}
                            <td className="px-4 py-1">
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditClick(item)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteClick(item.id || item.kode)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {paginatedData.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        {searchTerm ? 'Data tidak ditemukan.' : 'Belum ada data.'}
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Sebelumnya
                        </Button>
                        <span className="flex items-center px-3 py-1 text-sm">
                          {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data akan terhapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
