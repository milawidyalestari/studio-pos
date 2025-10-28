import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Package, 
  BarChart3, 
  Database, 
  Settings, 
  LogOut,
  Calculator,
  Truck,
  DollarSign,
  BookOpen,
  X,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES, APP_CONFIG } from '@/utils/constants';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useHasAccess } from '@/context/RoleAccessContext';

interface MinimizedNavigationProps {
  onExpand: () => void;
}

const menuItems = [
  { 
    path: ROUTES.DASHBOARD, 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    permission: { menu: 'Dashboard', action: 'view_stats' }
  },
  { 
    path: ROUTES.ORDERAN, 
    label: 'Orderan', 
    icon: FileText,
    permission: { menu: 'Orderan', action: 'view_orders' }
  },
  { 
    path: ROUTES.TRANSACTION, 
    label: 'Transaksi', 
    icon: Receipt,
    permission: { menu: 'Transaction', action: 'view_transactions' }
  },
  { 
    path: ROUTES.CASHIER, 
    label: 'Kasir', 
    icon: Calculator,
    permission: { menu: 'Cashier', action: 'view_cashier' }
  },
  { 
    path: '/finance', 
    label: 'Keuangan', 
    icon: DollarSign,
    permission: { menu: 'Finance', action: 'view_finance' }
  },
  { 
    path: '/accounting', 
    label: 'Akuntansi', 
    icon: BookOpen,
    permission: { menu: 'Accounting', action: 'view_accounting' }
  },
  { 
    path: ROUTES.INVENTORY, 
    label: 'Inventory', 
    icon: Package,
    permission: { menu: 'Inventory', action: 'view_inventory' }
  },
  { 
    path: ROUTES.SUPPLIERS, 
    label: 'Suppliers', 
    icon: Truck,
    permission: { menu: 'Master Data', action: 'view_suppliers' }
  },
  { 
    path: ROUTES.REPORT, 
    label: 'Report', 
    icon: BarChart3,
    permission: { menu: 'Report', action: 'view_reports' }
  },
  { 
    path: ROUTES.MASTER_DATA, 
    label: 'Master Data', 
    icon: Database,
    permission: { menu: 'Master Data', action: 'view_products' }
  },
  { 
    path: ROUTES.SETTINGS, 
    label: 'Settings', 
    icon: Settings,
    permission: { menu: 'Settings', action: 'view_settings' }
  },
];

const MinimizedNavigation = ({ onExpand }: MinimizedNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const hasAccess = useHasAccess();

  const handleLogout = () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Step 1: Clear user data
      localStorage.removeItem('azuro_user');
      console.log('✅ User data cleared from localStorage');
      
      // Step 2: Clear any other auth-related data
      sessionStorage.removeItem('current_user');
      console.log('✅ Session data cleared');
      
      // Step 3: Check if running in Electron
      const isElectron = typeof window !== 'undefined' && 
        (window as any).electronAPI?.app?.isDev !== undefined;
      
      if (isElectron) {
        // For Electron, reload the page to trigger NativeAppWrapper login flow
        console.log('🔄 Electron detected, reloading page for login flow');
        window.location.reload();
      } else {
        // For web version, navigate to login
        navigate('/login');
        console.log('✅ Navigation to login successful');
        
        // Step 4: Force page reload if needed
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            console.log('🔄 Forcing reload to login page');
            window.location.href = '/login';
          }
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Fallback logout method
      try {
        localStorage.removeItem('azuro_user');
        sessionStorage.clear();
        window.location.reload();
      } catch (fallbackError) {
        console.error('❌ Fallback logout failed:', fallbackError);
        // Last resort - reload page
        window.location.reload();
      }
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
    hasAccess(item.permission.menu, item.permission.action)
  );

  return (
    <div className="fixed top-12 left-0 z-20 bg-white border-r border-gray-200 shadow-lg h-full w-16 flex flex-col">
      {/* Header dengan tombol minimize */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-center relative">
        <button
          onClick={onExpand}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center group"
          title="Expand Navigation"
        >
          <Minimize2 className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
        </button>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 py-4 overflow-y-auto" role="navigation">
        <ul className="space-y-2 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center justify-center h-12 w-12 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive 
                      ? "bg-[#0050C8] text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onMouseEnter={() => setShowTooltip(item.label)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-blue-700 group-hover:text-blue-800"
                  )} />
                  
                  {/* Tooltip */}
                  {showTooltip === item.label && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200 flex-shrink-0">
        <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
          <AlertDialogTrigger asChild>
            <button
              className="flex items-center justify-center h-12 w-12 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group relative"
              aria-label="Logout"
              onMouseEnter={() => setShowTooltip('Logout')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <LogOut className="h-5 w-5 text-blue-700 group-hover:text-red-600" />
              
              {/* Tooltip */}
              {showTooltip === 'Logout' && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin keluar dari aplikasi?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MinimizedNavigation;
