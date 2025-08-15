-- 5. Análisis de Tareas Vencidas
SELECT
  t.user_id,
  t.category_id,
  COUNT(*) AS tareas_vencidas,
  AVG(EXTRACT(DAY FROM NOW() - t.due_date)) AS dias_promedio_vencidas
FROM tasks t
WHERE t.completed = false AND t.due_date < NOW()
GROUP BY t.user_id, t.category_id
ORDER BY tareas_vencidas DESC;
