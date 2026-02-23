# CourierFlow (Phase 0 + Phase 1)

CourierFlow is a monorepo foundation with:
- `apps/web`: Next.js + TypeScript + shadcn/ui + Better Auth
- `apps/api`: NestJS + TypeScript REST API
- `packages/contracts`: shared DTOs and zod schemas
- `packages/ui`: shared UI components
- `packages/config`: shared config presets
- `prisma`: SQL Server schema, migrations, seed
- `docker-compose.yml`: SQL Server, Kafka, Zookeeper, Redis, Mailhog, optional API/Web containers

## Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop

## 1) Environment Setup

```bash
cp .env.example .env
```

Required values are already listed in `.env.example`.

## 2) Install Dependencies

```bash
npm install
```

## 3) Start Infrastructure

Default local workflow (infra in Docker, apps on host):

```bash
docker compose up -d sqlserver zookeeper kafka redis mailhog
```

Optional full container mode (apps + infra):

```bash
docker compose --profile fullstack up --build
```

## 4) Prisma Setup

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

For CI/production-style migration application:

```bash
npm run prisma:deploy
```

## 5) Run Applications

```bash
npm run dev
```

This runs both workspaces through Turborepo:
- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## 6) Auth Endpoints

Better Auth is mounted in Next.js at:
- `GET/POST http://localhost:3000/api/auth/*`

Nest auth proxy endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`

## 7) Shipment Endpoints

- `POST /api/shipments`
- `GET /api/shipments`
- `GET /api/shipments/:trackingId`
- `PATCH /api/shipments/:trackingId/status`

## 8) Testing

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 9) CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
- lint + typecheck
- unit tests
- integration smoke with SQL Server service

## Troubleshooting

- SQL Server TLS errors: ensure `DATABASE_URL` includes `encrypt=true;trustServerCertificate=true` for local dev.
- Better Auth errors about secret: set a non-empty `BETTER_AUTH_SECRET` in `.env`.
- Missing Prisma client: run `npm run prisma:generate`.
- CORS/API mismatch: ensure web is at `3000` and Nest API at `4000`.
