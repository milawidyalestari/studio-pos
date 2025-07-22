import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { X, Printer, FileText } from 'lucide-react';
import { SPKPreview, ReceiptPreview, NotaPreview, PelunasanPreview } from './print/PrintPreviews';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {getPrintTypeIcon()}
              {getPrintTypeLabel()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Column - 2/3 width */}
          <div className="w-2/3 flex flex-col border-r">
            {/* Top Section - Order List */}
            <div className="flex-1 border-b">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-700">Daftar Order</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="p-4">
                  {orderList.length > 0 ? (
                    <div className="space-y-2">
                      {orderList.map((item, index) => (
                        <Card key={item.id || index} className="p-3">
                          <CardContent className="p-0">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{item.item}</h4>
                                  {item.ukuran?.panjang && item.ukuran?.lebar && (
                                    <p className="text-xs text-gray-500">
                                      {item.ukuran.panjang} x {item.ukuran.lebar}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">
                                    {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR'
                                    }).format(item.subTotal)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} x {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR'
                                    }).format(item.quantity > 0 ? item.subTotal / item.quantity : 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No order items to display</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Bottom Section - Empty for now */}
            <div className="flex-1">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-700">Additional Information</h3>
              </div>
              <div className="p-4">
                <div className="text-center py-8 text-gray-500">
                  <p>Additional print information can be displayed here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width (scrollable) */}
          <div className="w-1/3 flex flex-col">
            <div className="flex-1" style={{ position: 'relative' }}>
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-700">Preview dari Print</h3>
              </div>
              <div style={{ maxHeight: 'calc(90vh - 220px)', overflowY: 'auto' }}>
                <div className="p-4">
                  {getPreviewContent() || (
                    <div className="space-y-4">
                      {/* Default Preview Content */}
                      <Card className="p-4">
                        <CardContent className="p-0">
                          <div className="text-center space-y-2">
                            <h4 className="font-bold text-lg">PREVIEW</h4>
                            {orderData?.orderNumber && (
                              <p className="text-sm">Order: {orderData.orderNumber}</p>
                            )}
                            {orderData?.customerName && (
                              <p className="text-sm">Customer: {orderData.customerName}</p>
                            )}
                            {orderData?.totalAmount && (
                              <p className="font-bold text-lg">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(orderData.totalAmount)}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="text-xs text-gray-500 text-center">
                        <p>This is a preview of how the print will look</p>
                        <p>Adjust layout and content as needed</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Sticky total di bawah preview */}
                {orderData?.totalAmount !== undefined && (
                  <div
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      background: '#fff',
                      borderTop: '1px solid #eee',
                      padding: '12px 16px',
                      zIndex: 2,
                    }}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(orderData.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onPrint} className="bg-[#0050C8] hover:bg-[#003a9b]">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 