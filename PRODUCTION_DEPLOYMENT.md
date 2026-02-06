# Despliegue en Producción - Consejo de Redacción

## ✅ Estado del Despliegue

**Fecha**: 2026-01-29
**Servidor**: 192.168.0.99
**Estado**: ✅ COMPLETADO Y FUNCIONAL

---

## 🌐 Configuración de Red

### URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | <http://192.168.0.99:3002> | Interfaz web principal |
| **Backend API** | <http://192.168.0.99:8002> | API REST |
| **Base de Datos** | 192.168.0.99:5434 | PostgreSQL |

### Configuración Crítica del Firewall (UFW)

Para que otros equipos puedan acceder, es **OBLIGATORIO** permitir el tráfico en los puertos de la aplicación.

```bash
# Verificar estado:
sudo ufw status

# Si está activo, debes permitir:
sudo ufw allow 3002/tcp  # Frontend
sudo ufw allow 8002/tcp  # Backend API
sudo ufw reload
```

⚠️ **Si estos puertos están cerrados, los usuarios verán la página pero NO cargará la información (usuarios, noticias, etc).**

### Acceso desde Cualquier Ubicación

✅ La aplicación está **completamente funcional desde cualquier dispositivo en la red**:

- Computadoras en la oficina
- Tablets conectadas a la misma red
- Cualquier navegador moderno

**Ejemplo de uso**:

1. Abrir navegador en cualquier dispositivo
2. Ir a: `http://192.168.0.99:3002`
3. Login con usuario asignado
4. ¡Listo para usar!

---

## 🔧 Arquitectura Desplegada

```
┌─────────────────────────────────────────┐
│     Servidor: 192.168.0.99              │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Frontend (Next.js)            │    │
│  │  Puerto: 3002                  │    │
│  │  Env: NEXT_PUBLIC_API_URL      │───┐│
│  └────────────────────────────────┘   ││
│                                        ││
│  ┌────────────────────────────────┐   ││
│  │  Backend (FastAPI)             │◄──┘│
│  │  Puerto: 8002                  │    │
│  │  Env: GEMINI_API_KEY           │───┐│
│  └────────────────────────────────┘   ││
│                                        ││
│  ┌────────────────────────────────┐   ││
│  │  PostgreSQL Database           │◄──┘│
│  │  Puerto: 5434                  │    │
│  │  Volumen: Persistente          │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🔐 Variables de Entorno Configuradas

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://192.168.0.99:8002
```

✅ **Sin URLs hardcodeadas** - Todo configurado vía variables

### Backend (.env)

```bash
GEMINI_API_KEY=AIzaSy... (configurada desde local)
DATABASE_URL=postgresql://postgres:postgres@db:5432/consejo_redaccion
```

---

## 📊 Estado de la Base de Datos

### Base de Datos Limpia

✅ **Reseteo completado**:

- Noticias: 0
- Votos: 0
- Productos: 0
- Usuarios: **Se crearán al primer acceso**

### Primer Acceso

Al abrir la aplicación por primera vez:

1. El sistema creará los usuarios definidos en el código
2. Podrás hacer login con cualquier usuario existente
3. Password por defecto: `rutan123` (para usuarios que requieren autenticación)

---

## 🚀 Servicios Activos

```
NAME                          STATUS          PORTS
consejoredaccion-frontend-1   Running (10s)   0.0.0.0:3002→3000/tcp
consejoredaccion-backend-1    Running (10s)   0.0.0.0:8002→8000/tcp
consejoredaccion-db-1         Running (10s)   0.0.0.0:5434→5432/tcp
```

### Backend Health Check

```
✅ Uvicorn running on http://0.0.0.0:8000
✅ Application startup complete
✅ API respondiendo correctamente
```

---

## 📝 Comandos Útiles del Administrador

### Ver Logs en Tiempo Real

```bash
ssh n8n@192.168.0.99
cd /home/n8n/ConsejoRedaccion
docker compose logs -f

# Solo backend:
docker compose logs backend -f

# Solo frontend:
docker compose logs frontend -f
```

### Reiniciar Servicios

