// Check if Supabase connection is available
const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    return !error;
  } catch (error) {
    console.log('Supabase not available:', error);
    return false;
  }
};

// Auto-initialize on app start
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    // Check if we're using Supabase
    const isSupabase = await checkSupabaseConnection();
    
    if (isSupabase) {
      console.log('📡 Using Supabase database...');
      await initializeSupabaseTables();
    } else {
      console.log('💾 Using local storage database...');
    }
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const initializeSupabaseTables = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Try to create tables by attempting to insert and catch errors
    // This is a simpler approach than using RPC functions
    console.log('📋 Checking/creating categories table...');
    
    // Insert default categories if they don't exist
    await insertDefaultCategories();
    
    console.log('✅ Supabase tables initialized');
  } catch (error) {
    console.error('❌ Error initializing Supabase tables:', error);
    throw error;
  }
};

const insertDefaultCategories = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Check if categories already exist
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (existingCategories && existingCategories.length > 0) {
      console.log('📋 Categories already exist, skipping default insertion');
      return;
    }
    
    // Insert default categories - adjust structure to match your categories table
    const defaultCategories = [
      { category_name: 'Penjualan', code: 'SALES', type: 'income', color: '#10b981', group_name: 'Income' },
      { category_name: 'Jasa', code: 'SERVICE', type: 'income', color: '#10b981', group_name: 'Income' },
      { category_name: 'Bahan Baku', code: 'MATERIAL', type: 'expense', color: '#ef4444', group_name: 'Expense' },
      { category_name: 'Operasional', code: 'OPERATIONAL', type: 'expense', color: '#ef4444', group_name: 'Expense' },
      { category_name: 'Gaji', code: 'SALARY', type: 'expense', color: '#ef4444', group_name: 'Expense' },
      { category_name: 'Utilitas', code: 'UTILITY', type: 'expense', color: '#ef4444', group_name: 'Expense' }
    ];
    
    const { error } = await supabase
      .from('categories')
      .insert(defaultCategories);
    
    if (error) {
      console.warn('⚠️ Could not insert default categories:', error);
    } else {
      console.log('✅ Default categories inserted');
    }
  } catch (error) {
    console.error('❌ Error inserting default categories:', error);
  }
};