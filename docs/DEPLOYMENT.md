# Guía de Deployment - Consejo de Redacción CTi

## Deployment en Servidor Linux (Ruta N)

### Requisitos del Servidor

- **OS**: Ubuntu 20.04+ o Rocky Linux 9+
- **RAM**: Mínimo 8GB
- **CPU**: 2+ cores
- **Almacenamiento**: 40GB+
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Conexión a Internet**: Para API de Gemini

---

## Preparación del Servidor

### 1. Instalar Docker y Docker Compose

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Añadir repo Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Añadir usuario a grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### 2. Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Si se accede localmente sin proxy:
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8001/tcp  # Backend
```

---

## Deployment Inicial

### 1. Transferir Código al Servidor

```bash
# Opción A: Git (recomendado)
git clone https://github.com/rutanmedellin/consejo-redaccion.git
cd consejo-redaccion

# Opción B: SCP
scp -r ConsejoRedaccion/ usuario@servidor:/home/usuario/
```

### 2. Configurar Variables de Entorno

```bash
cd /home/usuario/consejo-redaccion

# Crear .env
nano .env
```

**Contenido de `.env` para producción:**

```bash
# Base de Datos
DATABASE_URL=postgresql://postgres:SECURE_PASSWORD_HERE@db:5432/consejo_redaccion

# IA
GEMINI_API_KEY=tu-api-key-de-produccion

# Seguridad
MASTER_PASSWORD=password_super_seguro_aqui

# Opcional: Logs
LOG_LEVEL=INFO
```

**¡IMPORTANTE!**: Cambiar todas las contraseñas por defecto.

### 3. Ajustar docker-compose.yml para Producción

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    restart: always  # ← Añadir
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # ← Usar variable
      POSTGRES_DB: consejo_redaccion
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - internal  # ← Red interna

  backend:
    build: ./backend
    restart: always  # ← Añadir
    ports:
      - "127.0.0.1:8001:8001"  # ← Solo localhost
    env_file:
      - .env
    depends_on:
      - db
    networks:
      - internal

  frontend:
    build: ./frontend
    restart: always  # ← Añadir
    ports:
      - "127.0.0.1:3000:3000"  # ← Solo localhost
    depends_on:
      - backend
    networks:
      - internal

networks:
  internal:
    driver: bridge

volumes:
  pgdata:
```

### 4. Build y Deploy

```bash
# Build imágenes
docker compose build

# Levantar servicios
docker compose up -d

# Verificar
docker compose ps
docker compose logs -f

# Seed inicial
docker compose exec backend python seed.py
```

---

## Configurar Nginx como Reverse Proxy

### 1. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Configurar Virtual Host

```bash
sudo nano /etc/nginx/sites-available/consejo.rutanmedellin.org
```

**Contenido:**

```nginx
upstream backend_api {
    server 127.0.0.1:8001;
}

upstream frontend_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name consejo.rutanmedellin.org;

    # Redirigir a HTTPS (cuando SSL esté configurado)
    # return 301 https://$server_name$request_uri;

    # Frontend
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/consejo_access.log;
    error_log /var/log/nginx/consejo_error.log;
}
```

### 3. Activar Configuración

```bash
# Symlink
sudo ln -s /etc/nginx/sites-available/consejo.rutanmedellin.org /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Configurar HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d consejo.rutanmedellin.org

# Auto-renovación (cron job automático)
sudo certbot renew --dry-run
```

---

## Monitoreo y Mantenimiento

### Logs

```bash
# Nginx
sudo tail -f /var/log/nginx/consejo_access.log
sudo tail -f /var/log/nginx/consejo_error.log

# Docker services
docker compose logs -f --tail=100

# Solo backend
docker compose logs -f backend

# Solo DB
docker compose logs -f db
```

### Monitoreo de Recursos

```bash
# CPU/RAM usage
docker stats

# Disk usage
docker system df
df -h
```

### Backup Automático

Crear script `/home/usuario/backup_consejo.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/consejo"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup DB
docker compose exec -T db pg_dump -U postgres consejo_redaccion > "$BACKUP_DIR/db_$DATE.sql"

# Comprimir
gzip "$BACKUP_DIR/db_$DATE.sql"

# Eliminar backups > 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completado: db_$DATE.sql.gz"
```

```bash
# Hacer ejecutable
chmod +x /home/usuario/backup_consejo.sh

# Cronjob (diario a las 2am)
crontab -e
# Añadir:
0 2 * * * /home/usuario/backup_consejo.sh >> /var/log/backup_consejo.log 2>&1
```

---

## Updates y Despliegue Continuo

### Update de Código

```bash
cd /home/usuario/consejo-redaccion

# Pull cambios
git pull origin main

# Rebuild servicios modificados
docker compose build

# Recrear solo lo necesario
docker compose up -d --force-recreate backend frontend

# Verificar
docker compose ps
```

### Rollback

```bash
# Ver versión actual
docker compose images

# Volver a commit anterior
git reset --hard <commit-hash>
docker compose build
docker compose up -d --force-recreate
```

---

## Troubleshooting Producción

### Servicio No Responde

```bash
# 1. Check containers
docker compose ps

# 2. Restart service
docker compose restart backend

# 3. Full restart
docker compose down
docker compose up -d

# 4. View logs
docker compose logs --tail=200 backend
```

### DB Connection Issues

```bash
# Check DB container
docker compose ps db
docker compose logs db

# Connect manually
docker compose exec db psql -U postgres -d consejo_redaccion

# Test from backend
docker compose exec backend python -c "from database import engine; print(engine.execute('SELECT 1').fetchone())"
```

### High Memory Usage

```bash
# Check stats
docker stats

# Restart containers
docker compose restart

# Clean up
docker system prune -a
```

### Gemini API Errors

```bash
# Verify API key
docker compose exec backend python -c "import os; print(os.getenv('GEMINI_API_KEY'))"

# Test API
docker compose exec backend python -c "from services.ai_service import analyze_text; import asyncio; print(asyncio.run(analyze_text('test')))"
```

---

## Security Checklist Producción

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Usar HTTPS (Let's Encrypt configurado)
- [ ] Firewall activo (UFW o firewalld)
- [ ] Solo exponer puertos necesarios
- [ ] Backups automáticos funcionando
- [ ] Updates de seguridad del SO habilitados
- [ ] Logs rotando correctamente
- [ ] Monitoreo de recursos activo
- [ ] CORS configurado solo para dominio de producción
- [ ] Variables de entorno no commiteadas en Git

---

## Comandos Rápidos

```bash
# Ver estado
docker compose ps

# Restart todo
docker compose restart

# Ver logs últimas 100 líneas
docker compose logs --tail=100

# Backup manual
docker compose exec db pg_dump -U postgres consejo_redaccion > backup.sql

# Rebuild completo
docker compose down && docker compose build && docker compose up -d
```
