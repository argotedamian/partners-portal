# Partners Portal (`partners-portal`)

Portal de partners (asesores inmobiliarios) para generar **cotizaciones** y **calificaciones** contra el backend.

## Requisitos

- Node.js (recomendado 20+)
- npm

## Setup

Instalar dependencias:

```bash
npm install
```

Levantar en desarrollo:

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

Este proyecto usa variables `NEXT_PUBLIC_*` (expuestas al cliente). Ver `.env` / `.env.local`.

- **`NEXT_PUBLIC_BACKEND_URL`**: base URL del backend (Laravel).
  - Usado por `src/lib/quotation.api.ts`
  - Endpoints consumidos:
    - `POST /api/web/v2/discounts/validate`
    - `POST /api/web/v2/individual/quotations`
    - `POST /api/web/v2/individual/qualifications`

- **`NEXT_PUBLIC_N8N_MOB`** / **`NEXT_PUBLIC_N8N_CE_BROKERS`** (opcionales): webhooks de n8n a notificar cuando una calificación queda aprobada (best-effort).
  - Se resuelve el webhook por dominio del asesor (`mob.com` → `mob`, `cebrokers.com` → `ce_brokers`)
  - Ver `notifyFianzaAprobacionWebhook` en `src/lib/quotation.api.ts`

- **`NEXT_PUBLIC_USE_MOCK_RESULT`** (opcional): fuerza respuestas mock para la calificación (si está vacío/no seteado, se llama a la API real).
  - Valores soportados (ver `src/mocks/qualification-mock-mode.enum.ts`):
    - `1`: cotización aprobada (mock)
    - `rejected` / `7` / `8`: rechazo (mock)
    - `6` / `9` / `11` / `13`: estados intermedios (mock)

Ejemplo (mac/linux):

```bash
NEXT_PUBLIC_BACKEND_URL="https://backend-laravel.hoggax.com" \
NEXT_PUBLIC_USE_MOCK_RESULT="1" \
npm run dev
```

## Mocks de partners (login/asesores)

Hay mocks estáticos en `public/mocks/` que se importan desde el frontend:

- **`public/mocks/partner-users.json`**: credenciales válidas en modo mock (email/password).
  - Ver helper `isValidPartnerMockCredentials` en `src/lib/partner-users-mock.ts`

- **`public/mocks/partners.json`**: lista de asesores habilitados (nombre, email, logo, comisión).
  - Ver helpers `isAllowedAdvisorEmailFromMock` / `resolvePartnerAgent` en `src/lib/partners-mock.ts`

## Build / Export

El proyecto está configurado como **export estático** (ver `next.config.ts`):

- `output: 'export'`
- `trailingSlash: true`

Generar build:

```bash
npm run build
```

El output queda en `out/` (para servir estático).
