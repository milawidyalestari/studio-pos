
import { useState } from "react";
import CategorySection from "@/components/CategorySection";
import TransactionSummary from "@/components/TransactionSummary";
import ActionButtons from "@/components/ActionButtons";
import PaymentSection from "@/components/PaymentSection";
import Numpad from "@/components/Numpad";
import { useCategories } from "@/hooks/useCategories";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const Cashier = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  
  // New state for step-by-step payment
  const [currentAmount, setCurrentAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentSteps, setPaymentSteps] = useState<Array<{amount: number, category: string}>>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  // Fetch categories for payment steps
  const { data: categories = [] } = useCategories();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.11;
    return subtotal + tax;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.11;
  };

  const handleAddItem = (name: string, price: number) => {
    const existingItem = items.find(item => item.name === name);
    if (existingItem) {
      setItems(items.map(item => 
        item.name === name 
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setItems([...items, { id: Date.now().toString(), name, price, qty: 1 }]);
    }
  };

  const handleRemoveItem = (id: string) => {
      setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, qty: newQty }
        : item
    ));
  };

  const handleNumberInput = (num: string) => {
    // Handle number input for payment amount
    if (num === '.') {
      if (!currentAmount.includes('.')) {
        setCurrentAmount(prev => prev + num);
      }
    } else if (num === '00') {
      setCurrentAmount(prev => prev + '00');
    } else {
      setCurrentAmount(prev => prev + num);
    }
  };

  const handleAddPaymentStep = () => {
    if (!currentAmount || parseFloat(currentAmount) <= 0) {
      alert('Masukkan jumlah uang yang valid!');
      return;
    }
    
    if (!selectedCategory) {
      alert('Pilih kategori terlebih dahulu!');
      return;
    }

    const amount = parseFloat(currentAmount);
    // Find category name from categories data
    const categoryName = categories.find(c => c.id === selectedCategory)?.category_name || selectedCategory;
    const newStep = { amount, category: categoryName };
    
    setPaymentSteps(prev => [...prev, newStep]);
    setTotalPaid(prev => prev + amount);
    
    // Reset current input
    setCurrentAmount('');
    setSelectedCategory('');
  };

  const handleFinalPayment = () => {
    if (!currentAmount || parseFloat(currentAmount) <= 0) {
      alert('Masukkan jumlah uang yang valid!');
      return;
    }

    const finalAmount = parseFloat(currentAmount);
    const totalToPay = calculateTotal();
    const totalWithSteps = totalPaid + finalAmount;
    
    if (totalWithSteps < totalToPay) {
      alert(`Pembayaran kurang! Total: ${formatCurrency(totalToPay)}, Dibayar: ${formatCurrency(totalWithSteps)}`);
      return;
    }

    const change = totalWithSteps - totalToPay;
    
    alert(`Transaksi berhasil!\nTotal: ${formatCurrency(totalToPay)}\nDibayar: ${formatCurrency(totalWithSteps)}\nKembalian: ${formatCurrency(change)}`);
    
    // Reset everything
    handleClear();
  };

  const handleClear = () => {
    setItems([]);
    setCashReceived('');
    setCurrentAmount('');
    setSelectedCategory('');
    setPaymentSteps([]);
    setTotalPaid(0);
  };

  const handleCompleteTransaction = () => {
    if (items.length === 0) {
      alert('Keranjang kosong!');
      return;
    }
    
    if (paymentMethod === 'cash' && !cashReceived) {
      alert('Masukkan jumlah uang yang diterima!');
      return;
    }

      const total = calculateTotal();
    const change = paymentMethod === 'cash' ? parseFloat(cashReceived) - total : 0;

    alert(`Transaksi berhasil!\nTotal: ${formatCurrency(total)}\nMetode: ${paymentMethod}\n${paymentMethod === 'cash' ? `Uang diterima: ${formatCurrency(parseFloat(cashReceived))}\nKembalian: ${formatCurrency(change)}` : ''}`);

      // Reset for next transaction
    handleClear();
  };

  const handleRefund = () => {
    alert('Proses refund dimulai');
  };

  const handleButton1 = () => {
    handleAddItem('Banner Print', 25000);
  };

  const handleButton2 = () => {
    handleAddItem('Business Cards', 15000);
  };

  const handleButton3 = () => {
    handleAddItem('Vinyl Sticker', 8000);
  };

  const handleButton4 = () => {
    handleAddItem('Laminating', 5000);
  };

  const handleButton5 = () => {
    handleAddItem('Photo Print A4', 3500);
  };

  const handleButton6 = () => {
    handleAddItem('Photo Print A3', 7000);
  };

  const handleButton7 = () => {
    handleAddItem('Canvas Print', 45000);
  };

  return (
    <div className="h-screen p-6">
      <div className="max-w-8xl mx-auto h-full flex flex-col">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-foreground">Cashier Terminal</h1>
        </header>
        
        <div className="grid grid-cols-12 gap-6 flex-1">
          {/* Left Column - Category Section */}
          <div className="col-span-6 h-full">
            <CategorySection 
              items={items}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              onCategorySelect={(categoryId) => {
                setSelectedCategory(categoryId);
              }}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Right Column - Transaction & Controls */}
          <div className="col-span-6 h-full flex flex-col space-y-4">
            {/* Transaction Summary */}
            <TransactionSummary 
              total={calculateTotal()}
              subtotal={calculateSubtotal()}
              tax={calculateTax()}
              totalPaid={totalPaid}
              paymentSteps={paymentSteps}
              currentAmount={currentAmount}
            />
            
            {/* Payment Section */}
            <PaymentSection 
              total={calculateTotal()}
              onPaymentMethodChange={setPaymentMethod}
              onCashReceivedChange={setCashReceived}
              currentAmount={currentAmount}
              selectedCategory={categories.find(c => c.id === selectedCategory)?.category_name || selectedCategory}
            />
            
            {/* Action Buttons and Numpad Row */}
            <div className="grid grid-cols-2 gap-6 flex-1">
              <ActionButtons 
                onRefund={handleRefund}
                onSub={handleAddPaymentStep}
                onButton1={handleButton1}
                onButton2={handleButton2}
                onButton3={handleButton3}
                onButton4={handleButton4}
                onButton5={handleButton5}
                onButton6={handleButton6}
                onButton7={handleButton7}
              />
              <Numpad 
                onNumberInput={handleNumberInput}
                onClear={handleClear}
                onComplete={handleFinalPayment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
