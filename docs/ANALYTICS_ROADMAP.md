# Plan de Trabajo: Estrategia de Analítica y Valor Agregado (Fase 13+)

Este plan ha sido refinado con base en la retroalimentación del equipo para maximizar el valor de la información sin comprometer la objetividad de la IA ni la estructura actual de datos.

---

## 🏁 Fase 13: Enriquecimiento y Veracidad (Data Integrity)

**Objetivo**: Profundizar el análisis automático y añadir validación de credibilidad.

- **[MOD] Backend - AI Service (Detector de Credibilidad / Anti-Fake News)**:
  - Implementar un análisis de "Marcadores de Credibilidad" en el prompt.
  - La IA buscará: Sensacionalismo excesivo, falta de fuentes citadas, sesgo emocional fuerte.
  - **Output**: Un "Score de Credibilidad" (0-100%) visible en la tarjeta de la noticia.
- **[MOD] Backend - AI Service (Entidades)**:
  - Extraer estructuradamente: Empresas Clave, Tecnologías Habilitadoras, Actores del Ecosistema.
- **[NEW] Script de Pipeline de Datos**:
  - Tarea semanal que consolida métricas globales y por usuario.

---

## 📊 Fase 14: Dashboard de Inteligencia & Talent Analytics

**Objetivo**: Visualizar hallazgos estratégicos y optimizar la asignación de recursos.

- **[MOD] Backend - Models (Metadata de Productos)**:
  - Añadir campo `metadata` (JSONB) a la tabla `Products`.
  - **Valor**: Permitirá rastrear qué productos se consumen más (ej. "Boletín vs. Nota"). Si sabemos que nadie descarga los Análisis largos, redirigimos esfuerzos a Cápsulas rápidas.
- **[NEW] Frontend - Analytics Module**:
  - **Ranking de 'Olfato Editorial'**: Mide la efectividad de un corresponsal.
    - *Fórmula*: (Noticias Priorizadas / Noticias Postuladas) * 100.
    - *Ejemplo*: El Postulador A registra 10 noticias y 8 son priorizadas (80% Olfato). El Postulador B registra 50 noticias y solo 2 son priorizadas (4% Olfato). **Valor:** Identificar a los mejores curadores de contenido.
  - **Mapa de Impacto**: Visualización geográfica.
    - **Valor**: Detectar si estamos ignorando innovación en ciertas regiones (ej. Latam vs Asia).
  - **Eficiencia del Ciclo (Time-to-product)**:
    - *Fórmula*: Fecha Creación Producto - Fecha Detección Noticia.
    - *Ejemplo*: "Ciclo de 3 días" (Alta agilidad) vs "Ciclo de 45 días" (Noticia fría).

---

## 🔍 Fase 15: Análisis de Contraste (AI vs Human)

**Objetivo**: Mantener la independencia de la IA para comparar perspectivas.

- **[MOD] Contrast Dashboard**:
  - En lugar de entrenar a la IA para pensar como nosotros, visualizaremos las discrepancias.
  - **Case Study**: Noticias donde IA dijo "Impacto Bajo" pero el Consejo votó "Impacto Alto".
  - **Valor**: Detectar "Puntos Ciegos" estratégicos donde el criterio humano ve valor que el algoritmo estándar ignora (o viceversa).

---

## 🎨 Fase 16: Evolución UI/UX (No Destructiva)

**Objetivo**: Mejorar la usabilidad aprovechando los datos existentes, **sin tocar la BD**.

- **[NEW] Tablero Kanban para el Consejo**:
  - Visualizar las noticias como tarjetas en columnas: `Identificado` -> `En Consejo` -> `Priorizado` -> `En Desarrollo`.
  - Funcionalidad Drag & Drop visual (actualiza estado en backend).
- **[NEW] Modo Oscuro / Alto Contraste**:
  - Implementación CSS pura usando las variables de Tailwind existentes.
- **[NEW] Vista de Lectura (Focus Mode)**:
  - Botón para ocultar sidebar y menús, dejando solo el contenido procesado para lectura sin distracciones.

---

## 📈 Indicadores de Éxito (KPIs)

| KPI | Meta |
|-----|------|
| **Conversión de Inteligencia** | > 40% de noticias priorizadas terminan en producto |
| **Puntualidad de Entrega** | < 5 días promedio por producto |
| **Nivel de Credibilidad** | Detección de > 90% de fuentes de baja calidad |

---
> [!IMPORTANT]
> Todas las mejoras propuestas respetan la integridad de la base de datos actual. La Fase 16 solo altera la presentación visual.
