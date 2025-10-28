import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, BookOpen, CreditCard, FileText, BarChart3, Settings, Calendar } from 'lucide-react';
import { useHasAccess } from '@/context/RoleAccessContext';
import ChartOfAccountsTab from '@/components/accounting/ChartOfAccountsTab';
import CashAccountsTab from '@/components/accounting/CashAccountsTab';
import JournalEntriesTab from '@/components/accounting/JournalEntriesTab';
import AccountingReportsTab from '@/components/accounting/AccountingReportsTab';

const Accounting = () => {
  const hasAccess = useHasAccess();
  const [activeTab, setActiveTab] = useState('chart-of-accounts');

  // Check if user has access to accounting module
  if (!hasAccess('Accounting', 'view_accounting')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Akses Ditolak
              </h3>
              <p className="text-gray-500">
                Anda tidak memiliki izin untuk mengakses modul Akuntansi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Akuntansi</h1>
            <p className="text-gray-600">POS Percetakan Spanduk & Digital</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mt-6 border-b border-gray-200">
          {[
            { id: 'chart-of-accounts', label: 'Daftar Akun', icon: BookOpen },
            { id: 'cash-accounts', label: 'Akun Kas', icon: CreditCard },
            { id: 'journal-entries', label: 'Jurnal Umum', icon: FileText },
            { id: 'reports', label: 'Laporan', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'chart-of-accounts' && <ChartOfAccountsTab />}
      {activeTab === 'cash-accounts' && <CashAccountsTab />}
      {activeTab === 'journal-entries' && <JournalEntriesTab />}
      {activeTab === 'reports' && <AccountingReportsTab />}
    </div>
  );
};

export default Accounting;
