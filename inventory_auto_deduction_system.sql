-- =====================================================
-- INVENTORY AUTO DEDUCTION SYSTEM
-- Version: 1.0
-- Date: 2025-01-15
-- Description: Sistem otomatis mengurangi stok bahan ketika order berubah status
-- ke "Proses Cetak", "Done", atau "Selesai Diambil"
-- =====================================================

-- =====================================================
-- STEP 1: Create Function to Calculate Material Usage
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_material_usage_for_order(order_uuid UUID)
RETURNS TABLE (
    material_id UUID,
    material_name VARCHAR(255),
    total_quantity_needed DECIMAL(10,2),
    current_stock DECIMAL(10,2),
    unit VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as material_id,
        m.name as material_name,
        SUM(oi.quantity * pm.quantity_per_unit) as total_quantity_needed,
        m.stok_aktif as current_stock,
        m.unit
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN product_materials pm ON oi.item_id::UUID = pm.product_id
    JOIN materials m ON pm.material_id = m.id
    WHERE o.id = order_uuid
    GROUP BY m.id, m.name, m.stok_aktif, m.unit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: Create Function to Check Stock Availability
-- =====================================================
CREATE OR REPLACE FUNCTION check_stock_availability(order_uuid UUID)
RETURNS TABLE (
    material_id UUID,
    material_name VARCHAR(255),
    required_quantity DECIMAL(10,2),
    available_stock DECIMAL(10,2),
    shortage DECIMAL(10,2),
    is_sufficient BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        usage.material_id,
        usage.material_name,
        usage.total_quantity_needed as required_quantity,
        usage.current_stock as available_stock,
        GREATEST(0, usage.total_quantity_needed - usage.current_stock) as shortage,
        (usage.current_stock >= usage.total_quantity_needed) as is_sufficient
    FROM calculate_material_usage_for_order(order_uuid) usage;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: Create Function to Deduct Materials from Inventory
-- =====================================================
CREATE OR REPLACE FUNCTION deduct_materials_from_inventory(order_uuid UUID)
RETURNS TABLE (
    material_id UUID,
    material_name VARCHAR(255),
    quantity_deducted DECIMAL(10,2),
    stock_before DECIMAL(10,2),
    stock_after DECIMAL(10,2),
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    material_record RECORD;
    stock_before_value DECIMAL(10,2);
    stock_after_value DECIMAL(10,2);
    quantity_to_deduct DECIMAL(10,2);
    success_flag BOOLEAN;
    error_msg TEXT;
BEGIN
    -- Loop through each material needed for the order
    FOR material_record IN 
        SELECT * FROM calculate_material_usage_for_order(order_uuid)
    LOOP
        success_flag := TRUE;
        error_msg := NULL;
        
        -- Get current stock
        SELECT stok_aktif INTO stock_before_value
        FROM materials 
        WHERE id = material_record.material_id;
        
        quantity_to_deduct := material_record.total_quantity_needed;
        
        -- Check if sufficient stock
        IF stock_before_value < quantity_to_deduct THEN
            success_flag := FALSE;
            error_msg := 'Insufficient stock. Required: ' || quantity_to_deduct || ', Available: ' || stock_before_value;
            stock_after_value := stock_before_value;
        ELSE
            -- Deduct the quantity
            UPDATE materials 
            SET 
                stok_aktif = stok_aktif - quantity_to_deduct,
                stok_keluar = stok_keluar + quantity_to_deduct,
                updated_at = NOW()
            WHERE id = material_record.material_id;
            
            -- Get new stock value
            SELECT stok_aktif INTO stock_after_value
            FROM materials 
            WHERE id = material_record.material_id;
        END IF;
        
        -- Return result
        RETURN QUERY SELECT 
            material_record.material_id,
            material_record.material_name,
            quantity_to_deduct,
            stock_before_value,
            stock_after_value,
            success_flag,
            error_msg;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 4: Create Function to Record Inventory Movement
-- =====================================================
CREATE OR REPLACE FUNCTION record_inventory_movement(
    p_material_id UUID,
    p_quantity DECIMAL(10,2),
    p_reference_type VARCHAR(50),
    p_reference_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    movement_id UUID;
    stock_before DECIMAL(10,2);
    stock_after DECIMAL(10,2);
BEGIN
    -- Get current stock
    SELECT stok_aktif INTO stock_before
    FROM materials 
    WHERE id = p_material_id;
    
    -- Calculate stock after
    stock_after := stock_before - p_quantity;
    
    -- Insert inventory movement record (using actual table structure)
    INSERT INTO inventory_movements (
        material_id,
        tanggal,
        tipe_mutasi,
        jumlah,
        keterangan,
        user_id
    ) VALUES (
        p_material_id,
        NOW(),
        'keluar',
        p_quantity::INTEGER,
        COALESCE(p_notes, 'Auto deduction for order: ' || p_reference_id::TEXT),
        NULL
    ) RETURNING id INTO movement_id;
    
    RETURN movement_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: Create Main Function to Process Order Status Change
-- =====================================================
CREATE OR REPLACE FUNCTION process_order_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    order_uuid UUID;
    old_status_id INTEGER;
    new_status_id INTEGER;
    status_name VARCHAR(50);
    material_record RECORD;
    movement_id UUID;
    total_deducted INTEGER := 0;
    total_failed INTEGER := 0;
BEGIN
    -- Get order details
    order_uuid := NEW.id;
    old_status_id := OLD.status_id;
    new_status_id := NEW.status_id;
    
    -- Get status name
    SELECT name INTO status_name
    FROM order_statuses 
    WHERE id = new_status_id;
    
    -- Only process if status changed to production statuses
    IF (old_status_id IS DISTINCT FROM new_status_id) AND 
       (status_name IN ('Proses Cetak', 'Done', 'Selesai Diambil')) THEN
        
        -- Check if materials are already deducted for this order
        -- (Check by looking for movements with order reference in keterangan)
        IF EXISTS (
            SELECT 1 FROM inventory_movements 
            WHERE keterangan LIKE '%order: ' || order_uuid::TEXT || '%'
        ) THEN
            -- Materials already deducted, skip
            RETURN NEW;
        END IF;
        
        -- Check stock availability first
        FOR material_record IN 
            SELECT * FROM check_stock_availability(order_uuid)
        LOOP
            IF NOT material_record.is_sufficient THEN
                -- Log insufficient stock warning
                RAISE WARNING 'Insufficient stock for material % (ID: %). Required: %, Available: %', 
                    material_record.material_name, 
                    material_record.material_id,
                    material_record.required_quantity,
                    material_record.available_stock;
            END IF;
        END LOOP;
        
        -- Deduct materials
        FOR material_record IN 
            SELECT * FROM deduct_materials_from_inventory(order_uuid)
        LOOP
            IF material_record.success THEN
                -- Record inventory movement
                SELECT record_inventory_movement(
                    material_record.material_id,
                    material_record.quantity_deducted,
                    'order',
                    order_uuid,
                    'Auto deduction for order status: ' || status_name
                ) INTO movement_id;
                
                total_deducted := total_deducted + 1;
            ELSE
                total_failed := total_failed + 1;
                RAISE WARNING 'Failed to deduct material %: %', 
                    material_record.material_name, 
                    material_record.error_message;
            END IF;
        END LOOP;
        
        -- Log summary
        RAISE NOTICE 'Order % inventory processing: % materials deducted, % failed', 
            NEW.order_number, total_deducted, total_failed;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Create Trigger for Order Status Changes
-- =====================================================
DROP TRIGGER IF EXISTS trigger_order_inventory_deduction ON orders;
CREATE TRIGGER trigger_order_inventory_deduction
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION process_order_inventory_deduction();

-- =====================================================
-- STEP 7: Create View for Inventory Usage Monitoring
-- =====================================================
CREATE OR REPLACE VIEW inventory_usage_summary AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.customer_name,
    os.name as status_name,
    o.tanggal as order_date,
    m.id as material_id,
    m.name as material_name,
    m.unit,
    im.jumlah as quantity_used,
    im.tanggal as deduction_date,
    im.keterangan
FROM orders o
JOIN order_statuses os ON o.status_id = os.id
JOIN inventory_movements im ON im.keterangan LIKE '%order: ' || o.id::TEXT || '%'
JOIN materials m ON im.material_id = m.id
WHERE im.tipe_mutasi = 'keluar'
ORDER BY o.tanggal DESC, im.tanggal DESC;

-- =====================================================
-- STEP 8: Create View for Low Stock Alert
-- =====================================================
CREATE OR REPLACE VIEW low_stock_alert AS
SELECT 
    m.id,
    m.name as material_name,
    m.unit,
    m.stok_aktif as current_stock,
    m.stok_minimum as minimum_stock,
    (m.stok_aktif - m.stok_minimum) as stock_shortage,
    CASE 
        WHEN m.stok_aktif <= 0 THEN 'Out of Stock'
        WHEN m.stok_aktif <= m.stok_minimum THEN 'Low Stock'
        ELSE 'Sufficient'
    END as stock_status
FROM materials m
WHERE m.stok_aktif <= m.stok_minimum
ORDER BY stock_shortage ASC;

-- =====================================================
-- STEP 9: Create Helper Functions
-- =====================================================
-- Function to manually process inventory for specific order
CREATE OR REPLACE FUNCTION manual_process_order_inventory(order_uuid UUID)
RETURNS TABLE (
    material_name VARCHAR(255),
    quantity_deducted DECIMAL(10,2),
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    material_record RECORD;
BEGIN
    -- Check if already processed
    IF EXISTS (
        SELECT 1 FROM inventory_movements 
        WHERE keterangan LIKE '%order: ' || order_uuid::TEXT || '%'
    ) THEN
        RETURN QUERY SELECT 
            'Already Processed'::VARCHAR(255),
            0::DECIMAL(10,2),
            false,
            'Inventory already processed for this order'::TEXT;
        RETURN;
    END IF;
    
    -- Process materials
    FOR material_record IN 
        SELECT * FROM deduct_materials_from_inventory(order_uuid)
    LOOP
        IF material_record.success THEN
            -- Record movement
            PERFORM record_inventory_movement(
                material_record.material_id,
                material_record.quantity_deducted,
                'order',
                order_uuid,
                'Manual processing'
            );
        END IF;
        
        RETURN QUERY SELECT 
            material_record.material_name,
            material_record.quantity_deducted,
            material_record.success,
            COALESCE(material_record.error_message, 'Success')::TEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get order material requirements
CREATE OR REPLACE FUNCTION get_order_material_requirements(order_uuid UUID)
RETURNS TABLE (
    order_number VARCHAR(50),
    item_name VARCHAR(255),
    item_quantity INTEGER,
    material_name VARCHAR(255),
    material_quantity_per_unit DECIMAL(10,2),
    total_material_needed DECIMAL(10,2),
    material_unit VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_number,
        oi.item_name,
        oi.quantity as item_quantity,
        m.name as material_name,
        pm.quantity_per_unit,
        (oi.quantity * pm.quantity_per_unit) as total_material_needed,
        m.unit as material_unit
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN product_materials pm ON oi.item_id::UUID = pm.product_id
    JOIN materials m ON pm.material_id = m.id
    WHERE o.id = order_uuid
    ORDER BY oi.item_name, m.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 10: Add Comments and Documentation
-- =====================================================
COMMENT ON FUNCTION calculate_material_usage_for_order(UUID) IS 
'Menghitung total bahan yang dibutuhkan untuk order tertentu berdasarkan order items dan product materials';

COMMENT ON FUNCTION check_stock_availability(UUID) IS 
'Mengecek ketersediaan stok bahan untuk order tertentu';

COMMENT ON FUNCTION deduct_materials_from_inventory(UUID) IS 
'Mengurangi stok bahan dari inventory untuk order tertentu';

COMMENT ON FUNCTION record_inventory_movement(UUID, DECIMAL, VARCHAR, UUID, TEXT) IS 
'Mencatat pergerakan inventory (stok keluar)';

COMMENT ON FUNCTION process_order_inventory_deduction() IS 
'Trigger function untuk memproses pengurangan stok otomatis ketika order berubah status';

COMMENT ON FUNCTION manual_process_order_inventory(UUID) IS 
'Function untuk memproses inventory secara manual untuk order tertentu';

COMMENT ON FUNCTION get_order_material_requirements(UUID) IS 
'Mendapatkan daftar bahan yang dibutuhkan untuk order tertentu';

COMMENT ON VIEW inventory_usage_summary IS 
'View untuk monitoring penggunaan bahan dari order';

COMMENT ON VIEW low_stock_alert IS 
'View untuk alert stok bahan yang rendah';

COMMENT ON TRIGGER trigger_order_inventory_deduction ON orders IS 
'Trigger untuk otomatis mengurangi stok bahan ketika order berubah status ke Proses Cetak, Done, atau Selesai Diambil';
