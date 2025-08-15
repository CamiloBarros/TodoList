# Explicación de Consultas SQL de Negocio

Esta carpeta contiene scripts SQL para responder preguntas clave de negocio sobre el uso y rendimiento de la aplicación de tareas. Cada archivo corresponde a una pregunta y está documentado a continuación.

---

## 01_analisis_participacion_usuarios.sql

**Pregunta:** ¿Cuál es el promedio de tareas creadas por usuario en los últimos 30 días, y cómo se compara con los 30 días anteriores?

**Explicación:**
Calcula cuántas tareas creó cada usuario en los últimos 30 días (`last_30`) y en los 30 días previos a ese periodo (`prev_30`). Luego, obtiene el promedio de tareas creadas por usuario en cada periodo. Permite comparar la actividad reciente con la anterior para detectar tendencias de participación.

---

## 02_tendencias_tasa_completado.sql

**Pregunta:** ¿Cuál es la tasa de completado diaria de tareas en los últimos 90 días, agrupada por nivel de prioridad?

**Explicación:**
Agrupa las tareas por fecha y prioridad. Calcula la cantidad de tareas completadas y el total por día/prioridad. La tasa de completado es el porcentaje de tareas completadas sobre el total cada día y prioridad.

---

## 03_rendimiento_por_categoria.sql

**Pregunta:** ¿Qué categorías tienen las tasas de completado más altas y más bajas, y cuál es el tiempo promedio de completado para cada categoría?

**Explicación:**
Agrupa tareas por categoría. Calcula la tasa de completado y el tiempo promedio (en horas) que tarda una tarea en completarse por categoría. Permite identificar categorías más eficientes o con problemas de finalización.

---

## 04_patrones_productividad_usuario.sql

**Pregunta:** ¿Cuáles son las horas pico y días de la semana cuando los usuarios crean más tareas, y cuándo las completan?

**Explicación:**
Extrae el día de la semana y la hora de creación y completado de tareas. Muestra los momentos con mayor actividad de creación y completado. Ayuda a identificar patrones de productividad y posibles horarios óptimos.

---

## 05_analisis_tareas_vencidas.sql

**Pregunta:** ¿Cuántas tareas están actualmente vencidas, agrupadas por usuario y categoría, y cuál es el promedio de días que están vencidas?

**Explicación:**
Selecciona tareas no completadas y con fecha de vencimiento pasada. Agrupa por usuario y categoría. Calcula cuántas tareas están vencidas y el promedio de días de atraso.

---

## 06_estadisticas_uso_etiquetas.sql

**Pregunta:** ¿Cuáles son las etiquetas más frecuentemente utilizadas, y qué etiquetas están asociadas con las tasas de completado más altas?

**Explicación:**
Cuenta cuántas veces se usa cada etiqueta en tareas. Calcula la tasa de completado de tareas asociadas a cada etiqueta. Permite identificar etiquetas populares y su relación con la finalización de tareas.

---

## 07_metricas_retencion_usuarios.sql

**Pregunta:** ¿Cuántos usuarios han creado al menos una tarea en cada una de las últimas 4 semanas, y cuál es la tasa de retención semana a semana?

**Explicación:**
Agrupa usuarios activos por semana (últimos 28 días). Calcula la cantidad de usuarios activos y la tasa de retención respecto a la semana anterior. Útil para medir la fidelidad y retención de usuarios.

---

## 08_distribucion_prioridad_usuarios_activos.sql

**Pregunta:** ¿Cuál es la distribución de tareas a través de los niveles de prioridad para usuarios activos (usuarios que han iniciado sesión en los últimos 7 días)?

**Explicación:**
Selecciona usuarios activos recientemente. Cuenta cuántas tareas tiene cada nivel de prioridad para estos usuarios. Permite analizar el enfoque de los usuarios activos respecto a la urgencia/importancia de sus tareas.

---

## 09_tendencias_estacionales.sql

**Pregunta:** ¿Cómo varía la creación y completado de tareas por mes en el último año, y hay algún patrón estacional?

**Explicación:**
Agrupa tareas por mes de creación. Muestra cuántas tareas se crean y completan cada mes. Permite detectar patrones estacionales o meses de mayor/menor actividad.

---

## 10_benchmarking_rendimiento.sql

**Pregunta:** ¿Qué usuarios están en el 10% superior por tasa de completado de tareas, y cuál es el número promedio de tareas que manejan simultáneamente?

**Explicación:**
Calcula la tasa de completado de tareas por usuario y determina el percentil 90. Selecciona los usuarios en el top 10% y calcula cuántas tareas gestionan simultáneamente en promedio. Útil para identificar usuarios de alto rendimiento y su carga de trabajo.
