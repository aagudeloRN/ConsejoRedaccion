# Guía de Usuario - Consejo de Redacción CTi

## Introducción

Bienvenido a la plataforma de gestión del Consejo de Redacción del Centro de Pensamiento CTi. Este sistema te ayuda a identificar, analizar y priorizar información relevante sobre Ciencia, Tecnología e Innovación.

## Inicio de Sesión

1. Visita `http://localhost:3000/login`
2. Selecciona tu usuario del menú desplegable
3. Ingresa tu contraseña
4. Haz clic en **Ingresar**

**Nota**: Si olvidas tu contraseña, contacta a: <alvaro.agudelo@rutanmedellin.org>

---

## Roles y Permisos

| Rol | Puede Ver | Puede Crear | Puede Votar | Admin |
|-----|-----------|-------------|-------------|-------|
| **Lector** | ✓ | ✗ | ✗ | ✗ |
| **Postulador** | ✓ | ✓ | ✓ | ✗ |
| **Dirección Ejecutiva** | ✓ | ✓ | ✓* | ✗ |
| **Administrador** | ✓ | ✓ | ✓ | ✓ |

*Solo puede haber 1 usuario con rol "Dirección Ejecutiva" activo

---

## 1. Dashboard (Inicio)

### ¿Qué puedo ver?

- **Resumen semanal**: Estadísticas de novedades detectadas
- **Mis asignaciones**: Productos que te han sido asignados (con enfoque editorial)
- **Novedades recientes**: Lista de todas las noticias activas

### Acciones Rápidas

- **+ Registrar Novedad**: Crea una nueva entrada
- **Ir al Consejo →**: Accede a la vista de votación

### Funciones para Administradores

- **Enviar al Consejo**: Toggle para activar/desactivar noticias en el consejo semanal
  - Aparece como columna "Consejo" en la tabla
  - Badge naranja "EN CONSEJO" indica noticias activas
- **Archivar**: Oculta noticias del view principal (ícono de ojo tachado)
- **Ver Archivo**: Accede a noticias archivadas

### Búsqueda

Usa la barra de búsqueda para filtrar por:

- Título
- Temática
- Contenido procesado

---

## 2. Registrar Novedad

### Paso 1: Cargar Fuente

Tienes dos opciones:

- **URL**: Pega el enlace de la noticia
- **PDF**: Sube un archivo (solo documentos con texto, NO escaneados)

### Paso 2: Seleccionar Categoría

- **Nerd**: Contenido técnico, profundo, especializado
- **Geek**: Tecnología mainstream, gadgets, tendencias
- **Trend**: Análisis de tendencias amplias

### Paso 3: Procesar con IA

Haz clic en **Analizar con IA**. El sistema:

1. Extrae el texto
2. Genera un resumen enfocado en CTI
3. Clasifica temática, geografía e impacto
4. Sugiere palabras clave

**Tiempo estimado**: 10-30 segundos

### Paso 4: Validar y Ajustar

Revisa cuidadosamente:

- ✅ **Título**: Editable
- ✅ **Resumen**: Puedes complementar con tu conocimiento experto
- ✅ **Temática**: Valida la clasificación
- ✅ **Geografía**: Confirma si aplica a Medellín, Antioquia, Colombia, etc.
- ✅ **Impacto**: Ajusta la relevancia para Ruta N
- ✅ **Palabras clave**: Añade o elimina según corresponda

### Paso 5: Guardar

Click **Guardar Novedad**. Se creará con estado `Identificado`.

**⚠️ Importante**: El PDF no se almacena, solo el texto procesado y la URL original.

---

## 3. Consejo de Redacción

### Vista Principal (`/council`)

Muestra todas las noticias que están actualmente en el consejo (`in_council=true`).

### Cómo Votar

1. Para cada noticia, asigna:
   - **Impacto** (1-5): ¿Qué tan relevante es para Ruta N?
   - **Relevancia** (1-5): ¿Qué tan urgente es abordarla?
   - **Categoría sugerida**: Nerd, Geek o Trend
2. Haz clic en **Votar**
3. El voto se guarda instantáneamente (puedes cambiar tu voto después)

### Visualización de Votos

- Cada tarjeta muestra:
  - Título de la noticia
  - Categoría actual
  - Número de votos recibidos
  - Promedio de impacto y relevancia

---

## 4. Matriz de Priorización

**Ruta**: `/council/matrix`

### ¿Qué es?

Una visualización de todas las noticias en el consejo basada en sus votos promedio.

### Ejes

- **X (Horizontal)**: Relevancia promedio
- **Y (Vertical)**: Impacto promedio

### Interpretación

- **Cuadrante superior derecho**: ALTA prioridad (alto impacto + alta relevancia)
- **Cuadrante inferior izquierdo**: BAJA prioridad
- **Tamaño del punto**: Número de votos recibidos

### Uso

Facilita la discusión en el consejo para decidir qué temas priorizar.

---

## 5. Estadísticas de Desempeño

**Ruta**: `/stats`

### Métricas por Usuario (solo activos)

- **Postulaciones**: Cuántas noticias han registrado
- **Priorizadas**: Cuántas llegaron a ser priorizadas
- **Asignadas**: Cuántas tienen actualmente asignadas

### Uso

