# Gestor de Tutores y Ayudantes (GTA)

Sistema de gestión docente, asignación de ramos y seguimiento de horas con autenticación JWT y PostgreSQL.

---

## 🚀 Requisitos previos

- **Node.js**: versión 24 LTS
- **pnpm**: versión 12 (`pnpm -v`)
- **Docker Desktop**: para ejecutar la base de datos PostgreSQL

---

## 🛠️ Puesta en marcha rápida (Guía paso a paso)

Si acabas de clonar el repositorio o hiciste `git pull`, sigue estos pasos para dejar todo funcionando a la primera:

### 1. Variables de entorno (`.env`)

Copia los archivos de ejemplo para el backend y para el frontend:

```powershell
# En la raíz del proyecto:
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

> **Nota:** `apps/api/.env.example` ya incluye un `JWT_SECRET` válido por defecto y configurado para entorno local. No necesitas modificar nada más.

---

### 2. Levantar la Base de Datos con Docker

Enciende el contenedor de PostgreSQL:

```powershell
docker compose --env-file infra/.env -f infra/compose.yaml up -d db
```

Para verificar que el contenedor esté corriendo (_healthy_):

```powershell
docker compose --env-file infra/.env -f infra/compose.yaml ps
```

---

### 3. Instalar dependencias y preparar Prisma

Instala las librerías del proyecto y genera el cliente de Prisma:

```powershell
pnpm install
pnpm --filter @gestor/api exec prisma generate
```

_(Opcional: si es tu primera vez levantando la base de datos o necesitas el docente de prueba):_

```powershell
pnpm --filter @gestor/api exec prisma migrate deploy
pnpm --filter @gestor/api exec prisma db seed
```

---

### 4. Iniciar la aplicación

Abre dos terminales desde la raíz del proyecto:

- **Terminal 1 (Backend - NestJS):**

  ```powershell
  pnpm dev:api
  ```

  _Espera el mensaje: `Nest application successfully started` (corre en `http://localhost:3000`)._

- **Terminal 2 (Frontend - React + Vite):**
  ```powershell
  pnpm dev:web
  ```
  _Abre en tu navegador exactamente: [http://localhost:5173](http://localhost:5173)._

---

## 🧪 Pruebas y verificación de calidad

- **Script de pruebas E2E / API en PowerShell (Positivas y Negativas):**
  _(Con la API y Docker corriendo en otra terminal):_

  ```powershell
  .\run-tests.ps1
  ```

- **Pruebas de contrato del frontend (14 pruebas):**

  ```powershell
  pnpm --filter @gestor/web test
  ```

- **Pruebas de configuración del backend (5 pruebas):**

  ```powershell
  pnpm --filter @gestor/api exec node --test checks/auth-settings.check.mjs
  ```

- **Smoke test de integración con dos usuarios (34 comprobaciones HTTP):**
  _(Con la API y Docker corriendo):_

  ```powershell
  pnpm --filter @gestor/api exec node checks/auth-smoke.mjs
  ```

- **Chequeo de formato y linter:**
  ```powershell
  pnpm format:check
  pnpm lint
  ```