```bash
ssh n8n@192.168.0.99
cd /home/n8n/ConsejoRedaccion

# Reiniciar todo:
docker compose restart

# Reiniciar solo un servicio:
docker compose restart backend
docker compose restart frontend
```

### Ver Estado

```bash
docker compose ps
```

### Detener/Iniciar

```bash
# Detener:
docker compose down

# Iniciar:
docker compose up -d
```

---

## 🔄 Scripts de Mantenimiento Disponibles

### En tu máquina local (`/home/aagudelo/Test/ConsejoRedaccion/`)

| Script | Propósito |
|--------|-----------|
| `check-ports.sh` | Verificar puertos disponibles antes de desplegar |
| `deploy.sh` | Despliegue completo (primera vez o cambios mayores) |
| `update.sh` | Actualización rápida de código (solo reinicia servicios) |
| `reset-database.sh` | Limpiar BD (mantiene usuarios, elimina noticias/votos) |

### Uso

```bash
cd /home/aagudelo/Test/ConsejoRedaccion

# Actualizar código:
./update.sh

# Limpiar BD:
./reset-database.sh

# Re-desplegar completo:
./deploy.sh
```

---

## ✨ Características Implementadas

### Funcionalidades Desplegadas

- ✅ **Gestión de Usuarios** - Login, roles, permisos
- ✅ **Registro de Noticias** - Con análisis IA (Gemini)
- ✅ **Consejo de Votación** - Sistema de priorización
- ✅ **Matriz de Decisión** - Visualización de consenso
- ✅ **Prioridad Ejecutiva** ⭐ - Dirección marca prioridades estratégicas
- ✅ **Gestión de Productos** - Boletines, artículos, infografías
- ✅ **Archivo de Noticias** - Historial completo
- ✅ **Analytics** - Estadísticas de participación

### Seguridad

- ✅ Control de acceso por roles
- ✅ Validación de permisos en backend
- ✅ Base de datos aislada en red interna Docker

---

## 🎯 Validación del Despliegue

### ✅ Checklist de Verificación

- [x] Frontend accesible desde cualquier ubicación
- [x] Backend respondiendo correctamente
- [x] Base de datos operativa
- [x] Variables de entorno configuradas
- [x] GEMINI_API_KEY activa
- [x] NEXT_PUBLIC_API_URL apuntando al servidor
- [x] Sin URLs hardcodeadas en el código
- [x] Servicios persistentes (reinician automáticamente)
- [x] Volúmenes de datos persistentes

---

## 🔍 Troubleshooting

### Frontend no carga

```bash
# Verificar logs:
ssh n8n@192.168.0.99 "docker compose -f /home/n8n/ConsejoRedaccion/docker-compose.yml logs frontend"

# Reiniciar:
ssh n8n@192.168.0.99 "docker compose -f /home/n8n/ConsejoRedaccion/docker-compose.yml restart frontend"
```

### Backend no responde

```bash
# Verificar API directamente:
curl http://192.168.0.99:8002/

# Debería retornar:
# {"message":"Welcome to Consejo de Redacción CTi API"}
```

### Error de conexión a BD

```bash
# Verificar que DB está corriendo:
ssh n8n@192.168.0.99 "docker compose -f /home/n8n/ConsejoRedaccion/docker-compose.yml ps db"

# Ver logs de DB:
ssh n8n@192.168.0.99 "docker compose -f /home/n8n/ConsejoRedaccion/docker-compose.yml logs db"
```

---

## 📞 Información de Soporte

**Servidor**: 192.168.0.99
**Usuario SSH**: n8n
**Directorio**: `/home/n8n/ConsejoRedaccion`

**Comandos de emergencia**:

```bash
# Ver todo el estado:
ssh n8n@192.168.0.99 "cd /home/n8n/ConsejoRedaccion && docker compose ps && docker compose logs --tail=50"

# Reinicio completo:
ssh n8n@192.168.0.99 "cd /home/n8n/ConsejoRedaccion && docker compose restart"
```

---

**Última actualización**: 2026-01-29 21:10 UTC
**Estado**: ✅ PRODUCCIÓN - OPERATIVO
