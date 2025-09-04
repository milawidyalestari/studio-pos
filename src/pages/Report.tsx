import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Search,
  Calendar,
  Receipt,
  BarChart3,
  ChevronDown,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Edit,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from '@/hooks/useOrders';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';

import { useQuery } from '@tanstack/react-query';
import { databaseManager } from '@/lib/database-manager';
import RequestOrderModal from '@/components/RequestOrderModal';

// Import libraries for export functionality
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const [activeTab, setActiveTab] = useState('daily-orders');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Search state - separate for each tab
  const [searchTerm, setSearchTerm] = useState({
    dailyOrders: '',
    sales: '',
    transactions: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any>(null);
  
  // State for view order items modal
  const [isViewItemsModalOpen, setIsViewItemsModalOpen] = useState(false);
  const [selectedOrderForItems, setSelectedOrderForItems] = useState<any>(null);
  
  // Filter state - separate for each tab
  const [filterOpen, setFilterOpen] = useState({
    dailyOrders: false,
    sales: false,
    transactions: false
  });
  const [dateMode, setDateMode] = useState({
    dailyOrders: 'single' as 'single' | 'range',
    sales: 'single' as 'single' | 'range',
    transactions: 'single' as 'single' | 'range'
  });
  const [singleDate, setSingleDate] = useState({
    dailyOrders: new Date() as Date | undefined, // Default to today for daily orders
    sales: new Date() as Date | undefined, // Default to today for sales
    transactions: new Date() as Date | undefined // Default to today for transactions
  });
  const [range, setRange] = useState({
    dailyOrders: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    sales: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    transactions: { from: undefined as Date | undefined, to: undefined as Date | undefined }
  });
  const [filterField, setFilterField] = useState({
    dailyOrders: 'tanggal', // Default to date filter for daily orders
    sales: 'tanggal', // Default to date filter for sales
    transactions: 'tanggal' // Default to date filter for transactions
  });
  const [filterValue, setFilterValue] = useState({
    dailyOrders: '',
    sales: '',
    transactions: ''
  });
  
  const { toast } = useToast();
  const { orders, isLoading, refetch, isFetching } = useOrders({ enableAutoRefresh: false });
  const { data: orderStatuses, isLoading: statusesLoading } = useOrderStatus();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  // Data loaded effect
  useEffect(() => {
    // Data has been loaded
  }, [products, categories, categoriesLoading, orders]);
  const { data: dbInfo } = useQuery({
    queryKey: ['database-info'],
    queryFn: async () => {
      return await databaseManager.getInfo();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Function to handle edit order
  const handleEditOrder = (order: any) => {
    // Validate order data
    if (!order || !order.order_number) {
      toast({
        title: "Error",
        description: "Data order tidak valid",
        variant: "destructive"
      });
      return;
    }

    // Set the selected order and open modal
    
    // Set the selected order and open modal
    setSelectedOrderForEdit(order);
    setIsEditModalOpen(true);
  };

  // Function to close edit modal
  const handleCloseEditModal = () => {
    // Close modal and clear data
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
  };

  // Function to handle view order items
  const handleViewOrderItems = (order: any) => {
    // Set the selected order and open modal
    setSelectedOrderForItems(order);
    setIsViewItemsModalOpen(true);
  };

  // Function to close view items modal
  const handleCloseViewItemsModal = () => {
    // Close modal and clear data
    setIsViewItemsModalOpen(false);
    setSelectedOrderForItems(null);
  };

  // Reset filter field when tab changes to ensure it's appropriate for the current tab
  useEffect(() => {
    const defaultFields = {
      'daily-orders': 'tanggal', // Keep date filter for daily orders
      'sales': 'tanggal',
      'transactions': 'tanggal'
    };
    
    setFilterField(prev => ({
      ...prev,
      [activeTab === 'daily-orders' ? 'dailyOrders' : 
       activeTab === 'sales' ? 'sales' : 'transactions']: defaultFields[activeTab as keyof typeof defaultFields]
    }));
    
    // Also reset filter values when tab changes, but preserve date for daily orders
    setFilterValue(prev => ({
      ...prev,
      [activeTab === 'daily-orders' ? 'dailyOrders' : 
       activeTab === 'sales' ? 'sales' : 'transactions']: ''
    }));
  }, [activeTab]);

  // Set default filter only when component first mounts (not when switching tabs)
  useEffect(() => {
    // Only set default filter for daily orders when component first loads
    // This ensures the filter doesn't reset when switching between tabs
    const hasInitialized = sessionStorage.getItem('dailyOrdersFilterInitialized');
    
    if (!hasInitialized) {
      setSingleDate(prev => ({
        ...prev,
        dailyOrders: new Date()
      }));
      setFilterField(prev => ({
        ...prev,
        dailyOrders: 'tanggal'
      }));
      
      // Mark as initialized
      sessionStorage.setItem('dailyOrdersFilterInitialized', 'true');
    }
  }, []); // Empty dependency array means this only runs once when component mounts

  // Helper function to check if date matches filter
  const matchesDateFilter = (orderDate: string) => {
    if (!orderDate) return false;
    
    const today = new Date();
    const orderDateObj = new Date(orderDate);
    
    // Normalize dates to start of day for accurate comparison
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };
    
    const normalizedToday = normalizeDate(today);
    const normalizedOrderDate = normalizeDate(orderDateObj);
    
    // Check custom date range first
    if (dateFilter === 'custom' && customDateRange.from) {
      const fromDate = normalizeDate(customDateRange.from);
      const toDate = customDateRange.to ? normalizeDate(customDateRange.to) : fromDate;
      return normalizedOrderDate >= fromDate && normalizedOrderDate <= toDate;
    }
    
    switch (dateFilter) {
      case 'all':
        return true; // Show all orders regardless of date
      case 'today':
        return normalizedOrderDate.getTime() === normalizedToday.getTime();
      case 'yesterday': {
        const yesterday = new Date(normalizedToday);
        yesterday.setDate(normalizedToday.getDate() - 1);
        return normalizedOrderDate.getTime() === yesterday.getTime();
      }
      case 'week': {
        const weekStart = new Date(normalizedToday);
        weekStart.setDate(normalizedToday.getDate() - normalizedToday.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return normalizedOrderDate >= weekStart && normalizedOrderDate <= weekEnd;
      }
      case 'month':
        return normalizedOrderDate.getMonth() === normalizedToday.getMonth() && 
               normalizedOrderDate.getFullYear() === normalizedToday.getFullYear();
      case 'quarter': {
        const currentQuarter = Math.floor(normalizedToday.getMonth() / 3);
        const orderQuarter = Math.floor(normalizedOrderDate.getMonth() / 3);
        return orderQuarter === currentQuarter && 
               normalizedOrderDate.getFullYear() === normalizedToday.getFullYear();
      }
      case 'year':
        return normalizedOrderDate.getFullYear() === normalizedToday.getFullYear();
      default:
        return true;
    }
  };

  // Helper function to get current search term based on active tab
  const getCurrentSearchTerm = () => {
    switch (activeTab) {
      case 'daily-orders':
        return searchTerm.dailyOrders;
      case 'sales':
        return searchTerm.sales;
      case 'transactions':
        return searchTerm.transactions;
      default:
        return '';
    }
  };

  // Helper function to update current search term based on active tab
  const setCurrentSearchTerm = (value: string) => {
    switch (activeTab) {
      case 'daily-orders':
        setSearchTerm(prev => ({ ...prev, dailyOrders: value }));
        break;
      case 'sales':
        setSearchTerm(prev => ({ ...prev, sales: value }));
        break;
      case 'transactions':
        setSearchTerm(prev => ({ ...prev, transactions: value }));
        break;
    }
  };

  // Enhanced filtering logic for each tab
  const getFilteredData = useMemo(() => {
    if (!orders) return { dailyOrders: [], sales: [], transactions: [] };



    const baseFiltered = orders.filter(order => {
      // Global search filter - different logic for each tab
      const currentSearchTerm = getCurrentSearchTerm();
      let matchesSearch = true;
      
      if (currentSearchTerm && currentSearchTerm.trim() !== '') {
        const searchLower = currentSearchTerm.toLowerCase();
        
        if (activeTab === 'sales') {
          // For sales tab, search in products and categories
          matchesSearch = order.order_items?.some(item => {
            if (products && item.item_name) {
              const product = products.find(p => p.kode === item.item_name);
              if (product) {
                // Search in product name
                if (product.nama && product.nama.toLowerCase().includes(searchLower)) return true;
                // Search in product code
                if (product.kode && product.kode.toLowerCase().includes(searchLower)) return true;
                // Search in category
                if (product.category_id && categories && categories.length > 0) {
                  const category = categories.find(c => c.id === product.category_id);
                  if (category && category.category_name.toLowerCase().includes(searchLower)) return true;
                }
                // Search in jenis (fallback)
                if (product.jenis && product.jenis.toLowerCase().includes(searchLower)) return true;
              }
            }
            // Fallback to item name
            return item.item_name && item.item_name.toLowerCase().includes(searchLower);
          }) || false;
        } else {
          // For other tabs, search in order number and customer name
          matchesSearch = 
            order.order_number?.toLowerCase().includes(searchLower) ||
            order.customer_name?.toLowerCase().includes(searchLower);
        }
      }
    
      // Global status filter
      const actualStatus = order.order_statuses?.name || 'Unknown';
      const matchesStatus = statusFilter === 'all' || 
        actualStatus.toLowerCase() === statusFilter.toLowerCase();
    
      // Global date filter
      const matchesGlobalDate = matchesDateFilter(order.created_at || '');
      
      return matchesSearch && matchesStatus && matchesGlobalDate;
    });



    // Tab-specific filtering
    const dailyOrdersFiltered = baseFiltered.filter(order => {
      if (filterField.dailyOrders === 'tanggal') {
        if (dateMode.dailyOrders === 'single' && singleDate.dailyOrders) {
          const orderDate = new Date(order.created_at || '');
          const filterDate = new Date(singleDate.dailyOrders);
          return orderDate.toDateString() === filterDate.toDateString();
        } else if (dateMode.dailyOrders === 'range' && range.dailyOrders.from && range.dailyOrders.to) {
          const orderDate = new Date(order.created_at || '');
          const fromDate = new Date(range.dailyOrders.from);
          const toDate = new Date(range.dailyOrders.to);
          return orderDate >= fromDate && orderDate <= toDate;
        }
      } else if (filterField.dailyOrders === 'order_number' && filterValue.dailyOrders) {
        return order.order_number?.toLowerCase().includes(filterValue.dailyOrders.toLowerCase());
      } else if (filterField.dailyOrders === 'customer_name' && filterValue.dailyOrders) {
        return order.customer_name?.toLowerCase().includes(filterValue.dailyOrders.toLowerCase());
      } else if (filterField.dailyOrders === 'estimasi' && filterValue.dailyOrders) {
        // Handle estimasi date filtering
        if (dateMode.dailyOrders === 'single' && singleDate.dailyOrders) {
          const estimasiDate = new Date(order.estimasi || '');
          const filterDate = new Date(singleDate.dailyOrders);
          return estimasiDate.toDateString() === filterDate.toDateString();
        } else if (dateMode.dailyOrders === 'range' && range.dailyOrders.from && range.dailyOrders.to) {
          const estimasiDate = new Date(order.estimasi || '');
          const fromDate = new Date(range.dailyOrders.from);
          const toDate = new Date(range.dailyOrders.to);
          return estimasiDate >= fromDate && estimasiDate <= toDate;
        }
      } else if (filterField.dailyOrders === 'order_status' && filterValue.dailyOrders) {
        return order.order_statuses?.name?.toLowerCase().includes(filterValue.dailyOrders.toLowerCase());
      } else if (filterField.dailyOrders === 'desainer' && filterValue.dailyOrders) {
        return order.desainer?.nama?.toLowerCase().includes(filterValue.dailyOrders.toLowerCase());
      }
      
      return true;
    });

    const salesFiltered = baseFiltered.filter(order => {
      if (filterField.sales === 'tanggal') {
        if (dateMode.sales === 'single' && singleDate.sales) {
          const orderDate = new Date(order.created_at || '');
          const filterDate = new Date(singleDate.sales);
          return orderDate.toDateString() === filterDate.toDateString();
        } else if (dateMode.sales === 'range' && range.sales.from && range.sales.to) {
          const orderDate = new Date(order.created_at || '');
          const fromDate = new Date(range.sales.from);
          const toDate = new Date(range.sales.to);
          return orderDate >= fromDate && orderDate <= toDate;
        }
      } else if (filterField.sales === 'product_name' && filterValue.sales) {
        return order.order_items?.some(item => {
          if (products && item.item_name) {
            const product = products.find(p => p.kode === item.item_name);
            const productName = product?.nama || product?.kode || item.item_name;
            const matches = productName.toLowerCase().includes(filterValue.sales.toLowerCase());
            return matches;
          }
          return item.item_name?.toLowerCase().includes(filterValue.sales.toLowerCase());
        });
      } else if (filterField.sales === 'category' && filterValue.sales) {
        const filterLower = filterValue.sales.toLowerCase().trim();
        
        // Check if this order has any items that match the category filter
        const hasMatchingItems = order.order_items?.some(item => {

          
          if (products && item.item_name) {
            const product = products.find(p => p.kode === item.item_name);

            
            if (product) {
              // Priority 1: Get category from categories table using category_id
              if (product.category_id && categories && categories.length > 0) {
                const category = categories.find(c => c.id === product.category_id);

                
                if (category && category.category_name) {
                  const categoryName = category.category_name.toLowerCase();
                  const matches = categoryName.includes(filterLower) || filterLower.includes(categoryName);
                  if (matches) {
                    return true;
                  }
                }
              }
              
              // Priority 2: Try to match jenis with existing category names (case-insensitive)
              if (product.jenis && product.jenis.trim() !== '' && categories && categories.length > 0) {

                
                // Try exact match first
                let matchedCategory = categories.find(c => 
                  c.category_name.toLowerCase() === product.jenis.toLowerCase()
                );
                
                // If no exact match, try partial match
                if (!matchedCategory) {
                  matchedCategory = categories.find(c => 
                    c.category_name.toLowerCase().includes(product.jenis.toLowerCase()) ||
                    product.jenis.toLowerCase().includes(c.category_name.toLowerCase())
                  );
                }
                
                if (matchedCategory && matchedCategory.category_name) {
                  const matchedCategoryName = matchedCategory.category_name.toLowerCase();
                  const matches = matchedCategoryName.includes(filterLower) || filterLower.includes(matchedCategoryName);
                  if (matches) {
                    return true;
                  }
                }
              }
              
              // Priority 3: Use jenis as fallback (only if no category found)
              if (product.jenis && product.jenis.trim() !== '') {
                const jenisLower = product.jenis.toLowerCase();
                const matches = jenisLower.includes(filterLower) || filterLower.includes(jenisLower);
                if (matches) {
                  return true;
                }
              }
            }
          }
          return false;
        });
        

        return hasMatchingItems;
      }
      
      return true;
    });



    const transactionsFiltered = baseFiltered.filter(order => {
      if (filterField.transactions === 'tanggal') {
        if (dateMode.transactions === 'single' && singleDate.transactions) {
          const filterDate = new Date(singleDate.transactions);
          const filterDateStr = filterDate.toDateString();
          
          // Gunakan payment_update untuk filtering transaksi
          const paymentUpdateDate = new Date(order.payment_update || order.created_at || '');
          return paymentUpdateDate.toDateString() === filterDateStr;
        } else if (dateMode.transactions === 'range' && range.transactions.from && range.transactions.to) {
          const fromDate = new Date(range.transactions.from);
          const toDate = new Date(range.transactions.to);
          
          // Gunakan payment_update untuk filtering transaksi
          const paymentUpdateDate = new Date(order.payment_update || order.created_at || '');
          return paymentUpdateDate >= fromDate && paymentUpdateDate <= toDate;
        }
      } else if (filterField.transactions === 'order_number' && filterValue.transactions) {
        return order.order_number?.toLowerCase().includes(filterValue.transactions.toLowerCase());
      } else if (filterField.transactions === 'customer_name' && filterValue.transactions) {
        return order.customer_name?.toLowerCase().includes(filterValue.transactions.toLowerCase());
      } else if (filterField.transactions === 'estimasi' && filterValue.transactions) {
        if (dateMode.transactions === 'single' && singleDate.transactions) {
          const estimasiDate = new Date(order.estimasi || '');
          const filterDate = new Date(singleDate.transactions);
          return estimasiDate.toDateString() === filterDate.toDateString();
        } else if (dateMode.transactions === 'range' && range.transactions.from && range.transactions.to) {
          const estimasiDate = new Date(order.estimasi || '');
          const fromDate = new Date(range.transactions.from);
          const toDate = new Date(range.transactions.to);
          return estimasiDate >= fromDate && estimasiDate <= toDate;
        }
      } else if (filterField.transactions === 'status' && filterValue.transactions) {
        return order.order_statuses?.name?.toLowerCase().includes(filterValue.transactions.toLowerCase());
      } else if (filterField.transactions === 'category' && filterValue.transactions) {
        return order.order_items?.some(item => {
          if (products && item.item_name) {
            const product = products.find(p => p.kode === item.item_name);
            const productName = product?.nama || product?.kode || item.item_name;
            return productName.toLowerCase().includes(filterValue.transactions.toLowerCase());
          }
          return item.item_name?.toLowerCase().includes(filterValue.transactions.toLowerCase());
        });
      } else if (filterField.transactions === 'total' && filterValue.transactions) {
        return order.total_amount?.toString().includes(filterValue.transactions);
      }
      
      return true;
    });

    return {
      dailyOrders: dailyOrdersFiltered,
      sales: salesFiltered,
      transactions: transactionsFiltered
    };
  }, [orders, searchTerm, statusFilter, dateFilter, customDateRange, filterField, filterValue, dateMode, singleDate, range, products, categories, activeTab, matchesDateFilter, getCurrentSearchTerm]);

  // Get filter fields for each tab based on active tab
  const getFilterFieldsForTab = (tabName: string) => {
    switch (tabName) {
      case 'daily-orders':
        return [
          { value: 'order_number', label: 'Nomor Orderan' },
          { value: 'customer_name', label: 'Customer' },
          { value: 'tanggal', label: 'Tanggal Order' },
          { value: 'estimasi', label: 'Deadline' },
          { value: 'order_status', label: 'Status Order' },
          { value: 'desainer', label: 'Designer' }
        ];
      case 'sales':
        return [
          { value: 'tanggal', label: 'Tanggal Order' },
          { value: 'product_name', label: 'Produk' },
          { value: 'category', label: 'Kategori' }
        ];
      case 'transactions':
        return [
          { value: 'order_number', label: 'Nomor Orderan' },
          { value: 'customer_name', label: 'Customer' },
          { value: 'tanggal', label: 'Tanggal Order' },
          { value: 'estimasi', label: 'Deadline' },
          { value: 'status', label: 'Status Order' },
          { value: 'category', label: 'Kategori Produk' },
          { value: 'total', label: 'Total Transaksi' }
        ];
      default:
        return [];
    }
  };

  // Get current filter fields based on active tab
  const currentFilterFields = getFilterFieldsForTab(activeTab);

  // Get current filter field and value based on active tab
  const getCurrentFilterField = () => {
    const result = (() => {
      switch (activeTab) {
        case 'daily-orders':
          return filterField.dailyOrders;
        case 'sales':
          return filterField.sales;
        case 'transactions':
          return filterField.transactions;
        default:
          return 'customer_name';
      }
    })();
    

    return result;
  };

  const getCurrentFilterValue = () => {
    const result = (() => {
      switch (activeTab) {
        case 'daily-orders':
          return filterValue.dailyOrders;
        case 'sales':
          return filterValue.sales;
        case 'transactions':
          return filterValue.transactions;
        default:
          return '';
      }
    })();
    

    return result;
  };

  const setCurrentFilterField = (value: string) => {
    switch (activeTab) {
      case 'daily-orders':
        setFilterField(prev => ({ ...prev, dailyOrders: value }));
        break;
      case 'sales':
        setFilterField(prev => {
          const newState = { ...prev, sales: value };
          return newState;
        });
        break;
      case 'transactions':
        setFilterField(prev => ({ ...prev, transactions: value }));
        break;
    }
  };

  const setCurrentFilterValue = (value: string) => {
    switch (activeTab) {
      case 'daily-orders':
        setFilterValue(prev => ({ ...prev, dailyOrders: value }));
        break;
      case 'sales':
        setFilterValue(prev => {
          const newState = { ...prev, sales: value };
          return newState;
        });
        break;
      case 'transactions':
        setFilterValue(prev => ({ ...prev, transactions: value }));
        break;
    }
  };

  // Get current date mode and single date based on active tab
  const getCurrentDateMode = () => {
    switch (activeTab) {
      case 'daily-orders':
        return dateMode.dailyOrders;
      case 'sales':
        return dateMode.sales;
      case 'transactions':
        return dateMode.transactions;
      default:
        return 'single';
    }
  };

  const getCurrentSingleDate = () => {
    switch (activeTab) {
      case 'daily-orders':
        return singleDate.dailyOrders;
      case 'sales':
        return singleDate.sales;
      case 'transactions':
        return singleDate.transactions;
      default:
        return undefined;
    }
  };

  const getCurrentRange = () => {
    switch (activeTab) {
      case 'daily-orders':
        return range.dailyOrders;
      case 'sales':
        return range.sales;
      case 'transactions':
        return range.transactions;
      default:
        return { from: undefined, to: undefined };
    }
  };

  const setCurrentDateMode = (value: 'single' | 'range') => {
    switch (activeTab) {
      case 'daily-orders':
        setDateMode(prev => ({ ...prev, dailyOrders: value }));
        break;
      case 'sales':
        setDateMode(prev => ({ ...prev, sales: value }));
        break;
      case 'transactions':
        setDateMode(prev => ({ ...prev, transactions: value }));
        break;
    }
  };

  const setCurrentSingleDate = (date: Date | undefined) => {
    switch (activeTab) {
      case 'daily-orders':
        setSingleDate(prev => ({ ...prev, dailyOrders: date }));
        break;
      case 'sales':
        setSingleDate(prev => ({ ...prev, sales: date }));
        break;
      case 'transactions':
        setSingleDate(prev => ({ ...prev, transactions: date }));
        break;
    }
  };

  const setCurrentRange = (rangeValue: { from: Date | undefined; to: Date | undefined }) => {
    switch (activeTab) {
      case 'daily-orders':
        setRange(prev => ({ ...prev, dailyOrders: rangeValue }));
        break;
      case 'sales':
        setRange(prev => ({ ...prev, sales: rangeValue }));
        break;
      case 'transactions':
        setRange(prev => ({ ...prev, transactions: rangeValue }));
        break;
    }
  };

  // Check if filter is active for current tab
  const isCurrentFilterActive = () => {
    const currentField = getCurrentFilterField();
    const currentValue = getCurrentFilterValue();
    const currentDateMode = getCurrentDateMode();
    const currentSingleDate = getCurrentSingleDate();
    const currentRange = getCurrentRange();
    
    if (currentField === 'tanggal') {
      // For date filter, check if there's a specific date selected (not just default today)
      if (currentDateMode === 'single') {
        // Check if single date is set and not just default today
        if (currentSingleDate) {
          const today = new Date();
          const todayStr = today.toDateString();
          const selectedStr = currentSingleDate.toDateString();
          return todayStr !== selectedStr; // Active if not today
        }
      } else if (currentDateMode === 'range') {
        // Check if range is set
        return !!(currentRange.from && currentRange.to);
      }
      return false;
    } else {
      // For other fields, check if value is not empty
      return currentValue.trim() !== '';
    }
  };

  // Check if daily orders filter is active (including default filter)
  const isDailyOrdersFilterActive = () => {
    if (activeTab === 'daily-orders') {
      const currentField = getCurrentFilterField();
      if (currentField === 'tanggal') {
        const currentDateMode = getCurrentDateMode();
        const currentSingleDate = getCurrentSingleDate();
        const currentRange = getCurrentRange();
        return (currentDateMode === 'single' && currentSingleDate) ||
               (currentDateMode === 'range' && currentRange.from && currentRange.to);
      }
    }
    return false;
  };

  // Check if sales filter is active (including default filter)
  const isSalesFilterActive = () => {
    if (activeTab === 'sales') {
      const currentField = getCurrentFilterField();
      if (currentField === 'tanggal') {
        const currentDateMode = getCurrentDateMode();
        const currentSingleDate = getCurrentSingleDate();
        const currentRange = getCurrentRange();
        return (currentDateMode === 'single' && currentSingleDate) ||
               (currentDateMode === 'range' && currentRange.from && currentRange.to);
      } else if (currentField === 'product_name' || currentField === 'category') {
        return getCurrentFilterValue() !== '';
      }
    }
    return false;
  };

  // Check if transactions filter is active (including default filter)
  const isTransactionsFilterActive = () => {
    if (activeTab === 'transactions') {
      const currentField = getCurrentFilterField();
      if (currentField === 'tanggal') {
        const currentDateMode = getCurrentDateMode();
        const currentSingleDate = getCurrentSingleDate();
        const currentRange = getCurrentRange();
        return (currentDateMode === 'single' && currentSingleDate) ||
               (currentDateMode === 'range' && currentRange.from && currentRange.to);
      } else if (currentField === 'customer_name' || currentField === 'category') {
        return getCurrentFilterValue() !== '';
      }
    }
    return false;
  };

  // Helper function to get product category with smart matching
  const getProductCategory = (itemName: string, products: any[], categories: any[]) => {
    // Strategy 1: Try exact match with kode
    let product = products.find(p => p.kode === itemName);
    
    // Strategy 2: Try partial match with kode
    if (!product) {
      product = products.find(p => p.kode.includes(itemName) || itemName.includes(p.kode));
    }
    
    // Strategy 3: Try match with nama
    if (!product) {
      product = products.find(p => p.nama && p.nama.toLowerCase().includes(itemName.toLowerCase()));
    }
    
    // Strategy 4: Try reverse match
    if (!product) {
      product = products.find(p => p.nama && itemName.toLowerCase().includes(p.nama.toLowerCase()));
    }
    
    if (product) {
      // Priority 1: Get category from categories table using category_id
      if (product.category_id && categories && categories.length > 0) {
        const category = categories.find(c => c.id === product.category_id);
        if (category && category.category_name) {
          return { name: product.nama || product.kode, category: category.category_name };
        }
      }
      
      // Priority 2: Try to match jenis with existing category names (case-insensitive)
      if (product.jenis && product.jenis.trim() !== '' && categories && categories.length > 0) {
        // Try exact match first
        let matchedCategory = categories.find(c => 
          c.category_name.toLowerCase() === product.jenis.toLowerCase()
        );
        
        // If no exact match, try partial match
        if (!matchedCategory) {
          matchedCategory = categories.find(c => 
            c.category_name.toLowerCase().includes(product.jenis.toLowerCase()) ||
            product.jenis.toLowerCase().includes(c.category_name.toLowerCase())
          );
        }
        
        if (matchedCategory && matchedCategory.category_name) {
          return { name: product.nama || product.kode, category: matchedCategory.category_name };
        }
      }
      
      // Priority 3: Use jenis as fallback (only if no category found)
      if (product.jenis && product.jenis.trim() !== '') {
        return { name: product.nama || product.kode, category: product.jenis };
      }
      
      // Return product with unknown category
      return { name: product.nama || product.kode, category: 'Kategori Tidak Diketahui' };
    }
    
    // Product not found, return item_name with unknown category
    return { name: itemName, category: 'Kategori Tidak Diketahui' };
  };

  // Calculate real sales data from filtered orders
  const calculateSalesData = () => {
    const filteredSalesOrders = getFilteredData.sales;
    
    if (!filteredSalesOrders || filteredSalesOrders.length === 0) {
      return [];
    }

    const productSales: { [key: string]: { quantity: number; revenue: number; category: string } } = {};

    filteredSalesOrders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          if (products && item.item_name) {
            const productInfo = getProductCategory(item.item_name, products, categories || []);
            
            if (!productSales[productInfo.name]) {
              productSales[productInfo.name] = { quantity: 0, revenue: 0, category: productInfo.category };
            }
            productSales[productInfo.name].quantity += Number(item.quantity) || 0;
            productSales[productInfo.name].revenue += Number(item.sub_total) || 0;
          }
        });
      }
    });



    // Apply additional filtering based on search term and filter field for sales tab
    let filteredProductSales = Object.entries(productSales);
    
    // Get current search term and filter for sales tab
    const currentSearchTerm = searchTerm.sales;
    const currentFilterField = filterField.sales;
    const currentFilterValue = filterValue.sales;
    

    
    // Apply search term filtering (global search for sales tab)
    if (currentSearchTerm && currentSearchTerm.trim() !== '') {
      const searchLower = currentSearchTerm.toLowerCase();
      filteredProductSales = filteredProductSales.filter(([product, data]) => {
        // Search in product name
        if (product.toLowerCase().includes(searchLower)) return true;
        // Search in category
        if (data.category.toLowerCase().includes(searchLower)) return true;
        return false;
      });

    }
    
    // Apply field-specific filtering
    if (currentFilterValue && currentFilterValue.trim() !== '') {
      const filterLower = currentFilterValue.toLowerCase();
      
      filteredProductSales = filteredProductSales.filter(([product, data]) => {
        if (currentFilterField === 'product_name') {
          const matches = product.toLowerCase().includes(filterLower);
          return matches;
        } else if (currentFilterField === 'category') {
          const matches = data.category.toLowerCase().includes(filterLower);
          return matches;
        }
        return true;
      });

    }

    return filteredProductSales
      .map(([product, data]) => ({
        product,
        category: data.category,
        quantity: data.quantity,
        revenue: data.revenue.toLocaleString('id-ID'),
        growth: '+0%' // You can calculate this vs previous period
      }))
      .sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending
      .slice(0, 10); // Top 10 products
  };

  const salesData = useMemo(() => calculateSalesData(), [
    getFilteredData.sales,
    products,
    categories,
    searchTerm.sales,
    filterField.sales,
    filterValue.sales
  ]);

  // Calculate totals for summary cards based on filtered data
  const calculateTotals = () => {
    const dailyOrdersTotal = getFilteredData.dailyOrders.length;
    const salesTotal = getFilteredData.sales.length;
    const transactionsTotal = getFilteredData.transactions.length;
    
    const dailyOrdersRevenue = getFilteredData.dailyOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const salesRevenue = getFilteredData.sales.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const transactionsRevenue = getFilteredData.transactions.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    const salesQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      dailyOrders: {
        totalOrders: dailyOrdersTotal,
        totalRevenue: dailyOrdersRevenue,
        averagePerOrder: dailyOrdersTotal > 0 ? dailyOrdersRevenue / dailyOrdersTotal : 0
      },
      sales: {
        totalProducts: salesQuantity,
        totalRevenue: salesRevenue,
        averagePerProduct: salesQuantity > 0 ? salesRevenue / salesQuantity : 0
      },
      transactions: {
        totalTransactions: transactionsTotal,
        totalRevenue: transactionsRevenue,
        averagePerTransaction: transactionsTotal > 0 ? transactionsRevenue / transactionsTotal : 0
      }
    };
  };

  const totals = calculateTotals();

  // Helper function to format date range display
  const formatDateRange = () => {
    if (dateFilter === 'custom' && customDateRange.from) {
      if (customDateRange.to) {
        return `${customDateRange.from.toLocaleDateString('id-ID')} - ${customDateRange.to.toLocaleDateString('id-ID')}`;
      }
      return customDateRange.from.toLocaleDateString('id-ID');
    }
    
    switch (dateFilter) {
      case 'all': return 'Semua Order';
      case 'today': return 'Hari Ini';
      case 'yesterday': return 'Kemarin';
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      case 'quarter': return 'Kuartal Ini';
      case 'year': return 'Tahun Ini';
      default: return 'Semua Tanggal';
    }
  };

  // Handle calendar date selection
  const handleCalendarSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setCustomDateRange(range);
      setDateFilter('custom');
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
  };

  // Use filtered transaction data
  const transactionData = getFilteredData.transactions
    .filter(order => {
      // Filter untuk hanya menampilkan orderan yang memenuhi kriteria tertentu
      const status = order.order_statuses?.name || '';
      const hasDownPayment = Number(order.down_payment) > 0;
      const hasPelunasan = Number(order.pelunasan) > 0;
      const notaPrinted = order.receipt_printed === true;
      
      // Kriteria: status Done/Selesai-Diambil, sudah DP, sudah pelunasan, atau nota sudah di print
      return (
        status.toLowerCase().includes('done') ||
        status.toLowerCase().includes('selesai') ||
        status.toLowerCase().includes('diambil') ||
        hasDownPayment ||
        hasPelunasan ||
        notaPrinted
      );
    })
    .map(order => ({
      id: order.order_number || 'N/A',
      customer: order.customer_name || 'N/A',
      // Gunakan payment_update untuk tanggal transaksi
      date: order.payment_update ? new Date(order.payment_update).toLocaleDateString('id-ID') : 
            (order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A'),
      status: order.order_statuses?.name || 'Unknown',
      category: (() => {
        const firstItem = order.order_items?.[0];
        if (!firstItem) return 'N/A';
        
        // Get the actual product name from products database
        let itemName = 'N/A';
        
        if (products && firstItem.item_name) {
          const product = products.find(p => p.kode === firstItem.item_name);
          if (product) {
            itemName = product.nama || product.kode || 'N/A';
          } else {
            // Fallback to item_name if product not found in database
            itemName = firstItem.item_name;
          }
        }
        
        return itemName;
      })(),
      paymentStatus: (() => {
        // Use the same payment status logic as Transaction page
        const uangMuka = Number(order.down_payment) || 0;
        const pelunasan = Number(order.pelunasan) || 0;
        const totalOrder = Number(order.total_amount) || 0;
        
        if (totalOrder <= 0) return 'N/A';
        
        if (uangMuka === 0 && pelunasan === 0) return 'Belum Dibayar';
        else if (uangMuka + pelunasan < totalOrder) return 'Belum Lunas';
        else if (uangMuka + pelunasan >= totalOrder) return 'Lunas';
        else return 'Belum Dibayar';
      })(),
      downPayment: Number(order.down_payment) || 0,
      pelunasan: Number(order.pelunasan) || 0,
      total: (order.total_amount || 0).toLocaleString('id-ID'),
      // Tambahkan informasi tanggal order asli vs tanggal pembayaran
      orderDate: order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A',
      paymentDate: order.payment_update ? new Date(order.payment_update).toLocaleDateString('id-ID') : 'N/A',
    }));

  // Total pendapatan khusus untuk laporan transaksi (hanya dari transactionData yang tampil)
  const transactionsReportTotalRevenue = useMemo(() => {
    try {
      return transactionData.reduce((sum, tx) => {
        const numeric = Number(String(tx.total).replace(/[^\d]/g, '')) || 0;
        return sum + numeric;
      }, 0);
    } catch {
      return 0;
    }
  }, [transactionData]);

  const handleExport = (format: string) => {
    try {
      let dataToExport: any[] = [];
      let fileName = '';
      let headers: string[] = [];
      
      // Prepare data based on active tab
      switch (activeTab) {
        case 'daily-orders':
          dataToExport = getFilteredData.dailyOrders.map(order => ({
            'Nomor Order': order.order_number || 'N/A',
            'Customer': order.customer_name || 'N/A',
            'Tanggal Order': order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A',
            'Deadline': order.estimasi ? new Date(order.estimasi).toLocaleDateString('id-ID') : '-',
            'Status': order.order_statuses?.name || 'Unknown',
            'Designer': order.desainer?.nama || '-',
            'Total Amount': order.total_amount || 0
          }));
          fileName = `laporan-order-harian-${new Date().toISOString().split('T')[0]}`;
          headers = ['Nomor Order', 'Customer', 'Tanggal Order', 'Deadline', 'Status', 'Designer', 'Total Amount'];
          break;
          
        case 'sales':
          dataToExport = salesData.map(item => ({
            'Produk': item.product,
            'Kategori': item.category,
            'Jumlah Terjual': item.quantity,
            'Pendapatan': item.revenue,
            'Pertumbuhan': item.growth
          }));
          fileName = `laporan-penjualan-${new Date().toISOString().split('T')[0]}`;
          headers = ['Produk', 'Kategori', 'Jumlah Terjual', 'Pendapatan', 'Pertumbuhan'];
          break;
          
        case 'transactions':
          dataToExport = transactionData.map(transaction => ({
            'ID Order': transaction.id,
            'Customer': transaction.customer,
            'Tanggal Order': transaction.orderDate,
            'Tanggal Pembayaran': transaction.date,
            'Kategori': transaction.category,
            'Status': transaction.status,
            'Status Pembayaran': transaction.paymentStatus,
            'DP': transaction.downPayment,
            'Pelunasan': transaction.pelunasan,
            'Total': transaction.total
          }));
          fileName = `laporan-transaksi-${new Date().toISOString().split('T')[0]}`;
          headers = ['ID Order', 'Customer', 'Tanggal Order', 'Tanggal Pembayaran', 'Kategori', 'Status', 'Status Pembayaran', 'DP', 'Pelunasan', 'Total'];
          break;
          
        default:
          dataToExport = [];
          fileName = `laporan-${new Date().toISOString().split('T')[0]}`;
          headers = [];
      }
      
      if (dataToExport.length === 0) {
        toast({
          title: "Tidak Ada Data",
          description: "Tidak ada data untuk diekspor",
          variant: "destructive"
        });
        return;
      }
      
      // Export based on format
      switch (format.toLowerCase()) {
        case 'csv':
          exportToCSV(dataToExport, headers, fileName);
          break;
        case 'excel':
          exportToExcel(dataToExport, headers, fileName);
          break;
        case 'pdf':
          exportToPDF(dataToExport, headers, fileName, activeTab);
          break;
        default:
          toast({
            title: "Format Tidak Didukung",
            description: "Format ekspor tidak didukung",
            variant: "destructive"
          });
          return;
      }
      
      toast({
        title: "Ekspor Berhasil",
        description: `Data berhasil diekspor dalam format ${format.toUpperCase()}`,
      });
      
    } catch (error) {
      toast({
        title: "Error Ekspor",
        description: "Terjadi kesalahan saat mengekspor data",
        variant: "destructive"
      });
    }
  };

  // Helper function to export to CSV
  const exportToCSV = (data: any[], headers: string[], fileName: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to export to Excel (XLSX)
  const exportToExcel = (data: any[], headers: string[], fileName: string) => {
    try {
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet format
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
      
      // Write and download file
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Excel export error:', error);
      // Fallback to CSV
      exportToCSV(data, headers, fileName.replace('.xlsx', ''));
      toast({
        title: "Export Excel Gagal",
        description: "Menggunakan format CSV sebagai alternatif",
        variant: "destructive"
      });
    }
  };

  // Helper function to export to PDF
  const exportToPDF = (data: any[], headers: string[], fileName: string, tabName: string) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Laporan ${tabName}`, 14, 22);
      doc.setFontSize(12);
      doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`, 14, 32);
      
      // Prepare table data
      const tableData = data.map(row => 
        headers.map(header => row[header] || '')
      );
      
      // Add table using autoTable plugin
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 80, 200],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Save PDF
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      // Fallback to CSV
      exportToCSV(data, headers, fileName.replace('.pdf', ''));
      toast({
        title: "Export PDF Gagal",
        description: "Menggunakan format CSV sebagai alternatif",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Diperbarui",
      description: "Data order telah diperbarui",
    });
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'cek file': return 'bg-orange-100 text-orange-800';
      case 'desain': return 'bg-purple-100 text-purple-800';
      case 'konfirmasi': return 'bg-cyan-100 text-cyan-800';
      case 'revisi': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get payment status color (same as Transaction page)
  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'lunas':
        return 'bg-green-100 text-green-800';
      case 'belum lunas':
        return 'bg-yellow-100 text-yellow-800';
      case 'belum dibayar':
        return 'bg-red-100 text-red-800';
      case 'n/a':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Note: getStatusText function removed - now using actual status from database via order_statuses join

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Report</h1>
              <p className="text-gray-600">Laporan Performa Dari Bisnis</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {[
              { id: 'daily-orders', label: 'Order Harian', icon: Calendar },
              { id: 'transactions', label: 'Transaksi', icon: Receipt },
              { id: 'sales', label: 'Penjualan', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Segarkan
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 bg-[#0050C8] hover:bg-[#003a9b]">
                  <Download className="h-4 w-4" />
                  Ekspor
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Ekspor sebagai CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Ekspor sebagai Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Ekspor sebagai PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

                {/* Content */}
        {activeTab === 'daily-orders' && (
        <div className="space-y-4">
          {/* Summary Cards for Daily Orders */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Order Masuk</p>
                      <p className="text-2xl font-bold text-gray-900">{totals.dailyOrders.totalOrders}</p>
                    </div>
                    <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-gray-900">IDR {totals.dailyOrders.totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <Receipt className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Rata-rata per Order</p>
                      <p className="text-2xl font-bold text-gray-900">
                        IDR {totals.dailyOrders.totalOrders > 0 ? totals.dailyOrders.averagePerOrder.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}
                      </p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Search and Filter for Daily Orders */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari order..." 
                  className="pl-10"
                  value={getCurrentSearchTerm()}
                  onChange={(e) => setCurrentSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Button */}
              <Popover open={filterOpen.dailyOrders} onOpenChange={(open) => setFilterOpen(prev => ({ ...prev, dailyOrders: open }))}>
                <PopoverTrigger asChild>
                  <Button
                    variant={isDailyOrdersFilterActive() ? 'default' : 'outline'}
                    className={`gap-2 ${isDailyOrdersFilterActive() ? 'bg-[#0050C8] text-white' : ''}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]" side="left" align="center" sideOffset={8}>
                  <div className="mb-3 font-semibold text-sm">
                    Filter Order Harian
                  </div>
                  
                  {/* Field Filter */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Field</label>
                    <Select value={getCurrentFilterField()} onValueChange={setCurrentFilterField}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentFilterFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date or Value Filter */}
                  {getCurrentFilterField() === 'tanggal' ? (
                    <>
                      <Select value={getCurrentDateMode()} onValueChange={setCurrentDateMode}>
                        <SelectTrigger className="w-full mb-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Per Tanggal</SelectItem>
                          <SelectItem value="range">Rentang Tanggal</SelectItem>
                        </SelectContent>
                      </Select>
                      {getCurrentDateMode() === 'single' ? (
                        <CalendarComponent
                          mode="single"
                          selected={getCurrentSingleDate()}
                          onSelect={(date) => setCurrentSingleDate(date)}
                          className="w-full"
                          classNames={{
                            day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                            day_today: "border border-[#0050C8]",
                            day_range_end: "bg-[#0050C8] text-white",
                          }}
                        />
                      ) : (
                        <CalendarComponent
                          mode="range"
                          selected={getCurrentRange()}
                          onSelect={(value) => setCurrentRange(value as any)}
                          className="w-full"
                          classNames={{
                            day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                            day_range_end: "bg-[#0050C8] text-white",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="mb-3">
                      <label className="block text-xs font-semibold mb-1">Cari</label>
                      <Input 
                        value={getCurrentFilterValue()} 
                        onChange={e => setCurrentFilterValue(e.target.value)} 
                        placeholder="Ketik kata kunci..." 
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => { 
                        setCurrentSingleDate(undefined); 
                        setCurrentRange({ from: undefined, to: undefined }); 
                        setCurrentFilterField('customer_name'); 
                        setCurrentFilterValue(''); 
                        setCurrentSearchTerm('');
                        setFilterOpen(prev => ({ ...prev, dailyOrders: false })); 
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#0050C8] text-white hover:bg-[#003a8c]"
                      onClick={() => setFilterOpen(prev => ({ ...prev, dailyOrders: false }))}
                    >
                      Terapkan
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0050C8]" />
                Laporan Order Harian
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Total Order: {getFilteredData.dailyOrders.length}</span>
                {isFetching && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Memperbarui...</span>}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0050C8]" />
                  <span className="ml-2">Memuat order...</span>
                </div>
              ) : getFilteredData.dailyOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada order ditemukan</p>
                  <p className="text-sm">Coba sesuaikan pencarian atau filter Anda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Order</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designer</th>
                        <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredData.dailyOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.customer_name}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A'}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.estimasi ? new Date(order.estimasi).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <Badge className={`${getStatusColor(order.order_statuses?.name || 'Unknown')}`}>
                              {order.order_statuses?.name || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                            {order.desainer?.nama || '-'}
                          </td>
                                                     <td className="px-6 py-2 whitespace-nowrap text-sm text-center">
                                                         <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleViewOrderItems(order)}
                               className="hover:bg-blue-50 hover:text-[#0050C8] transition-colors duration-200"
                               title={`Lihat Item Order ${order.order_number}`}
                               disabled={isLoading || isFetching}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Sales Report */}
        {activeTab === 'sales' && (
        <div className="space-y-4">
          {/* Summary Cards for Sales */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Produk Terjual</p>
                      <p className="text-2xl font-bold text-gray-900">{totals.sales.totalProducts}</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-gray-900">IDR {totals.sales.totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <Receipt className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Rata-rata per Produk</p>
                      <p className="text-2xl font-bold text-gray-900">
                        IDR {totals.sales.totalProducts > 0 ? totals.sales.averagePerProduct.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}
                      </p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Search and Filters for Sales */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar - Left */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari berdasarkan produk..." 
                  className="pl-10"
                  value={searchTerm.sales}
                  onChange={(e) => setSearchTerm(prev => ({ ...prev, sales: e.target.value }))}
                />
              </div>
              
              {/* Filters - Right */}
              <div className="flex items-center gap-2">
                {/* Filter Button */}
              <Popover open={filterOpen.sales} onOpenChange={(open) => setFilterOpen(prev => ({ ...prev, sales: open }))}>
                <PopoverTrigger asChild>
                  <Button
                    variant={isSalesFilterActive() ? 'default' : 'outline'}
                    className={`gap-2 ${isSalesFilterActive() ? 'bg-[#0050C8] text-white' : ''}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]" side="left" align="center" sideOffset={8}>
                  <div className="mb-3 font-semibold text-sm">
                    Filter Penjualan
                  </div>
                  
                  {/* Field Filter */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1">Field</label>
                    <Select 
                      value={getCurrentFilterField()} 
                      onValueChange={(value) => {
                        setCurrentFilterField(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentFilterFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value Filter - Only for Produk and Kategori */}
                  {getCurrentFilterField() === 'tanggal' ? (
                    <>
                      <Select value={getCurrentDateMode()} onValueChange={setCurrentDateMode}>
                        <SelectTrigger className="w-full mb-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Per Tanggal</SelectItem>
                          <SelectItem value="range">Rentang Tanggal</SelectItem>
                        </SelectContent>
                      </Select>
                      {getCurrentDateMode() === 'single' ? (
                        <CalendarComponent
                          mode="single"
                          selected={getCurrentSingleDate()}
                          onSelect={(date) => setCurrentSingleDate(date)}
                          className="w-full"
                          classNames={{
                            day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                            day_today: "border border-[#0050C8]",
                            day_range_end: "bg-[#0050C8] text-white",
                          }}
                        />
                      ) : (
                        <CalendarComponent
                          mode="range"
                          selected={getCurrentRange()}
                          onSelect={(value) => setCurrentRange(value as any)}
                          className="w-full"
                          classNames={{
                            day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                            day_range_end: "bg-[#0050C8] text-white",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="mb-3">
                      <label className="block text-xs font-semibold mb-1">Cari</label>
                      <Input 
                        value={getCurrentFilterValue()} 
                        onChange={e => {
                          setCurrentFilterValue(e.target.value);
                        }} 
                        placeholder={getCurrentFilterField() === 'product_name' ? 'Ketik nama produk...' : 'Ketik nama kategori...'} 
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => { 
                        setCurrentSingleDate(undefined); 
                        setCurrentRange({ from: undefined, to: undefined });
                        setCurrentFilterField('product_name'); 
                        setCurrentFilterValue(''); 
                        setSearchTerm(prev => ({ ...prev, sales: '' }));
                        setFilterOpen(prev => ({ ...prev, sales: false })); 
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#0050C8] text-white hover:bg-[#003a8c]"
                      onClick={() => setFilterOpen(prev => ({ ...prev, sales: false }))}
                    >
                      Terapkan
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0050C8]" />
                Laporan Performa Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0050C8]" />
                  <span className="ml-2">Memuat penjualan...</span>
                </div>
              ) : salesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada penjualan ditemukan</p>
                  <p className="text-sm">Coba sesuaikan pencarian atau filter Anda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Terjual</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertumbuhan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">IDR {item.revenue}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{item.growth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Transactions Report */}
        {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Summary Cards for Transactions */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Belum Dibayar</p>
                      <p className="text-2xl font-bold text-gray-900">IDR {transactionData.reduce((sum, transaction) => {
                        const totalOrder = Number(transaction.total.replace(/[^\d]/g, '')) || 0;
                        const downPayment = transaction.downPayment || 0;
                        const pelunasan = transaction.pelunasan || 0;
                        const totalPaid = downPayment + pelunasan;
                        return sum + Math.max(0, totalOrder - totalPaid);
                      }, 0).toLocaleString('id-ID')}</p>
                    </div>
                    <Receipt className="h-5 w-5 text-red-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total DP</p>
                      <p className="text-2xl font-bold text-gray-900">IDR {transactionData.reduce((sum, transaction) => sum + (transaction.downPayment || 0), 0).toLocaleString('id-ID')}</p>
                    </div>
                    <Receipt className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Pelunasan</p>
                      <p className="text-2xl font-bold text-gray-900">IDR {transactionData.reduce((sum, transaction) => sum + (transaction.pelunasan || 0), 0).toLocaleString('id-ID')}</p>
                    </div>
                    <Receipt className="h-5 w-5 text-green-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-gray-900">IDR {transactionsReportTotalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Search and Filters for Transactions */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between gap-4">
              {/* Search Bar - Left */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari transaksi..." 
                  className="pl-10"
                  value={getCurrentSearchTerm()}
                  onChange={(e) => setCurrentSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filters - Right */}
              <div className="flex items-center gap-2">
                {/* Filter Button */}
                <Popover open={filterOpen.transactions} onOpenChange={(open) => setFilterOpen(prev => ({ ...prev, transactions: open }))}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={isTransactionsFilterActive() ? 'default' : 'outline'}
                      className={`gap-2 ${isTransactionsFilterActive() ? 'bg-[#0050C8] text-white' : ''}`}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Filter
                    </Button>
                </PopoverTrigger>
                  <PopoverContent className="w-[300px]" side="left" align="center" sideOffset={8}>
                    <div className="mb-3 font-semibold text-sm">
                      Filter Transaksi
                    </div>
                    
                    {/* Field Filter */}
                    <div className="mb-3">
                      <label className="block text-xs font-semibold mb-1">Field</label>
                      <Select value={getCurrentFilterField()} onValueChange={setCurrentFilterField}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentFilterFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date or Value Filter */}
                    {getCurrentFilterField() === 'tanggal' ? (
                      <>
                        <Select value={getCurrentDateMode()} onValueChange={setCurrentDateMode}>
                          <SelectTrigger className="w-full mb-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Per Tanggal</SelectItem>
                            <SelectItem value="range">Rentang Tanggal</SelectItem>
                          </SelectContent>
                        </Select>
                        {getCurrentDateMode() === 'single' ? (
                          <CalendarComponent
                            mode="single"
                            selected={getCurrentSingleDate()}
                            onSelect={(date) => setCurrentSingleDate(date)}
                            className="w-full"
                            classNames={{
                              day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                              day_today: "border border-[#0050C8]",
                              day_range_end: "bg-[#0050C8] text-white",
                            }}
                          />
                        ) : (
                          <CalendarComponent
                            mode="range"
                            selected={getCurrentRange()}
                            onSelect={(value) => setCurrentRange(value as any)}
                            className="w-full"
                            classNames={{
                              day_selected: "bg-[#0050C8] text-white hover:bg-[#003a8c]",
                              day_range_end: "bg-[#0050C8] text-white",
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="mb-3">
                        <label className="block text-xs font-semibold mb-1">Cari</label>
                        <Input 
                          value={getCurrentFilterValue()} 
                          onChange={e => setCurrentFilterValue(e.target.value)} 
                          placeholder="Ketik kata kunci..." 
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => { 
                          setCurrentSingleDate(undefined); 
                          setCurrentRange({ from: undefined, to: undefined }); 
                          setCurrentFilterField('customer_name'); 
                          setCurrentFilterValue('');  
                          setCurrentSearchTerm('');
                          setFilterOpen(prev => ({ ...prev, transactions: false })); 
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#0050C8] text-white hover:bg-[#003a8c]"
                        onClick={() => setFilterOpen(prev => ({ ...prev, transactions: false }))}
                      >
                        Terapkan
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#0050C8]" />
                Laporan Transaksi
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Total Transaksi: {transactionData.length}</span>
                {isFetching && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Memperbarui...</span>}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0050C8]" />
                  <span className="ml-2">Memuat transaksi...</span>
                </div>
              ) : transactionData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada transaksi ditemukan</p>
                  <p className="text-sm">Coba sesuaikan pencarian atau filter Anda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pembayaran</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionData.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.orderDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${getPaymentStatusColor(transaction.paymentStatus)}`}>
                                {transaction.paymentStatus || 'Belum Dibayar'}
                              </span>
                              {transaction.paymentStatus === 'Belum Lunas' && (
                                <span className="text-xs text-gray-500">
                                  DP: IDR {transaction.downPayment?.toLocaleString('id-ID') || '0'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0050C8]">IDR {transaction.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Edit Order Modal */}
        {isEditModalOpen && selectedOrderForEdit && (
          <RequestOrderModal
            open={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSubmit={(orderData) => {
              try {
                // Handle order update
                
                toast({
                  title: "Order Diperbarui",
                  description: "Data order berhasil diperbarui",
                });
                
                handleCloseEditModal();
                refetch(); // Refresh data
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Gagal memperbarui order",
                  variant: "destructive"
                });
              }
            }}
            editingOrder={selectedOrderForEdit}
          />
        )}

        {/* View Order Items Modal */}
        {isViewItemsModalOpen && selectedOrderForItems && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Daftar Item Order #{selectedOrderForItems.order_number}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseViewItemsModal}
                  className="hover:bg-gray-100"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-900">{selectedOrderForItems.customer_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tanggal Order:</span>
                      <p className="text-gray-900">
                        {selectedOrderForItems.created_at ? new Date(selectedOrderForItems.created_at).toLocaleDateString('id-ID') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-900">{selectedOrderForItems.order_statuses?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <p className="text-gray-900 font-semibold">
                        IDR {selectedOrderForItems.total_amount?.toLocaleString('id-ID') || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Item yang Dipesan:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrderForItems.order_items && selectedOrderForItems.order_items.length > 0 ? (
                          selectedOrderForItems.order_items.map((item: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {item.item_name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {item.description || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                IDR {item.sub_total?.toLocaleString('id-ID') || '0'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              Tidak ada item yang ditemukan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseViewItemsModal}
                  className="mr-2"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;