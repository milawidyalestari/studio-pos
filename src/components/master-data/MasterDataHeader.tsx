
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const MasterDataHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
        <p className="text-gray-600">Manage all foundational data for your business</p>
      </div>
    </div>
  );
};
