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
import { getNotaSettings } from '../utils/notaSettings';

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

  // Initialize all items as selected by default
  useEffect(() => {
    if (orderList.length > 0) {
      const allItemIds = orderList.map((item, index) => item.id || index.toString());
      setSelectedItems(allItemIds);
    }
  }, [orderList]);

  // Convert orderList to PrintItem format for SPK
  const printItems = orderList.map((item, index) => {
    const printItem = {
      id: item.id || index.toString(),
      name: item.item,
      description: item.description || item.notes || '',
      dimensions: item.ukuran?.panjang && item.ukuran?.lebar && item.ukuran.panjang !== '' && item.ukuran.lebar !== '' && item.ukuran.panjang !== 'null' && item.ukuran.lebar !== 'null'
        ? `${item.ukuran.panjang} x ${item.ukuran.lebar}` 
        : '-',
      quantity: `@${item.quantity}`,
      location: item.finishing || 'Lembaran',
      subTotal: item.subTotal || 0,
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

    // Check if items are selected for SPK and Pelunasan
    if ((printType === 'spk' || printType === 'pelunasan') && selectedItems.length === 0) {
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
        // Call onPrint to trigger database update and close overlay
        onPrint();
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
    } else if (printType === 'nota') {
      // Get custom nota settings
      const notaSettings = getNotaSettings();
      
      // Generate HTML content for nota instead of plain text
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 16px;
              line-height: 1.5;
              font-weight: bold;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .order-number {
              font-size: 18px;
              font-weight: bold;
            }
            .section {
              margin-bottom: 15px;
            }
            .section-title {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 8px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
            }
            .item {
              border-top: 1px solid #ddd;
              padding: 8px 0;
              margin-bottom: 8px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 5px;
            }
            .item-name {
              font-weight: bold;
              font-size: 16px;
              flex: 1;
            }
            .item-dimensions {
              font-size: 14px;
              margin-left: 10px;
              font-weight: bold;
            }
            .item-details {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .item-price {
              font-size: 14px;
              font-weight: bold;
            }
            .item-subtotal {
              font-weight: bold;
              font-size: 14px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .payment-label {
              font-weight: bold;
              font-size: 14px;
            }
            .payment-value {
              font-weight: bold;
              font-size: 14px;
            }
            .total-row {
              font-weight: bold;
              font-size: 16px;
              border-top: 1px solid #ccc;
              padding-top: 5px;
              margin-top: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .info-label {
              font-weight: bold;
              font-size: 14px;
            }
            .info-value {
              font-weight: bold;
              font-size: 14px;
            }
            .business-info {
              text-align: center;
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
              font-weight: bold;
            }
            .footer-text {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${notaSettings.header.enabled ? `
            <!-- Header Section -->
            <div class="header" style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: ${notaSettings.header.fontSize}px; font-weight: ${notaSettings.header.fontWeight}; color: #0050C8;">
                ${notaSettings.header.text}
              </div>
            </div>
          ` : ''}
          
          ${notaSettings.logo.enabled && notaSettings.logo.url ? `
            <!-- Logo Section -->
            <div class="logo-section" style="text-align: center; margin-bottom: 20px;">
              <img src="${notaSettings.logo.url}" alt="${notaSettings.logo.altText}" style="width: ${notaSettings.logo.width}px; height: ${notaSettings.logo.height}px; margin: 0 auto; display: block;">
            </div>
          ` : ''}
          
          <!-- Business Information -->
          <div class="business-info">
            <div>${notaSettings.businessInfo.name}</div>
            <div>${notaSettings.businessInfo.address}</div>
            <div>${notaSettings.businessInfo.phone}</div>
            <div>${notaSettings.businessInfo.website}</div>
          </div>
          
          <div class="section">
            <div class="section-title">DETAIL ORDER:</div>
             <div class="info-row">
               <span class="info-label">Customer:</span>
               <span class="info-value">${orderData?.customerName || 'N/A'}</span>
             </div>
             <div class="info-row">
               <span class="info-label">Order Number:</span>
               <span class="info-value">${orderData?.orderNumber || 'N/A'}</span>
             </div>
             <div class="info-row">
               <span class="info-label">Tanggal:</span>
               <span class="info-value">${new Date().toLocaleDateString('id-ID')}</span>
             </div>
           </div>
          
                     <div class="section">
             <div class="section-title">ITEMS:</div>
             ${orderList.filter((item, index) => {
               // For nota, show all items if none selected, otherwise show only selected items
               if (printType === 'nota') {
                 return selectedItems.length === 0 || selectedItems.includes(item.id || index.toString());
               }
               return true; // For other print types, show all items
             }).map(item => {
               const size = item.ukuran || {};
        const unitPrice = Number(item.quantity) > 0 ? item.subTotal / Number(item.quantity) : 0;
               const dimensions = (size.panjang && size.lebar && size.panjang !== '' && size.lebar !== '' && 
                                 size.panjang !== 'null' && size.lebar !== 'null') ? 
                                 `${size.panjang} x ${size.lebar}` : '-';
               
               return `
                 <div class="item">
                   <div class="item-header">
                     <div class="item-name">${item.item}</div>
                     <div class="item-dimensions">${dimensions}</div>
                   </div>
                   <div class="item-details">
                     <div class="item-price">${item.quantity} x ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
                     }).format(unitPrice)}</div>
                     <div class="item-subtotal">${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR'
                     }).format(item.subTotal)}</div>
                   </div>
                 </div>
               `;
             }).join('')}
           </div>
          
                     <div class="payment-row">
            <span class="payment-label">Subtotal:</span>
            <span class="payment-value">${(() => {
              // Calculate subtotal based on selected items for nota
              if (printType === 'nota') {
                const selectedOrderItems = orderList.filter((item, index) => 
                  selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
                );
                const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(subtotal);
              }
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(orderData?.totalAmount || 0);
            })()}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Desain:</span>
            <span class="payment-value">${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(orderData?.desain || 0)}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Biaya Lainnya:</span>
            <span class="payment-value">${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(orderData?.biayaLainnya || 0)}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">Down Payment:</span>
            <span class="payment-value">${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(orderData?.downPayment || 0)}</span>
          </div>
          <div class="payment-row total-row">
            <span class="payment-label">Sisa Pembayaran:</span>
            <span class="payment-value">${(() => {
              // Calculate total based on selected items for nota
              if (printType === 'nota') {
                const selectedOrderItems = orderList.filter((item, index) => 
                  selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
                );
                const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
                const total = subtotal + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0) - (orderData?.downPayment || 0);
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(total);
              }
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format((orderData?.totalAmount || 0) + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0) - (orderData?.downPayment || 0));
            })()}</span>
          </div>
          
          ${notaSettings.footer.enabled ? `
            <div class="footer-text" style="text-align: center; margin-top: 20px; font-size: ${notaSettings.footer.fontSize}px; font-weight: ${notaSettings.footer.fontWeight}; color: #666;">
              ${notaSettings.footer.text.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
          ` : ''}
        </body>
        </html>
      `;
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
        return <NotaPreview orderData={orderData} orderList={orderList} selectedItems={selectedItems} />;
      case 'pelunasan':
        return <PelunasanPreview orderData={orderData} orderList={orderList} />;
      default:
        return null;
    }
  };

  // Render advanced interface for all print types
  if ((printType === 'spk' || printType === 'nota' || printType === 'pelunasan') && isOpen) {
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
              <h2 className="text-lg font-semibold">
                {printType === 'spk' ? 'Print RO' : 
                 printType === 'nota' ? 'Print Nota' : 
                 printType === 'pelunasan' ? 'Print Pelunasan' : 'Print'}
              </h2>
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
                    <span className="text-sm font-medium text-blue-800">Item untuk Print</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Semua item terpilih secara default. Klik item untuk membatalkan pilihan.
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
                        {printType !== 'nota' ? (
                        <div className="text-gray-600">{item.location}</div>
                        ) : (
                          <div className="text-gray-600 font-medium">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR'
                            }).format(item.subTotal)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>


            </div>

            {/* Right Section - Request Order (1/3 width) */}
            <div className="w-1/3 bg-white flex flex-col">
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 rounded-lg m-2 border border-border">
                {/* Header */}
                {printType === 'spk' ? (
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                      REQUEST ORDER
                  </h3>
                  <p className="text-sm text-gray-600">{orderData?.orderNumber || 'N/A'}</p>
                </div>
                ) : (
                  // Nota header with custom settings
                  (() => {
                    const notaSettings = getNotaSettings();
                    return (
                      <div className="text-center mb-4">
                        {/* Custom Header */}
                        {notaSettings.header.enabled && (
                          <div 
                            className="text-gray-900 mb-2"
                            style={{
                              fontSize: `${notaSettings.header.fontSize}px`,
                              fontWeight: notaSettings.header.fontWeight as any
                            }}
                          >
                            {notaSettings.header.text}
                          </div>
                        )}
                        
                        {/* Custom Logo */}
                        {notaSettings.logo.enabled && notaSettings.logo.url && (
                          <div className="flex justify-center mb-2">
                            <img
                              src={notaSettings.logo.url}
                              alt={notaSettings.logo.altText}
                              style={{
                                width: `${notaSettings.logo.width}px`,
                                height: `${notaSettings.logo.height}px`
                              }}
                              className="object-contain"
                            />
                          </div>
                        )}
                        
                        {/* Business Information */}
                        <div className="text-sm text-gray-600 space-y-1 mb-2">
                          <div>{notaSettings.businessInfo.name}</div>
                          <div>{notaSettings.businessInfo.address}</div>
                          <div>{notaSettings.businessInfo.phone}</div>
                          <div>{notaSettings.businessInfo.website}</div>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Checkboxes - Only for SPK */}
                {printType === 'spk' && (
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
                )}

                {/* Order Details */}
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>{printType === 'spk' ? 'Nama :' : 'Customer :'}</span>
                    <span className="font-medium">{orderData?.customerName || 'N/A'}</span>
                  </div>
                  {(printType === 'nota' || printType === 'pelunasan') && (
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-medium">{orderData?.orderNumber || 'N/A'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tanggal :</span>
                    <span>{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  {printType === 'spk' && (
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
                  )}
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
                          {printType !== 'nota' && (
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span className="flex-1">{item.description}</span>
                            <span className="ml-2">{item.quantity}</span>
                          </div>
                          )}
                          {printType !== 'nota' ? (
                          <div className="text-right text-gray-600">
                            {item.location}
                          </div>
                          ) : (
                            <div className="flex justify-between text-gray-600">
                              <div>
                                {item.quantity} x {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(item.subTotal / Number(item.quantity.replace('@', '')))}
                              </div>
                              <div className="font-medium">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(item.subTotal)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Tidak ada item dalam order
                    </div>
                  )}
                </div>
                
                {/* Payment Summary for Nota */}
                {printType === 'nota' && (
                  <div className="mt-4 space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>{(() => {
                        // Calculate subtotal based on selected items for nota
                        const selectedOrderItems = orderList.filter((item, index) => 
                          selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
                        );
                        const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
                        return new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(subtotal);
                      })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Desain:</span>
                      <span>{new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(orderData?.desain || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Biaya Lainnya:</span>
                      <span>{new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(orderData?.biayaLainnya || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Down Payment:</span>
                      <span>{new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(orderData?.downPayment || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Sisa:</span>
                      <span>{(() => {
                        // Calculate total based on selected items for nota
                        const selectedOrderItems = orderList.filter((item, index) => 
                          selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
                        );
                        const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
                        const total = subtotal + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0) - (orderData?.downPayment || 0);
                        return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                        }).format(total);
                      })()}</span>
                    </div>
                  </div>
                )}
                
                {/* Additional Information */}
                <div className="mt-4 space-y-2 text-sm">
                  {printType === 'spk' ? (
                    <>
                      <div className="flex justify-between">
                        <span>Kom :</span>
                        <span>{orderData?.komputer || '???'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Designer:</span>
                        <span>{orderData?.desainer || 'Belum ditugaskan'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Payment:</span>
                        <span>Cash</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cashier:</span>
                        <span>Cashier</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Custom Footer for Nota */}
                {printType === 'nota' && (() => {
                  const notaSettings = getNotaSettings();
                  return notaSettings.footer.enabled ? (
                    <div className="mt-4 text-center">
                      <div 
                        className="text-gray-600"
                        style={{
                          fontSize: `${notaSettings.footer.fontSize}px`,
                          fontWeight: notaSettings.footer.fontWeight as any
                        }}
                      >
                        {notaSettings.footer.text.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
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

  // Fallback: if dialog is not open, return null
  return null;
}; 