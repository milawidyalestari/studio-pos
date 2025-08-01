
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
  Printer
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
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.ORDERAN, label: 'Orderan', icon: FileText },
  { path: ROUTES.TRANSACTION, label: 'Transaction', icon: Receipt },
  { path: ROUTES.CASHIER, label: 'Cashier', icon: Calculator },
  { path: ROUTES.INVENTORY, label: 'Inventory', icon: Package },
  { path: ROUTES.SUPPLIERS, label: 'Suppliers', icon: Truck },
  { path: ROUTES.REPORT, label: 'Report', icon: BarChart3 },
  { path: ROUTES.MASTER_DATA, label: 'Master Data', icon: Database },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
  { path: '/print-demo', label: 'Print Demo', icon: Printer },
];

const Sidebar = memo<SidebarProps>(({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);
  const hasAccess = useHasAccess();

  const handleLogout = () => {
    localStorage.removeItem('studio_pos_user');
    navigate('/login');
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Torus  className="h-7 w-7 text-blue-700" />
            {APP_CONFIG.APP_NAME}
          </h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4 text-blue-700" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto" role="navigation">
        <ul className="space-y-1 px-2">
          {menuItems.filter(item => hasAccess(item.label, 'read')).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
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
                  <Icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3", isActive ? "text-white" : "text-blue-700")} />
                  {!collapsed && <span>{item.label}</span>}
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
              className={cn(
                "flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors",
                collapsed && "justify-center"
              )}
              aria-label="Logout"
            >
              <LogOut className={cn("h-5 w-5 text-blue-700", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>Logout</span>}
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
