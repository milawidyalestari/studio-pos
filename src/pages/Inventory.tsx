import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle,
  Download,
  FileDown,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Inventory = () => {
  const inventory = [
    { code: 'BRG001', name: 'Vinyl Glossy', unit: 'Roll', initialStock: 50, inStock: 10, outStock: 5, finalStock: 55 },
    { code: 'BRG002', name: 'Banner Frontlite', unit: 'Roll', initialStock: 30, inStock: 5, outStock: 8, finalStock: 27 },
    { code: 'BRG003', name: 'Sticker Chromo', unit: 'Pack', initialStock: 100, inStock: 20, outStock: 15, finalStock: 105 },
    { code: 'BRG004', name: 'Canvas', unit: 'Roll', initialStock: 20, inStock: 5, outStock: 2, finalStock: 23 },
    { code: 'BRG005', name: 'HVS Paper', unit: 'Rim', initialStock: 150, inStock: 50, outStock: 30, finalStock: 170 },
  ];

  const lowStockItems = [
    { name: 'Vinyl Glossy', currentStock: 5, minStock: 10 },
    { name: 'Banner Frontlite', currentStock: 3, minStock: 8 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage your stock and inventory items</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]">
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 mb-3">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-orange-200">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Current stock: {item.currentStock}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Minimum stock: {item.minStock}</p>
                  <p className="text-sm font-medium text-orange-800">
                    {item.minStock - item.currentStock} units needed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search inventory..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vinyl">Vinyl</SelectItem>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="paper">Paper</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.initialStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">+{item.inStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">-{item.outStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">{item.finalStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;