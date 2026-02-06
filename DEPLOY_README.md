# 🚀 Despliegue Rápido - Servidor de Producción

## ⚡ Inicio Rápido

```bash
cd /home/aagudelo/Test/ConsejoRedaccion

# Despliegue completo (primera vez)
./deploy.sh

# Actualizaciones rápidas de código
./update.sh
```

---

## 📦 ¿Qué incluye?

### Scripts Disponibles

1. **`deploy.sh`** - Despliegue completo
   - Sube todo el proyecto
   - Construye imágenes Docker
   - Configura servicios
   - ⏱️ ~5-10 minutos

2. **`update.sh`** - Actualización rápida
   - Solo sincroniza código
   - Reinicia servicios
   - ⏱️ ~30 segundos

3. **`DEPLOYMENT.md`** - Guía completa
   - Troubleshooting
   - Comandos útiles
   - Configuración avanzada

---

## 🌐 Acceso Post-Despliegue

| Servicio | URL |
|----------|-----|
| **Frontend** | <http://192.168.0.99:3002> |
| **Backend API** | <http://192.168.0.99:8002> |

**Login inicial**: Cualquier administrador configurado (ej: Alvaro Agudelo / rutan123)

---

## ⚙️ Configuración Post-Despliegue

### IMPORTANTE: Configurar API Key de Gemini

```bash
ssh n8n@192.168.0.99
# Password: N8n*123*

cd /home/n8n/ConsejoRedaccion
nano .env

# Editar línea:
GEMINI_API_KEY=tu_clave_real_aqui

# Guardar y reiniciar
docker compose restart backend
```

---

## 🔍 Verificar Estado

```bash
ssh n8n@192.168.0.99
cd /home/n8n/ConsejoRedaccion

# Ver servicios
docker compose ps

# Ver logs
docker compose logs -f backend
```

---

## 📝 Puertos Configurados

- **Frontend**: 3002 (evita conflicto con 3001)
- **Backend**: 8002 (evita conflicto con 8001)  
- **Database**: 5434 (evita conflicto con 5433)

Si hay conflictos, editar variables en `deploy.sh` y volver a ejecutar.

---

## 📚 Más Información

Ver `DEPLOYMENT.md` para guía completa con troubleshooting y comandos avanzados.
