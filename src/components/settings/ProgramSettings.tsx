
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessInfoTab } from './program/BusinessInfoTab';
import { TransactionsTab } from './program/TransactionsTab';
import { DevicesTab } from './program/DevicesTab';

export const ProgramSettings = () => {
  return (
    <Tabs defaultValue="business" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="business">Business Info</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="devices">Devices</TabsTrigger>
      </TabsList>

      <TabsContent value="business" className="space-y-4">
        <BusinessInfoTab />
      </TabsContent>

      <TabsContent value="transactions" className="space-y-4">
        <TransactionsTab />
      </TabsContent>

      <TabsContent value="devices" className="space-y-4">
        <DevicesTab />
      </TabsContent>
    </Tabs>
  );
};
