-- =========================================================
-- SKILLMATCH - Mejoras nivel Alumnos
-- Ejecutar conectado a la base skillmatch.
-- =========================================================

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30),
  ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255);

ALTER TABLE estudiantes
  ADD COLUMN IF NOT EXISTS cuatrimestre_inicial INTEGER,
  ADD COLUMN IF NOT EXISTS fecha_inicio_carrera DATE,
  ADD COLUMN IF NOT EXISTS estado_academico VARCHAR(20) NOT NULL DEFAULT 'activo';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_estudiantes_cuatrimestre_inicial'
  ) THEN
    ALTER TABLE estudiantes
      ADD CONSTRAINT chk_estudiantes_cuatrimestre_inicial
      CHECK (cuatrimestre_inicial IS NULL OR cuatrimestre_inicial BETWEEN 1 AND 11);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_estudiantes_estado_academico'
  ) THEN
    ALTER TABLE estudiantes
      ADD CONSTRAINT chk_estudiantes_estado_academico
      CHECK (estado_academico IN ('activo', 'egresado', 'baja'));
  END IF;
END $$;

UPDATE estudiantes
SET cuatrimestre_inicial = COALESCE(cuatrimestre_inicial, semestre, 1),
    fecha_inicio_carrera = COALESCE(fecha_inicio_carrera, DATE '2026-01-01')
WHERE cuatrimestre_inicial IS NULL
   OR fecha_inicio_carrera IS NULL;
