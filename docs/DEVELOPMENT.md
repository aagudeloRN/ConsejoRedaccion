# Guía de Desarrollo - Consejo de Redacción CTi

## Configuración del Entorno Local

### Requisitos Previos

- Docker & Docker Compose
- Node.js 18+ (para desarrollo frontend local)
- Python 3.10+ (para desarrollo backend local)
- Git

### Primera vez - Setup Completo

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd ConsejoRedaccion

# 2. Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales

# 3. Levantar servicios
docker compose up -d

# 4. Verificar servicios
docker compose ps
# Deberías ver: db, backend, frontend

# 5. Seed base de datos (solo primera vez)
docker compose exec backend python seed.py

# 6. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

### Variables de Entorno Requeridas

Crear archivo `.env` en la raíz:

```bash
# Base de Datos
DATABASE_URL=postgresql://postgres:postgres@db:5432/consejo_redaccion

# IA
GEMINI_API_KEY=tu-api-key-aqui

# Seguridad
MASTER_PASSWORD=rutan2026
```

---

## Estructura de Desarrollo

### Backend (FastAPI)

```
backend/
├── main.py              # Punto de entrada FastAPI
├── models.py            # Modelos SQLAlchemy
├── schemas.py           # Schemas Pydantic
├── database.py          # Configuración DB
├── crud.py              # CRUD operations
├── seed.py              # Datos iniciales
├── routers/
│   ├── users.py         # Endpoints de usuarios
│   ├── news.py          # Endpoints de noticias
│   ├── votes.py         # Endpoints de votación
│   └── analytics.py     # Endpoints de estadísticas
└── services/
    ├── ai_service.py         # Integración Gemini
    └── extraction_service.py # Extracción PDF/URL
```

#### Añadir Nuevo Endpoint

1. **Crear schema** en `schemas.py`:

```python
class MyNewSchema(BaseModel):
    field: str
```

1. **Agregar función CRUD** en `crud.py`:

```python
def create_item(db: Session, item: schemas.MyNewSchema):
    db_item = models.MyModel(**item.dict())
    db.add(db_item)
    db.commit()
    return db_item
```

1. **Crear endpoint** en router apropiado:

```python
@router.post("/items/")
def create_item(item: schemas.MyNewSchema, db: Session = Depends(get_db)):
    return crud.create_item(db, item)
```

1. **Importar router** en `main.py`:

```python
from routers import items
app.include_router(items.router)
```

#### Testing Backend Local

```bash
# Activar virtualenv
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Correr con hot-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

---

### Frontend (Next.js)

```
frontend/src/
├── app/                    # Routes (Next.js App Router)
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Dashboard
│   ├── login/              # Login page
│   ├── news/               # Gestión noticias
│   ├── council/            # Consejo
│   ├── stats/              # Estadísticas
│   └── users/manage/       # Admin usuarios
├── components/
│   ├── ui/                 # Componentes primitivos
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   ├── AuthGuard.tsx       # HOC de protección
│   ├── UserSelector.tsx    # Logout button
│   └── ...
├── context/
│   └── UserContext.tsx     # Estado global
└── types/
    └── index.ts            # TypeScript types
```

#### Añadir Nueva Página

1. **Crear archivo** en `app/nueva-ruta/page.tsx`:

```tsx
"use client";

export default function NuevaPaginaPage() {
  return <div>Contenido</div>;
}
```

1. **Proteger si necesario** con AuthGuard:

```tsx
import AuthGuard from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Contenido protegido</div>
    </AuthGuard>
  );
}
```

1. **Acceder via** `http://localhost:3000/nueva-ruta`

#### Usar Componentes UI

```tsx
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

<Button variant="primary" size="md" onClick={() => {}}>
  Guardar
</Button>

<Badge variant="success">Activo</Badge>
```

#### Testing Frontend Local

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo con hot-reload
npm run dev

# Build producción
npm run build

