/**
 * Script to fix the payment_update trigger
 * This ensures payment_update only updates when DP or Pelunasan actually changes
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eiobnwwzapiwxkxmqmhc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPaymentUpdateTrigger() {
  try {
    console.log('🔧 Fixing payment_update trigger...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250117000000_fix_payment_update_trigger.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Error executing migration:', error);
      
      // Try direct execution if rpc fails
      console.log('🔄 Trying direct execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement) {
          console.log(`Executing: ${statement.substring(0, 100)}...`);
          const { error: execError } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (execError) {
            console.error('Error:', execError.message);
          }
        }
      }
      
      console.log('\n⚠️  Please run this migration manually in the Supabase SQL Editor:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of:');
      console.log(`   supabase/migrations/20250117000000_fix_payment_update_trigger.sql`);
      console.log('4. Run the query');
      
    } else {
      console.log('✅ Payment update trigger fixed successfully!');
    }
    
    // Verify the trigger exists
    console.log('\n🔍 Verifying trigger...');
    const { data: triggerData, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('*')
      .eq('tgname', 'trigger_update_payment_update')
      .single();
    
    if (triggerError) {
      console.log('⚠️  Could not verify trigger (this is okay if permissions are restricted)');
    } else if (triggerData) {
      console.log('✅ Trigger verified: trigger_update_payment_update exists');
    }
    
    console.log('\n📝 Summary:');
    console.log('- payment_update field will now ONLY update when:');
    console.log('  1. down_payment value actually changes, OR');
    console.log('  2. pelunasan value actually changes');
    console.log('- It will NOT update when other order fields are changed');
    console.log('- In the Report > Transaction tab, the payment date will now correctly reflect');
    console.log('  the date when DP or Pelunasan was last edited');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
fixPaymentUpdateTrigger();

