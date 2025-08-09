import { database } from '@/lib/database';

export class DatabaseInitService {
  static async initializeWithSampleData(): Promise<void> {
    console.log('🔄 Initializing database with sample data...');
    
    try {
      // Check if we already have data
      const existingTransactions = await database.getTransactions();
      const existingCategories = await database.getCategories();
      
      if (existingTransactions.length > 0) {
        console.log('✅ Database already has data, skipping initialization');
        return;
      }
      
      // Initialize categories if empty
      if (existingCategories.length === 0) {
        console.log('📁 Creating default categories...');
        
        const defaultCategories = [
          { name: 'Penjualan', type: 'income' as const, color: '#10b981' },
          { name: 'Jasa', type: 'income' as const, color: '#059669' },
          { name: 'Bahan Baku', type: 'expense' as const, color: '#ef4444' },
          { name: 'Operasional', type: 'expense' as const, color: '#dc2626' }
        ];
        
        for (const category of defaultCategories) {
          await database.addCategory(category);
        }
        
        console.log('✅ Default categories created');
      }
      
      // Add sample transactions
      console.log('💼 Creating sample transactions...');
      
      const sampleTransactions = [
        {
          date: new Date().toISOString().split('T')[0],
          type: 'income' as const,
          category: 'Penjualan',
          description: 'Spanduk Florist 2 Pass',
          amount: 150000,
          paymentMethod: 'Cash',
          status: 'completed' as const
        },
        {
          date: new Date().toISOString().split('T')[0],
          type: 'income' as const,
          category: 'Penjualan',
          description: 'Spanduk Glossy 280 Gsm',
          amount: 400000,
          paymentMethod: 'Transfer',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'expense' as const,
          category: 'Bahan Baku',
          description: 'Kertas A3 80gsm',
          amount: 250000,
          paymentMethod: 'Cash',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'expense' as const,
          category: 'Operasional',
          description: 'Biaya Listrik',
          amount: 150000,
          paymentMethod: 'Transfer',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'income' as const,
          category: 'Penjualan',
          description: 'Cincin / Mata Ayam',
          amount: 250000,
          paymentMethod: 'Cash',
          status: 'pending' as const
        },
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'income' as const,
          category: 'Jasa',
          description: 'Desain Logo',
          amount: 500000,
          paymentMethod: 'Transfer',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'expense' as const,
          category: 'Bahan Baku',
          description: 'Tinta Printer',
          amount: 300000,
          paymentMethod: 'Cash',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'income' as const,
          category: 'Penjualan',
          description: 'Banner Event',
          amount: 750000,
          paymentMethod: 'Transfer',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'expense' as const,
          category: 'Operasional',
          description: 'Biaya Internet',
          amount: 200000,
          paymentMethod: 'Transfer',
          status: 'completed' as const
        },
        {
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'income' as const,
          category: 'Jasa',
          description: 'Editing Video',
          amount: 350000,
          paymentMethod: 'Cash',
          status: 'completed' as const
        }
      ];
      
      for (const transaction of sampleTransactions) {
        await database.addTransaction(transaction);
      }
      
      console.log('✅ Sample transactions created');
      console.log('🎉 Database initialization completed successfully!');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
  
  static async checkDatabaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 Checking database connection...');
      
      // Try to fetch data to test connection
      await database.getTransactions();
      await database.getCategories();
      await database.getFinancialSummary();
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
  
  static async getDatabaseInfo(): Promise<{
    type: 'local' | 'supabase';
    transactionCount: number;
    categoryCount: number;
    isConnected: boolean;
  }> {
    try {
      const transactions = await database.getTransactions();
      const categories = await database.getCategories();
      
      // Detect database type
      const isSupabase = database.constructor.name === 'SupabaseDatabaseService';
      
      return {
        type: isSupabase ? 'supabase' : 'local',
        transactionCount: transactions.length,
        categoryCount: categories.length,
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to get database info:', error);
      return {
        type: 'local',
        transactionCount: 0,
        categoryCount: 0,
        isConnected: false
      };
    }
  }
}

// Auto-initialize on app start
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check connection first
    const isConnected = await DatabaseInitService.checkDatabaseConnection();
    
    if (isConnected) {
      // Get database info
      const dbInfo = await DatabaseInitService.getDatabaseInfo();
      console.log(`📊 Database Info:`, dbInfo);
      
      // Initialize with sample data if needed
      await DatabaseInitService.initializeWithSampleData();
    } else {
      console.warn('⚠️ Database connection failed, using fallback mode');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Don't throw error to prevent app crash
  }
};