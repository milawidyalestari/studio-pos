import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { X, Printer, FileText, ChevronDown } from 'lucide-react';
import { SPKPreview, ReceiptPreview, NotaPreview, PelunasanPreview } from './print/PrintPreviews';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export interface PrintOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  title: string;
  orderList?: Array<{
    id: string;
    item: string; // Product name (not code)
    quantity: number;
    subTotal: number;
    ukuran?: {
      panjang?: string;
      lebar?: string;
    };
    [key: string]: any;
  }>;
  previewContent?: React.ReactNode;
  printType: 'spk' | 'receipt' | 'nota' | 'pelunasan' | 'other';
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number;
    [key: string]: any;
  };
}

export const PrintOverlay: React.FC<PrintOverlayProps> = ({
  isOpen,
  onClose,
  onPrint,
  title,
  orderList = [],
  previewContent,
  printType,
  orderData
}) => {
  // Advanced print settings for SPK
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [printSettings, setPrintSettings] = useState({
    destination: "epson-tm-t20",
    paperSize: "80mm-continuous", 
    printMode: "esc-pos",
    cutType: "partial",
    feedLines: "3",
    printDensity: "normal",
    characterSet: "cp437",
    fontType: "font-a",
    printSpeed: "normal",
    buzzer: "enabled",
    drawerKick: "disabled",
    copies: "1"
  });
  const [printOptions, setPrintOptions] = useState({
    outdoor: false,
    indoor: false,
    laserPrinting: false,
    mugNotaStempel: false,
  });

  // Convert orderList to PrintItem format for SPK
  const printItems = orderList.length > 0 ? orderList.map((item, index) => ({
    id: item.id || index.toString(),
    name: item.item,
    description: item.description || item.notes || '',
    dimensions: item.ukuran?.panjang && item.ukuran?.lebar 
      ? `${item.ukuran.panjang} x ${item.ukuran.lebar}` 
      : '',
    quantity: `@${item.quantity}`,
    location: item.unitType || 'Lembaran',
  })) : [
    {
      id: "1",
      name: "Spanduk Glossy 280 Gsm",
      description: "TBC Dari RSUD Tabanan",
      dimensions: "200 x 100",
      quantity: "@1",
      location: "Lembaran",
    },
    {
      id: "2", 
      name: "Spanduk Glossy 280 Gsm",
      description: "Congratulation dari Marga Mottor",
      dimensions: "100 x 70",
      quantity: "@1",
      location: "Lembaran",
    },
    {
      id: "3",
      name: "Spanduk Glossy 380 Gsm", 
      description: "Spanduk Toko Fancy",
      dimensions: "200 x 100",
      quantity: "@1",
      location: "F.Lipet",
    },
  ];

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getPrintTypeLabel = () => {
    switch (printType) {
      case 'spk':
        return 'Print SPK';
      case 'receipt':
        return 'Print Receipt';
      case 'nota':
        return 'Print Nota';
      case 'pelunasan':
        return 'Print Nota Pelunasan';
      default:
        return 'Print';
    }
  };

  const getPrintTypeIcon = () => {
    switch (printType) {
      case 'spk':
        return <FileText className="h-5 w-5" />;
      case 'receipt':
        return <Printer className="h-5 w-5" />;
      case 'nota':
        return <FileText className="h-5 w-5" />;
      case 'pelunasan':
        return <FileText className="h-5 w-5" />;
      default:
        return <Printer className="h-5 w-5" />;
    }
  };

  const getPreviewContent = () => {
    if (previewContent) {
      return previewContent;
    }

    switch (printType) {
      case 'spk':
        return <SPKPreview orderData={orderData} orderList={orderList} />;
      case 'receipt':
        return <ReceiptPreview orderData={orderData} orderList={orderList} />;
      case 'nota':
        return <NotaPreview orderData={orderData} orderList={orderList} />;
      case 'pelunasan':
        return <PelunasanPreview orderData={orderData} orderList={orderList} />;
      default:
        return null;
    }
  };

  // Render advanced SPK interface
  if (printType === 'spk') {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Print RO</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="hover:bg-gray-100 rounded-full p-2"
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Left Section - Item List + Print Settings (2/3 width) */}
            <div className="w-2/3 border-r border-border flex flex-col">
              {/* Item List Section */}
              <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                {printItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border border-border cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleItemSelect(item.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right text-sm space-y-0.5 ml-4">
                        <div className="font-semibold text-gray-900">{item.dimensions}</div>
                        <div className="text-gray-600">{item.quantity}</div>
                        <div className="text-gray-600">{item.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Print Settings Section */}
              <div className="border-t border-border px-4 pb-8 pt-4 bg-gray-50">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">Print Settings</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Row 1 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium min-w-16">Destination</span>
                    <Select 
                      value={printSettings.destination} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, destination: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <div className="flex items-center gap-1">
                          <Printer className="h-3 w-3" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="epson-tm-t20">Epson TM-T20</SelectItem>
                        <SelectItem value="epson-tm-u220">Epson TM-U220</SelectItem>
                        <SelectItem value="star-tsp143">Star TSP143</SelectItem>
                        <SelectItem value="citizen-ct-s310">Citizen CT-S310</SelectItem>
                        <SelectItem value="custom-pos">Custom POS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium min-w-16">Paper Size</span>
                    <Select 
                      value={printSettings.paperSize} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, paperSize: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="80mm-continuous">80mm x Continuous</SelectItem>
                        <SelectItem value="58mm-continuous">58mm x Continuous</SelectItem>
                        <SelectItem value="80mm-fixed">80mm x Fixed</SelectItem>
                        <SelectItem value="a4">A4 Paper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium min-w-16">Cut Type</span>
                    <Select 
                      value={printSettings.cutType} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, cutType: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="partial">Partial Cut</SelectItem>
                        <SelectItem value="full">Full Cut</SelectItem>
                        <SelectItem value="no-cut">No Cut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium min-w-16">Copies</span>
                    <Select 
                      value={printSettings.copies} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, copies: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="1">1 Copy</SelectItem>
                        <SelectItem value="2">2 Copies</SelectItem>
                        <SelectItem value="3">3 Copies</SelectItem>
                        <SelectItem value="5">5 Copies</SelectItem>
                        <SelectItem value="10">10 Copies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium min-w-16">Font Type</span>
                    <Select 
                      value={printSettings.fontType} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, fontType: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="font-a">Font A (12x24)</SelectItem>
                        <SelectItem value="font-b">Font B (9x17)</SelectItem>
                        <SelectItem value="font-c">Font C (9x24)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium min-w-16">Density</span>
                    <Select 
                      value={printSettings.printDensity} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, printDensity: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="extra-dark">Extra Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Request Order (1/3 width) */}
            <div className="w-1/3 bg-white flex flex-col">
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 rounded-lg m-2 border border-border">
                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">REQUEST ORDER</h3>
                  <p className="text-sm text-gray-600">{orderData?.orderNumber || 'N/A'}</p>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4 mb-4 text-xs">
                  <label className="flex items-center gap-1">
                    <Checkbox 
                      checked={printOptions.outdoor}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, outdoor: checked as boolean }))
                      }
                    />
                    <span>Outdoor/Indoor</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <Checkbox 
                      checked={printOptions.indoor}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, indoor: checked as boolean }))
                      }
                    />

                    <span>Laser Print</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <Checkbox 
                      checked={printOptions.mugNotaStempel}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, mugNotaStempel: checked as boolean }))
                      }
                    />
                    <span>Mug/Nota/Stamp</span>
                  </label>
                </div>

                {/* Order Details */}
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Nama :</span>
                    <span className="font-medium">{orderData?.customerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal :</span>
                    <span>{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span>{new Date().toLocaleDateString('id-ID')} 14:30</span>
                  </div>
                </div>

                <div className="text-sm font-medium mb-3 border-t">Items:</div>
                <div className="space-y-3 text-xs">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((itemId) => {
                      const item = printItems.find(i => i.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <div key={itemId} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="flex justify-between font-medium mb-1">
                            <span className="flex-1">{item.name}</span>
                            <span className="ml-2">{item.dimensions}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span className="flex-1">{item.description}</span>
                            <span className="ml-2">{item.quantity}</span>
                          </div>
                          <div className="text-right text-gray-600">
                            {item.location}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Pilih item di panel kiri
                    </div>
                  )}
                </div>
                
                {/* Additional Information */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kom : 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Designer: Mila</span>
                    <span className="text-xs text-gray-500">Orderan Selesai</span>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-border p-4">
                <div className="space-y-3">
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button className="flex-1 gap-2" onClick={onPrint}>
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render standard interface for other print types
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {getPrintTypeIcon()}
              {getPrintTypeLabel()}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row max-h-[calc(100vh-200px)]">
          {/* Left Panel - Print Settings */}
          <div className="w-full lg:w-1/3 p-6 border-r border-border">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Print Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Printer</label>
                    <select className="text-sm border border-border rounded px-2 py-1">
                      <option>Default Printer</option>
                      <option>Epson TM-T20</option>
                      <option>Star TSP143</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Paper Size</label>
                    <select className="text-sm border border-border rounded px-2 py-1">
                      <option>80mm</option>
                      <option>58mm</option>
                      <option>A4</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Copies</label>
                    <input type="number" min="1" defaultValue="1" className="text-sm border border-border rounded px-2 py-1 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-full lg:w-2/3 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Preview</h3>
                <Button onClick={onPrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
              <ScrollArea className="h-[500px] border border-border rounded-lg p-4">
                {getPreviewContent()}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 