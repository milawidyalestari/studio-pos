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
CREATE POLICY "Allow authenticated users to read notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for inserting notifications (all authenticated users can insert)
CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for updating notifications (all authenticated users can update)
CREATE POLICY "Allow authenticated users to update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to automatically clean old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old notifications (runs daily at 2 AM)
SELECT cron.schedule(
  'clean-old-notifications',
  '0 2 * * *',
  'SELECT clean_old_notifications();'
);


