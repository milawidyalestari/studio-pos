import React, { memo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Torus ,
  FileText, 
  Receipt, 
  Package, 
  BarChart3, 
  Database, 
  Settings, 
  LogOut,
  Menu,
  Calculator,
  Truck,
  Printer,
  DollarSign,
  CreditCard,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
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

const Sidebar = memo<SidebarProps>(({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
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

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden h-full",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center h-14 px-4 border-b border-gray-200",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            {APP_CONFIG.APP_NAME}
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex-shrink-0",
            !collapsed && "ml-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto" role="navigation">
        <ul className="space-y-1 px-2">
          {menuItems.filter(item => hasAccess(item.permission.menu, item.permission.action)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#0050C8] text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-blue-700",
                    collapsed ? "mx-auto" : "mr-3"
                  )} />
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-200 flex-shrink-0">
        <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
          <AlertDialogTrigger asChild>
            <button
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors relative group"
              aria-label="Logout"
            >
              <LogOut className={cn(
                "h-5 w-5 flex-shrink-0",
                collapsed ? "mx-auto" : "mr-3"
              )} />
              {!collapsed && <span>Logout</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                  Logout
                </span>
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
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;