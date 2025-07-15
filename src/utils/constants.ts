
export const APP_CONFIG = {
  APP_NAME: 'Montana',
  VERSION: '1.0.0',
  COMPANY_NAME: 'Digital Print Control',
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  ORDERAN: '/orderan',
  TRANSACTION: '/transaction',
  CASHIER: '/cashier',
  INVENTORY: '/inventory',
  SUPPLIERS: '/suppliers',
  REPORT: '/report',
  MASTER_DATA: '/master-data',
  SETTINGS: '/settings',
} as const;

export const ORDER_STATUS = {
  DESIGN: 'Design',
  CEK_FILE: 'Cek File',
  KONFIRMASI: 'Konfirmasi',
  EXPORT: 'Export',
  DONE: 'Done',
  PROSES_CETAK: 'Proses Cetak',
} as const;

export const CUSTOMER_LEVELS = {
  VIP: 'VIP',
  PREMIUM: 'Premium',
  REGULAR: 'Regular',
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const COLORS = {
  PRIMARY: '#0050C8',
  PRIMARY_HOVER: '#003a9b',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
} as const;
