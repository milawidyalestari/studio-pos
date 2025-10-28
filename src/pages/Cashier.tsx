import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCashDrawer } from "@/hooks/useCashDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus, Trash2, ShoppingCart, Settings, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CashDrawerSettings from "@/components/CashDrawerSettings";

interface CartItem {
  kode: string;
  nama: string;
  hargaJual: number;
  qty: number;
  isPriceEditable: boolean; // Track if price can be manually edited
  manualTotal?: number; // Manual total override for this item
}

const Cashier = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showCashDrawerSettings, setShowCashDrawerSettings] = useState(false);
  const [cashDrawerSettings, setCashDrawerSettings] = useState({
    port: 'COM1',
    baudRate: 9600,
    timeout: 5000,
    autoOpen: true,
  });

  const { data: products = [], isLoading } = useProducts();
  const { openCashDrawer, isOpening, error: cashDrawerError } = useCashDrawer();

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.kode?.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(product => ({
    ...product,
    // Map snake_case to camelCase for consistency
    hargaJual: product.harga_jual
  }));

  // Format currency to IDR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      // Use manual total if available, otherwise calculate from price * qty
      return sum + (item.manualTotal ?? (item.hargaJual * item.qty));
    }, 0);
  };

  // Add product to cart
  const handleAddToCart = (product: any) => {
    const existingItem = cart.find(item => item.kode === product.kode);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.kode === product.kode
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      // Check if price is locked (kunci_harga = true)
      const isPriceLocked = product.kunci_harga === true;
      const hasPrice = product.harga_jual && product.harga_jual > 0;
      
      setCart([...cart, {
        kode: product.kode,
        nama: product.nama,
        hargaJual: product.harga_jual || 0,
        qty: 1,
        // Price is editable only if:
        // 1. Price is NOT locked AND
        // 2. Either no price exists OR price is 0
        isPriceEditable: !isPriceLocked && !hasPrice
      }]);
    }
    setSearchTerm(""); // Clear search after adding
  };

  // Update quantity
  const handleUpdateQuantity = (kode: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(kode);
      return;
    }
    
    setCart(cart.map(item =>
      item.kode === kode
        ? { ...item, qty }
        : item
    ));
  };

  // Update price manually
  const handleUpdatePrice = (kode: string, price: number) => {
    setCart(cart.map(item =>
      item.kode === kode
        ? { ...item, hargaJual: price }
        : item
    ));
  };

  // Update manual total for item
  const handleUpdateManualTotal = (kode: string, total: number) => {
    setCart(cart.map(item =>
      item.kode === kode
        ? { ...item, manualTotal: total > 0 ? total : undefined }
        : item
    ));
  };

  // Clear manual total for item
  const handleClearManualTotal = (kode: string) => {
    setCart(cart.map(item =>
      item.kode === kode
        ? { ...item, manualTotal: undefined }
        : item
    ));
  };

  // Set all items to manual total mode
  const handleSetAllManual = () => {
    setCart(cart.map(item => ({
      ...item,
      manualTotal: item.hargaJual * item.qty
    })));
  };

  // Clear all manual totals
  const handleClearAllManual = () => {
    setCart(cart.map(item => ({
      ...item,
      manualTotal: undefined
    })));
  };

  // Remove from cart
  const handleRemoveFromCart = (kode: string) => {
    setCart(cart.filter(item => item.kode !== kode));
  };

  // Open cash drawer
  const handleOpenCashDrawer = async () => {
    try {
      await openCashDrawer({
        port: cashDrawerSettings.port,
        baudRate: cashDrawerSettings.baudRate,
        timeout: cashDrawerSettings.timeout,
      });
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
    }
  };

  // Complete transaction
  const handleCompleteTransaction = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }

    if (!paymentMethod) {
      alert('Pilih metode pembayaran terlebih dahulu!');
      return;
    }

    // Jika pembayaran tunai, pastikan uang diterima mencukupi
    if (paymentMethod === 'cash') {
      const total = calculateTotal();
      const received = parseFloat(cashReceived || '0');
      if (isNaN(received) || received <= 0) {
        alert('Masukkan jumlah uang tunai yang diterima.');
        return;
      }
      if (received < total) {
        const shortage = total - received;
        alert(`Uang diterima kurang: ${formatCurrency(shortage)}`);
        return;
      }
    }

    // Check if all items have valid totals (either price*qty or manual total)
    const itemsWithoutValidTotal = cart.filter(item => {
      const calculatedTotal = item.hargaJual * item.qty;
      const manualTotal = item.manualTotal;
      return (!manualTotal || manualTotal <= 0) && (!item.hargaJual || item.hargaJual <= 0 || calculatedTotal <= 0);
    });
    
    if (itemsWithoutValidTotal.length > 0) {
      alert(`Harap masukkan harga atau total yang valid untuk: ${itemsWithoutValidTotal.map(item => item.nama).join(', ')}`);
      return;
    }

    const total = calculateTotal();
    
    // Open cash drawer if auto open is enabled and payment method is cash
    if (cashDrawerSettings.autoOpen && paymentMethod === 'cash') {
      try {
        await handleOpenCashDrawer();
      } catch (error) {
        console.error('Failed to open cash drawer:', error);
        // Continue with transaction even if cash drawer fails
      }
    }
    
    alert(
      `Transaksi Berhasil!\n\n` +
      `Total: ${formatCurrency(total)}\n` +
      `Metode Pembayaran: ${paymentMethod}\n\n` +
      `Terima kasih!`
    );

    // Reset cart and payment method
    setCart([]);
    setPaymentMethod('cash');
    setCashReceived('');
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length > 0 && confirm('Hapus semua item dari keranjang?')) {
      setCart([]);
      setPaymentMethod("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Kasir</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCashDrawer}
                disabled={isOpening}
              >
                {isOpening ? 'Opening...' : 'Open Drawer'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCashDrawerSettings(!showCashDrawerSettings)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        {/* Cash Drawer Settings */}
        {showCashDrawerSettings && (
          <div className="mb-4">
            <CashDrawerSettings
              onSettingsChange={setCashDrawerSettings}
            />
          </div>
        )}

        {/* Cash Drawer Error */}
        {cashDrawerError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Cash Drawer Error: {cashDrawerError}
            </AlertDescription>
          </Alert>
        )}

        {/* Total - Full Width */}
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-baseline gap-3">
                <p className="text-lg font-medium">Total:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </p>
                {cart.some(item => item.manualTotal !== undefined) && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Manual Total
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Product Search */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4" />
                  Cari Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Ketik nama atau kode produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm"
                  autoFocus
                />
              </CardContent>
            </Card>

            {/* Product List */}
            {searchTerm && (
              <Card className="max-h-[500px] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-sm">Hasil Pencarian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <p className="text-gray-500 text-sm">Memuat produk...</p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-gray-500 text-sm">Produk tidak ditemukan</p>
                  ) : (
                    filteredProducts.map((product) => {
                      const hasPrice = product.hargaJual && product.hargaJual > 0;
                      const isPriceLocked = product.kunci_harga === true;
                      
                      return (
                        <div
                          key={product.kode}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAddToCart(product)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.nama}</p>
                            <p className="text-xs text-gray-500">Kode: {product.kode}</p>
                          </div>
                          <div className="text-right">
                            {hasPrice ? (
                              <div>
                                <p className="font-bold text-blue-600 text-sm">
                                  {formatCurrency(product.hargaJual)}
                                </p>
                                {isPriceLocked && (
                                  <p className="text-xs text-green-600">🔒 Terkunci</p>
                                )}
                              </div>
                            ) : (
                              <p className="font-medium text-orange-600 text-xs">
                                Harga belum diset
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Cart & Payment */}
          <div className="space-y-4">
            {/* Cart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="w-4 h-4" />
                  Keranjang ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <div className="flex items-center gap-2">
                    {cart.some(item => item.manualTotal !== undefined) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={handleClearAllManual}
                      >
                        Reset Manual
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={handleSetAllManual}
                      >
                        Set Manual All
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={handleClearCart}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Kosongkan
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3 h-[300px] overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">
                      Keranjang kosong
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.kode}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          item.isPriceEditable && (!item.hargaJual || item.hargaJual <= 0)
                            ? 'bg-yellow-50 border border-yellow-300'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{item.nama}</p>
                            {!item.isPriceEditable && item.hargaJual > 0 && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                🔒 Terkunci
                              </span>
                            )}
                          </div>
                          {item.isPriceEditable ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">Harga:</span>
                              <Input
                                type="number"
                                value={item.hargaJual || ''}
                                onChange={(e) => handleUpdatePrice(item.kode, parseInt(e.target.value) || 0)}
                                className="w-28 h-6 text-xs"
                                placeholder="Masukkan harga"
                                min="0"
                              />
                              <span className="text-xs text-gray-500">x {item.qty}</span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.hargaJual)} x {item.qty}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.kode, item.qty - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleUpdateQuantity(item.kode, parseInt(e.target.value) || 0)}
                            className="w-12 h-8 text-center text-sm"
                            min="1"
                          />
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.kode, item.qty + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="min-w-[120px] text-right">
                          {item.manualTotal !== undefined ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={item.manualTotal || ''}
                                  onChange={(e) => handleUpdateManualTotal(item.kode, parseInt(e.target.value) || 0)}
                                  className="w-20 h-6 text-xs text-right"
                                  placeholder="Total"
                                  min="0"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleClearManualTotal(item.kode)}
                                  title="Reset ke kalkulasi otomatis"
                                >
                                  <span className="text-xs">↺</span>
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500">
                                Auto: {formatCurrency(item.hargaJual * item.qty)}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-bold text-sm">
                                {formatCurrency(item.hargaJual * item.qty)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => handleUpdateManualTotal(item.kode, item.hargaJual * item.qty)}
                                title="Set manual total"
                              >
                                Set Manual
                              </Button>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveFromCart(item.kode)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Section - placed under Cart */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    <div>
                      <p className="text-sm font-medium mb-1">Metode Pembayaran</p>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="w-full h-10 text-sm">
                          <SelectValue placeholder="Metode Pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Tunai (Cash)</SelectItem>
                          <SelectItem value="debit">Kartu Debit</SelectItem>
                          <SelectItem value="credit">Kartu Kredit</SelectItem>
                          <SelectItem value="transfer">Transfer Bank</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                          <SelectItem value="ewallet">E-Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div>
                        <p className="text-sm font-medium mb-1">Uang Diterima</p>
                        <Input
                          type="number"
                          placeholder="0"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="h-10 text-sm"
                          min="0"
                        />
                      </div>
                    )}
                  </div>

                  {paymentMethod === 'cash' && cashReceived && (
                    <div className="text-sm">
                      {(() => {
                        const total = calculateTotal();
                        const received = parseFloat(cashReceived || '0');
                        const change = received - total;
                        return (
                          <div className={change < 0 ? 'text-red-600' : 'text-green-600'}>
                            {change < 0 ? (
                              <>Kurang: {formatCurrency(Math.abs(change))}</>
                            ) : (
                              <>Kembalian: {formatCurrency(change)}</>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={handleCompleteTransaction}
                      className="h-10 px-6 text-sm"
                      size="default"
                      disabled={cart.length === 0 || !paymentMethod}
                    >
                      Selesaikan Transaksi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
