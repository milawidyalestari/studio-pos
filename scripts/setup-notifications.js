const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupNotifications() {
  try {
    console.log('Setting up notifications table...');

    // Create notifications table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create notifications table
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          message TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('order_created', 'order_deleted', 'order_updated', 'order_processing', 'order_completed')),
          order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
          user_name TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          is_read BOOLEAN DEFAULT FALSE,
          order_data JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
        CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);

        -- Enable Row Level Security
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

        -- Create policy for reading notifications (all authenticated users can read)
        DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON notifications;
        CREATE POLICY "Allow authenticated users to read notifications" ON notifications
          FOR SELECT USING (auth.role() = 'authenticated');

        -- Create policy for inserting notifications (all authenticated users can insert)
        DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON notifications;
        CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        -- Create policy for updating notifications (all authenticated users can update)
        DROP POLICY IF EXISTS "Allow authenticated users to update notifications" ON notifications;
        CREATE POLICY "Allow authenticated users to update notifications" ON notifications
          FOR UPDATE USING (auth.role() = 'authenticated');
      `
    });

    if (createError) {
      console.error('Error creating notifications table:', createError);
      throw createError;
    }

    console.log('✅ Notifications table created successfully!');
    console.log('✅ Indexes created successfully!');
    console.log('✅ Row Level Security enabled!');
    console.log('✅ Policies created successfully!');

    // Test insert a sample notification
    const { error: testError } = await supabase
      .from('notifications')
      .insert({
        message: 'System - Notifikasi berhasil diaktifkan',
        type: 'order_updated',
        user_name: 'System',
        order_data: { test: true }
      });

    if (testError) {
      console.error('Error testing notification insert:', testError);
    } else {
      console.log('✅ Test notification inserted successfully!');
    }

    console.log('\n🎉 Notifications system setup completed!');
    console.log('The inbox will now automatically show notifications for:');
    console.log('- New orders created');
    console.log('- Orders updated');
    console.log('- Orders deleted');
    console.log('- Order status changes (processing, completed)');

  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    process.exit(1);
  }
}

setupNotifications();


