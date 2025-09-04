# Database Migration Guide

## Directory Structure

```
migrations/
├── schema/          # Schema changes (tables, columns, indexes, constraints)
├── data/            # Data migrations (inserts, updates, data transformations)  
├── roles/           # Role and permission related migrations
├── archived/        # Old/deprecated migrations for reference
└── README.md        # This file
```

## Migration Naming Convention

Format: `YYYYMMDD_HHMMSS_description.sql`

Examples:
- `20250101_000000_initial_schema.sql`
- `20250115_120000_add_payment_update_field.sql`
- `20250710_180000_create_roles_table.sql`

## Schema Migrations (migrations/schema/)

Core database structure changes:

1. **001_initial_schema.sql** - Base database tables and indexes
2. **002_transaction_master.sql** - Transaction master table and related functions
3. **003_roles_table.sql** - User roles table
4. **004_notifications_table.sql** - Notifications system table
5. **005_positions_table.sql** - Employee positions table
6. **006_order_statuses_table.sql** - Order status management
7. **007_product_materials.sql** - Product materials relationship
8. **008_inventory_movements.sql** - Inventory tracking system
9. **009_payment_updates.sql** - Payment system enhancements
10. **010_auth_fields.sql** - Authentication system fields

## Data Migrations (migrations/data/)

Data seeding and transformations:

1. **001_default_roles.sql** - Insert default user roles
2. **002_default_categories.sql** - Insert default transaction categories
3. **003_default_settings.sql** - Insert default application settings

## Role Migrations (migrations/roles/)

Role and permission system:

1. **001_role_permissions_table.sql** - Role permissions structure
2. **002_default_permissions.sql** - Default role permissions

## Migration Status

### Completed ✅
- Initial schema structure
- Transaction master table
- Role-based access control
- Notification system
- Product materials system
- Inventory movements

### In Progress 🔄
- Migration reorganization
- Consistency improvements

### Planned 📋
- Performance optimizations
- Additional indexes
- Data validation constraints

## How to Apply Migrations

1. **Manual Application**: Apply migrations in order using your database client
2. **Script Application**: Use migration scripts in `/scripts/` directory
3. **Supabase**: Migrations are automatically applied via Supabase CLI

## Important Notes

- Always backup your database before applying migrations
- Migrations should be idempotent (safe to run multiple times)
- Test migrations on development environment first
- Keep track of which migrations have been applied to production

## Migration Dependencies

Some migrations depend on others being applied first:

- Role permissions table requires roles table
- Product materials requires products table
- Transaction master requires categories table

## Rollback Procedures

For each major migration, rollback scripts are available in the same directory with `_rollback.sql` suffix.

## Contact

For migration issues or questions, contact the development team.
