# API Reference - Consejo de Redacción CTi

**Base URL**: `http://localhost:8001`

## Endpoints

### 🔐 Authentication & Users

#### POST `/users/login`

Autenticar usuario con contraseña.

**Request:**

```json
{
  "name": "Alvaro Agudelo",
  "password": "rutan2026"
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Alvaro Agudelo",
  "role": "Administrador",
  "active": true
}
```

**Errors:**

- `401 Unauthorized`: Contraseña incorrecta
- `403 Forbidden`: Usuario inactivo
- `404 Not Found`: Usuario no existe

---

#### GET `/users/`

Listar todos los usuarios.

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Alvaro Agudelo",
    "role": "Administrador",
    "active": true
  }
]
```

---

#### POST `/users/`

Crear nuevo usuario (solo Admin).

**Request:**

```json
{
  "name": "Nuevo Usuario",
  "role": "Postulador",
  "password": "password123",
  "active": true
}
```

**Response:** `201 Created`

---

#### PATCH `/users/{user_id}`

Actualizar usuario (solo Admin).

**Request:**

```json
{
  "role": "Administrador",
  "password": "newpassword",
  "active": false
}
```

**Response:** `200 OK`

---

### 📰 News Management

#### POST `/news/analyze`

Analizar URL o PDF con IA antes de guardar.

**Request (multipart/form-data):**

```
url: https://example.com/article (opcional)
file: archivo.pdf (opcional, solo application/pdf)
```

**Response:** `200 OK`

```json
{
  "title": "Título extraído por IA",
  "original_url": "https://...",
  "status": "Identificado",
  "classifications": {
    "summary": "Resumen generado...",
    "theme": "Innovación",
    "geography": "Colombia",
    "impact": "Alto para Ruta N",
    "keywords": ["IA", "tecnología"],
    "content_processed": "Texto completo..."
  }
}
```

**Errors:**

- `400 Bad Request`: Sin URL ni archivo, PDF no procesable (OCR requerido)

---

#### POST `/news/`

Guardar novedad en base de datos.

**Request:**

```json
{
  "title": "Título de la noticia",
  "original_url": "https://...",
  "status": "Identificado",
  "postulator_id": 1,
  "category": "Nerd",
  "classifications": {
    "summary": "...",
    "theme": "...",
    "geography": "...",
    "impact": "...",
    "keywords": []
  }
}
```

**Response:** `201 Created`

---

#### GET `/news/`

Listar noticias con filtros opcionales.

**Query Parameters:**

- `skip`: Offset (default: 0)
- `limit`: Límite (default: 100)
- `q`: Búsqueda en título/contenido
- `include_archived`: Incluir archivadas (default: false)

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "...",
    "status": "Identificado",
    "detection_date": "2026-01-29",
    "in_council": false,
    "category": "Nerd",
    "assignees": [],
    "votes": []
  }
]
```

---

#### GET `/news/{news_id}`

Obtener detalle de una noticia.

**Response:** `200 OK`

---

#### PATCH `/news/{news_id}`

Actualizar noticia (estado, asignados, enfoque editorial).

**Request:**

```json
{
  "status": "Priorizado",
  "is_prioritized": true,
  "editorial_focus": "Enfocarse en impacto para Medellín",
  "assignee_ids": [2, 3],
  "category": "Geek"
}
```

**Response:** `200 OK`

---

#### PATCH `/news/{news_id}/archive`

Archivar noticia (solo Admin).

**Response:** `200 OK`

---

#### PATCH `/news/{news_id}/reactivate`

Reactivar noticia archivada (solo Admin).

**Response:** `200 OK`

---

### 🗳️ Votes & Council

#### POST `/votes/`

Registrar o actualizar voto de usuario.

**Request:**

```json
{
  "news_id": 1,
  "user_id": 1,
  "impact_score": 5,
  "relevance_score": 4,
  "category_suggestion": "Geek"
}
```

**Response:** `200 OK`

---

#### GET `/votes/news/{news_id}`

Obtener votos activos de una noticia.

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "news_id": 1,
    "user_id": 1,
    "impact_score": 5,
    "relevance_score": 4,
    "category_suggestion": "Geek"
  }
]
```

---

#### PUT `/votes/council/{news_id}?in_council={true|false}`

Activar/desactivar noticia en consejo (solo Admin).

**Response:** `200 OK`

---

#### POST `/votes/council/close`

Cerrar consejo semanal (solo Admin).

**Comportamiento:**

1. Crea snapshot de sesión
2. Archiva votos actuales (is_active=false)
3. Vincula votos a sesión
4. Resetea `in_council=false` en todas las noticias

**Response:** `200 OK`

```json
{
  "message": "Council closed. Session 5 created. 8 news items removed from the active board."
}
```

---

### 📊 Analytics

#### GET `/analytics/users`

Estadísticas de desempeño por usuario (solo usuarios activos).

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Alvaro Agudelo",
    "postulations": 12,
    "prioritized": 8,
    "assigned": 3,
    "active": true
  }
]
```

---

## Modelos de Datos

### User Schema

```typescript
{
  id: number
  name: string
  role: "Administrador" | "Dirección Ejecutiva" | "Postulador" | "Lector"
  active: boolean
  password?: string  // Solo en escritura
}
```

### News Schema

```typescript
{
  id: number
  title: string
  original_url: string
  content_processed?: string
  summary?: string
  status: "Identificado" | "Priorizado" | "En desarrollo" | "Archivado"
  detection_date: string  // ISO 8601
  postulator_id: number
  category?: "Nerd" | "Geek" | "Trend"
  in_council: boolean
  is_prioritized: boolean
  editorial_focus?: string
  classifications?: {
    summary: string
    theme: string
    geography: string
    impact: string
    keywords: string[]
  }
  assignees: User[]
  votes: Vote[]
}
```

### Vote Schema

```typescript
{
  id: number
  news_id: number
  user_id: number
  impact_score: number  // 1-5
  relevance_score: number  // 1-5
  category_suggestion?: string
  is_active: boolean
  session_id?: number
}
```

## Rate Limiting

**Gemini API:**

- Free tier: 15 RPM
- Implementación: asyncio.Semaphore con max 5 requests concurrentes

## CORS

Desarrollo:

```python
allow_origins=["*"]
```

Producción (recomendado):

```python
allow_origins=["https://consejo.rutanmedellin.org"]
```

## Error Handling

Todos los endpoints siguen el formato FastAPI estándar:

```json
{
  "detail": "Mensaje de error descriptivo"
}
```

HTTP Status Codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

### 📦 Products & Deliverables

#### POST `/products/`

Registrar un nuevo producto/entregable.

**Request (multipart/form-data):**

```
news_id: 1 (int)
user_id: 1 (int)
product_type: "Boletín" | "Cápsula" | "Análisis" | "Link" | "Nota"
name: "Boletín Semanal Inno"
description: "Versión final del boletín..."
url: https://... (opcional, requerido si type=Link)
file: archivo.pdf (opcional, requerido si type=Boletín/Cápsula/Análisis)
```

**Response:** `200 OK`

#### GET `/products/news/{news_id}`

Listar productos de una noticia.

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "product_type": "Boletín",
    "name": "Boletín Final",
    "file_path": "uploads/products/123_file.pdf",
    "created_at": "2026-01-29"
  }
]
```

#### DELETE `/products/{id}`

Eliminar un producto.

**Response:** `200 OK`

---
