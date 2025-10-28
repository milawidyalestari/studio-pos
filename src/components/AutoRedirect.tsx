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
      // Default redirect ke dashboard untuk Administrator
      const userRole = localStorage.getItem('azuro_user') ? 
        JSON.parse(localStorage.getItem('azuro_user') || '{}').role : 'Administrator';
      
      if (userRole === 'Administrator') {
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // Cari halaman pertama yang user miliki akses
      const firstAccessibleRoute = routePermissions.find(route => {
        const access = hasAccess(route.permission.menu, route.permission.action);
        return access;
      });

      if (firstAccessibleRoute) {
        navigate(firstAccessibleRoute.path, { replace: true });
      } else {
        // Fallback ke dashboard
        navigate('/dashboard', { replace: true });
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
                window.location.href = '/login';
                console.log('✅ Navigation to login successful');
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
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
