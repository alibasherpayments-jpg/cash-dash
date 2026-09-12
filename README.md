# 🚀 CashDash — Production-Ready Rewards & Earn-Money Platform

A modern, fintech-grade rewards platform built with **Next.js 14 App Router**, **NestJS**, **Prisma ORM**, **PostgreSQL**, **Redis**, **BullMQ**, and **Tailwind CSS**.

Users can discover verified earning opportunities, complete mobile game achievements, apps, and market research surveys, receive virtual points credited to an immutable double-entry ledger, and cash out via configurable payment methods (PayPal, Crypto USDT/BTC/LTC, Digital Gift Cards, Bank Transfer).

Administrators have access to an **Admin Console** featuring a **Dynamic Withdrawal Method & Requirement Builder**, allowing creation and alteration of payout gateways and custom input schemas without modifying source code.

---

## 🌟 Key Architectural Features

- **Double-Entry Ledger-Based Wallet**: Balances are calculated through transaction history with credit/debit records, preventing balance corruption or client-side tampering.
- **Dynamic Payout Requirement Builder**: Define custom input fields (email, text, select dropdowns, numbers) and validation rules in the Admin Panel that instantly render on customer cashout forms.
- **Provider Abstraction Architecture**: Clean `IOfferProvider` and `IPaymentProvider` interfaces. Switch seamlessly from mock providers to real third-party postbacks and disbursement APIs.
- **BullMQ Background Task Processing**: Asynchronous worker queues for offer completion verification, ledger crediting, and real-time user notification dispatch.
- **Multi-Role RBAC & Audit Trails**: Every administrative point adjustment, withdrawal status change, or setting update generates an immutable audit record.
- **Fintech & Gaming Visual Identity**: Dark/light mode theme using custom tokens (Indigo `#6366F1`, Amber `#F59E0B`, Emerald `#10B981`) and accessible UI primitives.

---

## 🏗️ Repository Architecture (Monorepo)

```
f:\Projects\Cash Dash\
├── apps/
│   ├── web/                     # Next.js 14 App Router frontend
│   │   ├── src/app/(public)/    # Landing page, login, register, forgot/reset password, legal
│   │   ├── src/app/(auth)/      # Member dashboard, offers, wallet, withdraw, referrals, leaderboard
│   │   ├── src/app/admin/       # Admin console (overview, users, offers, withdrawals, methods, audit)
│   │   ├── src/components/      # UI primitives, common cards, and custom SVG illustrations
│   │   └── src/hooks/           # TanStack React Query hooks for real-time reactivity
│   │
│   └── api/                     # NestJS backend API
│       ├── src/auth/            # JWT authentication, refresh token rotation, HttpOnly cookies
│       ├── src/wallet/          # Ledger-backed wallet service with atomic Prisma transactions
│       ├── src/offers/          # Offer catalog & provider adapters (AdVenture, RewardHub, etc.)
│       ├── src/withdrawals/     # Payout lifecycle & dynamic requirements validator
│       ├── src/leaderboard/     # Rankings calculated exclusively from paid cashouts
│       ├── src/jobs/            # BullMQ background job queues & workers
│       ├── src/audit/           # Audit trail logging for all administrative actions
│       └── prisma/
│           ├── schema.prisma    # Full PostgreSQL relational schema (25+ entities)
│           └── seed.ts          # Realistic seed script (25+ users, 30+ offers, full history)
│
└── packages/
    └── shared/                  # Shared TypeScript interfaces, enums, formatters, and Zod types
```

---

## ⚡ Quick Start & Development Setup

### 1. Prerequisites

- **Node.js**: v18.0.0 or later
- **pnpm**: v9.0.0 or later (`npm install -g pnpm`)
- **Docker**: For local PostgreSQL and Redis containers (optional if local instances exist)

### 2. Configure Environment Variables

Create `.env` at root or copy `.env.example`:

```bash
cp .env.example .env
```

Key environment configurations:

```env
# Database & Cache
DATABASE_URL="postgresql://cashdash:cashdash_dev@localhost:5432/cashdash?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication Secrets
JWT_ACCESS_SECRET="your-super-secret-access-token-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key"
COOKIE_SECRET="your-super-secret-cookie-key"

# Ports
API_PORT=3001
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

### 3. Spin Up Local Infrastructure

Using Docker Compose:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`
- **Mailhog** SMTP on `localhost:1025` (Web UI on `http://localhost:8025`)

### 4. Install Dependencies & Generate Database Schema

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development Servers

```bash
pnpm dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Interactive Swagger Docs**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

## 🔑 Demo Seed Accounts

The platform is pre-populated with realistic users, offers, and transaction histories:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Superadmin** | `admin@cashdash.io` | `Admin@CashDash2024!` | Full Admin Console (`/admin`) + Member App |
| **Demo Member** | `user@cashdash.io` | `Password123!` | Member Dashboard (`/dashboard`) |

*(Quick autofill buttons are built directly into the `/login` page for easy testing)*

---

## 💳 How to Add a New Payout Method in Admin

You do **not** need to touch frontend or backend code to create new withdrawal options:

1. Sign in as Admin and navigate to `/admin/withdrawal-methods`.
2. Click **+ Add New Payout Method**.
3. Fill in display title, identifier slug, description, minimum points, fee %, and processing speed.
4. Under **Dynamic Required Information Fields**, click **+ Add Requirement Field**:
   - Specify `Field Key` (e.g. `venmoHandle` or `walletAddress`)
   - Specify `Display Label` (e.g. `Venmo @Username` or `Tron TRC20 Address`)
   - Select `Field Type` (`TEXT`, `EMAIL`, `NUMBER`, `SELECT`, `TEXTAREA`)
   - Set placeholder text, help text, and requirement toggle.
5. Click **Save & Enable Method**.
6. Immediately visit `/withdraw` as a regular member — the new gateway and all its custom input fields will be dynamically rendered and validated!

---

## 🔌 How to Connect a Real Offerwall Provider

1. Open `apps/api/src/offers/providers/offer-providers.ts`.
2. Implement the `IOfferProvider` interface:
   ```typescript
   export class RealBitLabsProvider implements IOfferProvider {
     slug = "bitlabs";
     name = "BitLabs Offerwall";

     async fetchOffers(userContext?: any): Promise<StandardOffer[]> {
       // Call real BitLabs REST endpoint
     }

     verifySignature(payload: any, signature: string): boolean {
       // Validate HMAC SHA-256 postback signature
     }
   }
   ```
3. Register the provider in `apps/api/src/offers/providers/provider.registry.ts`.
4. Configure the postback URL in your external provider dashboard to point to:
   `https://api.yourdomain.com/api/v1/webhooks/providers/bitlabs`
5. The built-in idempotent webhook receiver will authenticate the signature, check for duplicates, and dispatch a background reward job via BullMQ.

---

## 🧪 Running Automated Tests

```bash
# Backend unit tests (Vitest)
pnpm --filter api test

# Watch mode
pnpm --filter api test:watch
```

Test suites cover:
- `WalletService` — atomic point credit/debit and ledger transactions
- `WithdrawalsService` — state transitions, balance verification, and min requirements
- `LeaderboardService` — ranking calculation and visibility controls
- `AuthService` — conflict detection, password authentication, and session generation
- `ReferralsService` — referral commissions, anti-abuse checks, and statistics
- `FraudService` — velocity detection, suspicious reversal scoring, and risk level escalation
