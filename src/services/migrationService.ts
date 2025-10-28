/**
 * Migration Service - Database Schema Migration System
 * 
 * This service handles database schema migrations for different database types
 * Supports: PostgreSQL, SQLite, and LocalStorage
 */

export interface Migration {
  version: string;
  name: string;
  up: (adapter: any) => Promise<void>;
  down?: (adapter: any) => Promise<void>;
}

export interface MigrationResult {
  success: boolean;
  appliedMigrations: string[];
  error?: string;
}

export class MigrationService {
  private static instance: MigrationService;
  private migrations: Migration[] = [];

  private constructor() {
    this.registerMigrations();
  }

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Register all available migrations
   */
  private registerMigrations(): void {
    this.migrations = [
      {
        version: '001',
        name: 'initial_schema',
        up: this.createInitialSchema.bind(this)
      },
      {
        version: '002', 
        name: 'create_default_admin',
        up: this.createDefaultAdmin.bind(this)
      },
      {
        version: '003',
        name: 'create_sample_data',
        up: this.createSampleData.bind(this)
      }
    ];
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(adapter: any): Promise<MigrationResult> {
    try {
      const appliedMigrations: string[] = [];
      
      // Get already applied migrations
      const appliedVersions = await this.getAppliedMigrations(adapter);
      
      // Filter pending migrations
      const pendingMigrations = this.migrations.filter(
        migration => !appliedVersions.includes(migration.version)
      );

      console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);

      // Run each pending migration
      for (const migration of pendingMigrations) {
        try {
          console.log(`📦 Running migration ${migration.version}: ${migration.name}`);
          await migration.up(adapter);
          
          // Mark migration as applied
          await this.markMigrationApplied(adapter, migration.version);
          appliedMigrations.push(migration.version);
          
          console.log(`✅ Migration ${migration.version} completed`);
        } catch (error) {
          console.error(`❌ Migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      return {
        success: true,
        appliedMigrations
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        appliedMigrations: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create initial database schema
   */
  private async createInitialSchema(adapter: any): Promise<void> {
    // Check database type from config
    const configStr = localStorage.getItem('database_config');
    let schema = this.getInitialSchema();
    
    if (configStr) {
      const config = JSON.parse(configStr);
      if (config.type === 'sqlite') {
        // Use SQLite-compatible schema
        const { sqliteMigrationService } = await import('./sqliteMigrationService');
        schema = sqliteMigrationService.getSQLiteSchema();
      }
    }
    
    // For PostgreSQL/SQLite - execute SQL
    if (adapter.query && typeof adapter.query === 'function') {
      // This is a database adapter
      await this.executeSQL(adapter, schema);
    } else {
      // This is LocalStorage - create tables structure
      await this.createLocalStorageTables(schema);
    }
  }

  /**
   * Create default admin user
   */
  private async createDefaultAdmin(adapter: any): Promise<void> {
    const adminUser = {
      username: 'admin',
      password: 'admin123',
      email: 'admin@studio-pos.com',
      nama: 'Administrator',
      role: 'Administrator',
      status: 'Active',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if admin already exists
    const existingUsers = await adapter.query('employees', {
      where: { username: 'admin' },
      limit: 1
    });

    if (existingUsers.length === 0) {
      await adapter.create('employees', adminUser);
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  }

  /**
   * Create sample data
   */
  private async createSampleData(adapter: any): Promise<void> {
    // Create sample categories
    const categories = [
      {
        name: 'Makanan',
        type: 'product',
        color: '#10b981',
        icon: '🍽️',
        description: 'Kategori untuk makanan',
        created_at: new Date().toISOString()
      },
      {
        name: 'Minuman',
        type: 'product', 
        color: '#3b82f6',
        icon: '🥤',
        description: 'Kategori untuk minuman',
        created_at: new Date().toISOString()
      },
      {
        name: 'Snack',
        type: 'product',
        color: '#f59e0b',
        icon: '🍿',
        description: 'Kategori untuk snack',
        created_at: new Date().toISOString()
      }
    ];

    for (const category of categories) {
      const existing = await adapter.query('categories', {
        where: { name: category.name },
        limit: 1
      });

      if (existing.length === 0) {
        await adapter.create('categories', category);
      }
    }

    console.log('✅ Sample data created');
  }

  /**
   * Get initial database schema
   */
  private getInitialSchema(): string {
    return `
      -- Create employees table
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        nama VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'User',
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'product',
        color VARCHAR(7) NOT NULL DEFAULT '#6b7280',
        icon VARCHAR(10),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create products table
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        description TEXT,
        price DECIMAL(15,2) NOT NULL DEFAULT 0,
        cost DECIMAL(15,2) NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        category_id UUID REFERENCES categories(id),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create customers table
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create orders table
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(100),
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create order_items table
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(15,2) NOT NULL,
        total DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      CREATE TRIGGER update_employees_updated_at 
        BEFORE UPDATE ON employees
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_categories_updated_at 
        BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_products_updated_at 
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_customers_updated_at 
        BEFORE UPDATE ON customers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_orders_updated_at 
        BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
  }

  /**
   * Execute SQL for database adapters
   */
  private async executeSQL(adapter: any, sql: string): Promise<void> {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        await adapter.query(statement);
      } catch (error) {
        console.warn(`Warning executing SQL: ${statement}`, error);
        // Continue with other statements
      }
    }
  }

  /**
   * Create LocalStorage tables structure
   */
  private async createLocalStorageTables(schema: string): Promise<void> {
    // For LocalStorage, we just need to initialize empty arrays
    const tables = ['employees', 'categories', 'products', 'customers', 'orders', 'order_items'];
    
    for (const table of tables) {
      const existing = localStorage.getItem(`studio_pos_${table}`);
      if (!existing) {
        localStorage.setItem(`studio_pos_${table}`, JSON.stringify([]));
      }
    }
  }

  /**
   * Get applied migrations from database
   */
  private async getAppliedMigrations(adapter: any): Promise<string[]> {
    try {
      // Try to get from migrations table
      const migrations = await adapter.query('migrations', {
        select: 'version',
        orderBy: { column: 'version', direction: 'asc' }
      });
      
      return migrations.map((m: any) => m.version);
    } catch (error) {
      // If migrations table doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Mark migration as applied
   */
  private async markMigrationApplied(adapter: any, version: string): Promise<void> {
    try {
      // Try to insert into migrations table
      await adapter.create('migrations', {
        version,
        applied_at: new Date().toISOString()
      });
    } catch (error) {
      // If migrations table doesn't exist, create it first
      try {
        await adapter.query(`
          CREATE TABLE IF NOT EXISTS migrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            version VARCHAR(50) UNIQUE NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
        
        await adapter.create('migrations', {
          version,
          applied_at: new Date().toISOString()
        });
      } catch (createError) {
        console.warn('Could not create migrations table:', createError);
        // For LocalStorage, just log
        console.log(`Migration ${version} applied (LocalStorage)`);
      }
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(adapter: any): Promise<{
    total: number;
    applied: number;
    pending: number;
    appliedMigrations: string[];
  }> {
    const appliedVersions = await this.getAppliedMigrations(adapter);
    const pendingMigrations = this.migrations.filter(
      migration => !appliedVersions.includes(migration.version)
    );

    return {
      total: this.migrations.length,
      applied: appliedVersions.length,
      pending: pendingMigrations.length,
      appliedMigrations: appliedVersions
    };
  }
}

// Export singleton instance
export const migrationService = MigrationService.getInstance();