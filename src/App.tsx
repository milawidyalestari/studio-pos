
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import React from 'react';

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
  const isLoggedIn = Boolean(localStorage.getItem('studio_pos_user'));
  if (!isLoggedIn) {
    window.location.replace('/login');
    return null;
  }
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/orderan" element={<Orderan />} />
                        <Route path="/transaction" element={<TransactionPage />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/report" element={<Report />} />
                        <Route path="/master-data" element={<MasterData />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/cashier" element={<Cashier />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
