-- 4. Patrones de Productividad del Usuario
SELECT
  EXTRACT(DOW FROM created_at) AS dia_semana,
  EXTRACT(HOUR FROM created_at) AS hora,
  COUNT(*) AS tareas_creadas
FROM tasks
GROUP BY dia_semana, hora
ORDER BY tareas_creadas DESC
LIMIT 10;

SELECT
  EXTRACT(DOW FROM completed_at) AS dia_semana,
  EXTRACT(HOUR FROM completed_at) AS hora,
  COUNT(*) AS tareas_completadas
FROM tasks
WHERE completed
GROUP BY dia_semana, hora
ORDER BY tareas_completadas DESC
LIMIT 10;
