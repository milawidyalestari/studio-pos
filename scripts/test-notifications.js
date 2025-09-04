const { createClient } = require('@supabase/supabase-js');

// Use the same credentials as the client
const SUPABASE_URL = "https://oojmuyalhveuefjbwysj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testNotifications() {
  try {
    console.log('🧪 Testing Notification System...\n');

    // 1. Test database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('count(*)', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Create a test notification
    console.log('\n2. Creating test notification...');
    const { data: newNotification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        message: 'Test - Manual notification from script',
        type: 'order_updated',
        user_name: 'Test Script',
        order_data: { 
          test: true, 
          timestamp: new Date().toISOString(),
          script: 'test-notifications.js'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create test notification:', insertError.message);
      return;
    }
    console.log('✅ Test notification created successfully');
    console.log('📝 Notification ID:', newNotification.id);

    // 3. Fetch all notifications
    console.log('\n3. Fetching all notifications...');
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('❌ Failed to fetch notifications:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${notifications.length} notifications`);
    console.log('\n📋 Latest notifications:');
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.message} (${notif.user_name}) - ${notif.timestamp}`);
    });

    // 4. Test real-time subscription
    console.log('\n4. Testing real-time subscription...');
    const channel = supabase
      .channel('test_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('🎉 Real-time event received:', payload.eventType);
          console.log('📊 Data:', payload.new || payload.old);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription successful');
          
          // Create another test notification to trigger real-time event
          setTimeout(async () => {
            console.log('\n5. Creating real-time test notification...');
            const { error: realtimeError } = await supabase
              .from('notifications')
              .insert({
                message: 'Test - Real-time notification',
                type: 'order_created',
                user_name: 'Real-time Test',
                order_data: { realtime: true, timestamp: new Date().toISOString() }
              });

            if (realtimeError) {
              console.error('❌ Real-time test failed:', realtimeError.message);
            } else {
              console.log('✅ Real-time test notification created');
            }

            // Cleanup
            setTimeout(() => {
              supabase.removeChannel(channel);
              console.log('\n🧹 Cleanup completed');
              console.log('\n🎯 Test Summary:');
              console.log('- Database connection: ✅');
              console.log('- Notification creation: ✅');
              console.log('- Notification fetching: ✅');
              console.log('- Real-time subscription: ✅');
              console.log('\n💡 If you see real-time events in the console, the system is working!');
            }, 2000);
          }, 1000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
        }
      });

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testNotifications();
