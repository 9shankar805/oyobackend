# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a hotel booking platform similar to OYO India, built as a monorepo with a Node.js/Express REST API and React+TypeScript frontend. The application supports three user roles (Customer, Owner, Admin) with distinct workflows and features.

**Tech Stack:**
- Backend: Node.js + Express + PostgreSQL (Prisma ORM)
- Frontend: React + TypeScript + Vite + TailwindCSS
- Payment Processing: Stripe
- Authentication: JWT + Google OAuth

## Development Commands

### Initial Setup
```bash
# Copy environment template
cp .env.example .env
# Edit .env with required values: DATABASE_URL, JWT_SECRET, STRIPE keys, GOOGLE_CLIENT_ID

# Install dependencies
npm run install:api
npm run install:frontend
```

### Database Operations
```bash
# From api/ directory:
cd api

# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply migrations (development)
npm run db:migrate

# Push schema without migrations (prototyping)
npm run db:push

# Seed database with demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Running the Application
```bash
# Start API (Terminal 1) - runs on http://localhost:4000
npm run dev:api

# Start Frontend (Terminal 2) - runs on http://localhost:5173
npm run dev:frontend

# Production start
npm run start
```

### Testing Credentials (after seeding)
All demo accounts use password: `demo123`
- Customer: `customer@demo.com`
- Owner: `owner@demo.com`
- Admin: `admin@demo.com`

## Architecture

### Monorepo Structure
```
backend/
├── api/              # Express REST API
│   ├── src/
│   │   ├── routes/   # Route handlers (auth, hotels, bookings, admin, payments)
│   │   ├── middleware/ # Auth middleware (JWT, role-based)
│   │   ├── lib/      # Shared utilities (prisma, stripe, validate)
│   │   ├── data/     # Prisma client abstraction layer (store.js)
│   │   └── server.js # Main entry point
│   └── uploads/      # User-uploaded images
├── frontend/         # React SPA
│   └── src/
│       ├── pages/    # Route components (organized by role)
│       ├── components/ # Reusable UI components
│       ├── api/      # API client (axios)
│       └── auth/     # Auth context and storage
└── prisma/          # Database schema and migrations
    └── schema.prisma
