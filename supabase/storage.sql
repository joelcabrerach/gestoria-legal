-- ============================================================
-- SUPABASE STORAGE — Bucket para documentos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Crear bucket para documentos de expedientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  FALSE,  -- Privado: requiere auth para acceder
  52428800,  -- 50MB máximo por archivo
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- ── Políticas de Storage ──

-- Admins pueden subir archivos
CREATE POLICY "Admins suben documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- Usuarios autenticados pueden ver archivos de sus expedientes
CREATE POLICY "Usuarios ven sus documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
);

-- Admins pueden eliminar archivos
CREATE POLICY "Admins eliminan documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);
