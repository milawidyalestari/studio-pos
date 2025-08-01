import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface PrintPreviewProps {
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number;
    downPayment?: number;
    pelunasan?: number;
    [key: string]: any;
  };
  orderList?: Array<{
    id: string;
    item: string;
    quantity: number;
    subTotal: number;
    [key: string]: any;
  }>;
}

export const SPKPreview: React.FC<PrintPreviewProps> = ({ orderData, orderList }) => {
  // Helper function to check if size is valid
  const isValidSize = (panjang: any, lebar: any) => {
    return panjang && lebar && 
           panjang !== '' && lebar !== '' && 
           panjang !== 'null' && lebar !== 'null' &&
           panjang !== null && lebar !== null &&
           panjang !== undefined && lebar !== undefined;
  };
  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">REQUEST ORDER</h2>
            <p className="text-lg font-semibold">{orderData?.orderNumber || 'N/A'}</p>
          </div>
          
          <Separator className="my-4" />
          
          {/* Print Type Checkboxes */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded border-2 border-black bg-white checked:bg-black checked:border-black"
                  style={{
                    width: '12px',
                    height: '12px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                />
                <span>Outdoor/Indoor</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="rounded border-2 border-black bg-white checked:bg-black checked:border-black"
                  style={{
                    width: '12px',
                    height: '12px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                />
                <span>Laser Printing</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="rounded border-2 border-black bg-white checked:bg-black checked:border-black"
                  style={{
                    width: '12px',
                    height: '12px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                />
                <span>Mug/Nota/Stemple</span>
              </label>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Nama:</span>
                <span className="ml-2">{orderData?.customerName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Tanggal:</span>
                <span className="ml-2">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
              <div>
                <span className="font-medium">Deadline:</span>
                <span className="ml-2">{new Date().toLocaleDateString('id-ID')} 14:30</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Items List */}
          <div className="space-y-3">
            {orderList?.map((item, index) => {
              const size = (item as any).ukuran || {};
              const description = (item as any).description || (item as any).notes || '';
              const finishing = (item as any).finishing || 'Lembaran'; // Use finishing from database
              console.log('PrintPreviews - item finishing:', (item as any).finishing); // Debug log
              console.log('PrintPreviews - item size:', size); // Debug log
              console.log('PrintPreviews - size.panjang:', size.panjang, 'size.lebar:', size.lebar); // Debug log
              console.log('PrintPreviews - size.panjang type:', typeof size.panjang, 'size.lebar type:', typeof size.lebar); // Debug log
              console.log('PrintPreviews - size.panjang === null:', size.panjang === null, 'size.lebar === null:', size.lebar === null); // Debug log
              
              return (
                <div key={item.id || index} className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-sm mb-1">{item.item}</div>
                  {description && (
                    <div className="text-xs text-gray-600 mb-1">{description}</div>
                  )}
                  <div className="text-xs text-gray-700">
                    {isValidSize(size.panjang, size.lebar) ? `${size.panjang} x ${size.lebar}` : '-'} @{item.quantity} {finishing}
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator className="my-4" />
          
          {/* Additional Information */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Kom:</span>
              <span>1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Designer:</span>
              <span>Mila - Orderan Selesai</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ReceiptPreview: React.FC<PrintPreviewProps> = ({ orderData, orderList }) => {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold">RECEIPT</h2>
            <p className="text-xs text-gray-600">Studio POS System</p>
            <p className="text-xs">{new Date().toLocaleDateString('id-ID')}</p>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Order:</span>
              <span>{orderData?.orderNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{orderData?.customerName || 'N/A'}</span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Items:</h3>
            <div style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: 8 }}>
              {orderList?.map((item, index) => {
                const unitPrice = item.quantity > 0 ? item.subTotal / item.quantity : 0;
                const size = (item as any).ukuran || {};
                
                return (
                  <div key={item.id || index} className="text-sm border-b border-gray-100 pb-2">
                    <div className="font-medium">{item.item}</div>
                    {size.panjang && size.lebar && (
                      <div className="text-xs text-gray-600">
                        {size.panjang} x {size.lebar}
                      </div>
                    )}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {item.quantity} x {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(unitPrice)}
                      </span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(item.subTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="text-right space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(orderData?.totalAmount || 0)}
              </span>
            </div>
          </div>
          
          <div className="text-center mt-4 text-xs text-gray-600">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const NotaPreview: React.FC<PrintPreviewProps> = ({ orderData, orderList }) => {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold">NOTA</h2>
            <p className="text-xs text-gray-600">Studio POS System</p>
            <p className="text-xs">{new Date().toLocaleDateString('id-ID')}</p>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>No. Order:</span>
              <span>{orderData?.orderNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{orderData?.customerName || 'N/A'}</span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Detail Items:</h3>
            {orderList?.map((item, index) => {
              const size = (item as any).ukuran || {};
              
              return (
                <div key={item.id || index} className="border-l-2 border-gray-200 pl-2 border-b border-gray-100 pb-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.item}</span>
                    <span>{new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(item.subTotal)}</span>
                  </div>
                  {size.panjang && size.lebar && (
                    <div className="text-xs text-gray-600">
                      Ukuran: {size.panjang} x {size.lebar}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Quantity: {item.quantity} x {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(item.quantity > 0 ? item.subTotal / item.quantity : 0)}
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-1 text-right">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(orderData?.totalAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(orderData?.totalAmount || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PelunasanPreview: React.FC<PrintPreviewProps> = ({ orderData, orderList }) => {
  const downPayment = orderData?.downPayment || 0;
  const pelunasan = orderData?.pelunasan || 0;
  const totalAmount = orderData?.totalAmount || 0;
  const remaining = totalAmount - downPayment - pelunasan;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold">NOTA PELUNASAN</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Payment Settlement
            </Badge>
            <p className="text-xs text-gray-600">{new Date().toLocaleDateString('id-ID')}</p>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Order Number:</span>
              <span>{orderData?.orderNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{orderData?.customerName || 'N/A'}</span>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Payment Summary:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Order:</span>
                <span>{new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Down Payment:</span>
                <span>- {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(downPayment)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Payment Now:</span>
                <span>- {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(pelunasan)}</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="text-right space-y-1">
            <div className="flex justify-between text-sm font-bold">
              <span>Remaining:</span>
              <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(remaining)}
              </span>
            </div>
            {remaining <= 0 && (
              <Badge variant="default" className="bg-green-600">
                PAID IN FULL
              </Badge>
            )}
          </div>
          
          <div className="text-center mt-4 text-xs text-gray-600">
            <p>Payment settlement completed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 