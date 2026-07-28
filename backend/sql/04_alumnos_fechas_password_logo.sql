-- =========================================================
-- SKILLMATCH - Ajustes de fechas académicas y preparación de logos
-- Ejecutar conectado a la base skillmatch.
-- =========================================================

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS fecha_registro DATE DEFAULT CURRENT_DATE;

UPDATE usuarios
SET fecha_registro = CURRENT_DATE
WHERE fecha_registro IS NULL;

CREATE OR REPLACE FUNCTION skillmatch_primer_lunes(year_value INTEGER, month_value INTEGER)
RETURNS DATE AS $$
DECLARE
  base_date DATE;
  day_value INTEGER;
  offset_days INTEGER;
BEGIN
  base_date := make_date(year_value, month_value, 1);
  day_value := EXTRACT(DOW FROM base_date)::INTEGER;
  offset_days := CASE WHEN day_value = 1 THEN 0 ELSE (8 - day_value) % 7 END;
  RETURN base_date + offset_days;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION skillmatch_inicio_cuatri_actual()
RETURNS DATE AS $$
DECLARE
  current_month INTEGER;
  start_month INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
  start_month := CASE
    WHEN current_month < 5 THEN 1
    WHEN current_month < 9 THEN 5
    ELSE 9
  END;
  RETURN skillmatch_primer_lunes(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, start_month);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION skillmatch_inicio_carrera_estimado(cuatrimestre INTEGER)
RETURNS DATE AS $$
DECLARE
  current_start DATE;
  estimated_month DATE;
  clean_cuatri INTEGER;
BEGIN
  clean_cuatri := LEAST(GREATEST(COALESCE(cuatrimestre, 1), 1), 11);
  current_start := skillmatch_inicio_cuatri_actual();
  estimated_month := current_start - make_interval(months => (clean_cuatri - 1) * 4);
  RETURN skillmatch_primer_lunes(EXTRACT(YEAR FROM estimated_month)::INTEGER, EXTRACT(MONTH FROM estimated_month)::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Corrige datos de prueba donde se había usado 2026-01-01 como fecha genérica.
-- Para estudiantes activos, se estima el inicio con el cuatrimestre actual y el primer lunes del periodo.
UPDATE estudiantes
SET fecha_inicio_carrera = skillmatch_inicio_carrera_estimado(COALESCE(semestre, cuatrimestre_inicial, 1))
WHERE fecha_inicio_carrera IS NULL
   OR fecha_inicio_carrera = DATE '2026-01-01';

UPDATE estudiantes
SET cuatrimestre_inicial = COALESCE(cuatrimestre_inicial, semestre, 1)
WHERE cuatrimestre_inicial IS NULL;
