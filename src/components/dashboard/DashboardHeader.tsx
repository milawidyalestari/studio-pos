
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang kembali! Berikut adalah ringkasan performa hari ini</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
