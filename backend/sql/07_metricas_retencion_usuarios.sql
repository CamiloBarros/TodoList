-- 7. Métricas de Retención de Usuarios
WITH semanas AS (
  SELECT
    user_id,
    DATE_TRUNC('week', created_at) AS semana
  FROM tasks
  WHERE created_at >= NOW() - INTERVAL '28 days'
  GROUP BY user_id, semana
),
usuarios_por_semana AS (
  SELECT semana, COUNT(DISTINCT user_id) AS usuarios_activos
  FROM semanas
  GROUP BY semana
)
SELECT
  semana,
  usuarios_activos,
  LAG(usuarios_activos) OVER (ORDER BY semana) AS usuarios_previos,
  ROUND(100.0 * usuarios_activos / NULLIF(LAG(usuarios_activos) OVER (ORDER BY semana),0), 2) AS tasa_retencion
FROM usuarios_por_semana
ORDER BY semana DESC;
