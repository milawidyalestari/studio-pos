
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionsTab } from './program/TransactionsTab';
import { DevicesTab } from './program/DevicesTab';

export const ProgramSettings = () => {
  return (
    <Tabs defaultValue="transactions" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="devices">Devices</TabsTrigger>
      </TabsList>

      <TabsContent value="transactions" className="space-y-4">
        <TransactionsTab />
      </TabsContent>

      <TabsContent value="devices" className="space-y-4">
        <DevicesTab />
      </TabsContent>
    </Tabs>
  );
};
