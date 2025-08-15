-- 1. Análisis de Participación de Usuarios
WITH last_30 AS (
  SELECT user_id, COUNT(*) AS tareas_ultimos_30
  FROM tasks
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
),
prev_30 AS (
  SELECT user_id, COUNT(*) AS tareas_previos_30
  FROM tasks
  WHERE created_at >= NOW() - INTERVAL '60 days'
    AND created_at < NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT
  (SELECT AVG(tareas_ultimos_30) FROM last_30) AS promedio_ultimos_30,
  (SELECT AVG(tareas_previos_30) FROM prev_30) AS promedio_previos_30;
