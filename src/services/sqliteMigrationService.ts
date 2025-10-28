/**
 * SQLite Migration Service - SQLite-specific schema migrations
 * 
 * This service handles SQLite-specific schema conversions
 * Converts PostgreSQL schema to SQLite-compatible format
 */

export class SQLiteMigrationService {
  private static instance: SQLiteMigrationService;

  private constructor() {}

  static getInstance(): SQLiteMigrationService {
    if (!SQLiteMigrationService.instance) {
      SQLiteMigrationService.instance = new SQLiteMigrationService();
    }
    return SQLiteMigrationService.instance;
  }

  /**
   * Convert PostgreSQL schema to SQLite
   */
  convertToSQLite(pgSchema: string): string {
    let sqliteSchema = pgSchema;

    // Convert data types
    sqliteSchema = sqliteSchema
      .replace(/UUID/g, 'TEXT')
      .replace(/gen_random_uuid\(\)/g, "lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))")
      .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL')
      .replace(/TIMESTAMP WITH TIME ZONE/g, 'DATETIME')
      .replace(/TIMESTAMP/g, 'DATETIME')
      .replace(/BOOLEAN/g, 'INTEGER')
      .replace(/TEXT CHECK/g, 'TEXT')
      .replace(/VARCHAR\(\d+\)/g, 'TEXT')
      .replace(/VARCHAR/g, 'TEXT');

    // Remove PostgreSQL-specific features
    sqliteSchema = sqliteSchema
      .replace(/CREATE EXTENSION[^;]+;/g, '')
      .replace(/CREATE OR REPLACE FUNCTION[^;]+;/g, '')
      .replace(/CREATE TRIGGER[^;]+;/g, '')
      .replace(/CREATE INDEX[^;]+;/g, '')
      .replace(/REFERENCES[^,)]+\)/g, '')
      .replace(/ON DELETE CASCADE/g, '')
      .replace(/ON DELETE RESTRICT/g, '')
      .replace(/UNIQUE NOT NULL/g, 'UNIQUE')
      .replace(/NOT NULL DEFAULT[^,)]+\)/g, 'NOT NULL')
      .replace(/DEFAULT NOW\(\)/g, 'DEFAULT CURRENT_TIMESTAMP')
      .replace(/DEFAULT gen_random_uuid\(\)/g, 'PRIMARY KEY');

    // Clean up extra whitespace and empty lines
    sqliteSchema = sqliteSchema
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\s*\n/gm, '')
      .trim();

    return sqliteSchema;
  }

  /**
   * Get SQLite-compatible schema
   */
  getSQLiteSchema(): string {
    return `
      -- Create employees table
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        nama TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        status TEXT NOT NULL DEFAULT 'Active',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL DEFAULT 'product',
        color TEXT NOT NULL DEFAULT '#6b7280',
        icon TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        description TEXT,
        price REAL NOT NULL DEFAULT 0,
        cost REAL NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        category_id TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create customers table
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create orders table
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        total_amount REAL NOT NULL DEFAULT 0,
        payment_method TEXT,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create order_items table
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT,
        product_id TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create migrations table
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        version TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
      CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
    `;
  }

  /**
   * Create SQLite triggers (using application-level triggers)
   */
  getSQLiteTriggers(): string {
    return `
      -- Note: SQLite doesn't support triggers like PostgreSQL
      -- These will be handled at the application level
      -- See src/lib/database-triggers.ts for implementation
    `;
  }

  /**
   * Get sample data for SQLite
   */
  getSampleData(): any[] {
    return [
      {
        table: 'employees',
        data: {
          id: 'admin-001',
          username: 'admin',
          password: 'admin123',
          email: 'admin@studio-pos.com',
          nama: 'Administrator',
          role: 'Administrator',
          status: 'Active',
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        table: 'categories',
        data: [
          {
            id: 'cat-001',
            name: 'Makanan',
            type: 'product',
            color: '#10b981',
            icon: '🍽️',
            description: 'Kategori untuk makanan',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'cat-002',
            name: 'Minuman',
            type: 'product',
            color: '#3b82f6',
            icon: '🥤',
            description: 'Kategori untuk minuman',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'cat-003',
            name: 'Snack',
            type: 'product',
            color: '#f59e0b',
            icon: '🍿',
            description: 'Kategori untuk snack',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }
    ];
  }
}

// Export singleton instance
export const sqliteMigrationService = SQLiteMigrationService.getInstance();

