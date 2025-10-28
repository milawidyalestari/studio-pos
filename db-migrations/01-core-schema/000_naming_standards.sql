-- =====================================================
-- MIGRATION: Naming Standards & Conventions
-- Version: 000
-- Date: 2025-01-01
-- Description: Standar penamaan untuk seluruh database
-- =====================================================

-- =====================================================
-- NAMING CONVENTIONS YANG DIGUNAKAN:
-- =====================================================
/*
TABEL: 
- Gunakan bahasa Indonesia untuk field bisnis: nama, kode, alamat
- Gunakan bahasa Inggris untuk field sistem: id, created_at, updated_at
- Format: snake_case untuk kolom, PascalCase untuk enum

ENUM VALUES:
- Format: PascalCase untuk readability
- Contoh: 'Regular', 'Premium', 'VIP'

FOREIGN KEY:
- Format: {table_name}_id
- Contoh: customer_id, product_id

INDEX:
- Format: idx_{table}_{column}
- Contoh: idx_customers_nama, idx_orders_status

CONSTRAINTS:
- Format: chk_{table}_{description}
- Contoh: chk_customers_level, chk_orders_status
*/

-- =====================================================
-- STANDARD ENUM TYPES
-- =====================================================

-- Customer Level Enum
DROP TYPE IF EXISTS customer_level CASCADE;
CREATE TYPE customer_level AS ENUM ('Regular', 'Premium', 'VIP');

-- Employee Status Enum  
DROP TYPE IF EXISTS employee_status CASCADE;
CREATE TYPE employee_status AS ENUM ('Active', 'Inactive');

-- Payment Type Enum
DROP TYPE IF EXISTS payment_type CASCADE;
CREATE TYPE payment_type AS ENUM ('cash', 'transfer', 'credit', 'qris');

-- Order Status Enum
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'Unnest',
    'Design', 
    'Cek File',
    'Konfirmasi',
    'Export',
    'Done',
    'Proses Cetak'
);

-- Transaction Type Enum
DROP TYPE IF EXISTS transaction_type CASCADE;
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'adjustment');

-- Transaction Status Enum
DROP TYPE IF EXISTS transaction_status CASCADE;
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'rejected');

-- Priority Level Enum
DROP TYPE IF EXISTS priority_level CASCADE;
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- Notification Type Enum
DROP TYPE IF EXISTS notification_type CASCADE;
CREATE TYPE notification_type AS ENUM (
    'order_created', 
    'order_updated', 
    'order_deleted',
    'order_processing', 
    'order_completed',
    'payment_received',
    'stock_low'
);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TYPE customer_level IS 'Level customer: Regular, Premium, VIP';
COMMENT ON TYPE employee_status IS 'Status karyawan: Active, Inactive';
COMMENT ON TYPE payment_type IS 'Jenis pembayaran: cash, transfer, credit, qris';
COMMENT ON TYPE order_status IS 'Status order sesuai workflow studio';
COMMENT ON TYPE transaction_type IS 'Jenis transaksi keuangan';
COMMENT ON TYPE notification_type IS 'Jenis notifikasi sistem';











