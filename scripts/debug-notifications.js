const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugNotifications() {
  try {
    console.log('🔍 Debugging Notification System...\n');

    // 1. Check if notifications table exists
    console.log('1. Checking notifications table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('notifications')
      .select('count(*)', { count: 'exact', head: true });

    if (tableError) {
      console.error('❌ Notifications table error:', tableError);
      console.log('💡 Solution: Run the database setup script first');
      return;
    }
    console.log('✅ Notifications table exists');

    // 2. Check if there are any notifications
    console.log('\n2. Checking existing notifications...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
    } else {
      console.log(`✅ Found ${notifications.length} notifications`);
      if (notifications.length > 0) {
        console.log('Latest notification:', notifications[0]);
      }
    }

    // 3. Check orders table structure
    console.log('\n3. Checking orders table structure...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (ordersError) {
      console.error('❌ Error accessing orders table:', ordersError);
    } else if (orders.length > 0) {
      console.log('✅ Orders table accessible');
      console.log('Sample order fields:', Object.keys(orders[0]));
      
      // Check if employee_id field exists
      if ('employee_id' in orders[0]) {
        console.log('✅ employee_id field exists');
      } else {
        console.log('⚠️  employee_id field not found - this might cause issues');
      }
    }

    // 4. Check employees table
    console.log('\n4. Checking employees table...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, name')
      .limit(3);

    if (empError) {
      console.error('❌ Error accessing employees table:', empError);
    } else {
      console.log(`✅ Employees table accessible, found ${employees.length} employees`);
      if (employees.length > 0) {
        console.log('Sample employees:', employees);
      }
    }

    // 5. Test real-time subscription
    console.log('\n5. Testing real-time subscription...');
    const channel = supabase
      .channel('debug_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🎉 Real-time event received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    // Wait a bit for subscription to establish
    setTimeout(async () => {
      // 6. Test creating a notification manually
      console.log('\n6. Testing manual notification creation...');
      const { data: testNotif, error: testError } = await supabase
        .from('notifications')
        .insert({
          message: 'Test - Debug notification',
          type: 'order_updated',
          user_name: 'Debug System',
          order_data: { test: true, timestamp: new Date().toISOString() }
        })
        .select()
        .single();

      if (testError) {
        console.error('❌ Error creating test notification:', testError);
      } else {
        console.log('✅ Test notification created successfully:', testNotif);
      }

      // 7. Check RLS policies
      console.log('\n7. Checking RLS policies...');
      const { data: policies, error: policyError } = await supabase
        .rpc('get_policies', { table_name: 'notifications' })
        .catch(() => ({ data: null, error: 'Function not available' }));

      if (policyError) {
        console.log('⚠️  Could not check RLS policies directly');
        console.log('💡 Make sure RLS is enabled and policies are set correctly');
      } else {
        console.log('✅ RLS policies check completed');
      }

      // Cleanup
      supabase.removeChannel(channel);
      
      console.log('\n🎯 Debug Summary:');
      console.log('- Check browser console for real-time subscription errors');
      console.log('- Verify that orders table has employee_id field');
      console.log('- Ensure RLS policies allow authenticated users to read/write notifications');
      console.log('- Check if real-time is enabled in Supabase dashboard');
      
    }, 2000);

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugNotifications();



