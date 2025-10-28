
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orderan from "./pages/Orderan";
import TransactionPage from "./pages/Transaction";
import Inventory from "./pages/Inventory";
import Report from "./pages/Report";
import MasterData from "./pages/MasterData";
import Settings from "./pages/Settings";
import Cashier from "./pages/Cashier";
import Finance from "./pages/Finance";
import Accounting from "./pages/Accounting";
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import React from 'react';
import { RoleAccessProvider } from '@/context/RoleAccessContext';
import { useDatabaseInit } from '@/hooks/use-database-init';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AutoRedirect, NoAccessPage } from '@/components/AutoRedirect';
import { ROUTES } from '@/utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Komponen proteksi route
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = Boolean(localStorage.getItem('azuro_user'));
  if (!isLoggedIn) {
    window.location.replace('/login');
    return null;
  }
  return <>{children}</>;
}

// Database initialization component
function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const { isInitialized, isInitializing, error, dbInfo } = useDatabaseInit();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Setting up database...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Database status indicator */}
      {dbInfo && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dbInfo.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{dbInfo.type} ({dbInfo.mode})</span>
          </div>
        </div>
      )}
    </>
  );
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <RoleAccessProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              
              <DatabaseInitializer>
                <HashRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/*"
                      element={
                        <RequireAuth>
                          <AutoRedirect>
                            <Layout>
                              <Routes>
                                <Route path="/" element={<div>Redirecting...</div>} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/orderan" element={<Orderan />} />
                                <Route path="/transaction" element={<TransactionPage />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/report" element={<Report />} />
                                <Route path="/master-data" element={<MasterData />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/cashier" element={<Cashier />} />
                                <Route path="/finance" element={<Finance />} />
                                <Route path="/accounting" element={<Accounting />} />
                                <Route path="/suppliers" element={<Suppliers />} />
                                <Route path="/no-access" element={<NoAccessPage />} />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Layout>
                          </AutoRedirect>
                        </RequireAuth>
                      }
                    />
                  </Routes>
                </HashRouter>
              </DatabaseInitializer>
            </TooltipProvider>
          </RoleAccessProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