# Preview build
npm start
```

---

## Debugging

### Ver Logs

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend

# Solo base de datos
docker compose logs -f db
```

### Acceder a Contenedores

```bash
# Backend shell
docker compose exec backend bash

# Frontend shell
docker compose exec frontend sh

# PostgreSQL CLI
docker compose exec db psql -U postgres -d consejo_redaccion
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker compose restart

# Reiniciar solo backend
docker compose restart backend

# Rebuild completo
docker compose down
docker compose up --build -d
```

---

## Base de Datos

### Migraciones Manuales

No usamos Alembic aún. Para cambios de schema:

```python
# Crear migrate_new_feature.py
from sqlalchemy import text
from database import SessionLocal

def migrate():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE news ADD COLUMN new_field TEXT"))
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
```

```bash
docker compose exec backend python migrate_new_feature.py
```

### Seed Datos

```bash
# Ejecutar seed
docker compose exec backend python seed.py

# Limpiar y re-seed
docker compose exec db psql -U postgres -d consejo_redaccion -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker compose exec backend python -c "from database import engine; import models; models.Base.metadata.create_all(bind=engine)"
docker compose exec backend python seed.py
```

### Backup y Restore

```bash
# Backup
docker compose exec db pg_dump -U postgres consejo_redaccion > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260129.sql | docker compose exec -T db psql -U postgres consejo_redaccion
```

---

## Testing

### Backend Tests (Próximamente)

```bash
pytest backend/tests/ -v
```

### Frontend Tests (Próximamente)

```bash
cd frontend
npm run test
```

---

## Code Style

### Python (Backend)

- PEP 8
- Type hints donde sea posible
- Docstrings para funciones públicas

### TypeScript (Frontend)

- ESLint config de Next.js
- Prettier para formateo
- Interfaces explícitas para props

### Componentes React

- Functional components
- Hooks (useState, useEffect, useCallback, useMemo)
- React.memo para componentes puros

---

## Performance Profiling

### Backend

```python
import time

@router.get("/slow-endpoint")
async def slow_endpoint():
    start = time.time()
    result = expensive_operation()
    print(f"Took {time.time() - start}s")
    return result
```

### Frontend

React DevTools Profiler:

1. Abrir Chrome DevTools
2. Tab "Profiler"
3. Grabar interacción
4. Analizar flamegraph

---

## Troubleshooting

### "Port already in use"

```bash
# Ver qué usa el puerto
sudo lsof -i :3000  # o :8001, :5432

# Matar proceso
kill -9 <PID>
```

### "Module not found"

```bash
# Backend
docker compose exec backend pip install <package>

# Frontend
cd frontend && npm install <package>
```

### "Database connection refused"

```bash
# Verificar que DB está corriendo
docker compose ps db

# Ver logs de DB
docker compose logs db

# Reiniciar DB
docker compose restart db
```

### "Gemini API Error"

- Verificar que `GEMINI_API_KEY` está en `.env`
- Verificar cuota: <https://aistudio.google.com/app/apikey>
- Wait 60s si rate limit

---

## Git Workflow

```bash
# Nueva feature
git checkout -b feature/mi-nueva-feature

# Commits descriptivos
git commit -m "feat: añadir filtro por categoría en news"

# Push
git push origin feature/mi-nueva-feature

# Pull request en GitHub
```

### Commit Message Convention

- `feat:` Nueva funcionalidad
- `fix:` Bug fix
- `docs:` Cambios en documentación
- `style:` Formateo, sin cambio de lógica
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Tareas de mantenimiento

---

## Hotkeys de Desarrollo

**VS Code recomendado:**

- `Ctrl+Shift+P`: Command Palette
- `Ctrl+P`: Quick file open
- `F12`: Go to definition
- `Ctrl+Space`: IntelliSense

**Docker:**

- `docker compose up -d`: Levantar en background
- `docker compose down`: Detener y eliminar
- `Ctrl+C`: Detener compose en foreground
