-- 10. Benchmarking de Rendimiento
WITH tasas AS (
  SELECT
    user_id,
    COUNT(*) FILTER (WHERE completed) * 1.0 / NULLIF(COUNT(*),0) AS tasa_completado,
    COUNT(*) AS total_tareas
  FROM tasks
  GROUP BY user_id
),
percentil AS (
  SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY tasa_completado) AS p90 FROM tasas
),
top_usuarios AS (
  SELECT t.user_id, t.tasa_completado
  FROM tasas t, percentil p
  WHERE t.tasa_completado >= p.p90
)
SELECT
  u.id,
  u.name,
  t.tasa_completado,
  AVG(sub.tareas_simultaneas) AS promedio_tareas_simultaneas
FROM top_usuarios t
JOIN users u ON u.id = t.user_id
JOIN LATERAL (
  SELECT AVG(conteo) AS tareas_simultaneas
  FROM (
    SELECT COUNT(*) AS conteo
    FROM tasks t2
    WHERE t2.user_id = t.user_id
      AND t2.created_at <= t1.created_at
      AND (t2.completed_at IS NULL OR t2.completed_at > t1.created_at)
    FROM tasks t1
    WHERE t1.user_id = t.user_id
  ) sub2
) sub ON TRUE
GROUP BY u.id, u.name, t.tasa_completado
ORDER BY t.tasa_completado DESC;
