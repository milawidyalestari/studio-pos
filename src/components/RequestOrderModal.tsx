import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    jasaDesain: '',
    biayaLain: '',
    subTotal: '',
    discount: 0,
    ppn: 10,
    paymentType: '',
    bank: '',
    admin: '',
    desainer: '',
    komputer: '',
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    id: '',
    bahan: '',
    item: '',
    ukuran: { panjang: '', lebar: '' },
    quantity: '',
    finishing: ''
  });

  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const total = orderList.reduce((sum, item) => sum + item.subTotal, 0);
    setTotalPrice(total);
  }, [orderList]);

  const updateCurrentItem = (field: string, value: any) => {
    setCurrentItem(prev => {
      if (field === 'ukuran') {
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const resetCurrentItem = () => {
    setCurrentItem({
      id: '',
      bahan: '',
      item: '',
      ukuran: { panjang: '', lebar: '' },
      quantity: '',
      finishing: ''
    });
  };

  const addToOrderList = () => {
    if (!currentItem.item || !currentItem.ukuran.panjang || !currentItem.ukuran.lebar || !currentItem.quantity) {
      return;
    }

    const panjang = parseFloat(currentItem.ukuran.panjang) || 0;
    const lebar = parseFloat(currentItem.ukuran.lebar) || 0;
    const quantity = parseInt(currentItem.quantity) || 0;
    
    let subTotal = 0;
    if (panjang > 0 && lebar > 0 && quantity > 0) {
      subTotal = calculateItemPrice(panjang, lebar, quantity, currentItem.bahan, currentItem.finishing);
    }

    const newOrderItem: OrderItem = {
      ...currentItem,
      id: currentItem.id || Date.now().toString(),
      subTotal
    };

    setOrderList(prev => [...prev, newOrderItem]);
    resetCurrentItem();
  };

  const deleteFromOrderList = (itemId: string) => {
    setOrderList(prev => prev.filter(item => item.id !== itemId));
  };

  const editOrderItem = (item: OrderItem) => {
    setCurrentItem(item);
    deleteFromOrderList(item.id);
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
      jasaDesain: '',
      biayaLain: '',
      subTotal: '',
      discount: 0,
      ppn: 10,
      paymentType: '',
      bank: '',
      admin: '',
      desainer: '',
      komputer: '',
      notes: ''
    });
    setOrderList([]);
    resetCurrentItem();
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
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Request Order {formData.orderNumber}</DialogTitle>
        </DialogHeader>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Scrollable */}
              <div className="w-1/2 border-r flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    {/* Customer Info */}
                    <div className="mb-6">
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                          <Label htmlFor="customer" className="text-sm font-medium">Customer</Label>
                          <Input
                            id="customer"
                            value={formData.customer}
                            onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                            placeholder="Customer name"
                            className="mt-1"
                          />
                        </div>
                        <Button type="button" size="sm" className="bg-[#0050C8] hover:bg-[#003a9b] mt-6">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="outdoor"
                            checked={formData.outdoor}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, outdoor: !!checked }))}
                          />
                          <Label htmlFor="outdoor" className="text-sm">Outdoor/Indoor</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="laser"
                            checked={formData.laserPrinting}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, laserPrinting: !!checked }))}
                          />
                          <Label htmlFor="laser" className="text-sm">Laser Printing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="mug"
                            checked={formData.mugNota}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mugNota: !!checked }))}
                          />
                          <Label htmlFor="mug" className="text-sm">Mug/Nota/Stemple</Label>
                        </div>
                      </div>

                      {/* Date Time */}
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="tanggal" className="text-sm font-medium">Date</Label>
                          <Input
                            id="tanggal"
                            type="date"
                            value={formData.tanggal}
                            onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="waktu" className="text-sm font-medium">Time</Label>
                          <Input
                            id="waktu"
                            type="time"
                            value={formData.waktu}
                            onChange={(e) => setFormData(prev => ({ ...prev, waktu: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="estimasi" className="text-sm font-medium">Estimate</Label>
                          <Input
                            id="estimasi"
                            value={formData.estimasi}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimasi: e.target.value }))}
                            placeholder="Days"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="estimasiWaktu" className="text-sm font-medium">Time</Label>
                          <Input
                            id="estimasiWaktu"
                            type="time"
                            value={formData.estimasiWaktu}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimasiWaktu: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="border rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Items</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="idItem" className="text-sm font-medium">ID Item</Label>
                          <Input
                            id="idItem"
                            value={currentItem.id}
                            onChange={(e) => updateCurrentItem('id', e.target.value)}
                            placeholder="ID Item"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bahan" className="text-sm font-medium">Material</Label>
                          <Select value={currentItem.bahan} onValueChange={(value) => updateCurrentItem('bahan', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select Material" />
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
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="item" className="text-sm font-medium">Item</Label>
                        <Input
                          id="item"
                          value={currentItem.item}
                          onChange={(e) => updateCurrentItem('item', e.target.value)}
                          placeholder="Item description"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="panjang" className="text-sm font-medium">Size (L mm)</Label>
                          <Input
                            id="panjang"
                            type="number"
                            value={currentItem.ukuran.panjang}
                            onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, panjang: e.target.value })}
                            placeholder="Length"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lebar" className="text-sm font-medium">Size (W mm)</Label>
                          <Input
                            id="lebar"
                            type="number"
                            value={currentItem.ukuran.lebar}
                            onChange={(e) => updateCurrentItem('ukuran', { ...currentItem.ukuran, lebar: e.target.value })}
                            placeholder="Width"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={currentItem.quantity}
                            onChange={(e) => updateCurrentItem('quantity', e.target.value)}
                            placeholder="Quantity"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="finishing" className="text-sm font-medium">Finishing</Label>
                          <Select value={currentItem.finishing} onValueChange={(value) => updateCurrentItem('finishing', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select Finishing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="laminating">Laminating</SelectItem>
                              <SelectItem value="cutting">Cutting</SelectItem>
                              <SelectItem value="mounting">Mounting</SelectItem>
                              <SelectItem value="grommets">Grommets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button type="button" variant="outline" onClick={resetCurrentItem}>Reset</Button>
                        <Button type="button" onClick={addToOrderList} className="bg-[#0050C8] hover:bg-[#003a9b]">Add Item</Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel */}
              <div className="w-1/2 flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    {/* Order List */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Order List</h3>
                      <div className="border rounded-lg h-48 overflow-hidden">
                        <div className="grid grid-cols-6 gap-1 text-xs font-semibold border-b p-2 bg-gray-50">
                          <span>No</span>
                          <span>Item</span>
                          <span>Qty</span>
                          <span>Sub Total</span>
                          <span>Edit</span>
                          <span>Del</span>
                        </div>
                        <ScrollArea className="h-[calc(100%-2.5rem)]">
                          {orderList.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-6 gap-1 text-xs py-2 px-2 border-b hover:bg-gray-50">
                              <span>{index + 1}</span>
                              <span className="truncate" title={item.item}>{item.item}</span>
                              <span>{item.quantity}</span>
                              <span className="text-green-600 font-semibold">{formatCurrency(item.subTotal)}</span>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => editOrderItem(item)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 text-red-500"
                                onClick={() => deleteFromOrderList(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    </div>

                    {/* Notes - Fixed height with internal scrolling */}
                    <div className="mb-4">
                      <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                      <ScrollArea className="h-20 border rounded-md mt-1">
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Order notes..."
                          className="h-20 border-0 resize-none focus:ring-0"
                        />
                      </ScrollArea>
                    </div>

                    {/* Service and Cost Details */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="jasaDesain" className="text-sm font-medium">Design Service</Label>
                        <Input
                          id="jasaDesain"
                          value={formData.jasaDesain}
                          onChange={(e) => setFormData(prev => ({ ...prev, jasaDesain: e.target.value }))}
                          placeholder="Design fee"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="biayaLain" className="text-sm font-medium">Other Costs</Label>
                        <Input
                          id="biayaLain"
                          value={formData.biayaLain}
                          onChange={(e) => setFormData(prev => ({ ...prev, biayaLain: e.target.value }))}
                          placeholder="Other costs"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subTotal" className="text-sm font-medium">Sub Total</Label>
                        <Input
                          id="subTotal"
                          value={formatCurrency(totalPrice)}
                          readOnly
                          className="mt-1 bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Staff Information */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label htmlFor="admin" className="text-sm font-medium">Admin</Label>
                        <Input
                          id="admin"
                          value={formData.admin}
                          onChange={(e) => setFormData(prev => ({ ...prev, admin: e.target.value }))}
                          placeholder="Admin name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="desainer" className="text-sm font-medium">Designer</Label>
                        <Input
                          id="desainer"
                          value={formData.desainer}
                          onChange={(e) => setFormData(prev => ({ ...prev, desainer: e.target.value }))}
                          placeholder="Designer name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="komputer" className="text-sm font-medium">Computer</Label>
                        <Input
                          id="komputer"
                          value={formData.komputer}
                          onChange={(e) => setFormData(prev => ({ ...prev, komputer: e.target.value }))}
                          placeholder="Computer info"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Fixed Price Summary Section */}
                <div className="border-t bg-white p-6 flex-shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">TOTAL</span>
                    <span className="text-2xl font-bold text-[#0050C8]">{formatCurrency(totalPrice)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Discount</Label>
                      <div className="flex items-center mt-1">
                        <Input 
                          value={formData.discount}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                          type="number"
                          className="mr-2"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Down Payment</Label>
                      <Input placeholder="Down payment" className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <Label className="text-sm">Tax</Label>
                      <Input 
                        value={formData.ppn}
                        onChange={(e) => setFormData(prev => ({ ...prev, ppn: Number(e.target.value) }))}
                        className="w-16 text-sm"
                        type="number"
                      />
                      <span className="text-sm">%</span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Remaining</Label>
                      <Input value={formatCurrency(totalPrice)} readOnly className="mt-1 bg-gray-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="border-t px-6 py-4 bg-white flex-shrink-0">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>New</Button>
                <Button type="button" variant="outline">Save</Button>
                <Button type="button" variant="outline">Correct</Button>
                <Button type="button" className="bg-[#0050C8] hover:bg-[#003a9b] ml-auto">Print SPK</Button>
                <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">Print Receipt</Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestOrderModal;
