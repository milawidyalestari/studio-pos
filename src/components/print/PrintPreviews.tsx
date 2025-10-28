import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { getNotaSettings } from '../../utils/notaSettings';
import { getStrukSettings } from '../../utils/strukSettings';
import { PaymentStamp } from './PaymentStamp';

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
  selectedItems?: string[];
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
  
  // Get struk settings
  const strukSettings = getStrukSettings();
  
  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300">
        <CardContent className="p-4">
          {/* Header */}
          <div className="text-center space-y-2">
            {strukSettings.spk.showHeader && (
              <h2 className="text-xl font-bold">{strukSettings.spk.headerText}</h2>
            )}
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
            <p className="text-xs text-gray-600">Azuro System</p>
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

export const NotaPreview: React.FC<PrintPreviewProps> = ({ orderData, orderList, selectedItems = [] }) => {
  // Helper function to check if size is valid
  const isValidSize = (panjang: any, lebar: any) => {
    return panjang && lebar && 
           panjang !== '' && lebar !== '' && 
           panjang !== 'null' && lebar !== 'null' &&
           panjang !== null && lebar !== null &&
           panjang !== undefined && lebar !== undefined;
  };
  
  // Get custom nota settings
  const notaSettings = getNotaSettings();
  const strukSettings = getStrukSettings();
  
  // Calculate payment status - check if remaining payment is 0 or less
  const calculatePaymentStatus = () => {
    const selectedOrderItems = orderList?.filter((item, index) => 
      selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
    ) || [];
    const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
    const total = subtotal + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0);
    const remaining = total - (orderData?.downPayment || 0) - (orderData?.pelunasan || 0);
    return remaining <= 0;
  };

  const isLunas = calculatePaymentStatus();
  
  return (
    <div className="space-y-4">
      <Card className="border-2 border-gray-300 relative">
        <CardContent className="p-4">
          {/* Logo Section */}
          {strukSettings.struk.logo.url && (
            <div className="text-center mb-4">
              <img
                src={strukSettings.struk.logo.url}
                alt="Company Logo"
                className="mx-auto h-12 object-contain"
              />
            </div>
          )}
          
          {/* Header Section */}
          {strukSettings.struk.showHeader && (
            <div className="text-center mb-4">
              <div className="font-bold text-blue-600 text-lg">
                {strukSettings.struk.headerText}
              </div>
            </div>
          )}
          
          {/* Business Information */}
          <div className="text-center mb-4 text-sm text-gray-600">
            <div>{notaSettings.businessInfo.name}</div>
            <div>{notaSettings.businessInfo.address}</div>
            <div>{notaSettings.businessInfo.phone}</div>
            <div>{notaSettings.businessInfo.website}</div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Customer:</span>
                <span className="ml-2">{orderData?.customerName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Order Number:</span>
                <span className="ml-2">{orderData?.orderNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Tanggal:</span>
                <span className="ml-2">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
              <div>
                <span className="font-medium">Deadline:</span>
                <span className="ml-2">
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
          </div>
          
          <Separator className="my-4" />
          
          {/* Items List */}
          <div className="space-y-3">
            {orderList?.filter((item, index) => {
              // For nota, show all items if none selected, otherwise show only selected items
              return selectedItems.length === 0 || selectedItems.includes(item.id || index.toString());
            }).map((item, index) => {
              const size = (item as any).ukuran || {};
              const unitPrice = item.quantity > 0 ? item.subTotal / item.quantity : 0;
              
              return (
                <div key={item.id || index} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm flex-1">{item.item}</div>
                    <div className="text-xs text-gray-700 ml-2">
                      {isValidSize(size.panjang, size.lebar) ? `${size.panjang} x ${size.lebar}` : '-'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      {item.quantity} x {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(unitPrice)}
                    </div>
                    <div className="text-xs font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(item.subTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator className="my-4" />
          
          {/* Payment Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Subtotal:</span>
              <span>{(() => {
                // Calculate subtotal based on selected items for nota
                const selectedOrderItems = orderList?.filter((item, index) => 
                  selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
                ) || [];
                const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(subtotal);
              })()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Desain:</span>
              <span>{new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(orderData?.desain || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Biaya Lainnya:</span>
              <span>{new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(orderData?.biayaLainnya || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Down Payment:</span>
              <span>{new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(orderData?.downPayment || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Sisa:</span>
              <span>{(() => {
                // Calculate total based on selected items for nota
                const selectedOrderItems = orderList?.filter((item, index) => 
                  selectedItems.length === 0 || selectedItems.includes(item.id || index.toString())
                ) || [];
                const subtotal = selectedOrderItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
                const total = subtotal + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0);
                const remaining = total - (orderData?.downPayment || 0) - (orderData?.pelunasan || 0);
                
                // Show "LUNAS" if payment is complete, otherwise show remaining amount
                if (remaining <= 0) {
                  return 'LUNAS';
                }
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(Math.max(0, remaining));
              })()}</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Additional Information */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Payment:</span>
              <span>Cash</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Cashier:</span>
              <span>Cashier</span>
            </div>
          </div>
          
          {/* Footer Section */}
          {strukSettings.struk.showFooter && (
            <div className="mt-4 text-center">
              <div className="text-gray-600 text-xs">
                {strukSettings.struk.footerText}
              </div>
            </div>
          )}
          
          {/* Logo Lunas */}
          {strukSettings.struk.showLunasLogo && strukSettings.struk.lunasLogo.url && isLunas && (
            <div className="mt-4 text-center">
              <img
                src={strukSettings.struk.lunasLogo.url}
                alt="Lunas"
                className="mx-auto h-8 object-contain opacity-80"
              />
            </div>
          )}
          
          {/* Payment Status Stamp */}
          <PaymentStamp 
            isLunas={isLunas}
            settings={notaSettings.stamp}
          />
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

  // Helper function to check if size is valid (same as SPK and Nota)
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
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold">NOTA PELUNASAN</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Payment Settlement
            </Badge>
            <p className="text-sm font-semibold">{orderData?.orderNumber || 'N/A'}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{orderData?.customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Items List - Same format as SPK and Nota */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Order Items:</h3>
            {orderList?.map((item, index) => {
              const size = (item as any).ukuran || {};
              const unitPrice = item.quantity > 0 ? item.subTotal / item.quantity : 0;
              
              return (
                <div key={item.id || index} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm flex-1">{item.item}</div>
                    <div className="text-xs text-gray-700 ml-2">
                      {isValidSize(size.panjang, size.lebar) ? `${size.panjang} x ${size.lebar}` : '-'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      {item.quantity} x {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(unitPrice)}
                    </div>
                    <div className="text-xs font-medium">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(item.subTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Separator className="my-4" />
          
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