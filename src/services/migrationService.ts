import { DatabaseService } from '@/lib/database';
import { Transaction, Category } from '@/types/finance';
import { CashRegisterConfig } from '@/types/cashRegister';

export interface MigrationStatus {
  tableName: string;
  totalRecords: number;
  migratedRecords: number;
  migrationStatus: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface MigrationProgress {
  currentTable: string;
  currentRecord: number;
  totalRecords: number;
  percentage: number;
  status: string;
}

export class MigrationService {
  public database: DatabaseService;
  private onProgress?: (progress: MigrationProgress) => void;

  constructor(database: DatabaseService) {
    this.database = database;
  }

  setProgressCallback(callback: (progress: MigrationProgress) => void) {
    this.onProgress = callback;
  }

  private updateProgress(
    currentTable: string,
    currentRecord: number,
    totalRecords: number,
    status: string
  ) {
    if (this.onProgress) {
      const percentage = Math.round((currentRecord / totalRecords) * 100);
      this.onProgress({
        currentTable,
        currentRecord,
        totalRecords,
        percentage,
        status
      });
    }
  }

  async migrateAllData(): Promise<MigrationStatus[]> {
    const results: MigrationStatus[] = [];

    try {
      // Migrate categories
      results.push(await this.migrateCategories());

      // Migrate transactions
      results.push(await this.migrateTransactions());

      // Migrate cash register configs
      results.push(await this.migrateCashRegisterConfigs());

      // Migrate products
      results.push(await this.migrateProducts());

      // Migrate app settings
      results.push(await this.migrateAppSettings());

      return results;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async migrateCategories(): Promise<MigrationStatus> {
    try {
      this.updateProgress('categories', 0, 1, 'Starting category migration...');

      // Get categories from local storage
      const localCategories = this.getLocalStorageData('categories') || [];
      
      if (localCategories.length === 0) {
        this.updateProgress('categories', 1, 1, 'No categories to migrate');
        return {
          tableName: 'categories',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'completed'
        };
      }

      let migratedCount = 0;
      
      for (let i = 0; i < localCategories.length; i++) {
        const category = localCategories[i];
        
        try {
          // Check if category already exists
          const existingCategory = await this.database.getCategoryByName(category.name);
          
          if (!existingCategory) {
            // Create new category in database
            await this.database.createCategory({
              name: category.name,
              type: category.type,
              color: category.color || '#3B82F6',
              icon: category.icon,
              description: category.description
            });
            migratedCount++;
          }
          
          this.updateProgress(
            'categories',
            i + 1,
            localCategories.length,
            `Migrated ${migratedCount} categories`
          );
        } catch (error) {
          console.error(`Failed to migrate category ${category.name}:`, error);
        }
      }

      this.updateProgress('categories', localCategories.length, localCategories.length, 'Category migration completed');
      
      return {
        tableName: 'categories',
        totalRecords: localCategories.length,
        migratedRecords: migratedCount,
        migrationStatus: 'completed'
      };
    } catch (error) {
      return {
        tableName: 'categories',
        totalRecords: 0,
        migratedRecords: 0,
        migrationStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async migrateTransactions(): Promise<MigrationStatus> {
    try {
      this.updateProgress('transactions', 0, 1, 'Starting transaction migration...');

      // Get transactions from local storage
      const localTransactions = this.getLocalStorageData('transactions') || [];
      
      if (localTransactions.length === 0) {
        this.updateProgress('transactions', 1, 1, 'No transactions to migrate');
        return {
          tableName: 'transactions',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'completed'
        };
      }

      let migratedCount = 0;
      
      for (let i = 0; i < localTransactions.length; i++) {
        const transaction = localTransactions[i];
        
        try {
          // Check if transaction already exists
          const existingTransaction = await this.database.getTransactionByReference(transaction.reference_number);
          
          if (!existingTransaction) {
            // Get category ID if category exists
            let categoryId: string | null = null;
            if (transaction.category) {
              const category = await this.database.getCategoryByName(transaction.category);
              categoryId = category?.id || null;
            }

            // Create new transaction in database
            await this.database.createTransaction({
              title: transaction.title,
              amount: transaction.amount,
              type: transaction.type,
              categoryId,
              date: new Date(transaction.date),
              description: transaction.description,
              paymentMethod: transaction.paymentMethod,
              referenceNumber: transaction.referenceNumber
            });
            migratedCount++;
          }
          
          this.updateProgress(
            'transactions',
            i + 1,
            localTransactions.length,
            `Migrated ${migratedCount} transactions`
          );
        } catch (error) {
          console.error(`Failed to migrate transaction ${transaction.title}:`, error);
        }
      }

      this.updateProgress('transactions', localTransactions.length, localTransactions.length, 'Transaction migration completed');
      
      return {
        tableName: 'transactions',
        totalRecords: localTransactions.length,
        migratedRecords: migratedCount,
        migrationStatus: 'completed'
      };
    } catch (error) {
      return {
        tableName: 'transactions',
        totalRecords: 0,
        migratedRecords: 0,
        migrationStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async migrateCashRegisterConfigs(): Promise<MigrationStatus> {
    try {
      this.updateProgress('cash_register_configs', 0, 1, 'Starting cash register config migration...');

      // Get cash register configs from local storage
      const localConfigs = this.getLocalStorageData('cashRegisterConfigs') || [];
      
      if (localConfigs.length === 0) {
        this.updateProgress('cash_register_configs', 1, 1, 'No cash register configs to migrate');
        return {
          tableName: 'cash_register_configs',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'completed'
        };
      }

      let migratedCount = 0;
      
      for (let i = 0; i < localConfigs.length; i++) {
        const config = localConfigs[i];
        
        try {
          // Check if config already exists
          const existingConfig = await this.database.getCashRegisterConfigByName(config.name);
          
          if (!existingConfig) {
            // Create new config in database
            await this.database.createCashRegisterConfig({
              name: config.name,
              manufacturer: config.manufacturer,
              model: config.model,
              type: config.type,
              connectionType: config.connectionType,
              protocol: config.protocol,
              ipAddress: config.ipAddress,
              port: config.port,
              baudRate: config.baudRate,
              features: config.features,
              commands: config.commands,
              settings: config.settings,
              status: config.status || 'disconnected'
            });
            migratedCount++;
          }
          
          this.updateProgress(
            'cash_register_configs',
            i + 1,
            localConfigs.length,
            `Migrated ${migratedCount} cash register configs`
          );
        } catch (error) {
          console.error(`Failed to migrate cash register config ${config.name}:`, error);
        }
      }

      this.updateProgress('cash_register_configs', localConfigs.length, localConfigs.length, 'Cash register config migration completed');
      
      return {
        tableName: 'cash_register_configs',
        totalRecords: localConfigs.length,
        migratedRecords: migratedCount,
        migrationStatus: 'completed'
      };
    } catch (error) {
      return {
        tableName: 'cash_register_configs',
        totalRecords: 0,
        migratedRecords: 0,
        migrationStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async migrateProducts(): Promise<MigrationStatus> {
    try {
      this.updateProgress('products', 0, 1, 'Starting product migration...');

      // Get products from local storage
      const localProducts = this.getLocalStorageData('products') || [];
      
      if (localProducts.length === 0) {
        this.updateProgress('products', 1, 1, 'No products to migrate');
        return {
          tableName: 'products',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'completed'
        };
      }

      let migratedCount = 0;
      
      for (let i = 0; i < localProducts.length; i++) {
        const product = localProducts[i];
        
        try {
          // Check if product already exists
          const existingProduct = await this.database.getProductBySku(product.sku);
          
          if (!existingProduct) {
            // Create new product in database
            await this.database.createProduct({
              name: product.name,
              description: product.description,
              price: product.price,
              cost: product.cost,
              category: product.category,
              sku: product.sku,
              barcode: product.barcode,
              stockQuantity: product.stockQuantity || 0,
              minStockLevel: product.minStockLevel || 0
            });
            migratedCount++;
          }
          
          this.updateProgress(
            'products',
            i + 1,
            localProducts.length,
            `Migrated ${migratedCount} products`
          );
        } catch (error) {
          console.error(`Failed to migrate product ${product.name}:`, error);
        }
      }

      this.updateProgress('products', localProducts.length, localProducts.length, 'Product migration completed');
      
      return {
        tableName: 'products',
        totalRecords: localProducts.length,
        migratedRecords: migratedCount,
        migrationStatus: 'completed'
      };
    } catch (error) {
      return {
        tableName: 'products',
        totalRecords: 0,
        migratedRecords: 0,
        migrationStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async migrateAppSettings(): Promise<MigrationStatus> {
    try {
      this.updateProgress('app_settings', 0, 1, 'Starting app settings migration...');

      // Get app settings from local storage
      const localSettings = this.getLocalStorageData('appSettings') || {};
      
      if (Object.keys(localSettings).length === 0) {
        this.updateProgress('app_settings', 1, 1, 'No app settings to migrate');
        return {
          tableName: 'app_settings',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'completed'
        };
      }

      let migratedCount = 0;
      const settingKeys = Object.keys(localSettings);
      
      for (let i = 0; i < settingKeys.length; i++) {
        const key = settingKeys[i];
        const value = localSettings[key];
        
        try {
          // Create or update setting in database
          await this.database.createOrUpdateAppSetting({
            key,
            value: String(value),
            type: typeof value === 'boolean' ? 'boolean' : 'string',
            description: `Migrated from local storage`
          });
          migratedCount++;
          
          this.updateProgress(
            'app_settings',
            i + 1,
            settingKeys.length,
            `Migrated ${migratedCount} app settings`
          );
        } catch (error) {
          console.error(`Failed to migrate app setting ${key}:`, error);
        }
      }

      this.updateProgress('app_settings', settingKeys.length, settingKeys.length, 'App settings migration completed');
      
      return {
        tableName: 'app_settings',
        totalRecords: settingKeys.length,
        migratedRecords: migratedCount,
        migrationStatus: 'completed'
      };
    } catch (error) {
      return {
        tableName: 'app_settings',
        totalRecords: 0,
        migratedRecords: 0,
        migrationStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getLocalStorageData(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get local storage data for key ${key}:`, error);
      return null;
    }
  }

  async getMigrationStatus(): Promise<MigrationStatus[]> {
    try {
      // This would call the database function get_migration_status()
      // For now, return a basic status
      return [
        {
          tableName: 'categories',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'pending'
        },
        {
          tableName: 'transactions',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'pending'
        },
        {
          tableName: 'cash_register_configs',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'pending'
        },
        {
          tableName: 'products',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'pending'
        },
        {
          tableName: 'app_settings',
          totalRecords: 0,
          migratedRecords: 0,
          migrationStatus: 'pending'
        }
      ];
    } catch (error) {
      console.error('Failed to get migration status:', error);
      throw error;
    }
  }

  async backupLocalStorage(): Promise<string> {
    try {
      const backupData: Record<string, any> = {};
      
      // Backup all relevant local storage data
      const keys = [
        'categories',
        'transactions',
        'cashRegisterConfigs',
        'products',
        'appSettings',
        'cashRegisterConnections',
        'testResults'
      ];

      keys.forEach(key => {
        const data = this.getLocalStorageData(key);
        if (data) {
          backupData[key] = data;
        }
      });

      const backupString = JSON.stringify(backupData, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `studio-pos-backup-${timestamp}.json`;

      // Create download link
      const blob = new Blob([backupString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      return filename;
    } catch (error) {
      console.error('Failed to backup local storage:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupFile: File): Promise<void> {
    try {
      const backupData = await this.readBackupFile(backupFile);
      
      // Restore data to local storage
      Object.entries(backupData).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Failed to restore key ${key}:`, error);
        }
      });

      console.log('Backup restored successfully');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  private async readBackupFile(file: File): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid backup file format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };

      reader.readAsText(file);
    });
  }
}
