# Chrono

Aplicación fullstack para gestión de recordatorios con sincronización Google Calendar.

**Stack:** Expo (React Native + Web) · NestJS · PostgreSQL · Redis + BullMQ · Docker

## Estructura del monorepo

```
chrono/
├── apps/
│   ├── api/        # Backend NestJS (REST + Swagger)
│   ├── mobile/     # Frontend Expo (iOS, Android, Web)
│   └── worker/     # Procesador BullMQ (notificaciones)
├── packages/
│   └── shared/     # Tipos y constantes compartidos
└── docker-compose.yml
```

## Ramas de desarrollo

| Rama | Funcionalidad | Estado |
|------|---------------|--------|
| `main` | Base del repositorio | — |
| `feature/infra-monorepo` | Infraestructura, Docker, monorepo, MVP completo | **Revisión pendiente** |
| `feature/api-auth` | Autenticación JWT + Google OAuth | Pendiente merge infra |
| `feature/api-reminders` | CRUD recordatorios | Pendiente |
| `feature/api-google-calendar` | Sync Google Calendar | Pendiente |
| `feature/worker` | Worker BullMQ | Pendiente |
| `feature/mobile` | App Expo | Pendiente |

> **Flujo:** Revisa cada rama, prueba localmente y avísame para hacer merge a `main` antes de continuar con la siguiente.

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm 10+

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd chrono
git checkout feature/infra-monorepo
cp .env.example .env
npm install
```

### 2. Levantar infraestructura (PostgreSQL + Redis + API + Worker)

```bash
docker compose up -d
```

Servicios:
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 3. Desarrollo local (sin Docker para API/Worker)

```bash
# Solo bases de datos
docker compose up -d postgres redis

# Compilar shared
npm run shared:build

# API en modo watch
npm run api:dev

# Worker en modo watch (otra terminal)
npm run worker:dev
```

### 4. Frontend Expo

```bash
npm run mobile:dev
```

- Web: http://localhost:8081
- Escanea QR con Expo Go en móvil

Configura `EXPO_PUBLIC_API_URL` en `.env` si la API no está en localhost.

## Endpoints principales

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro email/password |
| POST | `/api/auth/login` | Login email/password |
| GET | `/api/auth/me` | Usuario autenticado (JWT) |
| GET | `/api/auth/google` | OAuth Google (requiere credenciales) |

### Recordatorios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reminders` | Listar (opcional: `?start=&end=`) |
| POST | `/api/reminders` | Crear |
| GET | `/api/reminders/:id` | Obtener uno |
| PATCH | `/api/reminders/:id` | Actualizar |
| DELETE | `/api/reminders/:id` | Eliminar |

### Google Calendar
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/google-calendar/status` | Estado conexión |
| POST | `/api/google-calendar/sync` | Sync (stub) |

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |

## Ejemplo: registro y crear recordatorio

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","name":"Test","password":"123456"}'

# Login (guarda el accessToken)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"123456"}'

# Crear recordatorio
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Reunión","datetime":"2026-06-25T10:00:00.000Z","recurrence":"none"}'
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL |
| `REDIS_HOST` / `REDIS_PORT` | Redis para BullMQ |
| `JWT_SECRET` | Secreto para firmar tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `EXPO_PUBLIC_API_URL` | URL API para el frontend |

## Google OAuth (preparado)

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilita Google Calendar API
3. Crea credenciales OAuth 2.0
4. Añade `http://localhost:3000/api/auth/google/callback` como redirect URI
5. Configura las variables en `.env`

## Worker

El worker procesa jobs de la cola `reminders`:
- `process-reminder`: cuando llega la hora del recordatorio
- `send-notification`: mock con `console.log` (preparado para push/email)

## Licencia

MIT
