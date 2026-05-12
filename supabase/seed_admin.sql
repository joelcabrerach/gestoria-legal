-- ============================================================
-- USUARIO ADMINISTRADOR INICIAL
-- ============================================================
-- IMPORTANTE: Este script NO se ejecuta en el SQL Editor.
-- El usuario debe crearse desde el Dashboard de Supabase:
--
-- 1. Ve a: Authentication > Users > Add User
-- 2. Email: info@joelcabreragelsi.com
-- 3. Password: River2026
-- 4. Marca "Auto Confirm User"
-- 5. Click "Create User"
--
-- Después, ejecutá este SQL en el SQL Editor para
-- asignar el rol de administrador:
-- ============================================================

-- Actualizar el perfil a rol administrador
-- (El perfil se crea automáticamente por el trigger trg_crear_perfil_en_registro)
UPDATE perfiles
SET
  rol = 'administrador',
  nombre = 'Joel',
  apellido = 'Cabrera Gelsi'
WHERE email = 'info@joelcabreragelsi.com';

-- Verificar que se actualizó correctamente
SELECT id, nombre, apellido, email, rol
FROM perfiles
WHERE email = 'info@joelcabreragelsi.com';


-- ============================================================
-- EXPEDIENTE DE PRUEBA (opcional)
-- Ejecutá esto después de crear el usuario admin
-- ============================================================

-- Crear un cliente de prueba (primero debe existir en auth.users)
-- Si querés probar, creá otro usuario desde el dashboard con:
-- Email: cliente.prueba@test.com / Password: Test2026

-- Luego ejecutá:
/*
INSERT INTO expedientes (titulo, descripcion, direccion, ciudad, region, cliente_id, administrador_id, fecha_estimada)
SELECT
  'Compraventa Depto. Providencia',
  'Trámite de compraventa de departamento en calle Los Leones 1234',
  'Los Leones 1234, Providencia',
  'Santiago',
  'Metropolitana',
  cliente.id,
  admin.id,
  '2026-06-30'
FROM
  perfiles AS cliente,
  perfiles AS admin
WHERE
  cliente.email = 'cliente.prueba@test.com'
  AND admin.email = 'info@joelcabreragelsi.com';
*/
