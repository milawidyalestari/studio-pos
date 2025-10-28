import { useMemo } from 'react';
import { useOrders } from './useOrders';
import { formatCurrency } from '@/utils/formatters';

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  thisWeekOrders: number;
  thisWeekRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  dailyRevenueData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  dailyProductData: Array<{
    date: string;
    products: Array<{
      productName: string;
      quantity: number;
      revenue: number;
    }>;
  }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export const useOrderAnalytics = () => {
  const { orders = [], isLoading, error } = useOrders({ enableAutoRefresh: false });

  const analytics = useMemo((): OrderAnalytics => {
    console.log('OrderAnalytics - Orders data:', orders);
    console.log('OrderAnalytics - Orders length:', orders?.length);
    
    if (!orders || orders.length === 0) {
      console.log('OrderAnalytics - No orders data, returning empty analytics');
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        todayOrders: 0,
        todayRevenue: 0,
        thisWeekOrders: 0,
        thisWeekRevenue: 0,
        thisMonthOrders: 0,
        thisMonthRevenue: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        orderStatusDistribution: [],
        dailyRevenueData: [],
        dailyProductData: [],
        recentOrders: [],
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate date ranges
    const isToday = (date: string) => {
      const orderDate = new Date(date);
      return orderDate >= today && orderDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    };

    const isThisWeek = (date: string) => {
      const orderDate = new Date(date);
      return orderDate >= startOfWeek && orderDate <= now;
    };

    const isThisMonth = (date: string) => {
      const orderDate = new Date(date);
      return orderDate >= startOfMonth && orderDate <= now;
    };

    // Basic calculations
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Today's data
    const todayOrders = orders.filter(order => isToday(order.created_at || order.tanggal || '')).length;
    const todayRevenue = orders
      .filter(order => isToday(order.created_at || order.tanggal || ''))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // This week's data
    const thisWeekOrders = orders.filter(order => isThisWeek(order.created_at || order.tanggal || '')).length;
    const thisWeekRevenue = orders
      .filter(order => isThisWeek(order.created_at || order.tanggal || ''))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // This month's data
    const thisMonthOrders = orders.filter(order => isThisMonth(order.created_at || order.tanggal || '')).length;
    const thisMonthRevenue = orders
      .filter(order => isThisMonth(order.created_at || order.tanggal || ''))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Status distribution
    const statusMap = new Map<string, number>();
    orders.forEach(order => {
      const status = order.order_statuses?.name || 'Unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const orderStatusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }));

    // Count orders by completion status
    const completedOrders = orders.filter(order => 
      order.order_statuses?.name?.toLowerCase().includes('selesai') ||
      order.order_statuses?.name?.toLowerCase().includes('completed')
    ).length;

    const pendingOrders = orders.filter(order => 
      !order.order_statuses?.name?.toLowerCase().includes('selesai') &&
      !order.order_statuses?.name?.toLowerCase().includes('completed') &&
      !order.order_statuses?.name?.toLowerCase().includes('cancel')
    ).length;

    const cancelledOrders = orders.filter(order => 
      order.order_statuses?.name?.toLowerCase().includes('cancel')
    ).length;

    // Daily revenue data for the last 7 days
    const dailyRevenueData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i)); // Start from 6 days ago, go to today
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || order.tanggal || '').toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      const revenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      console.log(`Daily data for ${dateStr}:`, {
        orders: dayOrders.length,
        revenue,
        dayOrders: dayOrders.map(o => ({ id: o.id, amount: o.total_amount, date: o.created_at || o.tanggal }))
      });

      return {
        date: dateStr,
        orders: dayOrders.length,
        revenue,
      };
    });
    
    console.log('Daily revenue data:', dailyRevenueData);

    // Daily product data for the last 7 days
    const dailyProductData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i)); // Start from 6 days ago, go to today
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at || order.tanggal || '').toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      // Group products by name for this day
      const productMap = new Map<string, { quantity: number; revenue: number }>();
      
      dayOrders.forEach(order => {
        if (order.order_items && Array.isArray(order.order_items)) {
          order.order_items.forEach((item: any) => {
            const productName = item.item_name || 'Unknown Product';
            const quantity = item.quantity || 0;
            const subTotal = item.sub_total || 0;
            
            const existing = productMap.get(productName) || { quantity: 0, revenue: 0 };
            existing.quantity += quantity;
            existing.revenue += subTotal;
            productMap.set(productName, existing);
          });
        }
      });

      const products = Array.from(productMap.entries()).map(([productName, data]) => ({
        productName,
        quantity: data.quantity,
        revenue: data.revenue,
      })).sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

      console.log(`Daily product data for ${dateStr}:`, products);

      return {
        date: dateStr,
        products,
      };
    });
    
    console.log('Daily product data:', dailyProductData);

    // Recent orders (last 10)
    const recentOrders = orders
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        order_number: order.order_number || '',
        customer_name: order.customer_name || 'Unknown',
        total_amount: order.total_amount || 0,
        status: order.order_statuses?.name || 'Unknown',
        created_at: order.created_at || order.tanggal || '',
      }));

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      todayOrders,
      todayRevenue,
      thisWeekOrders,
      thisWeekRevenue,
      thisMonthOrders,
      thisMonthRevenue,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      orderStatusDistribution,
      dailyRevenueData,
      dailyProductData,
      recentOrders,
    };
  }, [orders]);

  return {
    analytics,
    isLoading,
    error,
  };
};
