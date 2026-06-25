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

## Desarrollo

Todo el desarrollo activo se hace en la rama **`main`** (rama por defecto del repositorio).

```bash
git checkout main
git pull origin main
```

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (local o Docker)
- Redis (opcional; sin Redis el CRUD funciona, las notificaciones no)
- Docker (opcional)

## Inicio rápido — local sin Docker (recomendado)

### 1. Instalar dependencias

```bash
git clone https://github.com/capcrz12/Chrono.git
cd Chrono
npm install
```

### 2. Configurar PostgreSQL

Tienes PostgreSQL 17 instalado. Ejecuta:

```powershell
npm run setup:local
```

Te pedirá la contraseña del usuario `postgres` y creará la base de datos `chrono`.

### 3. Configurar entorno

```bash
cp .env.example .env
```

Si **no tienes Redis**, añade en `.env`:

```
REDIS_ENABLED=false
```

### 4. Arrancar todo (API + Worker + Expo)

```powershell
npm run dev:local
```

Abre:
- **Expo Web:** http://localhost:8081 (pulsa `w` en la terminal de Expo)
- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api/docs

### Manual (3 terminales)

```bash
npm run shared:build
npm run api:dev      # terminal 1
npm run worker:dev   # terminal 2 (opcional sin Redis)
npm run mobile:dev   # terminal 3 → pulsa w para web
```

## Inicio rápido — con Docker

```bash
docker compose up -d
```

### Frontend Expo (con Docker o local)

```bash
npm run mobile:dev
```

- Web: http://localhost:8081 (pulsa `w`)
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
