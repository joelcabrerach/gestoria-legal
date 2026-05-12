-- ============================================================
-- GESTORÍA APP - Esquema de Base de Datos para Supabase
-- App de Gestión Inmobiliaria y Legal
-- ============================================================
-- Autor: Joel Cabrera Gelsi
-- Fecha: 2026-05-12
-- Motor: PostgreSQL (Supabase)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONES NECESARIAS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. TIPOS ENUMERADOS (ENUMs)
-- Usamos ENUMs para restringir valores válidos y evitar
-- datos inconsistentes en columnas clave.
-- ────────────────────────────────────────────────────────────

-- Rol del usuario en la plataforma
CREATE TYPE rol_usuario AS ENUM ('administrador', 'cliente');

-- Estado actual del expediente (flujo legal inmobiliario)
CREATE TYPE estado_expediente AS ENUM (
  'tasacion',       -- Tasación de la propiedad
  'escritura',      -- Preparación de escritura
  'notaria',        -- Firma en notaría
  'cbr',            -- Inscripción en Conservador de Bienes Raíces
  'completado'      -- Trámite finalizado
);

-- Estado de avance de cada hito
CREATE TYPE estado_hito AS ENUM (
  'pendiente',      -- Aún no iniciado
  'en_progreso',    -- En ejecución
  'completado',     -- Finalizado correctamente
  'bloqueado'       -- Detenido por algún impedimento
);

-- Tipo de documento subido al sistema
CREATE TYPE tipo_documento AS ENUM (
  'escritura',
  'tasacion',
  'certificado_dominio',
  'poder_notarial',
  'cedula_identidad',
  'comprobante_pago',
  'plano',
  'otro'
);


-- ────────────────────────────────────────────────────────────
-- 2. TABLA: perfiles
-- Extiende auth.users de Supabase con datos de perfil.
-- Se vincula 1:1 con el usuario autenticado.
-- ────────────────────────────────────────────────────────────
CREATE TABLE perfiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  apellido      TEXT,
  email         TEXT UNIQUE NOT NULL,
  telefono      TEXT,
  rol           rol_usuario NOT NULL DEFAULT 'cliente',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por rol (ej: listar todos los administradores)
CREATE INDEX idx_perfiles_rol ON perfiles(rol);

COMMENT ON TABLE perfiles IS 'Perfiles de usuario vinculados a auth.users de Supabase';
COMMENT ON COLUMN perfiles.id IS 'UUID del usuario en auth.users (FK)';
COMMENT ON COLUMN perfiles.rol IS 'administrador = acceso total | cliente = solo sus expedientes';


-- ────────────────────────────────────────────────────────────
-- 3. TABLA: expedientes
-- Cada expediente representa un trámite inmobiliario/legal.
-- Un cliente puede tener múltiples expedientes.
-- ────────────────────────────────────────────────────────────
CREATE TABLE expedientes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  direccion       TEXT NOT NULL,
  ciudad          TEXT,
  region          TEXT,
  estado          estado_expediente NOT NULL DEFAULT 'tasacion',
  progreso        INTEGER NOT NULL DEFAULT 0
                    CHECK (progreso >= 0 AND progreso <= 100),
  cliente_id      UUID NOT NULL REFERENCES perfiles(id) ON DELETE RESTRICT,
  administrador_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_inicio    DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_estimada  DATE,
  notas_internas  TEXT,           -- Solo visible para administradores
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_expedientes_cliente    ON expedientes(cliente_id);
CREATE INDEX idx_expedientes_admin      ON expedientes(administrador_id);
CREATE INDEX idx_expedientes_estado     ON expedientes(estado);
CREATE INDEX idx_expedientes_fecha      ON expedientes(fecha_inicio DESC);

COMMENT ON TABLE expedientes IS 'Expedientes de trámites inmobiliarios/legales';
COMMENT ON COLUMN expedientes.progreso IS 'Porcentaje de avance del trámite (0-100)';
COMMENT ON COLUMN expedientes.cliente_id IS 'Cliente dueño del expediente';
COMMENT ON COLUMN expedientes.administrador_id IS 'Administrador asignado al caso';


