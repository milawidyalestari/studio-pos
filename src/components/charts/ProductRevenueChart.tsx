import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';

interface ProductData {
  productName: string;
  quantity: number;
  revenue: number;
}

interface DailyProductData {
  date: string;
  products: ProductData[];
}

interface ProductRevenueChartProps {
  data: DailyProductData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export const ProductRevenueChart: React.FC<ProductRevenueChartProps> = ({ data }) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [maxProducts, setMaxProducts] = useState<number>(5);

  // Get all unique products from the data
  const allProducts = useMemo(() => {
    const productSet = new Set<string>();
    data.forEach(day => {
      day.products.forEach(product => {
        productSet.add(product.productName);
      });
    });
    return Array.from(productSet).sort();
  }, [data]);

  // Get top products by total revenue
  const topProducts = useMemo(() => {
    const productTotals = new Map<string, number>();
    
    data.forEach(day => {
      day.products.forEach(product => {
        const current = productTotals.get(product.productName) || 0;
        productTotals.set(product.productName, current + product.revenue);
      });
    });

    return Array.from(productTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxProducts)
      .map(([name]) => name);
  }, [data, maxProducts]);

  // Transform data for chart
  const chartData = useMemo(() => {
    const productsToShow = selectedProducts.length > 0 ? selectedProducts : topProducts;
    
    return data.map(day => {
      const dayData: any = { date: day.date };
      
      productsToShow.forEach(productName => {
        const product = day.products.find(p => p.productName === productName);
        dayData[productName] = product ? product.revenue : 0;
      });
      
      return dayData;
    });
  }, [data, selectedProducts, topProducts]);

  const handleProductToggle = (productName: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productName)) {
        return prev.filter(p => p !== productName);
      } else {
        return [...prev, productName];
      }
    });
  };

  const handleMaxProductsChange = (value: string) => {
    setMaxProducts(parseInt(value));
    setSelectedProducts([]); // Reset selection when changing max products
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Pendapatan per Produk 7 Hari</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Belum ada data produk untuk ditampilkan</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Tidak ada data produk</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pendapatan per Produk 7 Hari</CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tampilkan:</label>
            <Select value={maxProducts.toString()} onValueChange={handleMaxProductsChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">produk teratas</span>
          </div>
          
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setSelectedProducts([])}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Reset ke produk teratas
            </button>
          )}
        </div>
        
        {/* Product selection */}
        <div className="flex flex-wrap gap-2 mt-2">
          {allProducts.map((product, index) => {
            const isSelected = selectedProducts.includes(product);
            const isTopProduct = topProducts.includes(product);
            const isVisible = selectedProducts.length === 0 ? isTopProduct : isSelected;
            
            return (
              <button
                key={product}
                onClick={() => handleProductToggle(product)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isVisible
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: isVisible ? COLORS[index % COLORS.length] + '20' : undefined,
                  borderColor: isVisible ? COLORS[index % COLORS.length] : undefined,
                  color: isVisible ? COLORS[index % COLORS.length] : undefined,
                }}
              >
                {product}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            />
            <YAxis tickFormatter={(value) => `${value / 1000000}Jt`} />
            <Tooltip 
              formatter={(value: any, name: any) => [
                formatCurrency(value), 
                name
              ]}
              labelFormatter={(date) => new Date(date).toLocaleDateString('id-ID')}
            />
            <Legend />
            {(selectedProducts.length > 0 ? selectedProducts : topProducts).map((productName, index) => (
              <Line
                key={productName}
                type="monotone"
                dataKey={productName}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                name={productName}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


