import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Printer, FileText, ChevronDown, Loader2, Info } from 'lucide-react';
import { SPKPreview, ReceiptPreview, NotaPreview, PelunasanPreview } from './print/PrintPreviews';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { usePrintService } from '../hooks/usePrintService';
import { printService } from '../services/printService';

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
    finishing?: string; // Add finishing field
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
  onCloseAndReopenRequestOrder?: () => void;
}

export const PrintOverlay: React.FC<PrintOverlayProps> = ({
  isOpen,
  onClose,
  onPrint,
  title,
  orderList = [],
  previewContent,
  printType,
  orderData,
  onCloseAndReopenRequestOrder
}) => {
  // Print service hook
  const {
    isPrinting,
    printSettings: servicePrintSettings,
    updatePrintSettings,
    print,
    printerConfigs,
    paperSizes,
    fontTypes,
    densitySettings,
    getAvailablePrinters,
    getSystemPrinters
  } = usePrintService();

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
    outdoor: orderData?.outdoor || false,
    indoor: false,
    laserPrinting: orderData?.laserPrinting || false,
    mugNotaStempel: orderData?.mugNota || false,
  });

  // Update printOptions when orderData changes
  useEffect(() => {
    setPrintOptions({
      outdoor: orderData?.outdoor || false,
      indoor: false,
      laserPrinting: orderData?.laserPrinting || false,
      mugNotaStempel: orderData?.mugNota || false,
    });
  }, [orderData]);

  // Convert orderList to PrintItem format for SPK
  const printItems = orderList.map((item, index) => {
    console.log('PrintOverlay - item finishing:', item.finishing); // Debug log
    const printItem = {
      id: item.id || index.toString(),
      name: item.item,
      description: item.description || item.notes || '',
      dimensions: item.ukuran?.panjang && item.ukuran?.lebar && item.ukuran.panjang !== '' && item.ukuran.lebar !== '' && item.ukuran.panjang !== 'null' && item.ukuran.lebar !== 'null'
        ? `${item.ukuran.panjang} x ${item.ukuran.lebar}` 
        : '-',
      quantity: `@${item.quantity}`,
      location: item.finishing || 'Lembaran',
    };
    return printItem;
  });

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle print with native service
  const handleNativePrint = async () => {
    // Prevent multiple clicks
    if (isPrinting) {
      console.log('Print already in progress, ignoring click');
      return;
    }

    // Check if items are selected for SPK
    if (printType === 'spk' && selectedItems.length === 0) {
      alert('Silakan pilih item yang akan di-print terlebih dahulu!');
      return;
    }

    try {
      console.log('Starting native print...');
      
      // Generate content for printing
      const content = generatePrintContent();
      console.log('Generated content length:', content.length);
      
      // Update service settings
      updatePrintSettings({
        destination: printSettings.destination,
        paperSize: printSettings.paperSize,
        cutType: printSettings.cutType,
        fontType: printSettings.fontType,
        density: printSettings.printDensity,
        copies: parseInt(printSettings.copies)
      });

      console.log('Print settings updated:', printSettings);

      // Print using service
      const job = {
        type: printType as 'spk' | 'receipt' | 'nota' | 'pelunasan',
        content: content,
        settings: {
          destination: printSettings.destination,
          paperSize: printSettings.paperSize,
          cutType: printSettings.cutType,
          fontType: printSettings.fontType,
          density: printSettings.printDensity,
          copies: parseInt(printSettings.copies)
        },
        orderData: {
          ...orderData,
          outdoor: printOptions.outdoor,
          laserPrinting: printOptions.laserPrinting,
          mugNota: printOptions.mugNotaStempel,
        },
        orderList: orderList,
        selectedItems: selectedItems
      };
      
      const success = await print(job);
      
      if (success) {
        console.log('Print successful');
        // Show success message
        alert('Print berhasil!');
        // Close overlay after successful print
        onClose();
      } else {
        console.error('Print failed');
        // Show error message
        alert('Print gagal. Mencoba browser print...');
        // Fallback to browser print
        onPrint();
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Error saat print. Mencoba browser print...');
      // Fallback to browser print
      onPrint();
    }
  };

  // Generate content for printing based on print preview format
  const generatePrintContent = (): string => {
    let content = '';
    
    if (printType === 'spk') {
      // Header
      content += 'REQUEST ORDER\n';
      content += '==============\n\n';
      content += `${orderData?.orderNumber || 'N/A'}\n\n`;
      
      // Print Type Checkboxes
      content += 'TIPE ORDER:\n';
      content += '------------\n';
      if (printOptions.outdoor) content += '✓ Outdoor/Indoor\n';
      if (printOptions.laserPrinting) content += '✓ Laser Printing\n';
      if (printOptions.mugNotaStempel) content += '✓ Mug/Nota/Stemple\n';
      content += '\n';
      
      // Order Details
      content += 'DETAIL ORDER:\n';
      content += '-------------\n';
      content += `Nama: ${orderData?.customerName || 'N/A'}\n`;
      content += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
      
      // Deadline
      content += 'Deadline: ';
      if (orderData?.estimasi) {
        const deadline = new Date(orderData.estimasi).toLocaleDateString('id-ID', {
          timeZone: 'Asia/Kuala_Lumpur',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        content += `${deadline}`;
        if (orderData?.estimasiWaktu) {
          content += ` | ${orderData.estimasiWaktu.slice(0, 5)}`;
        }
      } else {
        content += 'Tidak ditentukan';
      }
      content += '\n\n';
      
      // Items List
      content += 'ITEMS:\n';
      content += '------\n';
      orderList.forEach(item => {
        content += `${item.item}\n`;
        if (item.description) {
          content += `  ${item.description}\n`;
        }
        if (item.ukuran?.panjang && item.ukuran?.lebar) {
          content += `  ${item.ukuran.panjang} x ${item.ukuran.lebar} @${item.quantity} Lembaran\n`;
        } else {
          content += `  @${item.quantity} Lembaran\n`;
        }
        content += '\n';
      });
      
      // Additional Information
      content += 'INFORMASI TAMBAHAN:\n';
      content += '-------------------\n';
      content += `Kom: ${orderData?.komputer || '???'}\n`;
      content += `Designer: ${orderData?.desainer || '???'}\n`;
    } else if (printType === 'receipt') {
      // Receipt format
      content += 'RECEIPT\n';
      content += '=======\n';
      content += 'Studio POS System\n';
      content += `${new Date().toLocaleDateString('id-ID')}\n\n`;
      
      content += `Order: ${orderData?.orderNumber || 'N/A'}\n`;
      content += `Customer: ${orderData?.customerName || 'N/A'}\n\n`;
      
      content += 'Items:\n';
      content += '------\n';
      orderList.forEach(item => {
        const unitPrice = Number(item.quantity) > 0 ? item.subTotal / Number(item.quantity) : 0;
        content += `${item.item}\n`;
        if (item.ukuran?.panjang && item.ukuran?.lebar) {
          content += `  ${item.ukuran.panjang} x ${item.ukuran.lebar}\n`;
        }
        content += `  ${item.quantity} x ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(unitPrice)}\n`;
        content += `  Total: ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
        }).format(item.subTotal)}\n\n`;
      });
      
      content += `Total: ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(orderData?.totalAmount || 0)}`;
    }
    
    return content;
  };

  // Update print options when orderData changes
  useEffect(() => {
    if (orderData) {
      setPrintOptions({
        outdoor: orderData.outdoor || false,
        indoor: false,
        laserPrinting: orderData.laserPrinting || false,
        mugNotaStempel: orderData.mugNota || false,
      });
    }
  }, [orderData]);

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
  if (printType === 'spk' && isOpen) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
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
                // Add fade out animation
                const modal = e.currentTarget.closest('.bg-background');
                if (modal) {
                  modal.classList.add('animate-out', 'fade-out', 'duration-400');
                  setTimeout(() => {
                    onClose();
                    // If this is SPK print and we have the callback, reopen Request Order modal
                    if (printType === 'spk' && onCloseAndReopenRequestOrder) {
                      onCloseAndReopenRequestOrder();
                    }
                  }, 400);
                } else {
                  onClose();
                  // If this is SPK print and we have the callback, reopen Request Order modal
                  if (printType === 'spk' && onCloseAndReopenRequestOrder) {
                    onCloseAndReopenRequestOrder();
                  }
                }
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
                {/* Selection Instructions */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Pilih Item untuk Print</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Klik item yang ingin dicetak
                  </p>
                  {selectedItems.length > 0 && (
                    <p className="text-xs text-green-700 mt-1">
                      ✓ {selectedItems.length} item dipilih
                    </p>
                  )}
                </div>
                
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
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-gray-700">
                            {item.description}
                          </p>
                        )}
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
                  {/* Row 1 - Destination & Paper Size */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium min-w-16">Destination</Label>
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
                        {Object.entries(printerConfigs).map(([key, config]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium min-w-16">Paper Size</Label>
                    <Select 
                      value={printSettings.paperSize} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, paperSize: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        {Object.entries(paperSizes).map(([key, size]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 2 - Cut Type & Font Type */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium min-w-16">Cut Type</Label>
                    <Select 
                      value={printSettings.cutType} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, cutType: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        <SelectItem value="full">Full Cut</SelectItem>
                        <SelectItem value="partial">Partial Cut</SelectItem>
                        <SelectItem value="none">No Cut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium min-w-16">Font Type</Label>
                    <Select 
                      value={printSettings.fontType} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, fontType: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        {Object.entries(fontTypes).map(([key, font]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 3 - Density & Copies */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium min-w-16">Density</Label>
                    <Select 
                      value={printSettings.printDensity} 
                      onValueChange={(value) => setPrintSettings(prev => ({...prev, printDensity: value}))}
                    >
                      <SelectTrigger className="flex-1 bg-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-border shadow-lg z-[110]">
                        {Object.entries(densitySettings).map(([key, density]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            {density.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium min-w-16">Copies</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={printSettings.copies}
                      onChange={(e) => setPrintSettings(prev => ({...prev, copies: e.target.value}))}
                      className="flex-1 bg-white text-xs h-8"
                    />
                  </div>

                  {/* Test Printer Connection */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const hasPrinter = await printService.connectToExistingUSBDevice();
                          if (hasPrinter) {
                            alert('Printer ditemukan!');
                          } else {
                            alert('Tidak ada printer yang terhubung. Silakan hubungkan printer USB.');
                          }
                        } catch (error) {
                          alert('Error saat mengecek printer: ' + error);
                        }
                      }}
                      className="w-full text-xs"
                    >
                      Test Printer Connection
                    </Button>
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
                <div className="space-y-2 mb-4">
                  <div className="flex gap-4 text-xs">
                    <label className="flex items-center gap-1">
                      <Checkbox 
                        checked={printOptions.outdoor}
                        disabled={true}
                        className="data-[state=checked]:bg-black"
                      />
                      <span className={printOptions.outdoor ? "text-gray-500" : "text-gray-500"}>
                        Outdoor/Indoor
                      </span>
                    </label>
                    <label className="flex items-center gap-1">
                      <Checkbox 
                        checked={printOptions.laserPrinting}
                        disabled={true}
                        className="data-[state=checked]:bg-black"
                      />
                      <span className={printOptions.laserPrinting ? "text-gray-500" : "text-gray-500"}>
                        Laser
                      </span>
                    </label>
                    <label className="flex items-center gap-1">
                      <Checkbox 
                        checked={printOptions.mugNotaStempel}
                        disabled={true}
                        className="data-[state=checked]:bg-black"
                      />
                      <span className={printOptions.mugNotaStempel ? "text-gray-500" : "text-gray-500"}>
                        Mug/Nota/Stamp
                      </span>
                    </label>
                  </div>
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
                    <span>
                      {orderData?.estimasi ? (
                        <>
                          {new Date(orderData.estimasi).toLocaleDateString('id-ID', {
                            timeZone: 'Asia/Kuala_Lumpur',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                          {orderData?.estimasiWaktu && (
                            <span className="ml-1">| {orderData.estimasiWaktu.slice(0, 5)}</span>
                          )}
                        </>
                      ) : (
                        'Tidak ditentukan'
                      )}
                    </span>
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
                    <span>Kom :</span>
                    <span>{orderData?.komputer || '???'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Designer:</span>
                    <span>{orderData?.desainer || 'Belum ditugaskan'}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-border p-4">
                <div className="space-y-3">
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-3">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      // Add fade out animation
                      const modal = document.querySelector('.bg-background');
                      if (modal) {
                        modal.classList.add('animate-out', 'fade-out', 'duration-200');
                        setTimeout(() => {
                          onClose();
                          // If this is SPK print and we have the callback, reopen Request Order modal
                          if (printType === 'spk' && onCloseAndReopenRequestOrder) {
                            onCloseAndReopenRequestOrder();
                          }
                        }, 400);
                      } else {
                        onClose();
                        // If this is SPK print and we have the callback, reopen Request Order modal
                        if (printType === 'spk' && onCloseAndReopenRequestOrder) {
                          onCloseAndReopenRequestOrder();
                        }
                      }
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 gap-2 bg-blue-700 hover:bg-blue-800" 
                      onClick={handleNativePrint}
                      disabled={isPrinting}
                    >
                      {isPrinting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4" />
                      )}
                      {isPrinting ? 'Printing...' : 'Print'}
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
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 animate-in fade-in-0 zoom-in-95 duration-300">
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