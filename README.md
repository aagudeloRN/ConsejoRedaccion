# Consejo de Redacción CTi - Ruta N Medellín

Sistema web para gestionar el flujo de trabajo del Consejo de Redacción del Centro de Pensamiento CTi de Ruta N Medellín. Permite identificar, analizar, priorizar y gestionar información coyuntural relevante para la Ciencia, Tecnología e Innovación.

## 🚀 Quick Start

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd ConsejoRedaccion

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Levantar servicios con Docker
docker compose up -d

# 4. Seed base de datos (solo primera vez)
docker compose exec backend python seed.py

# 5. Acceder
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

**Login por defecto**:

- Usuario: Alvaro Agudelo
- Contraseña: rutan2026

---

## 📋 Funcionalidades Principales

### ✅ Implementado

- [x] **Registro de Noticias** con IA (Gemini)
  - Carga URL o PDF
  - Análisis automático (resumen, clasificación, keywords)
  - Validación y edición por usuario
- [x] **Gestión de Usuarios**
  - Login con contraseña
  - 4 roles: Administrador, Dirección Ejecutiva, Postulador, Lector
  - Activar/desactivar usuarios
- [x] **Consejo de Redacción**
  - Votación (impacto + relevancia)
  - Matriz de priorización visual
  - Cierre de semana con historial
- [x] **Asignación de Tareas**
  - Asignar corresponsales
  - Enfoque editorial
  - Vista "Mis Asignaciones"
- [x] **Estadísticas**
  - Desempeño por usuario (postulaciones, priorizadas, asignadas)
  - Solo usuarios activos
- [x] **Categorización**: Nerd, Geek, Trend
- [x] **Búsqueda** por título/contenido
- [x] **Archivo de Noticias**

### 🚧 En Roadmap

- [ ] Productos Generados (Boletines, Cápsulas)
- [ ] Dashboard analítico avanzado
- [ ] Integración Azure AD
- [ ] API pública

---

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy
- **Base de Datos**: PostgreSQL 15
- **IA**: Google Gemini API
- **Deploy**: Docker + Docker Compose

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [📖 DocumentoBase.md](./DocumentoBase.md) | Especificación original del proyecto |
| [🏛️ ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura técnica completa |
| [🔌 API.md](./docs/API.md) | Referencia completa de endpoints |
| [👤 USER_GUIDE.md](./docs/USER_GUIDE.md) | Manual de usuario por roles |
| [💻 DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Guía para desarrolladores |
| [🚀 DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Guía de deployment en producción |

---

## 🎨 Roles y Permisos

| Rol | Ver | Crear | Votar | Consejo | Admin |
|-----|-----|-------|-------|---------|-------|
| Lector | ✓ | ✗ | ✗ | ✗ | ✗ |
| Postulador | ✓ | ✓ | ✓ | ✗ | ✗ |
| Dirección Ejecutiva | ✓ | ✓ | ✓* | ✗ | ✗ |
| Administrador | ✓ | ✓ | ✓ | ✓ | ✓ |

*Solo 1 usuario Dir. Ejecutiva activo permitido

---

## 🛠️ Desarrollo Local

### Requisitos

- Docker & Docker Compose
- (Opcional) Node.js 18+ y Python 3.10+ para desarrollo sin Docker

### Estructura del Proyecto

```
ConsejoRedaccion/
├── backend/           # FastAPI application
│   ├── routers/       # API endpoints
│   ├── services/      # Business logic (AI, extraction)
│   ├── models.py      # SQLAlchemy models
│   └── schemas.py     # Pydantic schemas
├── frontend/          # Next.js application
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/ # React components
│       ├── context/   # Global state
│       └── types/     # TypeScript types
├── docs/              # Documentation
└── docker-compose.yml
```

### Comandos Útiles

```bash
# Ver logs
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Entrar a contenedor
docker compose exec backend bash

# Backup DB
docker compose exec db pg_dump -U postgres consejo_redaccion > backup.sql

# Rebuild
docker compose down && docker compose up --build -d
```

---

## 🎯 Flujo de Trabajo Típico

1. **Postulador** registra noticia → IA analiza → valida → guarda
2. **Admin** envía noticias al consejo (toggle en dashboard)
3. **Miembros** votan (impacto + relevancia)
4. **Admin** visualiza matriz → asigna corresponsales
5. **Corresponsal** desarrolla producto según enfoque editorial
6. **Admin** cierra consejo semanal → se archiva historial

---

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- CORS configurado
- AuthGuard protege rutas privadas
- Variables de entorno para secrets
- Logs de todas las acciones

---

## 📊 Performance

- React.memo en componentes puros
- useCallback para event handlers
- Componentes UI reutilizables
- Queries SQL optimizadas
- Rate limiting en Gemini API (5 concurrent max)

---

## 🐛 Troubleshooting

**"PDF no procesable"**
→ El PDF es escaneado, busca versión web

**"Error IA"**
→ Verifica `GEMINI_API_KEY` en `.env` y cuota API

**"No puedo entrar"**
→ Verifica que usuario esté activo (contacta admin)

**Ver más**: [USER_GUIDE.md](./docs/USER_GUIDE.md#troubleshooting)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea un branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: añadir...'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

Ver [DEVELOPMENT.md](./docs/DEVELOPMENT.md) para guía completa.

---

## 📝 Changelog

### v1.0.0 (2026-01-29)

- ✅ MVP completo
- ✅ Login + 4 roles
- ✅ Registro con IA
- ✅ Consejo + votación
- ✅ Asignaciones
- ✅ Estadísticas
- ✅ Categorías (Nerd/Geek/Trend)
- ✅ Optimización de código (-35% backend, +performance frontend)

---

## 📄 Licencia

Propiedad de **Corporación Ruta N Medellín** - Todos los derechos reservados.

---

## 👥 Equipo

**Centro de Pensamiento CTi - Ruta N Medellín**

**Desarrollado por**: Alvaro Agudelo

**Contacto**: <alvaro.agudelo@rutanmedellin.org>

---

## 🙏 Agradecimientos

- Google Gemini API (IA)
- Community de Next.js y FastAPI
- Manual de Marca Ruta N V2
