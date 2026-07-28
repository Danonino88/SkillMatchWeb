-- =========================================================
-- SKILLMATCH - Admin, Empresa, Profesor y rol Vinculación
-- Ejecutar conectado a la base skillmatch.
-- =========================================================

BEGIN;

-- 1) Roles
INSERT INTO roles (id_rol, nombre_rol) VALUES
  (1, 'admin'),
  (2, 'estudiante'),
  (3, 'empresa'),
  (4, 'profesor'),
  (5, 'vinculacion'),
  (6, 'visitante')
ON CONFLICT (id_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;

-- 2) Usuarios: campos de perfil
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30),
  ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255),
  ADD COLUMN IF NOT EXISTS fecha_registro DATE DEFAULT CURRENT_DATE;

UPDATE usuarios SET fecha_registro = CURRENT_DATE WHERE fecha_registro IS NULL;

-- 3) Empresas: estados de validación por Vinculación
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente';

ALTER TABLE empresas ALTER COLUMN estado SET DEFAULT 'pendiente';

ALTER TABLE empresas DROP CONSTRAINT IF EXISTS chk_empresas_estado;

ALTER TABLE empresas
  ADD CONSTRAINT chk_empresas_estado
  CHECK (estado IN ('pendiente', 'habilitada', 'deshabilitada', 'rechazada'));

UPDATE empresas SET estado = 'habilitada' WHERE estado IS NULL;

-- 4) Proyectos también pueden pertenecer a profesor
ALTER TABLE proyectos
  ADD COLUMN IF NOT EXISTS id_profesor INTEGER,
  ADD COLUMN IF NOT EXISTS area_trabajo VARCHAR(150),
  ADD COLUMN IF NOT EXISTS ambito_desarrollo VARCHAR(80),
  ADD COLUMN IF NOT EXISTS es_innovacion INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ya_trabaja INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS competencia_impacto VARCHAR(80),
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS actividades TEXT,
  ADD COLUMN IF NOT EXISTS img_principal VARCHAR(500),
  ADD COLUMN IF NOT EXISTS tecnologias TEXT;

ALTER TABLE proyectos ALTER COLUMN id_estudiante DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_proyecto_profesor'
  ) THEN
    ALTER TABLE proyectos
      ADD CONSTRAINT fk_proyecto_profesor
      FOREIGN KEY (id_profesor) REFERENCES profesores(id_profesor);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_proyecto_autor'
  ) THEN
    ALTER TABLE proyectos
      ADD CONSTRAINT chk_proyecto_autor
      CHECK (id_estudiante IS NOT NULL OR id_profesor IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proyecto_profesor ON proyectos(id_profesor);

-- 5) Chatbot mejorado: palabras clave y activación
ALTER TABLE chatbot
  ADD COLUMN IF NOT EXISTS keywords TEXT,
  ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE;

-- 6) Usuarios de prueba. Contraseña de todos: SkillMatch123
-- Hash bcrypt: $2b$12$kj3IQuOtk1lUMh1kbBXMVu5cPfw4j34tyXbh5BnqkJ1ISKjYbsRA2
WITH admin_user AS (
  INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, estado, telefono)
  VALUES ('Admin', 'General', 'admin@uteq.edu.mx', '$2b$12$kj3IQuOtk1lUMh1kbBXMVu5cPfw4j34tyXbh5BnqkJ1ISKjYbsRA2', 1, 'activo', '4420000000')
  ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    password_hash = EXCLUDED.password_hash,
    id_rol = EXCLUDED.id_rol,
    estado = 'activo'
  RETURNING id_usuario
)
SELECT id_usuario FROM admin_user;

WITH vinc_user AS (
  INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, estado, telefono)
  VALUES ('Vinculación', 'UTEQ', 'vinculacion@uteq.edu.mx', '$2b$12$kj3IQuOtk1lUMh1kbBXMVu5cPfw4j34tyXbh5BnqkJ1ISKjYbsRA2', 5, 'activo', '4420000001')
  ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    password_hash = EXCLUDED.password_hash,
    id_rol = EXCLUDED.id_rol,
    estado = 'activo'
  RETURNING id_usuario
)
SELECT id_usuario FROM vinc_user;

