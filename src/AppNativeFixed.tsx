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
import Finance from "./pages/Finance";
import Accounting from "./pages/Accounting";
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";
import React from 'react';
import { RoleAccessProvider } from '@/context/RoleAccessContext';
import { NativeAppWrapper } from '@/components/NativeAppWrapper';
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

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && 
  (window as any).electronAPI?.app?.isDev !== undefined;

// Check if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const App = () => {
  // If running in Electron, use native wrapper with proper flow
  if (isElectron) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <RoleAccessProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                
                <NativeAppWrapper>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<AutoRedirect><Layout><Routes>
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
                      </Routes></Layout></AutoRedirect>} />
                      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                      <Route path="/orderan" element={<Layout><Orderan /></Layout>} />
                      <Route path="/transaction" element={<Layout><TransactionPage /></Layout>} />
                      <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
                      <Route path="/report" element={<Layout><Report /></Layout>} />
                      <Route path="/master-data" element={<Layout><MasterData /></Layout>} />
                      <Route path="/settings" element={<Layout><Settings /></Layout>} />
                      <Route path="/cashier" element={<Layout><Cashier /></Layout>} />
                      <Route path="/finance" element={<Layout><Finance /></Layout>} />
                      <Route path="/accounting" element={<Layout><Accounting /></Layout>} />
                      <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
                      <Route path="/no-access" element={<NoAccessPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </NativeAppWrapper>
              </TooltipProvider>
            </RoleAccessProvider>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  // For web version, use original App logic
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <RoleAccessProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<div>Web Login - Not implemented yet</div>} />
                  <Route
                    path="/*"
                    element={
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
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RoleAccessProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;


