-- =====================================================
-- MIGRATION: Notifications Table
-- Version: 002.004
-- Date: 2025-01-16
-- Description: Sistem notifikasi untuk aplikasi
-- =====================================================

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    order_data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_name ON notifications(user_name);

-- =====================================================
-- FUNCTION: Clean Old Notifications
-- =====================================================
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS VOID AS $$
BEGIN
    DELETE FROM notifications 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Cleaned old notifications older than 30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Create Notification
-- =====================================================
CREATE OR REPLACE FUNCTION create_notification(
    p_message TEXT,
    p_type notification_type,
    p_user_name VARCHAR(255),
    p_order_id UUID DEFAULT NULL,
    p_order_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_notification_id UUID;
BEGIN
    INSERT INTO notifications (message, type, user_name, order_id, order_data)
    VALUES (p_message, p_type, p_user_name, p_order_id, p_order_data)
    RETURNING id INTO new_notification_id;
    
    RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE notifications IS 'Sistem notifikasi untuk tracking aktivitas pengguna';
COMMENT ON COLUMN notifications.type IS 'Jenis notifikasi sesuai enum notification_type';
COMMENT ON COLUMN notifications.order_data IS 'Data order dalam format JSON untuk referensi';
COMMENT ON FUNCTION clean_old_notifications() IS 'Membersihkan notifikasi lama (> 30 hari)';
COMMENT ON FUNCTION create_notification(TEXT, notification_type, VARCHAR, UUID, JSONB) IS 'Helper function untuk membuat notifikasi baru';











