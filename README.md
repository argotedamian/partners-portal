# Partners Portal (`partners-portal`)

Portal frontend para **partners.hoggax.com**. Permite a asesores inmobiliarios (partners de Hoggax) gestionar calificaciones de garantías de alquiler para sus inquilinos.

## Requisitos

- Node.js 20+
- npm

## Setup

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

---

## Arquitectura

### Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 |
| Estilos | Tailwind CSS v4 (PostCSS) |
| Forms | react-hook-form + zod |
| Toasts | sonner |
| QR | react-qr-code |
| Animaciones | rive-js |
| HTTP | native `fetch` |

El proyecto es **frontend-only**. Toda la lógica de negocio vive en el backend Laravel. El portal orquesta el formulario, llama a la API, muestra el resultado, y notifica al partner vía webhook.

### Estructura de carpetas

```
src/
  app/        → App Router: layout, page, HomeClient, SEO (manifest/robots/sitemap)
  components/ → Navbar, Footer, AuthGate, form, result, quotation-edit-panel, quoter-plan-card
  hooks/      → useQuotationFlow (core), useHomeState, useNavbarState
  lib/        → quotation.api.ts, auth-session.ts, partners-mock.ts,
                passport-qualification-alignment.ts, constants.ts, utils
  mocks/      → mock modes enum, estados de calificación, autofill
  state/      → React Context + useReducer
  styles/     → CSS por componente
```

### Estado global

`useReducer` + React Context. Sin Redux ni Zustand.

```
AppState
├── session   → isAuthenticated, advisorLabel, partnerLogoSrc, partner
├── quotation → qualification, advisorEmail, draft
└── ui        → isMounted
```

- Acciones: convención `domain/actionName` (`session/setAuthenticated`, `quotation/setQualification`, etc.)
- Selectors separados en `src/state/appState.selectors.ts`
- Provider en `src/state/AppStateContext.tsx`

### Autenticación

`AuthGate` (`src/components/auth-gate.tsx`) envuelve toda la app en el layout. Rutas públicas: `/login` y `/compartir-certificado`.

- Lee la sesión del browser storage via `src/lib/auth-session.ts`
- Auto-logout con `setTimeout` basado en el tiempo restante de la sesión
- Redirige a `/login?next=<ruta>` si no hay sesión válida

### Sistema de partners

El partner se identifica por **dominio del email del asesor**:

| Dominio | PartnerKey |
|---|---|
| `mob.com` | `mob` |
| `cebrokers.com` | `ce_brokers` |

Los datos del partner (nombre, logo, comisión) vienen de `/public/mocks/partners.json`. Al aprobar una calificación (status 4 o 5), se dispara un **webhook n8n** correspondiente al partner (best-effort, swallows errors).

Ver `src/lib/partners-mock.ts` y `notifyFianzaAprobacionWebhook` en `src/lib/quotation.api.ts`.

### Flujo de calificación

```
Form (react-hook-form)
  → useQuotationFlow.onSubmit()       src/hooks/useQuotationFlow.ts
    → resolvePartnerAgent()            identifica asesor por email
    → createQualification()            POST /api/web/v2/individual/qualifications
    → alignQualificationStatusForPassport()   corrección client-side para pasaportes
    → notifyFianzaAprobacionWebhook()  webhook n8n (best-effort)
    → onComplete(qualification)        muestra pantalla de resultado
```

**Passport alignment** (`src/lib/passport-qualification-alignment.ts`): cuando el solicitante usa pasaporte (doc_type=2), el cliente corrige el `status_id` (4↔6) para igualar el comportamiento de la API legacy. Techo para estudiantes: $850.000 ARS (alquiler + expensas), alineado con `settings.js` del backend.

---

## Variables de entorno

Variables `NEXT_PUBLIC_*` expuestas al cliente. Ver `.env` / `.env.local`.

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Base URL del backend Laravel |
| `NEXT_PUBLIC_N8N_MOB` | Webhook n8n para partner MOB (opcional) |
| `NEXT_PUBLIC_N8N_CE_BROKERS` | Webhook n8n para partner CE Brokers (opcional) |
| `NEXT_PUBLIC_USE_MOCK_RESULT` | Fuerza resultado mock (ver tabla abajo) |
| `NEXT_PUBLIC_MOCK_INDEX` | Activa autofill del formulario con datos pre-cargados |

**Endpoints consumidos** (`NEXT_PUBLIC_BACKEND_URL`):
- `POST /api/web/v2/discounts/validate`
- `POST /api/web/v2/individual/quotations`
- `POST /api/web/v2/individual/qualifications`

### `NEXT_PUBLIC_USE_MOCK_RESULT`

Si está vacío o no seteado, se llama a la API real. Valores soportados (ver `src/mocks/qualification-mock-mode.enum.ts`):

| Valor | Resultado |
|---|---|
| `1` | Calificación aprobada (mock) |
| `rejected` / `7` / `8` | Rechazo (mock) |
| `6` / `9` / `11` / `13` | Estados intermedios (mock) |

### `NEXT_PUBLIC_MOCK_INDEX`

Cuando está seteado, pre-llena el formulario con datos del mock correspondiente (ver `src/mocks/form-autofill-mocks.ts`). Útil para acelerar pruebas en desarrollo sin tener que completar el form manualmente.

Ejemplo de arranque en desarrollo con mocks:

```bash
NEXT_PUBLIC_BACKEND_URL="https://backend-laravel.hoggax.com" \
NEXT_PUBLIC_USE_MOCK_RESULT="1" \
NEXT_PUBLIC_MOCK_INDEX="0" \
npm run dev
```

---

## Mocks estáticos

En `public/mocks/`:

- **`partner-users.json`**: credenciales válidas para login en modo mock (email/password).
  - Ver `isValidPartnerMockCredentials` en `src/lib/partner-users-mock.ts`

- **`partners.json`**: lista de asesores habilitados (nombre, email, logo, comisión).
  - Ver `isAllowedAdvisorEmailFromMock` / `resolvePartnerAgent` en `src/lib/partners-mock.ts`

---

## Build / Deploy

El proyecto está configurado como **export estático** (`next.config.ts`):

```bash
npm run build
```

Output en `out/` → servido estático en `partners.hoggax.com`.
