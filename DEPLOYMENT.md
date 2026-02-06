# Guía de Despliegue - Consejo de Redacción CTI

## 📋 Pre-requisitos

### En tu máquina local

- [x] Proyecto completo en `/home/aagudelo/Test/ConsejoRedaccion`
- [x] Conexión de red al servidor 192.168.0.99
- [x] `sshpass` instalado
- [x] `rsync` instalado

### En el servidor (192.168.0.99)

- [x] Docker y Docker Compose instalados
- [x] Usuario `n8n` con permisos
- [x] Puertos disponibles: 3002, 8002, 5435

---

## 🚀 Despliegue con Server Manager

### Usar el script consolidado (Recomendado)

```bash
cd /home/aagudelo/Test/ConsejoRedaccion
./server-manager.sh
```

### Opciones del menú

| Opción | Función |
|--------|---------|
| 1) Deploy | Rebuild completo (preserva BD) |
| 2) Quick Update | Sync + rebuild frontend/backend |
| 3) Database | Migrate/Reset/Seed/Backup |
| 4) Services | Start/Stop/Restart/Status |
| 5) Logs | Ver logs de servicios |

**Tiempo estimado**: 3-5 minutos

---

## 🔧 Configuración Post-Despliegue

### 1. Configurar API Key de Gemini

```bash
# Conectarse al servidor
ssh n8n@192.168.0.99
# Contraseña: N8n*123*

# Editar .env
cd /home/n8n/ConsejoRedaccion
nano .env

# Reemplazar esta línea:
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Por tu clave real:
GEMINI_API_KEY=tu_clave_aqui

# Guardar (Ctrl+O) y salir (Ctrl+X)

# Reiniciar backend
docker compose restart backend
```

### 2. Verificar Estado

```bash
# Ver contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Solo backend
docker compose logs backend -f

# Solo frontend
docker compose logs frontend -f
```

---

## 🌐 URLs de Acceso

Una vez desplegado:

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend** | <http://192.168.0.99:3002> | 3002 |
| **Backend API** | <http://192.168.0.99:8002> | 8002 |
| **PostgreSQL** | 192.168.0.99:5435 | 5435 |

### Primer Login

- Usuario: `Alvaro Agudelo` (o cualquier admin configurado)
- Contraseña: `rutan123`

---

## 📦 Puertos Configurados

El servidor usa puertos **alternativos** para evitar conflictos:

```bash
Frontend:  3002
Backend:   8002
Database:  5435
```

Si hay conflictos, editar en `server-manager.sh`:

```bash
FRONTEND_PORT=3002
BACKEND_PORT=8002
DB_PORT=5435
```

---

## 💾 Backups Automáticos

El servidor tiene backups automáticos configurados:

```
📅 Frecuencia: Diario a las 2:00 AM
📂 Ubicación: /home/n8n/ConsejoRedaccion/backups/
🔄 Retención: Últimos 7 backups
```

### Backup Manual

```bash
./server-manager.sh
# Seleccionar: 3) Database Menu → d) Backup Database
```

### Restaurar Backup

```bash
ssh n8n@192.168.0.99
cat /home/n8n/ConsejoRedaccion/backups/backup_YYYYMMDD_HHMMSS.sql | \
  docker compose exec -T db psql -U postgres -d consejoredaccion
```

---

## 🔄 Comandos Útiles

### Actualizar el código

```bash
# Desde tu máquina local
cd /home/aagudelo/Test/ConsejoRedaccion
./deploy.sh
```

### Reiniciar servicios

```bash
ssh n8n@192.168.0.99
cd /home/n8n/ConsejoRedaccion

# Reiniciar todo
docker compose restart

# Solo un servicio
docker compose restart backend
docker compose restart frontend
```

### Detener servicios

```bash
docker compose down

# Detener y eliminar volúmenes (⚠️ BORRA LA BD)
docker compose down -v
```

### Ver estadísticas

```bash
# Uso de recursos
docker stats

# Logs específicos
docker compose logs backend --tail=50
docker compose logs frontend --since=10m
```

### Acceder a la base de datos

```bash
# Conectarse al contenedor de PostgreSQL
docker compose exec db psql -U postgres -d consejo_redaccion

# Listar tablas
\dt

# Ver usuarios
SELECT * FROM users;

# Salir
\q
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to Database"

```bash
# Verificar que la DB esté corriendo
docker compose ps

# Reiniciar DB
docker compose restart db

# Ver logs
docker compose logs db
```

### Error: "Port already in use"

```bash
# Ver qué está usando el puerto
ssh n8n@192.168.0.99
sudo lsof -i :3002
sudo lsof -i :8002
sudo lsof -i :5434

# Cambiar puertos en deploy.sh y volver a desplegar
```

### Frontend no carga

```bash
# Verificar que el backend esté respondiendo
curl http://192.168.0.99:8002/

# Debería retornar: {"message":"Welcome to Consejo de Redacción CTi API"}

# Reconstruir frontend
docker compose build frontend
docker compose up -d frontend
```

### Actualizar solo el código sin reconstruir

```bash
# Copiar archivos cambiados manualmente
sshpass -p "N8n*123*" rsync -avz ./backend/routers/ n8n@192.168.0.99:/home/n8n/ConsejoRedaccion/backend/routers/

# Reiniciar servicio
ssh n8n@192.168.0.99 "cd /home/n8n/ConsejoRedaccion && docker compose restart backend"
```

---

## 🔒 Seguridad

### Cambiar contraseña de BD (Recomendado)

1. Editar `/home/n8n/ConsejoRedaccion/.env`:

   ```
   POSTGRES_PASSWORD=nueva_password_segura
   ```

2. Recrear contenedor:

   ```bash
   docker compose down
   docker volume rm consejoredaccion_postgres_data  # ⚠️ BORRA DATOS
   docker compose up -d
   ```

### Firewall

```bash
# Permitir solo desde red local
sudo ufw allow from 192.168.0.0/24 to any port 3002
sudo ufw allow from 192.168.0.0/24 to any port 8002
```

---

## 📊 Monitoreo

### Script de salud (health check)

```bash
# Crear archivo health-check.sh en el servidor
cat > /home/n8n/ConsejoRedaccion/health-check.sh << 'EOF'
#!/bin/bash
echo "=== Estado de Servicios ==="
docker compose ps
echo ""
echo "=== Backend Health ==="
curl -s http://localhost:8002/ || echo "❌ Backend no responde"
echo ""
echo "=== Frontend Health ==="
curl -s http://localhost:3000/ | head -n 5 || echo "❌ Frontend no responde"
EOF

chmod +x /home/n8n/ConsejoRedaccion/health-check.sh
```

---

## 📞 Soporte

Si hay problemas:

1. Revisar logs: `docker compose logs -f`
2. Verificar puertos: `docker compose ps`
3. Reiniciar servicios: `docker compose restart`
4. Reconstruir desde cero: `docker compose down && docker compose up -d --build`

---

**Última actualización**: 2026-01-29
