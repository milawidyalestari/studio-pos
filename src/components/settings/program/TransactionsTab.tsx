
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const TransactionsTab = () => {
  const { toast } = useToast();
  const [transactionSettings, setTransactionSettings] = useState({
    defaultCurrency: 'IDR',
    taxRate: '11',
    discountType: 'percentage',
    maxDiscount: '50',
    receiptPrefix: 'DPS',
    invoicePrefix: 'INV',
    autoNumbering: true,
    printAfterSale: true,
    requireCustomerInfo: false,
    allowPartialPayment: true,
    defaultPaymentMethod: 'cash'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setTransactionSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Transaction settings saved",
      description: "Your transaction settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Transaction Settings</CardTitle>
          <CardDescription>Configure basic transaction parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={transactionSettings.defaultCurrency}
                onValueChange={(value) => handleInputChange('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                value={transactionSettings.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Select
                value={transactionSettings.discountType}
                onValueChange={(value) => handleInputChange('discountType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-discount">Maximum Discount</Label>
              <Input
                id="max-discount"
                value={transactionSettings.maxDiscount}
                onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Settings</CardTitle>
          <CardDescription>Configure receipt and invoice numbering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receipt-prefix">Receipt Prefix</Label>
              <Input
                id="receipt-prefix"
                value={transactionSettings.receiptPrefix}
                onChange={(e) => handleInputChange('receiptPrefix', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
              <Input
                id="invoice-prefix"
                value={transactionSettings.invoicePrefix}
                onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-numbering"
              checked={transactionSettings.autoNumbering}
              onCheckedChange={(checked) => handleInputChange('autoNumbering', checked)}
            />
            <Label htmlFor="auto-numbering">Enable automatic numbering</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Behavior</CardTitle>
          <CardDescription>Configure how sales transactions behave</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="print-after-sale"
                checked={transactionSettings.printAfterSale}
                onCheckedChange={(checked) => handleInputChange('printAfterSale', checked)}
              />
              <Label htmlFor="print-after-sale">Automatically print receipt after sale</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="require-customer"
                checked={transactionSettings.requireCustomerInfo}
                onCheckedChange={(checked) => handleInputChange('requireCustomerInfo', checked)}
              />
              <Label htmlFor="require-customer">Require customer information for sales</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="partial-payment"
                checked={transactionSettings.allowPartialPayment}
                onCheckedChange={(checked) => handleInputChange('allowPartialPayment', checked)}
              />
              <Label htmlFor="partial-payment">Allow partial payments</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">Default Payment Method</Label>
            <Select
              value={transactionSettings.defaultPaymentMethod}
              onValueChange={(value) => handleInputChange('defaultPaymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="transfer">Bank Transfer</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Transaction Settings</Button>
      </div>
    </div>
  );
};