- Evaluar participación del equipo
- Identificar corresponsales más activos
- Planificar distribución de carga

---

## 6. Gestión de Usuarios

**⚠️ Solo Administradores**

### Acciones Disponibles

1. **Editar Rol**: Cambiar entre Lector, Postulador, Dirección Ejecutiva, Administrador
2. **Cambiar Contraseña**: Asignar nueva contraseña (solo admin puede hacerlo)
3. **Activar/Desactivar**: Los usuarios inactivos:
   - No pueden hacer login
   - No aparecen en el selector de usuario
   - No aparecen en estadísticas

### Limitaciones

- Solo puede haber 1 usuario DirEjecutiva activo simultáneamente
- No se pueden eliminar usuarios (solo desactivar) para mantener historial

---

## 7. Mi Flujo de Trabajo Típico

### Como Postulador

1. Encuentro una noticia relevante
2. **Registrar Novedad** → Cargo URL/PDF
3. Selecciono categoría
4. **Analizar con IA** → Valido y ajusto
5. **Guardar**
6. Espero a que Admin la envíe al consejo

### Como Miembro del Consejo

1. Admin envía noticias al consejo (toggle en Dashboard)
2. Accedo a **Consejo de Redacción**
3. **Voto** en cada noticia (impacto, relevancia)
4. Opcional: Veo **Matriz** para discutir prioridades
5. Admin asigna productos a corresponsales

### Como Corresponsal Asignado

1. Veo **Mis Asignaciones** en el Dashboard
2. Leo el **Enfoque Editorial** dejado por el admin
3. Desarrollo el producto (boletín, cápsula, análisis)
4. Marco como completado o informo al admin

### Como Administrador

1. Reviso noticias registradas en Dashboard
2. **Toggle Consejo** para activar las relevantes
3. Monitoreo votación en **Consejo**
4. Uso **Matriz** para discussiones
5. **Asigno corresponsales** con enfoque editorial
6. Al final de la semana: **Cerrar Consejo**
7. Gestiono usuarios según sea necesario

230:
231: ---
232:
233: ## 7. Gestión de Productos (Entregables)
234:
235: Una vez una noticia ha sido trabajada, el responsable debe cargar los productos generados.
236:
237: ### Dónde Encontrarlo
238:
239: 1. Ve al **Detalle de la Noticia**.
240: 2. Al final de la página encontrarás la sección **Entregables y Productos**.
241:
242: ### Cómo Cargar Productos
243:
244: 1. Haz clic en **+ Agregar Producto**.
245: 2. Selecciona el **Tipo**:
246:    - **Boletín / Cápsula / Análisis**: Requieren subir un archivo (PDF, Doc, Imagen).
247:    - **Link**: Requiere una URL externa.
248:    - **Nota**: Solo texto descriptivo.
249: 3. Ingresa un **Nombre** descriptivo.
250: 4. (Opcional) Añade una descripción.
251: 5. **Guardar Producto**.
252:
253: ### Reglas de Validación
254:
255: - ⚠️ El sistema mostrará una advertencia hasta que cargues al menos **un documento de soporte** (Boletín, Cápsula o Análisis).
256: - Puedes agregar múltiples archivos y enlaces por noticia.
257:
258: ---

## 8. Tips y Mejores Prácticas

### Al Registrar Noticias

- ✅ Verifica que la URL sea accesible
- ✅ PDFs deben tener texto seleccionable (no escaneos)
- ✅ Complementa SIEMPRE el análisis de IA con tu expertise
- ✅ Sé específico en palabras clave

### Al Votar

- ✅ Considera impacto para RUTA N específicamente
- ✅ Relevancia = urgencia temporal
- ✅ Vota en todas las noticias del consejo

### Como Admin

- ✅ Envía al consejo solo noticias validadas
- ✅ Cierra el consejo semanalmente para mantener histórico
- ✅ Define enfoque editorial claro al asignar

### Búsqueda

- ✅ Usa palabras clave específicas
- ✅ Búsqueda es case-insensitive
- ✅ Busca por tema, no por estado

---

## 9. Troubleshooting

### "PDF no procesable"

**Causa**: El PDF es una imagen escaneada sin capa de texto.  
**Solución**: Busca la noticia en versión web o usa un OCR externo.

### "Error al analizar con IA"

**Causa**: Límite de rate de Gemini API o conexión.  
**Solución**: Espera 1 minuto y reintenta.

### "No puedo hacer login"

**Posibles causas**:

1. Usuario inactivo → Contacta al admin
2. Contraseña incorrecta → Solicita reset al admin
3. Ya hay 1 Dir. Ejecutiva activo → Contacta al admin

### "No veo la opción de Consejo"

**Causa**: No tienes rol Administrador.  
**Solución**: Solo admins pueden enviar noticias al consejo.

---

## 10. Atajos de Teclado

*Proximamente*

---

## 11. Glosario

- **Categoría**: Clasificación editorial (Nerd/Geek/Trend)
- **En Consejo**: Noticias activas para votación semanal
- **Priorizado**: Noticias que el consejo decidió desarrollar
- **Enfoque Editorial**: Instrucciones del admin al asignar corresponsal
- **Archivado**: Noticias ocultas del dashboard principal
- **Sesión de Consejo**: Snapshot histórico de votos de una semana
