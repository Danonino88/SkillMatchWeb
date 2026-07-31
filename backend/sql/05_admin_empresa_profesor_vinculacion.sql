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

-- 6) Configuración segura de usuarios
-- Este script no crea cuentas ni contraseñas predeterminadas.
-- El primer administrador debe crearse manualmente con una
-- contraseña única y mediante un procedimiento autorizado.

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

-- No se incluyen consultas de cuentas predeterminadas.

