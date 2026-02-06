# Documentación Técnica - Consejo de Redacción CTi

## 🏗️ Resumen del Proyecto

Sistema integral para la gestión de inteligencia colectiva y producción editorial de Ruta N Medellín. Facilita la identificación de tendencias CTi mediante procesamiento de IA y votación democrática del consejo.

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion (micro-interacciones).
- **Backend**: FastAPI (Python), SQLAlchemy ORM.
- **Base de Datos**: PostgreSQL 15.
- **IA**: Google Gemini 1.5 Flash (Análisis de impacto y resúmenes).
- **Procesamiento**: `trafilatura` (Extracción web), `pypdf` (Análisis de documentos).

---

## 🕒 Histórico de Cambios Significativos (Log de Evolución)

### Fases 1-6: Fundación y MVP

- Implementación de modelos core: Usuarios, Noticias, Votos, Sesiones.
- Integración inicial con Gemini para análisis de noticias.
- Panel de administración para gestión de usuarios y roles.
- Matriz de calor (Impacto vs Relevancia) para priorización.

### Fase 7-8: Estabilización y Extracción

- **Corrección Crítica**: Eliminación de referencias a `localhost` en el build de producción.
- **Mejora IA**: Reemplazo de librerías de scraping estándar por `trafilatura` para mejorar la extracción en sitios con mucho JavaScript.
- **Ajuste de Prompt**: Refinamiento del contexto para Gemini, enfatizando el impacto específico para **Ruta N** y el ecosistema de Medellín.

### Fase 9-10: UI Premium y UX

- **Paginación**: Implementación de paginación en cliente para el listado principal (10 noticias/página).
- **UI de Impacto**: Añadidos Skeleton Loaders, resaltado de términos de búsqueda y micro-interacciones.
- **Tooltips Pro**: Rediseño de tooltips para ser más anchos (28rem) y priorizar la sección de "Impacto/Relevancia" sobre el resumen.
- **Sticky Headers**: Implementación de encabezados fijos en tablas para facilitar el scroll.
- **Armonización de Roles**: Estandarización de accesos para "Admin" y "Administrador" en el módulo de estadísticas.

---

## 🐛 Historial de Ajustes y Errores (Fix Log)

1. **Error de Extracción**: Algunas URLs devolvían contenido vacío.
   - *Solución*: Se integró `trafilatura` con manejo de UA dinámico.
2. **Corte de Tooltips**: Los tooltips se escondían bajo el encabezado fijo o el scroll de la tabla.
   - *Solución*: Implementación de `premium-row` con `z-index` dinámico al hacer hover.
3. **Persistencia Decisional**: Los votos se duplicaban en ciertas condiciones de sesión.
   - *Solución*: Lógica de UPSERT en el modelo de votos basado en `user_id` y `news_id`.
4. **Visibilidad de Estadísticas**: Perfiles admin no veían el card de estadísticas por discrepancia de strings.
   - *Solución*: Unificación lógica de `Admin || Administrador` en el frontend.

---

## 📂 Archivos de Documentación Detallada

- **[USER_GUIDE.md](./USER_GUIDE.md)**: Manual de uso por rol.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Modelado de datos y flujo de IA.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Guía de despliegue con Docker y Manager.