WITH empresa_user AS (
  INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, estado, telefono)
  VALUES ('Empresa', 'Prueba', 'empresa.prueba@skillmatch.local', '$2b$12$kj3IQuOtk1lUMh1kbBXMVu5cPfw4j34tyXbh5BnqkJ1ISKjYbsRA2', 3, 'activo', '4420000002')
  ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    password_hash = EXCLUDED.password_hash,
    id_rol = EXCLUDED.id_rol,
    estado = 'activo'
  RETURNING id_usuario
)
INSERT INTO empresas (id_empresa, razon_social, giro, contacto, estado)
SELECT id_usuario, 'Empresa de Prueba SkillMatch', 'Tecnología', 'RH SkillMatch', 'habilitada'
FROM empresa_user
ON CONFLICT (id_empresa) DO UPDATE SET
  razon_social = EXCLUDED.razon_social,
  giro = EXCLUDED.giro,
  contacto = EXCLUDED.contacto,
  estado = EXCLUDED.estado;

WITH prof_user AS (
  INSERT INTO usuarios (nombre, apellido, correo, password_hash, id_rol, estado, telefono)
  VALUES ('Profesor', 'Prueba', 'profesor.prueba@uteq.edu.mx', '$2b$12$kj3IQuOtk1lUMh1kbBXMVu5cPfw4j34tyXbh5BnqkJ1ISKjYbsRA2', 4, 'activo', '4420000003')
  ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    password_hash = EXCLUDED.password_hash,
    id_rol = EXCLUDED.id_rol,
    estado = 'activo'
  RETURNING id_usuario
)
INSERT INTO profesores (id_profesor, departamento, asignaturas)
SELECT id_usuario, 'Tecnologías de la Información', 'Desarrollo Web, Bases de Datos, Proyectos Integradores'
FROM prof_user
ON CONFLICT (id_profesor) DO UPDATE SET
  departamento = EXCLUDED.departamento,
  asignaturas = EXCLUDED.asignaturas;

-- Respuestas base para chatbot, sin duplicar por pregunta.
INSERT INTO chatbot (pregunta, respuesta, categoria, keywords, activa)
SELECT 'Fechas de estadía', 'Consulta las fechas vigentes de estadía con el área de Vinculación o en los avisos de SkillMatch.', 'estadias', 'estadía, fechas, periodo, inicio, fin', TRUE
WHERE NOT EXISTS (SELECT 1 FROM chatbot WHERE pregunta = 'Fechas de estadía');

INSERT INTO chatbot (pregunta, respuesta, categoria, keywords, activa)
SELECT 'Horario de profesores', 'Los profesores suben su propio horario en su panel. Puedes consultarlo cuando esté publicado.', 'profesores', 'horario, profesor, asesor, clase', TRUE
WHERE NOT EXISTS (SELECT 1 FROM chatbot WHERE pregunta = 'Horario de profesores');

INSERT INTO chatbot (pregunta, respuesta, categoria, keywords, activa)
SELECT 'Vacantes disponibles', 'Las vacantes activas aparecen en el panel del estudiante. Las empresas deben estar validadas por Vinculación para publicar.', 'vacantes', 'vacantes, empleo, empresa, postulación', TRUE
WHERE NOT EXISTS (SELECT 1 FROM chatbot WHERE pregunta = 'Vacantes disponibles');

SELECT setval(pg_get_serial_sequence('usuarios','id_usuario'), COALESCE((SELECT MAX(id_usuario) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('roles','id_rol'), COALESCE((SELECT MAX(id_rol) FROM roles), 1), true);

COMMIT;

SELECT u.correo, r.nombre_rol, u.estado
FROM usuarios u
JOIN roles r ON r.id_rol = u.id_rol
WHERE u.correo IN ('admin@uteq.edu.mx','vinculacion@uteq.edu.mx','empresa.prueba@skillmatch.local','profesor.prueba@uteq.edu.mx','2024171013@uteq.edu.mx')
ORDER BY r.id_rol, u.correo;
