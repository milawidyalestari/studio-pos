import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ActiveOrdersTable from '@/components/dashboard/ActiveOrdersTable';
import CalendarSection from '@/components/dashboard/CalendarSection';
import QuickAccessSection from '@/components/dashboard/QuickAccessSection';
import RequestOrderModal from '@/components/RequestOrderModal';
import { useHasAccess } from '@/context/RoleAccessContext';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [quickAccessCollapsed, setQuickAccessCollapsed] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const hasAccess = useHasAccess();

  const handleTambahOrderClick = () => {
    setShowRequestModal(true);
  };

  const handleOrderModalClose = () => {
    setShowRequestModal(false);
  };

  const handleOrderModalSubmit = (orderData: object) => {
    // The order is automatically saved through the RequestOrderModal using useOrders hook
    // The order list will automatically refresh due to React Query invalidation
    console.log('Order submitted:', orderData);
  };

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 mb-p4">
        <DashboardHeader />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0 mt-2">
        {/* Left Section: Stats and Active Orders */}
        <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0">
          {/* Stats Grid */}
          {hasAccess('Dashboard', 'view_stats') && (
            <div className="flex-shrink-0">
              <DashboardStats 
                selectedDate={selectedDate}
                selectedDeadline={selectedDeadline}
              />
            </div>
          )}
          
          {/* Active Orders Table */}
          {hasAccess('Dashboard', 'view_orders') && (
            <div className="flex-1 min-h-0">
              <ActiveOrdersTable
                selectedDate={selectedDate}
                selectedDeadline={selectedDeadline}
                onDeadlineFilterChange={setSelectedDeadline}
              />
            </div>
          )}
        </div>

        {/* Right Section: Calendar and Quick Access */}
        <Card className="lg:col-span-1 flex flex-col min-h-0">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Calendar Section */}
            {hasAccess('Dashboard', 'view_calendar') && (
              <div className="flex-shrink-0">
                <CalendarSection
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  collapsed={calendarCollapsed}
                  onToggleCollapse={() => setCalendarCollapsed((c) => !c)}
                />
                {/* Visual separation */}
                <div className="border-b border-gray-200 mb-1" />
              </div>
            )}

            {/* Quick Access Section */}
            <div className="flex-1 min-h-0">
              <QuickAccessSection
                collapsed={quickAccessCollapsed}
                onToggleCollapse={() => setQuickAccessCollapsed((c) => !c)}
                onTambahOrderClick={handleTambahOrderClick}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Request Order Modal */}
      <RequestOrderModal
        open={showRequestModal}
        onClose={handleOrderModalClose}
        onSubmit={handleOrderModalSubmit}
        editingOrder={null}
        onReopen={(restoredEditingOrder) => {
          // Handle reopen if needed
          setShowRequestModal(true);
        }}
      />
    </div>
  );
};

export default Dashboard;
