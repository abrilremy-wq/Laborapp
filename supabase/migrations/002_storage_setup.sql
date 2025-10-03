-- Crear bucket para imágenes de servicios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-images', 'service-images', true);

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'service-images');

-- Política para permitir subida de imágenes solo a usuarios autenticados
CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir actualización de imágenes solo al propietario
CREATE POLICY "Users can update own images" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir eliminación de imágenes solo al propietario
CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

