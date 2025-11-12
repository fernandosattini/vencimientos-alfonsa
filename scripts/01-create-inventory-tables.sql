-- Crear tabla de productos con vencimiento
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Dimensiones del producto
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  
  -- Información del producto
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  
  -- Fecha de vencimiento
  expiration_date DATE NOT NULL,
  
  -- Metadata
  notes TEXT,
  
  -- Para sincronización
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Crear tabla de historial de cambios (opcional, para auditoría)
CREATE TABLE IF NOT EXISTS product_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  changes JSONB,
  
  notes TEXT
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_products_expiration_date ON products(expiration_date);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING GIN(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);

-- Crear vista para productos no eliminados ordenados por vencimiento
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM products
WHERE is_deleted = FALSE
ORDER BY expiration_date ASC;
