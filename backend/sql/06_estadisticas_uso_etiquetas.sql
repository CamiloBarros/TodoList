-- 6. Estadísticas de Uso de Etiquetas
SELECT
  tg.id AS tag_id,
  tg.name AS etiqueta,
  COUNT(tt.task_id) AS veces_usada,
  ROUND(100.0 * COUNT(tt.task_id) FILTER (WHERE t.completed) / NULLIF(COUNT(tt.task_id),0), 2) AS tasa_completado
FROM tags tg
LEFT JOIN task_tags tt ON tt.tag_id = tg.id
LEFT JOIN tasks t ON t.id = tt.task_id
GROUP BY tg.id, tg.name
ORDER BY veces_usada DESC
LIMIT 10;
