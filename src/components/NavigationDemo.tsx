import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Package, 
  BarChart3, 
  Database, 
  Settings, 
  Calculator,
  Truck,
  DollarSign,
  BookOpen
} from 'lucide-react';

const NavigationDemo = () => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Navigation Minimize Demo
          </CardTitle>
          <CardDescription>
            Test the new navigation minimize functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Navigation States</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Expanded:</strong> Full sidebar with labels</li>
                <li>• <strong>Collapsed:</strong> Sidebar with icons only</li>
                <li>• <strong>Minimized:</strong> Icon-only navigation bar</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-sm">
                <li>• Hamburger menu always visible</li>
                <li>• Tooltips on hover</li>
                <li>• Smooth transitions</li>
                <li>• Responsive design</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Controls</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Menu:</strong> Toggle collapse/expand</li>
                <li>• <strong>Minimize:</strong> Switch to icon mode</li>
                <li>• <strong>Expand:</strong> Return to full sidebar</li>
              </ul>
            </Card>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Available Pages</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { icon: LayoutDashboard, label: 'Dashboard', color: 'bg-blue-100 text-blue-700' },
                { icon: FileText, label: 'Orderan', color: 'bg-green-100 text-green-700' },
                { icon: Receipt, label: 'Transaksi', color: 'bg-purple-100 text-purple-700' },
                { icon: Calculator, label: 'Kasir', color: 'bg-orange-100 text-orange-700' },
                { icon: DollarSign, label: 'Keuangan', color: 'bg-emerald-100 text-emerald-700' },
                { icon: BookOpen, label: 'Akuntansi', color: 'bg-indigo-100 text-indigo-700' },
                { icon: Package, label: 'Inventory', color: 'bg-pink-100 text-pink-700' },
                { icon: Truck, label: 'Suppliers', color: 'bg-cyan-100 text-cyan-700' },
                { icon: BarChart3, label: 'Report', color: 'bg-amber-100 text-amber-700' },
                { icon: Database, label: 'Master Data', color: 'bg-red-100 text-red-700' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-700' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className={`p-3 rounded-lg ${item.color} text-center`}>
                    <Icon className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs font-medium">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationDemo;
