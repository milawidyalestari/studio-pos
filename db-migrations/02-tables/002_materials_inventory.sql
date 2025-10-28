-- =====================================================
-- MIGRATION: Materials & Inventory Tables
-- Version: 002.002
-- Date: 2025-07-11
-- Description: Sistem inventory dan materials
-- =====================================================

-- =====================================================
-- MATERIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- meter, kg, pcs, dll
    kategori VARCHAR(100),
    
    -- Stock Information
    stok_aktif DECIMAL(10,2) NOT NULL DEFAULT 0,
    stok_minimum DECIMAL(10,2) NOT NULL DEFAULT 0,
    stok_akhir DECIMAL(10,2) NOT NULL DEFAULT 0,
    stok_opname DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Pricing
    cost_per_unit DECIMAL(15,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCT MATERIALS RELATION
-- =====================================================
CREATE TABLE IF NOT EXISTS product_materials (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity_per_unit DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    notes TEXT,
    
    PRIMARY KEY (product_id, material_id),
    
    CONSTRAINT check_quantity_per_unit_positive 
    CHECK (quantity_per_unit > 0)
);

-- =====================================================
-- INVENTORY MOVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    
    -- Movement Details
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50), -- 'purchase', 'production', 'adjustment', 'sale'
    reference_id UUID, -- ID dari tabel referensi (misalnya order_id)
    
    -- Stock Information
    stock_before DECIMAL(10,2) NOT NULL,
    stock_after DECIMAL(10,2) NOT NULL,
    
    -- Additional Info
    notes TEXT,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_materials_kategori ON materials(kategori);
CREATE INDEX IF NOT EXISTS idx_materials_is_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON product_materials(product_id);
CREATE INDEX IF NOT EXISTS idx_product_materials_material_id ON product_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_product_materials_quantity_per_unit ON product_materials(quantity_per_unit);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_material_id ON inventory_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE materials IS 'Tabel untuk mengelola bahan baku/materials';
COMMENT ON TABLE product_materials IS 'Relasi many-to-many antara products dan materials';
COMMENT ON TABLE inventory_movements IS 'History pergerakan stock materials';
COMMENT ON COLUMN materials.stok_aktif IS 'Stock yang tersedia untuk digunakan';
COMMENT ON COLUMN materials.stok_minimum IS 'Batas minimum stock untuk alert';
COMMENT ON COLUMN materials.stok_akhir IS 'Stock akhir hasil perhitungan';
COMMENT ON COLUMN materials.stok_opname IS 'Stock hasil stock opname fisik';
COMMENT ON COLUMN product_materials.quantity_per_unit IS 'Jumlah material yang dibutuhkan per unit produk';

