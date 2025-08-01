import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="fixed top-0 left-0 h-full z-10">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      <main 
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
        style={{ height: '100vh', overflowY: 'auto' }}
      >
        <div className="mx-auto max-w-screen-2xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
