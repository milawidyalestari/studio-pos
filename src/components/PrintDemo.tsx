import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { usePrintOverlay } from '../hooks/usePrintOverlay';
import { PrintOverlay } from './PrintOverlay';
import { FileText, Printer, Receipt, CreditCard } from 'lucide-react';

const PrintDemo: React.FC = () => {
  const {
    isOpen: isPrintOverlayOpen,
    printType,
    printData,
    closePrintOverlay,
    handlePrint,
    printSPK,
    printReceipt,
    printNota,
    printPelunasan,
  } = usePrintOverlay();

  // Sample data for demo with product names instead of codes
  const sampleOrderList = [
    {
      id: '1',
      item: 'Banner Vinyl', // Instead of PRD0004
      quantity: 2,
      subTotal: 500000,
      ukuran: { panjang: '280', lebar: '160' },
    },
    {
      id: '2',
      item: 'Sticker Vinyl',
      quantity: 10,
      subTotal: 250000,
      ukuran: { panjang: '21', lebar: '29.7' },
    },
    {
      id: '3',
      item: 'Print Foto',
      quantity: 5,
      subTotal: 75000,
      ukuran: { panjang: '25.4', lebar: '20.3' },
    },
  ];

  const sampleOrderData = {
    orderNumber: 'ORD-2024-001',
    customerName: 'PT. Contoh Indonesia',
    totalAmount: 825000,
    downPayment: 200000,
    pelunasan: 300000,
  };

  const handlePrintSPKDemo = () => {
    printSPK({
      orderList: sampleOrderList,
      orderData: sampleOrderData,
    });
  };

  const handlePrintReceiptDemo = () => {
    printReceipt({
      orderList: sampleOrderList,
      orderData: sampleOrderData,
    });
  };

  const handlePrintNotaDemo = () => {
    printNota({
      orderList: sampleOrderList,
      orderData: sampleOrderData,
    });
  };

  const handlePrintPelunasanDemo = () => {
    printPelunasan({
      orderList: sampleOrderList,
      orderData: sampleOrderData,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Print Overlay Demo</h1>
        <p className="text-gray-600">Demo untuk menampilkan berbagai jenis print overlay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrintSPKDemo}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Print SPK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Surat Perintah Kerja untuk tim produksi
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrintReceiptDemo}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-green-600" />
              Print Receipt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Receipt untuk customer
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrintNotaDemo}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-orange-600" />
              Print Nota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Nota detail untuk customer
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrintPelunasanDemo}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Print Pelunasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Nota pelunasan pembayaran
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Sample Order Data:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Order Number:</strong> {sampleOrderData.orderNumber}</p>
          <p><strong>Customer:</strong> {sampleOrderData.customerName}</p>
          <p><strong>Total Amount:</strong> {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(sampleOrderData.totalAmount)}</p>
          <p><strong>Items:</strong> {sampleOrderList.length} items</p>
        </div>
      </div>

      {/* Print Overlay */}
      <PrintOverlay
        isOpen={isPrintOverlayOpen}
        onClose={closePrintOverlay}
        onPrint={handlePrint}
        title={`Print ${printType.toUpperCase()}`}
        orderList={printData.orderList}
        orderData={printData.orderData}
        printType={printType}
      />
    </div>
  );
};

export default PrintDemo; 