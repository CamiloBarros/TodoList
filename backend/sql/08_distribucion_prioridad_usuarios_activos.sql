-- 8. Análisis de Distribución de Prioridad
WITH activos AS (
  SELECT id FROM users WHERE last_login >= NOW() - INTERVAL '7 days'
)
SELECT
  t.priority,
  COUNT(*) AS total
FROM tasks t
JOIN activos a ON t.user_id = a.id
GROUP BY t.priority
ORDER BY total DESC;
