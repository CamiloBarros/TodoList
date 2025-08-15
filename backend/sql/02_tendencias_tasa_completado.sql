-- 2. Tendencias de Tasa de Completado
SELECT
  DATE(created_at) AS fecha,
  priority,
  COUNT(*) FILTER (WHERE completed) AS completadas,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE completed) / NULLIF(COUNT(*),0), 2) AS tasa_completado
FROM tasks
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY fecha, priority
ORDER BY fecha DESC, priority;
