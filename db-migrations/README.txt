=====================================================
STUDIO POS - DATABASE MIGRATIONS v2.0
=====================================================

⚠️  MIGRATION SYSTEM YANG SUDAH DIPERBAIKI
Sistem migration lama (supabase/migrations/) masih memiliki 38 file 
yang berantakan. Gunakan struktur baru ini untuk development.

STRUCTURE OVERVIEW:
├── 01-core-schema/          # Schema dasar database
├── 02-tables/               # Tabel tambahan
├── 03-columns-updates/      # Update kolom (future)
├── 04-functions-triggers/   # Functions & triggers
├── 05-data-seeds/          # Data default
├── 06-permissions/         # Roles & permissions
├── apply_all_migrations.sql # Script apply semua
├── rollback_all_migrations.sql # Script rollback
└── README.txt              # File ini

=====================================================
CARA MENGGUNAKAN:
=====================================================

1. APPLY SEMUA MIGRATION:
   psql -d your_database -f apply_all_migrations.sql

2. APPLY INDIVIDUAL:
   Jalankan file secara berurutan sesuai nomor folder

3. ROLLBACK:
   psql -d your_database -f rollback_all_migrations.sql

=====================================================
URUTAN EKSEKUSI:
=====================================================

1. Core Schema (01-core-schema/)
   - 001_initial_database_setup.sql

2. Additional Tables (02-tables/)
   - 001_orders_table.sql
   - 002_materials_inventory.sql
   - 003_transaction_master.sql

3. Functions & Triggers (04-functions-triggers/)
   - 001_transaction_functions.sql
   - 002_payment_update_trigger.sql

4. Data Seeds (05-data-seeds/)
   - 001_default_categories.sql

5. Permissions (06-permissions/)
   - 001_roles_and_permissions.sql
   - 002_default_roles_data.sql

=====================================================
KEUNGGULAN STRUKTUR INI:
=====================================================

✓ Terorganisir berdasarkan kategori
✓ Urutan eksekusi yang jelas
✓ Naming convention konsisten
✓ Dokumentasi lengkap di setiap file
✓ Script apply dan rollback otomatis
✓ Mudah di-maintain dan di-debug
✓ Bisa dijalankan bertahap atau sekaligus

=====================================================
CATATAN PENTING:
=====================================================

- Selalu backup database sebelum migration
- Test di development environment dulu
- Pastikan dependencies terpenuhi
- Rollback script akan menghapus semua data
- File migration bersifat idempotent (aman dijalankan berulang)

=====================================================
