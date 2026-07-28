-- =========================================================
-- SKILLMATCH - Separación de responsabilidades Admin / Vinculación
-- Ejecutar conectado a la base skillmatch.
-- =========================================================

BEGIN;

-- 1) Roles formales del sistema
INSERT INTO roles (id_rol, nombre_rol) VALUES
  (1, 'admin'),
  (2, 'estudiante'),
  (3, 'empresa'),
  (4, 'profesor'),
  (5, 'vinculacion'),
  (6, 'visitante')
ON CONFLICT (id_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;

-- 2) Corregir datos visibles del usuario de Vinculación
UPDATE usuarios
SET nombre = 'Vinculación',
    apellido = 'UTEQ',
    id_rol = 5,
    estado = 'activo'
WHERE correo = 'vinculacion@uteq.edu.mx';

-- 3) Asegurar que el administrador sea diferente a Vinculación
UPDATE usuarios
SET nombre = 'Admin',
    apellido = 'General',
    id_rol = 1,
    estado = 'activo'
WHERE correo = 'admin@uteq.edu.mx';

-- 4) Asegurar columnas usadas por los paneles
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30),
  ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255),
  ADD COLUMN IF NOT EXISTS fecha_registro DATE DEFAULT CURRENT_DATE;

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente';

ALTER TABLE empresas ALTER COLUMN estado SET DEFAULT 'pendiente';
ALTER TABLE empresas DROP CONSTRAINT IF EXISTS chk_empresas_estado;
ALTER TABLE empresas
  ADD CONSTRAINT chk_empresas_estado
  CHECK (estado IN ('pendiente', 'habilitada', 'deshabilitada', 'rechazada'));

ALTER TABLE chatbot
  ADD COLUMN IF NOT EXISTS keywords TEXT,
  ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE;

-- 5) Índices para consultas de Vinculación
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas(estado);
CREATE INDEX IF NOT EXISTS idx_vacantes_estado ON vacantes(estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_vacante ON postulaciones(id_vacante);

COMMIT;

SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.id_rol, r.nombre_rol
FROM usuarios u
JOIN roles r ON r.id_rol = u.id_rol
WHERE u.correo IN ('admin@uteq.edu.mx','vinculacion@uteq.edu.mx')
ORDER BY u.id_rol;