-- ────────────────────────────────────────────────────────────
-- 4. TABLA: documentos
-- Archivos asociados a cada expediente (PDFs, imágenes, etc).
-- Se almacenan en Supabase Storage, aquí guardamos la URL.
-- ────────────────────────────────────────────────────────────
CREATE TABLE documentos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expediente_id   UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  nombre_archivo  TEXT NOT NULL,
  url_archivo     TEXT NOT NULL,
  tipo_doc        tipo_documento NOT NULL DEFAULT 'otro',
  tamano_bytes    BIGINT,
  subido_por      UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha_subida    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para listar documentos de un expediente
CREATE INDEX idx_documentos_expediente ON documentos(expediente_id);
CREATE INDEX idx_documentos_tipo       ON documentos(tipo_doc);

COMMENT ON TABLE documentos IS 'Documentos adjuntos a expedientes (almacenados en Supabase Storage)';
COMMENT ON COLUMN documentos.url_archivo IS 'URL pública o firmada del archivo en Supabase Storage';


-- ────────────────────────────────────────────────────────────
-- 5. TABLA: hitos (milestones)
-- Pasos específicos dentro de un expediente.
-- Permiten un seguimiento granular del avance del trámite.
-- ────────────────────────────────────────────────────────────
CREATE TABLE hitos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expediente_id   UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  orden           INTEGER NOT NULL DEFAULT 0,  -- Para ordenar los pasos
  estado          estado_hito NOT NULL DEFAULT 'pendiente',
  fecha_limite    DATE,
  fecha_completado TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para listar hitos de un expediente en orden
CREATE INDEX idx_hitos_expediente ON hitos(expediente_id, orden);

COMMENT ON TABLE hitos IS 'Hitos/pasos del trámite dentro de cada expediente';
COMMENT ON COLUMN hitos.orden IS 'Orden secuencial del hito dentro del expediente';


-- ────────────────────────────────────────────────────────────
-- 6. FUNCIÓN: actualizar updated_at automáticamente
-- Trigger que actualiza el campo updated_at en cada UPDATE.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER trg_perfiles_updated_at
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_expedientes_updated_at
  BEFORE UPDATE ON expedientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_hitos_updated_at
  BEFORE UPDATE ON hitos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();


-- ────────────────────────────────────────────────────────────
-- 7. FUNCIÓN: crear perfil automáticamente al registrarse
-- Se dispara cuando un nuevo usuario se registra en auth.users.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION crear_perfil_en_registro()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', 'Sin nombre'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'rol')::rol_usuario, 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en la tabla de autenticación de Supabase
CREATE TRIGGER trg_crear_perfil_en_registro
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_en_registro();


-- ────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- Políticas de seguridad a nivel de fila.
-- Garantizan que cada usuario solo vea lo que le corresponde.
-- ────────────────────────────────────────────────────────────

-- Activar RLS en todas las tablas
ALTER TABLE perfiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitos       ENABLE ROW LEVEL SECURITY;

-- ── PERFILES ──
-- Los usuarios pueden ver y editar su propio perfil
-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Usuarios ven su propio perfil"
  ON perfiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

CREATE POLICY "Usuarios editan su propio perfil"
  ON perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── EXPEDIENTES ──
-- Clientes ven solo sus expedientes
-- Administradores ven todos
CREATE POLICY "Clientes ven sus expedientes"
  ON expedientes FOR SELECT
  USING (
    cliente_id = auth.uid()
    OR administrador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

CREATE POLICY "Admins crean expedientes"
  ON expedientes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

CREATE POLICY "Admins actualizan expedientes"
  ON expedientes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

CREATE POLICY "Admins eliminan expedientes"
  ON expedientes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

-- ── DOCUMENTOS ──
-- Visibles si el usuario tiene acceso al expediente padre
CREATE POLICY "Acceso a documentos por expediente"
  ON documentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expedientes
      WHERE expedientes.id = documentos.expediente_id
        AND (
          expedientes.cliente_id = auth.uid()
          OR expedientes.administrador_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
          )
        )
    )
  );

-- Solo administradores pueden subir documentos oficiales
CREATE POLICY "Solo admins suben documentos"
  ON documentos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

CREATE POLICY "Solo admins actualizan documentos"
  ON documentos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

