
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
    receiptPrefix: 'DPS',
    autoNumbering: true,
    printAfterSale: true
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
          <CardTitle>Basic Settings</CardTitle>
          <CardDescription>Essential transaction configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={transactionSettings.defaultCurrency}
                onValueChange={(value) => handleInputChange('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
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
              <Label htmlFor="receipt-prefix">Receipt Prefix</Label>
              <Input
                id="receipt-prefix"
                value={transactionSettings.receiptPrefix}
                onChange={(e) => handleInputChange('receiptPrefix', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-numbering"
                checked={transactionSettings.autoNumbering}
                onCheckedChange={(checked) => handleInputChange('autoNumbering', checked)}
              />
              <Label htmlFor="auto-numbering">Auto numbering</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="print-after-sale"
                checked={transactionSettings.printAfterSale}
                onCheckedChange={(checked) => handleInputChange('printAfterSale', checked)}
              />
              <Label htmlFor="print-after-sale">Print receipt after sale</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};
