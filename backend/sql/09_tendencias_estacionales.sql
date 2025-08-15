-- 9. Tendencias Estacionales
SELECT
  DATE_TRUNC('month', created_at) AS mes,
  COUNT(*) AS tareas_creadas,
  COUNT(*) FILTER (WHERE completed) AS tareas_completadas
FROM tasks
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY mes
ORDER BY mes;
