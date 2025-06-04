import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import { calculateItemPrice, formatCurrency } from '@/services/masterData';

interface OrderItem {
  id: string;
  bahan: string;
  item: string;
  ukuran: { panjang: string; lebar: string };
  quantity: string;
  finishing: string;
  subTotal: number;
}

interface RequestOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const RequestOrderModal = ({ open, onClose, onSubmit }: RequestOrderModalProps) => {
  const [formData, setFormData] = useState({
    orderNumber: `#${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
    customer: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: new Date().toTimeString().slice(0, 5),
    estimasi: '',
    estimasiWaktu: '',
    outdoor: false,
    laserPrinting: false,
    mugNota: false,
    items: [{ id: Date.now().toString(), bahan: '', item: '', ukuran: { panjang: '', lebar: '' }, quantity: '', finishing: '', subTotal: 0 }],
    jasaDesain: '',
    biayaLain: '',
    subTotal: '',
    discount: 0,
    ppn: 10,
    paymentType: '',
    bank: ''
  });

  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);

  // Calculate total price whenever orderList changes
  useEffect(() => {
    const total = orderList.reduce((sum, item) => sum + item.subTotal, 0);
    setTotalPrice(total);
  }, [orderList]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now().toString(), 
        bahan: '', 
        item: '', 
        ukuran: { panjang: '', lebar: '' }, 
        quantity: '', 
        finishing: '',
        subTotal: 0
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      if (field === 'ukuran') {
        newItems[index] = { ...newItems[index], [field]: value };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }

      // Calculate subtotal when relevant fields change
      if (['ukuran', 'quantity', 'bahan', 'finishing'].includes(field)) {
        const item = newItems[index];
        const panjang = parseFloat(item.ukuran.panjang) || 0;
        const lebar = parseFloat(item.ukuran.lebar) || 0;
        const quantity = parseInt(item.quantity) || 0;
        
        if (panjang > 0 && lebar > 0 && quantity > 0) {
          const subTotal = calculateItemPrice(panjang, lebar, quantity, item.bahan, item.finishing);
          newItems[index].subTotal = subTotal;
        }
      }

      return { ...prev, items: newItems };
    });
  };

  const addToOrderList = () => {
    const validItems = formData.items.filter(item => 
      item.item && item.ukuran.panjang && item.ukuran.lebar && item.quantity
    );
    
    if (validItems.length === 0) return;

    const newOrderItems = validItems.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    setOrderList(prev => [...prev, ...newOrderItems]);
    
    // Clear form after adding to order list
    setFormData(prev => ({
      ...prev,
      items: [{ id: Date.now().toString(), bahan: '', item: '', ukuran: { panjang: '', lebar: '' }, quantity: '', finishing: '', subTotal: 0 }]
    }));
  };

  const deleteFromOrderList = (itemId: string) => {
    setOrderList(prev => prev.filter(item => item.id !== itemId));
  };

  const editOrderItem = (item: OrderItem) => {
    setEditingItem(item);
  };

  const saveEditedItem = () => {
    if (!editingItem) return;
    
    setOrderList(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
  };

  const updateEditingItem = (field: string, value: any) => {
    if (!editingItem) return;
    
    let updatedItem = { ...editingItem };
    if (field === 'ukuran') {
      updatedItem[field] = value;
    } else {
      updatedItem = { ...updatedItem, [field]: value };
    }

    // Recalculate subtotal
    if (['ukuran', 'quantity', 'bahan', 'finishing'].includes(field)) {
      const panjang = parseFloat(updatedItem.ukuran.panjang) || 0;
      const lebar = parseFloat(updatedItem.ukuran.lebar) || 0;
      const quantity = parseInt(updatedItem.quantity) || 0;
      
      if (panjang > 0 && lebar > 0 && quantity > 0) {
        updatedItem.subTotal = calculateItemPrice(panjang, lebar, quantity, updatedItem.bahan, updatedItem.finishing);
      }
    }

    setEditingItem(updatedItem);
  };

  const selectOrderItem = (item: OrderItem) => {
    setSelectedOrderItem(item);
  };

  const resetForm = () => {
    setFormData({
      orderNumber: `#${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
      customer: '',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toTimeString().slice(0, 5),
      estimasi: '',
      estimasiWaktu: '',
      outdoor: false,
      laserPrinting: false,
      mugNota: false,
      items: [{ id: Date.now().toString(), bahan: '', item: '', ukuran: { panjang: '', lebar: '' }, quantity: '', finishing: '', subTotal: 0 }],
      jasaDesain: '',
      biayaLain: '',
      subTotal: '',
      discount: 0,
      ppn: 10,
      paymentType: '',
      bank: ''
    });
    setOrderList([]);
    setTotalPrice(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOrderData = {
      ...formData,
      items: orderList,
      totalPrice: formatCurrency(totalPrice)
    };
    onSubmit(finalOrderData);
    
    // Reset everything after submitting
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Request Order {formData.orderNumber}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 h-full">
          {/* Left Side - Order Details */}
          <div className="col-span-8 space-y-4 flex flex-col">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <div className="flex gap-2">
                  <Input
                    id="customer"
                    value={formData.customer}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="Customer name"
                  />
                  <Button type="button" size="sm" className="bg-[#0050C8] hover:bg-[#003a9b]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="outdoor"
                    checked={formData.outdoor}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, outdoor: !!checked }))}
                  />
                  <Label htmlFor="outdoor">Outdoor/Indoor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="laser"
                    checked={formData.laserPrinting}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, laserPrinting: !!checked }))}
                  />
                  <Label htmlFor="laser">Laser Printing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mug"
                    checked={formData.mugNota}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mugNota: !!checked }))}
                  />
                  <Label htmlFor="mug">Mug/Nota/Stemple</Label>
                </div>
              </div>
            </div>

            {/* Date Time */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="waktu">Waktu</Label>
                <Input
                  id="waktu"
                  type="time"
                  value={formData.waktu}
                  onChange={(e) => setFormData(prev => ({ ...prev, waktu: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="estimasi">Estimasi</Label>
                <Input
                  id="estimasi"
                  value={formData.estimasi}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimasi: e.target.value }))}
                  placeholder="Days"
                />
              </div>
              <div>
                <Label htmlFor="estimasiWaktu">Waktu</Label>
                <Input
                  id="estimasiWaktu"
                  type="time"
                  value={formData.estimasiWaktu}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimasiWaktu: e.target.value }))}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 flex-1 min-h-0">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Items</Label>
                <Button type="button" onClick={addItem} size="sm" className="bg-[#0050C8] hover:bg-[#003a9b]">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-80">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-9 gap-2 p-3 border rounded-lg mb-3">
                    <div>
                      <Label>ID Item</Label>
                      <Input
                        value={item.id}
                        onChange={(e) => updateItem(index, 'id', e.target.value)}
                        placeholder="ID"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label>Bahan</Label>
                      <Select value={item.bahan} onValueChange={(value) => updateItem(index, 'bahan', value)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Bahan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vinyl">Vinyl</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="sticker">Sticker</SelectItem>
                          <SelectItem value="canvas">Canvas</SelectItem>
                          <SelectItem value="paper">Paper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Item</Label>
                      <Input
                        value={item.item}
                        onChange={(e) => updateItem(index, 'item', e.target.value)}
                        placeholder="Item"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label>Ukuran (P mm)</Label>
                      <Input
                        value={item.ukuran.panjang}
                        onChange={(e) => updateItem(index, 'ukuran', { ...item.ukuran, panjang: e.target.value })}
                        placeholder="P"
                        className="text-xs"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label>Ukuran (L mm)</Label>
                      <Input
                        value={item.ukuran.lebar}
                        onChange={(e) => updateItem(index, 'ukuran', { ...item.ukuran, lebar: e.target.value })}
                        placeholder="L"
                        className="text-xs"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="text-xs"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label>Finishing</Label>
                      <Select value={item.finishing} onValueChange={(value) => updateItem(index, 'finishing', value)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Finishing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laminating">Laminating</SelectItem>
                          <SelectItem value="cutting">Cutting</SelectItem>
                          <SelectItem value="mounting">Mounting</SelectItem>
                          <SelectItem value="grommets">Grommets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {item.subTotal > 0 && (
                      <div className="col-span-9 text-right text-sm font-semibold text-green-600">
                        Subtotal: {formatCurrency(item.subTotal)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-auto">
              <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              <Button type="button" onClick={addToOrderList} className="bg-[#0050C8] hover:bg-[#003a9b]">Tambah</Button>
              <Button type="button" variant="outline">Baru</Button>
              <Button type="button" variant="outline">Simpan</Button>
              <Button type="button" variant="outline">Koreksi</Button>
              <Button type="button" className="bg-[#0050C8] hover:bg-[#003a9b]">Cetak SPK</Button>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="col-span-4 bg-gray-50 p-4 rounded-lg flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4">Daftar Order</h3>
            
            <div className="space-y-2 mb-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-6 gap-1 text-xs font-semibold border-b pb-2">
                <span>No</span>
                <span>Item</span>
                <span>Qty</span>
                <span>Sub Total</span>
                <span>Edit</span>
                <span>Del</span>
              </div>
              {orderList.map((item, index) => (
                <div 
                  key={item.id} 
                  className="grid grid-cols-6 gap-1 text-xs py-1 border-b cursor-pointer hover:bg-gray-100 rounded px-1"
                  onClick={() => selectOrderItem(item)}
                >
                  <span>{index + 1}</span>
                  <span className="truncate" title={item.item}>{item.item}</span>
                  <span>{item.quantity}</span>
                  <span className="text-green-600 font-semibold text-[10px]">{formatCurrency(item.subTotal)}</span>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      editOrderItem(item);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromOrderList(item.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-3 mt-auto">
              <div className="flex justify-between items-center">
                <span className="font-semibold">TOTAL</span>
                <span className="text-xl font-bold text-[#0050C8]">{formatCurrency(totalPrice)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Diskon</Label>
                  <div className="flex">
                    <Input 
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                      className="text-xs"
                      type="number"
                    />
                    <span className="ml-1 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <Label>DP</Label>
                  <Input placeholder="Down payment" className="text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <Label className="text-xs">PPN</Label>
                  <Input 
                    value={formData.ppn}
                    onChange={(e) => setFormData(prev => ({ ...prev, ppn: Number(e.target.value) }))}
                    className="w-12 text-xs"
                    type="number"
                  />
                  <span className="text-xs">%</span>
                </div>
                <div>
                  <Label>Sisa</Label>
                  <Input value={formatCurrency(totalPrice)} readOnly className="text-xs" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#0050C8] hover:bg-[#003a9b]">
                Cetak Nota
              </Button>
            </div>
          </div>
        </form>

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
              <div className="space-y-3">
                <div>
                  <Label>Item</Label>
                  <Input
                    value={editingItem.item}
                    onChange={(e) => updateEditingItem('item', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Bahan</Label>
                  <Select value={editingItem.bahan} onValueChange={(value) => updateEditingItem('bahan', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vinyl">Vinyl</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="sticker">Sticker</SelectItem>
                      <SelectItem value="canvas">Canvas</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Panjang (mm)</Label>
                    <Input
                      type="number"
                      value={editingItem.ukuran.panjang}
                      onChange={(e) => updateEditingItem('ukuran', { ...editingItem.ukuran, panjang: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Lebar (mm)</Label>
                    <Input
                      type="number"
                      value={editingItem.ukuran.lebar}
                      onChange={(e) => updateEditingItem('ukuran', { ...editingItem.ukuran, lebar: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => updateEditingItem('quantity', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Finishing</Label>
                  <Select value={editingItem.finishing} onValueChange={(value) => updateEditingItem('finishing', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laminating">Laminating</SelectItem>
                      <SelectItem value="cutting">Cutting</SelectItem>
                      <SelectItem value="mounting">Mounting</SelectItem>
                      <SelectItem value="grommets">Grommets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right font-semibold">
                  Subtotal: {formatCurrency(editingItem.subTotal)}
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={saveEditedItem} className="bg-[#0050C8] hover:bg-[#003a9b]">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order Item Details Modal */}
        {selectedOrderItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Order Item Details</h3>
              <div className="space-y-3">
                <div>
                  <Label>Item</Label>
                  <div className="p-2 bg-gray-100 rounded">{selectedOrderItem.item}</div>
                </div>
                <div>
                  <Label>Bahan</Label>
                  <div className="p-2 bg-gray-100 rounded">{selectedOrderItem.bahan}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Panjang (mm)</Label>
                    <div className="p-2 bg-gray-100 rounded">{selectedOrderItem.ukuran.panjang}</div>
                  </div>
                  <div>
                    <Label>Lebar (mm)</Label>
                    <div className="p-2 bg-gray-100 rounded">{selectedOrderItem.ukuran.lebar}</div>
                  </div>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <div className="p-2 bg-gray-100 rounded">{selectedOrderItem.quantity}</div>
                </div>
                <div>
                  <Label>Finishing</Label>
                  <div className="p-2 bg-gray-100 rounded">{selectedOrderItem.finishing}</div>
                </div>
                <div className="text-right font-semibold text-green-600">
                  Subtotal: {formatCurrency(selectedOrderItem.subTotal)}
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  onClick={() => {
                    setSelectedOrderItem(null);
                    editOrderItem(selectedOrderItem);
                  }} 
                  className="bg-[#0050C8] hover:bg-[#003a9b]"
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    deleteFromOrderList(selectedOrderItem.id);
                    setSelectedOrderItem(null);
                  }}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrderItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestOrderModal;
