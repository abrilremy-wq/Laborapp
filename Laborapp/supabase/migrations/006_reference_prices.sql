-- Crear tabla de precios de referencia
CREATE TABLE reference_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL,
  region TEXT NOT NULL,
  price_avg NUMERIC NOT NULL,
  source TEXT DEFAULT 'publicaciones' CHECK (source IN ('publicaciones', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_reference_prices_service_type ON reference_prices(service_type);
CREATE INDEX idx_reference_prices_region ON reference_prices(region);
CREATE INDEX idx_reference_prices_created_at ON reference_prices(created_at);

-- Función para actualizar precios de referencia basados en servicios
CREATE OR REPLACE FUNCTION update_reference_prices()
RETURNS void AS $$
BEGIN
  -- Limpiar datos anteriores de publicaciones
  DELETE FROM reference_prices WHERE source = 'publicaciones';
  
  -- Insertar nuevos promedios calculados desde servicios
  INSERT INTO reference_prices (service_type, region, price_avg, source)
  SELECT 
    s.service_type,
    COALESCE(s.coverage_area, 'Sin especificar') as region,
    ROUND(AVG(s.reference_price), 2) as price_avg,
    'publicaciones' as source
  FROM services s
  WHERE s.reference_price IS NOT NULL 
    AND s.status = 'active'
    AND s.created_at >= NOW() - INTERVAL '6 months' -- Solo últimos 6 meses
  GROUP BY s.service_type, COALESCE(s.coverage_area, 'Sin especificar')
  HAVING COUNT(*) >= 2; -- Al menos 2 servicios para calcular promedio
END;
$$ LANGUAGE plpgsql;

-- Función para obtener precios de referencia con filtros
CREATE OR REPLACE FUNCTION get_reference_prices(
  p_service_type TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL
)
RETURNS TABLE (
  service_type TEXT,
  region TEXT,
  price_avg NUMERIC,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.service_type,
    rp.region,
    rp.price_avg,
    rp.source,
    rp.created_at
  FROM reference_prices rp
  WHERE 
    (p_service_type IS NULL OR rp.service_type = p_service_type)
    AND (p_region IS NULL OR rp.region ILIKE '%' || p_region || '%')
  ORDER BY rp.service_type, rp.region, rp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reference_prices_updated_at
  BEFORE UPDATE ON reference_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE reference_prices ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Users can view reference prices" ON reference_prices
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción/actualización solo a administradores
-- (Por ahora permitimos a todos los usuarios autenticados)
CREATE POLICY "Users can insert reference prices" ON reference_prices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update reference prices" ON reference_prices
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insertar datos iniciales ejecutando la función
SELECT update_reference_prices();

-- Comentarios para documentación
COMMENT ON TABLE reference_prices IS 'Precios de referencia por tipo de servicio y región';
COMMENT ON COLUMN reference_prices.service_type IS 'Tipo de servicio (siembra, cosecha, fumigación, etc.)';
COMMENT ON COLUMN reference_prices.region IS 'Región o zona de cobertura';
COMMENT ON COLUMN reference_prices.price_avg IS 'Precio promedio calculado';
COMMENT ON COLUMN reference_prices.source IS 'Fuente del precio: publicaciones o manual';
COMMENT ON FUNCTION update_reference_prices() IS 'Actualiza precios de referencia basados en servicios activos';
COMMENT ON FUNCTION get_reference_prices(TEXT, TEXT) IS 'Obtiene precios de referencia con filtros opcionales';
