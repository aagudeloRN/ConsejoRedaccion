# Plan de Trabajo: Estrategia de Analítica y Valor Agregado (Fase 13+)

Este plan detalla el camino para transformar el portal de una herramienta de gestión a una plataforma de **Inteligencia Estratégica**.

---

## 🏁 Fase 13: Cimentación y Enriquecimiento de Datos

**Objetivo**: Asegurar que los datos capturados tengan la granularidad necesaria para análisis profundos.

- **[MOD] Backend - AI Service**:
  - Ajustar el prompt de Gemini para extraer "Entidades Clave" (Empresas, Tecnologías específicas, Actores) de forma estructurada en el JSON.
  - Implementar un score de "Confianza de la IA" para el análisis inicial.
- **[MOD] Backend - Models**:
  - Añadir un campo `metadata` (JSONB) a la tabla `Products` para rastrear visualizaciones o descargas (opcional).
- **[NEW] Script de Pipeline de Datos**:
  - Crear una tarea programada (Cron/Worker) que consolide las estadísticas de la semana cada viernes.

---

## 📊 Fase 14: Dashboard de Inteligencia (Business Intelligence)

**Objetivo**: Visualizar hallazgos y facilitar la toma de decisiones por la Dirección.

- **[NEW] Frontend - Analytics Module**:
  - **Vista de Tendencias**: Gráficas de calor sobre las temáticas más recurrentes por mes.
  - **Ranking de 'Olfato Editorial'**: Visualización del desempeño de los corresponsales (News -> Prioritized -> Product).
  - **Mapa de Impacto**: Distribución geográfica de las novedades y productos.
- **[MOD] Backend - Analytics Router**:
  - Crear endpoints específicos para tendencias (agregaciones por SQL).
  - Endpoint de "Eficiencia del Ciclo" (días promedio entre Identificación y Producto).

---

## 🔄 Fase 15: Automatización y Cierre de Ciclo

**Objetivo**: Proactividad del sistema y mejora continua de la IA.

- **[NEW] Sistema de Alertas Inteligentes**:
  - Notificaciones automáticas (Email/Teams/Web) cuando una noticia sea clasificada con "Impacto 5" por la IA.
- **[MOD] Backend - AI Refinement**:
  - Implementar un flujo de "Feedback Loop": Si el Consejo cambia radicalmente la clasificación de la IA, el sistema guarda esa discrepancia.
  - Usar los "Votos Finales" del Consejo como ejemplos (few-shot prompting) para que Gemini aprenda el criterio de Ruta N.
- **[NEW] Reporte Ejecutivo PDF**:
  - Botón para exportar el resumen mensual de inteligencia en un formato premium listo para presentación.

---

## 📈 Indicadores de Éxito (KPIs)

| KPI | Meta |
|-----|------|
| **Conversión de Inteligencia** | > 40% de noticias priorizadas terminan en producto |
| **Puntualidad de Entrega** | < 5 dias promedio por producto |
| **Precisión IA** | > 80% de coincidencias entre Impacto IA e Impacto Humano |

---
> [!IMPORTANT]
> Este plan no requiere cambios destructivos en la base de datos actual, ya que se apoya en la estructura de relaciones ya implementada.
