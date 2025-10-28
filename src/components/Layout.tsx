import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TitleBar from './TitleBar';
import WindowTransitionEffect from './WindowTransitionEffect';
import { WindowStateProvider } from './WindowStateManager';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <WindowStateProvider>
      <WindowTransitionEffect>
        <div className="min-h-screen min-w-full bg-gray-50 flex flex-col">
          {/* Title Bar - Positioned at the very top */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <TitleBar 
              title="Studio POS" 
              useAnimatedControls={true}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="flex flex-1 relative min-h-[600px] min-w-[1024px]" style={{ marginTop: '3rem' }}>
            {/* Sidebar */}
            <div 
              className={`fixed top-12 left-0 z-10 transition-all duration-300 ${
                sidebarCollapsed ? 'w-16' : 'w-64'
              }`}
              style={{ height: 'calc(100vh - 3rem)' }}
            >
              <Sidebar 
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>
            
            {/* Main Content */}
            <main 
              className={`flex-1 transition-all duration-300 ${
                sidebarCollapsed ? 'ml-16' : 'ml-64'
              }`}
              style={{ height: 'calc(100vh - 3rem)', overflowY: 'auto' }}
            >
              <div className="mx-auto max-w-screen-2xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </WindowTransitionEffect>
    </WindowStateProvider>
  );
};

export default Layout;
