# Índice de Documentación - Consejo de Redacción CTi

## 📚 Guía Rápida

¿Nuevo en el proyecto? Comienza aquí:

1. **[README.md](../README.md)** - Vista general del proyecto y quick start
2. **[USER_GUIDE.md](./USER_GUIDE.md)** - Manual de usuario (obligatorio para todos)
3. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Setup desarrollo local (para devs)

---

## 📖 Documentación Completa

### Para Usuarios del Sistema

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| **[USER_GUIDE.md](./USER_GUIDE.md)** | Todos los usuarios | Manual completo por roles: cómo registrar noticias, votar, usar el dashboard, gestionar usuarios |

### Para Desarrolladores

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Devs, Arquitectos | Stack técnico, modelos de datos, flujos, seguridad, performance |
| **[API.md](./API.md)** | Backend devs | Referencia completa de endpoints con ejemplos de request/response |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Contribuidores | Setup local, estructura del código, debugging, testing |

### Para Administradores de Sistema

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | DevOps, SysAdmins | Deployment en producción, Nginx, HTTPS, backups, monitoreo |

### Documentos Base

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| **[README.md](../README.md)** | Todos | Overview, quick start, features, stack, changelog |
| **[DocumentoBase.md](../DocumentoBase.md)** | Stakeholders, PM | Especificación original del proyecto, requisitos, mockups |

---

## 🎯 ¿Qué documento necesito?

### "Quiero usar el sistema"

→ **[USER_GUIDE.md](./USER_GUIDE.md)**

### "Quiero saber cómo funciona técnicamente"

→ **[ARCHITECTURE.md](./ARCHITECTURE.md)**

### "Necesito integrarme con la API"

→ **[API.md](./API.md)**

### "Voy a contribuir código"

→ **[DEVELOPMENT.md](./DEVELOPMENT.md)**

### "Necesito deployar en producción"

→ **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### "Quiero entender la visión del proyecto"

→ **[DocumentoBase.md](../DocumentoBase.md)**

---

## 📝 Historial de Documentación

### v1.0.0 (2026-01-29)

- ✅ Documentación completa creada
- ✅ 6 documentos markdown
- ✅ Cobertura 100% de funcionalidades implementadas
- ✅ Guías para todos los roles (usuario, dev, sysadmin)

---

## 🔄 Actualizaciones

**Documentación viviente**: Estos documentos se actualizan con cada cambio significativo en el sistema.

**Última actualización**: 2026-01-29

**Próxima revisión**: Cuando se implemente Fase 6 (Productos Generados)

---

## 🤝 Contribuir a la Documentación

Si encuentras información incorrecta, desactualizada o confusa:

1. Abre un issue en GitHub
2. O envía un PR con la corrección
3. O contacta a: <alvaro.agudelo@rutanmedellin.org>

---

## 📂 Estructura de Archivos

```
ConsejoRedaccion/
├── README.md                    # ← Empieza aquí
├── DocumentoBase.md             # Spec original
├── docs/
│   ├── INDEX.md                 # ← Este archivo
│   ├── ARCHITECTURE.md          # Arquitectura técnica
│   ├── API.md                   # Referencia API
│   ├── USER_GUIDE.md            # Manual usuarios
│   ├── DEVELOPMENT.md           # Guía desarrollo
│   └── DEPLOYMENT.md            # Guía deployment
├── backend/                     # Código backend
├── frontend/                    # Código frontend
└── docker-compose.yml           # Orquestación
```

---

## 💡 Tips de Navegación

- **Usa Ctrl+F** para buscar en cada documento
- **Los vínculos internos** funcionan en GitHub y editores markdown
- **Mermaid diagrams** se renderizan en GitHub y VS Code
- **Code blocks** tienen syntax highlighting

---

## 🔗 Enlaces Externos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Docker Docs](https://docs.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
