-- 3. Rendimiento por Categoría
SELECT
  c.id AS categoria_id,
  c.name AS categoria,
  COUNT(t.id) AS total_tareas,
  COUNT(t.id) FILTER (WHERE t.completed) AS completadas,
  ROUND(100.0 * COUNT(t.id) FILTER (WHERE t.completed) / NULLIF(COUNT(t.id),0), 2) AS tasa_completado,
  AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) FILTER (WHERE t.completed) AS horas_promedio_completado
FROM categories c
LEFT JOIN tasks t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY tasa_completado DESC;
