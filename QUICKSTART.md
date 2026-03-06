# Production-Ready OYO Backend – Quick Start

## 1) Start PostgreSQL (Docker)

```bash
docker run --name oyo-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=oyo -p 5432:5432 -d postgres:15
```

## 2) Install and run migrations

```bash
cd api
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

## 3) Start API

```bash
npm run dev
```

- API: http://localhost:4000
- Health: http://localhost:4000/health
- Ready (DB check): http://localhost:4000/ready

## What’s now “real”

- **PostgreSQL** + Prisma (no more in-memory arrays)
- **Stripe** payments (intent/confirm/refund)
- **Validation** with Joi for all endpoints
- **Production hardening**: env checks, health/ready, consistent errors

## Demo credentials (seeded)

- customer@demo.com / demo123
- owner@demo.com / demo123
- admin@demo.com / demo123

## Next steps for production

- Set a strong `JWT_SECRET`
- Use a managed PostgreSQL and update `DATABASE_URL`
- Use live Stripe keys
- Set `NODE_ENV=production`
