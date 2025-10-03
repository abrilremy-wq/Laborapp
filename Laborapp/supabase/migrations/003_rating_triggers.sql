-- Función para actualizar la reputación de un usuario
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular el promedio y conteo de valoraciones para el usuario valorado
  UPDATE users_public 
  SET 
    reputation_avg = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM ratings 
      WHERE rated_user_id = NEW.rated_user_id
    ),
    reputation_count = (
      SELECT COUNT(*) 
      FROM ratings 
      WHERE rated_user_id = NEW.rated_user_id
    )
  WHERE id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la función cuando se inserta una nueva valoración
CREATE TRIGGER trigger_update_reputation_insert
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- Trigger para ejecutar la función cuando se actualiza una valoración
CREATE TRIGGER trigger_update_reputation_update
  AFTER UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- Trigger para ejecutar la función cuando se elimina una valoración
CREATE TRIGGER trigger_update_reputation_delete
  AFTER DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- Actualizar reputaciones existentes (si hay datos)
UPDATE users_public 
SET 
  reputation_avg = COALESCE((
    SELECT AVG(rating) 
    FROM ratings 
    WHERE rated_user_id = users_public.id
  ), 0),
  reputation_count = COALESCE((
    SELECT COUNT(*) 
    FROM ratings 
    WHERE rated_user_id = users_public.id
  ), 0);