```

### API Architecture

**Route Organization:**
- `/api/auth` - Registration, login (email/password + Google OAuth)
- `/api/hotels` - Hotel search, details, creation, room management, reviews
- `/api/bookings` - Booking creation, viewing, cancellation
- `/api/payments` - Stripe payment intents, confirmation, refunds, history
- `/api/admin` - User management, hotel approval workflow

**Key Patterns:**
- **Data Abstraction Layer**: `api/src/data/store.js` exports Prisma models for consistent access
- **Validation**: `api/src/lib/validate.js` provides Joi schemas and middleware
- **Auth Flow**: `requireAuth` middleware verifies JWT → `requireRole([roles])` enforces RBAC
- **Development Proxy**: In dev mode, Express proxies non-API requests to Vite dev server

### Database Schema (Prisma)

**Core Models:**
- `User` - email/password or Google auth, roles: CUSTOMER/OWNER/ADMIN
- `Hotel` - owned by users with OWNER role, status: PENDING/APPROVED/REJECTED/SUSPENDED
- `Room` - belongs to hotel, types: STANDARD/DELUXE/PREMIUM/SUITE
- `Booking` - links user+hotel+room, status: PENDING/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED
- `Payment` - Stripe integration, status: PENDING/COMPLETED/FAILED/REFUNDED
- `Review` - one per booking, 1-5 star rating
- `Wallet` - owner earnings (one per user)
- `Payout` - owner withdrawal requests

**Important Relationships:**
- Hotels cascade delete with rooms, bookings, reviews
- Bookings link to User, Hotel, Room (no cascades to preserve payment history)
- Reviews are 1:1 with completed bookings

### Frontend Architecture

**Route Structure:**
- Public: `/`, `/hotels`, `/hotels/:id`, `/login`, `/register`
- Customer: `/customer/*` - bookings, payment history
- Owner: `/owner/*` - hotels, rooms, bookings, earnings, analytics
- Admin: `/admin/*` - user management, hotel approvals

**Role-Based Access:**
- `RequireRole` component wraps protected routes
- `AuthProvider` manages JWT token and user state (localStorage persistence)
- Role mismatch redirects to home

**API Client:**
- Centralized axios instance in `frontend/src/api/client.ts`
- Automatically attaches JWT Bearer token from auth storage

## Key Workflows

### Hotel Owner Onboarding
1. Owner registers (status: `verified: false`)
2. Owner completes profile verification
3. Owner creates hotel (status: `PENDING`)
4. Admin approves/rejects hotel via `/api/admin/hotels/:id/approve`
5. Only `APPROVED` hotels appear in customer searches

### Booking and Payment Flow
1. Customer searches hotels (filtered by location, price, amenities)
2. Customer selects room and creates booking (inventory checked for date overlap)
3. Payment intent created via Stripe (`/api/payments/intent`)
4. Frontend confirms payment with Stripe Elements
5. Backend verifies payment status (`/api/payments/confirm`)
6. Booking status updated, funds added to owner's wallet

### Image Uploads
- Endpoint: `POST /api/hotels/:id/images`
- Uses `multer` middleware with disk storage
- Images saved to `api/uploads/` directory
- Served statically at `/uploads/`

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Must be strong in production
- `STRIPE_SECRET_KEY` - Stripe API key for backend
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key for frontend

**Optional:**
- `GOOGLE_CLIENT_ID` - For Google OAuth login
- `PORT` - API port (default: 4000)
- `CLIENT_ORIGIN` - CORS origin (default: http://localhost:5173)
- `NODE_ENV` - Set to `production` for deployment
- `VITE_DEV_SERVER` - Vite proxy target (dev only)

## Important Implementation Notes

### Authentication
- JWT tokens expire in 7 days
- Token payload: `{ sub: userId, role, name }`
- Fallback secret `dev_secret` used only in development if JWT_SECRET unset
- Google OAuth creates or updates user via `upsert` on email

### Payment Processing
- Stripe API version: `2024-06-20`
- Amounts stored in database as integers (dollars/rupees, not cents)
- Stripe receives `amount * 100` to convert to cents
- Payment intents support automatic payment methods

### Database Migrations
- Schema location: `prisma/schema.prisma`
- Always run `npm run db:generate` after schema changes
- Use `npm run db:migrate` for production-ready migrations
- Use `npm run db:push` for rapid prototyping (skips migration files)

### Development Server Proxy
- In development, Express proxies frontend assets to Vite
- API routes (`/api/*`), uploads (`/uploads/*`), and health checks are handled by Express
- All other routes proxied to Vite dev server for HMR support

### Health Checks
- `GET /health` - Basic liveness check
- `GET /ready` - Readiness check with database connectivity test

## Prisma Client Usage

Always import from the abstraction layer:
```javascript
const { users, hotels, rooms, bookings, payments } = require('../data/store');

// Query example
const hotel = await hotels.findUnique({ 
  where: { id }, 
  include: { rooms: true, reviews: true } 
});
```

## Common Development Patterns

### Adding a New API Endpoint
1. Define Joi schema in `api/src/lib/validate.js` if accepting body data
2. Add route handler in appropriate file in `api/src/routes/`
3. Apply `requireAuth` and `requireRole([...])` middleware for protected routes
4. Use `validate(schema)` middleware for request validation
5. Access validated data via `req.validated`, user via `req.user`

### Adding a New Database Model
1. Update `prisma/schema.prisma`
2. Run `npm run db:generate` to regenerate Prisma Client
3. Run `npm run db:migrate` to create migration
4. Export model in `api/src/data/store.js` for consistent access
5. Update seed script if needed (`api/src/seed.js`)

### File Upload Endpoints
- Use existing `multer` configuration from `api/src/routes/hotels.js`
- Set file size limits appropriately
- Store references in database as array of objects: `[{ url, filename }]`
- Verify ownership before allowing uploads

## Deployment Checklist

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (not the example value)
3. Configure managed PostgreSQL and set `DATABASE_URL`
4. Run `npm run db:migrate` on first deploy
5. Use Stripe live keys (`pk_live_...` and `sk_live_...`)
6. Configure `CLIENT_ORIGIN` to production frontend URL
7. Ensure uploads directory is persistent or migrate to cloud storage (S3, etc.)
