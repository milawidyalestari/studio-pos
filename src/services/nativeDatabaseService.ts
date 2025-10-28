import { DatabaseManager, DatabaseConfig } from '@/lib/database-manager';

export interface DatabaseDetectionResult {
  hasDatabase: boolean;
  databaseType: 'postgresql' | 'sqlite' | 'none';
  isFirstRun: boolean;
  needsSetup: boolean;
  error?: string;
}

export interface FirstRunSetup {
  createDefaultUser: boolean;
  createDefaultCategories: boolean;
  createDefaultTables: boolean;
  initializeSampleData: boolean;
}

export class NativeDatabaseService {
  private static instance: NativeDatabaseService;
  private databaseManager: DatabaseManager;
  private isInitialized = false;

  private constructor() {
    this.databaseManager = DatabaseManager.getInstance();
  }

  static getInstance(): NativeDatabaseService {
    if (!NativeDatabaseService.instance) {
      NativeDatabaseService.instance = new NativeDatabaseService();
    }
    return NativeDatabaseService.instance;
  }

  /**
   * Deteksi database yang tersedia pada sistem
   */
  async detectDatabase(): Promise<DatabaseDetectionResult> {
    try {
      console.log('🔍 Detecting available databases...');

      // Cek apakah ada Electron API (PostgreSQL/SQLite)
      const hasElectronAPI = typeof window !== 'undefined' && 
        (window as any).electronAPI?.database;

      if (hasElectronAPI) {
        try {
          const dbInfo = await (window as any).electronAPI.database.getInfo();
          
          if (dbInfo.connected) {
            console.log('✅ PostgreSQL/SQLite database detected and connected');
            return {
              hasDatabase: true,
              databaseType: dbInfo.type === 'postgresql' ? 'postgresql' : 'sqlite',
              isFirstRun: false,
              needsSetup: false
            };
          }
        } catch (error) {
          console.warn('⚠️ Database connection failed:', error);
        }
      }

      // Cek apakah ada data di localStorage (aplikasi sudah pernah dijalankan)
      const hasLocalData = this.checkLocalStorageData();
      
      if (hasLocalData) {
        console.log('💾 Local storage data found');
        return {
          hasDatabase: true,
          databaseType: 'none', // Local storage
          isFirstRun: false,
          needsSetup: false
        };
      }

      // First run - tidak ada database atau data
      console.log('🆕 First run detected - no database or data found');
      return {
        hasDatabase: false,
        databaseType: 'none',
        isFirstRun: true,
        needsSetup: true
      };

    } catch (error) {
      console.error('❌ Database detection failed:', error);
      return {
        hasDatabase: false,
        databaseType: 'none',
        isFirstRun: true,
        needsSetup: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cek apakah ada data di localStorage
   */
  private checkLocalStorageData(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => 
        key.startsWith('studio_pos_') || 
        key.startsWith('finance_') ||
        key.includes('transaction') ||
        key.includes('category')
      );
      return appKeys.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Setup database untuk first run
   */
  async setupFirstRun(setup: FirstRunSetup): Promise<void> {
    try {
      console.log('🚀 Setting up first run...');

      // Initialize database manager
      const config: DatabaseConfig = {
        mode: 'production',
        type: 'local', // Default ke local storage untuk first run
        connection: {}
      };

      await this.databaseManager.initialize(config);

      // Create default user
      if (setup.createDefaultUser) {
        await this.createDefaultUser();
      }

      // Create default categories
      if (setup.createDefaultCategories) {
        await this.createDefaultCategories();
      }

      // Create default tables structure
      if (setup.createDefaultTables) {
        await this.createDefaultTables();
      }

      // Initialize sample data
      if (setup.initializeSampleData) {
        await this.initializeSampleData();
      }

      this.isInitialized = true;
      console.log('✅ First run setup completed');

    } catch (error) {
      console.error('❌ First run setup failed:', error);
      throw error;
    }
  }

  /**
   * Buat user admin default
   */
  private async createDefaultUser(): Promise<void> {
    try {
      console.log('👤 Creating default admin user...');

      const adminUser = {
        id: 'admin',
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        email: 'admin@studio-pos.com',
        role: 'admin',
        full_name: 'Administrator',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Simpan ke localStorage untuk sementara
      localStorage.setItem('studio_pos_users', JSON.stringify([adminUser]));
      
      console.log('✅ Default admin user created (admin/admin123)');
    } catch (error) {
      console.error('❌ Failed to create default user:', error);
      throw error;
    }
  }

  /**
   * Buat kategori default
   */
  private async createDefaultCategories(): Promise<void> {
    try {
      console.log('📋 Creating default categories...');

      const defaultCategories = [
        {
          id: 'cat_1',
          name: 'Penjualan',
          type: 'income',
          color: '#10b981',
          created_at: new Date().toISOString()
        },
        {
          id: 'cat_2',
          name: 'Jasa',
          type: 'income',
          color: '#059669',
          created_at: new Date().toISOString()
        },
        {
          id: 'cat_3',
          name: 'Bahan Baku',
          type: 'expense',
          color: '#ef4444',
          created_at: new Date().toISOString()
        },
        {
          id: 'cat_4',
          name: 'Operasional',
          type: 'expense',
          color: '#dc2626',
          created_at: new Date().toISOString()
        },
        {
          id: 'cat_5',
          name: 'Gaji',
          type: 'expense',
          color: '#f59e0b',
          created_at: new Date().toISOString()
        },
        {
          id: 'cat_6',
          name: 'Utilitas',
          type: 'expense',
          color: '#8b5cf6',
          created_at: new Date().toISOString()
        }
      ];

      localStorage.setItem('studio_pos_categories', JSON.stringify(defaultCategories));
      
      console.log('✅ Default categories created');
    } catch (error) {
      console.error('❌ Failed to create default categories:', error);
      throw error;
    }
  }

  /**
   * Buat struktur tabel default
   */
  private async createDefaultTables(): Promise<void> {
    try {
      console.log('🗄️ Creating default table structure...');

      // Initialize empty tables
      const tables = {
        orders: [],
        products: [],
        customers: [],
        suppliers: [],
        employees: [],
        transactions: [],
        categories: [],
        users: []
      };

      // Simpan struktur tabel ke localStorage
      Object.entries(tables).forEach(([tableName, data]) => {
        localStorage.setItem(`studio_pos_${tableName}`, JSON.stringify(data));
      });

      console.log('✅ Default table structure created');
    } catch (error) {
      console.error('❌ Failed to create default tables:', error);
      throw error;
    }
  }

  /**
   * Initialize sample data untuk demo
   */
  private async initializeSampleData(): Promise<void> {
    try {
      console.log('📊 Initializing sample data...');

      // Sample customers
      const sampleCustomers = [
        {
          id: 'cust_1',
          kode: 'CUST001',
          nama: 'Pelanggan Umum',
          whatsapp: '',
          level: 'Regular',
          created_at: new Date().toISOString()
        }
      ];

      // Sample products
      const sampleProducts = [
        {
          id: 'prod_1',
          kode: 'PROD001',
          jenis: 'Print',
          nama: 'Print A4 Hitam Putih',
          satuan: 'lembar',
          harga_beli: 500,
          harga_jual: 1000,
          stok_awal: 0,
          stok_masuk: 0,
          stok_keluar: 0,
          stok_opname: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'prod_2',
          kode: 'PROD002',
          jenis: 'Print',
          nama: 'Print A4 Berwarna',
          satuan: 'lembar',
          harga_beli: 2000,
          harga_jual: 3000,
          stok_awal: 0,
          stok_masuk: 0,
          stok_keluar: 0,
          stok_opname: 0,
          created_at: new Date().toISOString()
        }
      ];

      // Sample suppliers
      const sampleSuppliers = [
        {
          id: 'sup_1',
          name: 'Supplier Bahan Baku',
          contact_person: 'John Doe',
          email: 'john@supplier.com',
          phone: '08123456789',
          payment_terms: '30 hari',
          outstanding_balance: 0,
          address: 'Jl. Supplier No. 1',
          created_at: new Date().toISOString()
        }
      ];

      // Simpan sample data
      localStorage.setItem('studio_pos_customers', JSON.stringify(sampleCustomers));
      localStorage.setItem('studio_pos_products', JSON.stringify(sampleProducts));
      localStorage.setItem('studio_pos_suppliers', JSON.stringify(sampleSuppliers));

      console.log('✅ Sample data initialized');
    } catch (error) {
      console.error('❌ Failed to initialize sample data:', error);
      throw error;
    }
  }

  /**
   * Cek apakah aplikasi sudah diinisialisasi
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get database manager instance
   */
  getDatabaseManager(): DatabaseManager {
    return this.databaseManager;
  }

  /**
   * Reset aplikasi ke kondisi fresh
   */
  async resetToFresh(): Promise<void> {
    try {
      console.log('🔄 Resetting application to fresh state...');

      // Clear all localStorage data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('studio_pos_') || key.startsWith('finance_')) {
          localStorage.removeItem(key);
        }
      });

      // Reset initialization flag
      this.isInitialized = false;

      console.log('✅ Application reset to fresh state');
    } catch (error) {
      console.error('❌ Failed to reset application:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const nativeDatabaseService = NativeDatabaseService.getInstance();


