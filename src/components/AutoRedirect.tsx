import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHasAccess } from '@/context/RoleAccessContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Definisi route dengan permission mapping
const routePermissions = [
  { path: '/dashboard', permission: { menu: 'Dashboard', action: 'view_stats' } },
  { path: '/orderan', permission: { menu: 'Orderan', action: 'view_orders' } },
  { path: '/transaction', permission: { menu: 'Transaction', action: 'view_transactions' } },
  { path: '/cashier', permission: { menu: 'Transaction', action: 'view_transactions' } },
  { path: '/finance', permission: { menu: 'Finance', action: 'view_finance' } },
  { path: '/inventory', permission: { menu: 'Inventory', action: 'view_inventory' } },
  { path: '/suppliers', permission: { menu: 'Master Data', action: 'view_suppliers' } },
  { path: '/report', permission: { menu: 'Report', action: 'view_reports' } },
  { path: '/master-data', permission: { menu: 'Master Data', action: 'view_products' } },
  { path: '/settings', permission: { menu: 'Settings', action: 'view_settings' } },
  { path: '/print-demo', permission: { menu: 'Settings', action: 'system_tools' } },
];

interface AutoRedirectProps {
  children: React.ReactNode;
}

export const AutoRedirect: React.FC<AutoRedirectProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAccess = useHasAccess();

  useEffect(() => {
    // Hanya redirect jika sedang di root path "/"
    if (location.pathname === '/') {
      console.log('🔍 AutoRedirect: User di root path, checking permissions...');
      
      // Cari halaman pertama yang user miliki akses
      const firstAccessibleRoute = routePermissions.find(route => {
        const access = hasAccess(route.permission.menu, route.permission.action);
        console.log(`🔍 Checking ${route.path}: ${access ? '✅' : '❌'}`);
        return access;
      });

      if (firstAccessibleRoute) {
        console.log(`🎯 Redirecting to: ${firstAccessibleRoute.path}`);
        navigate(firstAccessibleRoute.path, { replace: true });
      } else {
        console.log('❌ No accessible routes found, redirecting to access denied');
        // Jika tidak ada route yang accessible, redirect ke halaman khusus
        navigate('/no-access', { replace: true });
      }
    }
  }, [location.pathname, hasAccess, navigate]);

  // Jika sedang di root path, show loading
  if (location.pathname === '/') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Mengarahkan ke halaman yang tersedia...</p>
        </div>
      </div>
    );
  }

  // Jika bukan root path, render children normal
  return <>{children}</>;
};

// Komponen khusus untuk "No Access"
export const NoAccessPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Akses</h2>
        <p className="text-gray-600 mb-4">
          Anda tidak memiliki izin untuk mengakses halaman apapun dalam sistem ini. 
          Silakan hubungi administrator untuk mendapatkan akses.
        </p>
        <button 
          onClick={() => {
            localStorage.removeItem('studio_pos_user');
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
