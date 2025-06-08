
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Cashier = () => {
  const [display, setDisplay] = useState('0.00');
  const [currentTotal, setCurrentTotal] = useState(0);
  const [items, setItems] = useState<Array<{id: string, name: string, price: number, qty: number}>>([]);

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
    const newItem = {
      id: Date.now().toString(),
      name,
      price,
      qty: 1
    };
    setItems(prev => [...prev, newItem]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Cashier Terminal</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receipt Display */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4 min-h-[300px]">
                <div className="text-right text-3xl font-mono font-bold mb-4 bg-black text-green-400 p-3 rounded">
                  ${display}
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.qty}</span>
                      <span>${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {items.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${items.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Register Keypad */}
          <Card>
            <CardHeader>
              <CardTitle>Register Keypad</CardTitle>
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
                    className="h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    CASH
                  </Button>
                  <Button
                    className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    CARD
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
