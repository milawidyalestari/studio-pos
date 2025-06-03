
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

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
    items: [{ id: '', bahan: '', item: '', ukuran: { panjang: '', lebar: '' }, quantity: '', finishing: '' }],
    jasaDesain: '',
    biayaLain: '',
    subTotal: '',
    discount: 0,
    ppn: 10,
    paymentType: '',
    bank: ''
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: '', bahan: '', item: '', ukuran: { panjang: '', lebar: '' }, quantity: '', finishing: '' }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Request Order #{formData.orderNumber}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
          {/* Left Side - Order Details */}
          <div className="col-span-8 space-y-4">
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Items</Label>
                <Button type="button" onClick={addItem} size="sm" className="bg-[#0050C8] hover:bg-[#003a9b]">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-8 gap-2 p-3 border rounded-lg">
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
                    <Input
                      value={item.bahan}
                      onChange={(e) => updateItem(index, 'bahan', e.target.value)}
                      placeholder="Bahan"
                      className="text-xs"
                    />
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
                    <Label>Ukuran (P)</Label>
                    <Input
                      value={item.ukuran.panjang}
                      onChange={(e) => updateItem(index, 'ukuran', { ...item.ukuran, panjang: e.target.value })}
                      placeholder="P"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label>Ukuran (L)</Label>
                    <Input
                      value={item.ukuran.lebar}
                      onChange={(e) => updateItem(index, 'ukuran', { ...item.ukuran, lebar: e.target.value })}
                      placeholder="L"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Finishing</Label>
                    <Textarea
                      value={item.finishing}
                      onChange={(e) => updateItem(index, 'finishing', e.target.value)}
                      placeholder="Finishing details"
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="jasaDesain">Jasa Desain</Label>
                <Input
                  id="jasaDesain"
                  value={formData.jasaDesain}
                  onChange={(e) => setFormData(prev => ({ ...prev, jasaDesain: e.target.value }))}
                  placeholder="Design fee"
                />
              </div>
              <div>
                <Label htmlFor="biayaLain">Biaya Lain</Label>
                <Input
                  id="biayaLain"
                  value={formData.biayaLain}
                  onChange={(e) => setFormData(prev => ({ ...prev, biayaLain: e.target.value }))}
                  placeholder="Other costs"
                />
              </div>
              <div>
                <Label htmlFor="subTotal">Sub Total</Label>
                <Input
                  id="subTotal"
                  value={formData.subTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, subTotal: e.target.value }))}
                  placeholder="Sub total"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button type="button" variant="outline">Reset</Button>
              <Button type="submit" className="bg-[#0050C8] hover:bg-[#003a9b]">Tambah</Button>
              <Button type="button" variant="outline">Baru</Button>
              <Button type="button" variant="outline">Simpan</Button>
              <Button type="button" variant="outline">Koreksi</Button>
              <Button type="button" className="bg-[#0050C8] hover:bg-[#003a9b]">Cetak SPK</Button>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="col-span-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Daftar Order</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>No</span>
                <span>ID Item</span>
                <span>Item</span>
                <span>Qty</span>
                <span>Sub Total</span>
              </div>
              <hr />
              {formData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>{index + 1}</span>
                  <span>{item.id || '-'}</span>
                  <span>{item.item || '-'}</span>
                  <span>{item.quantity || '-'}</span>
                  <span>-</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">TOTAL</span>
                <span className="text-xl font-bold">IDR 140,00,00</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Diskon</Label>
                  <div className="flex">
                    <Input 
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                      className="text-xs"
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
                  />
                  <span className="text-xs">%</span>
                </div>
                <div>
                  <Label>Sisa</Label>
                  <Input value="IDR 140,00,00" readOnly className="text-xs" />
                </div>
              </div>

              <div>
                <Label>Lunas</Label>
                <Input className="text-xs" />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox />
                <Label className="text-xs">Pembayaran Non Tunai</Label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Jenis</Label>
                  <Select>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bank</Label>
                  <Select>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bca">BCA</SelectItem>
                      <SelectItem value="mandiri">Mandiri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-[#0050C8] hover:bg-[#003a9b]">
                Cetak Nota
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestOrderModal;
