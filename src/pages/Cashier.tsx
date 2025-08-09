
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Receipt, 
  Settings, 
  DollarSign, 
  CreditCard, 
  Wallet,
  Calculator,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const Cashier = () => {
  const [display, setDisplay] = useState('0.00');
  const [currentTotal, setCurrentTotal] = useState(0);
  const [items, setItems] = useState<Array<{id: string, name: string, price: number, qty: number}>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);

  const handleNumberInput = (num: string) => {
    if (display === '0.00') {
      setDisplay(num + '.00');
    } else {
      setDisplay(prev => {
        const [integer, decimal] = prev.split('.');
        if (decimal.length < 2) {
          return integer + '.' + decimal + num;
        }
        return (parseInt(integer + decimal) / 10 + parseInt(num) / 100).toFixed(2);
      });
    }
  };

  const handleClear = () => {
    setDisplay('0.00');
    setCashReceived('');
    setChange(0);
    setTransactionResult(null);
  };

  const handleSubtotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setDisplay(subtotal.toFixed(2));
  };

  const handleTotal = () => {
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    setCurrentTotal(total);
    setDisplay(total.toFixed(2));
  };

  const handleAddItem = (name: string, price: number) => {
    const existingItem = items.find(item => item.name === name);
    if (existingItem) {
      setItems(prev => prev.map(item => 
        item.name === name 
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now().toString(),
        name,
        price,
        qty: 1
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
    } else {
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, qty: newQty }
          : item
      ));
    }
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    
    if (paymentMethod === 'cash' && cashReceived) {
      const cashAmount = parseFloat(cashReceived);
      const changeAmount = cashAmount - total;
      setChange(changeAmount);
    }
  };

  const handleCompleteTransaction = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    setTransactionResult(null);

    try {
      const total = calculateTotal();
      
      // Create transaction data
      const transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: new Date(),
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.qty,
          total: item.price * item.qty
        })),
        subtotal: total - (total * 0.11),
        tax: total * 0.11,
        total: total,
        paymentMethod,
        change: change
      };

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTransactionResult({
        success: true,
        transactionId: transaction.id,
        printed: false,
        drawerOpened: false,
        displayUpdated: false
      });

      // Reset for next transaction
      setItems([]);
      setDisplay('0.00');
      setCurrentTotal(0);
      setCashReceived('');
      setChange(0);

    } catch (error: any) {
      setTransactionResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.11;
    return subtotal + tax;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Wallet className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'transfer':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionStatusIcon = () => {
    if (!transactionResult) return null;
    
    if (transactionResult.success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Cashier Terminal</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Settings className="h-3 w-3 mr-1" />
              Hardware settings available in Settings page
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receipt Display */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4 min-h-[400px]">
                <div className="text-right text-3xl font-mono font-bold mb-4 bg-black text-green-400 p-3 rounded">
                  ${display}
                </div>
                
                {/* Transaction Result Alert */}
                {transactionResult && (
                  <Alert className={`mb-4 ${transactionResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {getTransactionStatusIcon()}
                    <AlertDescription>
                      {transactionResult.success ? (
                        <div>
                          <p className="font-semibold text-green-800">Transaction Successful!</p>
                          <p className="text-sm text-green-700">
                            ID: {transactionResult.transactionId}
                            {transactionResult.printed && ' • Receipt Printed'}
                            {transactionResult.drawerOpened && ' • Drawer Opened'}
                            {transactionResult.displayUpdated && ' • Display Updated'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-red-800">Transaction Failed</p>
                          <p className="text-sm text-red-700">{transactionResult.error}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Items List */}
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2 border rounded">
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.qty - 1)}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.qty + 1)}
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                          <span className="text-gray-600">x ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-2 text-red-600"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {items.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (11%):</span>
                        <span>${(items.reduce((sum, item) => sum + (item.price * item.qty), 0) * 0.11).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div>
                        <Label>Payment Method</Label>
                        <div className="flex gap-2 mt-2">
                          {(['cash', 'card', 'transfer'] as const).map((method) => (
                            <Button
                              key={method}
                              variant={paymentMethod === method ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPaymentMethod(method)}
                              className="gap-2"
                            >
                              {getPaymentMethodIcon(method)}
                              {method.charAt(0).toUpperCase() + method.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {paymentMethod === 'cash' && (
                        <div>
                          <Label>Cash Received</Label>
                          <Input
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            placeholder="0.00"
                            className="mt-1"
                          />
                          {cashReceived && (
                            <div className="mt-2 text-sm">
                              <span>Change: ${(parseFloat(cashReceived) - calculateTotal()).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={handleCompleteTransaction}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={items.length === 0 || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Complete Transaction'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Register Keypad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Register Keypad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {/* Product Quick Keys */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    onClick={() => handleAddItem('Banner Print', 25.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Banner<br />$25.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Business Cards', 15.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Cards<br />$15.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Vinyl Sticker', 8.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Vinyl<br />$8.00
                  </Button>
                  <Button
                    onClick={() => handleAddItem('Laminating', 5.00)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Laminate<br />$5.00
                  </Button>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                    <Button
                      key={num}
                      onClick={() => handleNumberInput(num.toString())}
                      className="h-12 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    onClick={handleClear}
                    className="h-12 bg-red-500 hover:bg-red-600 text-white font-bold"
                  >
                    CLEAR
                  </Button>
                  <Button
                    onClick={() => handleNumberInput('0')}
                    className="h-12 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg"
                  >
                    0
                  </Button>
                  <Button
                    onClick={() => handleNumberInput('00')}
                    className="h-12 bg-gray-200 hover:bg-gray-300 text-black font-bold text-lg"
                  >
                    00
                  </Button>
                </div>

                {/* Function Keys */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleSubtotal}
                    className="h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                  >
                    SUBTOTAL
                  </Button>
                  <Button
                    onClick={handleTotal}
                    className="h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                  >
                    TOTAL
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    PAYMENT
                  </Button>
                  <Button
                    onClick={handleCompleteTransaction}
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'PROCESSING' : 'COMPLETE'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