CREATE POLICY "Admins eliminan documentos"
  ON documentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

-- ── HITOS ──
-- Misma lógica: acceso basado en el expediente padre
CREATE POLICY "Acceso a hitos por expediente"
  ON hitos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expedientes
      WHERE expedientes.id = hitos.expediente_id
        AND (
          expedientes.cliente_id = auth.uid()
          OR expedientes.administrador_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
          )
        )
    )
  );

CREATE POLICY "Admins gestionan hitos"
  ON hitos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );


-- ────────────────────────────────────────────────────────────
-- 9. TABLA: hitos_estandar (catálogo de plantillas)
-- Pasos comunes reutilizables para crear hitos en expedientes.
-- Admins pueden agregar/editar plantillas desde el dashboard.
-- ────────────────────────────────────────────────────────────
CREATE TABLE hitos_estandar (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  orden           INTEGER NOT NULL DEFAULT 0,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,  -- Para desactivar sin borrar
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hitos_estandar_orden ON hitos_estandar(orden);

COMMENT ON TABLE hitos_estandar IS 'Catálogo de hitos/pasos estándar para nuevos expedientes';
COMMENT ON COLUMN hitos_estandar.activo IS 'Si es FALSE, no se incluye en nuevos expedientes';

-- RLS: Solo admins gestionan el catálogo, todos pueden leer
ALTER TABLE hitos_estandar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos leen hitos estandar"
  ON hitos_estandar FOR SELECT
  USING (TRUE);

CREATE POLICY "Solo admins gestionan hitos estandar"
  ON hitos_estandar FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

-- ── DATOS SEMILLA: Hitos estándar del flujo inmobiliario ──
INSERT INTO hitos_estandar (titulo, descripcion, orden) VALUES
  ('Recepción de documentos',  'Recepción y revisión de documentación inicial del cliente',  1),
  ('Tasación',                 'Tasación profesional de la propiedad',                       2),
  ('Estudio de títulos',       'Verificación de la cadena de títulos y gravámenes',          3),
  ('Borrador escritura',       'Preparación del borrador de escritura pública',              4),
  ('Firma en Notaría',         'Firma de la escritura ante notario público',                 5),
  ('Inscripción en CBR',       'Inscripción en el Conservador de Bienes Raíces',            6),
  ('Entrega final',            'Entrega de copias y cierre del expediente',                  7);


-- ────────────────────────────────────────────────────────────
-- 10. FUNCIÓN: crear hitos desde catálogo al crear expediente
-- Lee de hitos_estandar (solo los activos) para poblar hitos.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION crear_hitos_por_defecto()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hitos (expediente_id, titulo, descripcion, orden)
  SELECT NEW.id, he.titulo, he.descripcion, he.orden
  FROM hitos_estandar he
  WHERE he.activo = TRUE
  ORDER BY he.orden;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-crear hitos cuando se crea un nuevo expediente
CREATE TRIGGER trg_crear_hitos_por_defecto
  AFTER INSERT ON expedientes
  FOR EACH ROW EXECUTE FUNCTION crear_hitos_por_defecto();


-- ────────────────────────────────────────────────────────────
-- 11. VISTAS ÚTILES
-- ────────────────────────────────────────────────────────────

-- Vista: resumen de expedientes con datos del cliente
CREATE VIEW vista_expedientes_resumen AS
SELECT
  e.id,
  e.titulo,
  e.direccion,
  e.ciudad,
  e.estado,
  e.progreso,
  e.fecha_inicio,
  e.fecha_estimada,
  p_cliente.nombre   AS cliente_nombre,
  p_cliente.email    AS cliente_email,
  p_admin.nombre     AS administrador_nombre,
  (SELECT COUNT(*) FROM documentos d WHERE d.expediente_id = e.id) AS total_documentos,
  (SELECT COUNT(*) FROM hitos h WHERE h.expediente_id = e.id AND h.estado = 'completado') AS hitos_completados,
  (SELECT COUNT(*) FROM hitos h WHERE h.expediente_id = e.id) AS total_hitos
FROM expedientes e
LEFT JOIN perfiles p_cliente ON e.cliente_id = p_cliente.id
LEFT JOIN perfiles p_admin   ON e.administrador_id = p_admin.id;
