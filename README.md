# PulseFit Requests

Employee Request Management System PoC for a fitness organization.

Employees submit internal requests (leave, IT, payroll, operations). The system auto-categorizes, assigns an agent, tracks SLA, and supports Open → Active → Finalized.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + Neon (PostgreSQL)
- Demo Employee / Employer roles (cookie session, no real auth)

## Features

- Request intake form with unique `EMP-xxxxx` IDs
- Keyword-based department categorization
- Least-loaded agent assignment
- SLA tracking and escalation flags
- Employee portal + Employer dashboard
- Search and status workflow for employers

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and add your Neon connection string:

```bash
cp .env.example .env
```

3. Apply database schema and seed agents:

```bash
npx prisma migrate deploy
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Employee** or **Employer**.

### Demo accounts

| Role | Name | Email |
|------|------|-------|
| Employee | Demo Employee | employee@company.com |
| Employer | Employer Admin | employer@company.com |

## Production deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Set environment variable:

```text
DATABASE_URL=your_neon_pooled_connection_string
```

4. Deploy. On first deploy, run migrations against Neon:

```bash
npx prisma migrate deploy
npm run db:seed
```

## Deliverables

- Workflow diagram / Part 1 PDF: `docs/`
- Working prototype: this app
- Solution summary: write separately (max 2 pages)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run db:seed` | Seed demo agents |
| `npm run docs:workflow-pdf` | Regenerate Part 1 PDF |

## Security notes

- Never commit `.env`.
- Rotate the Neon password if it was ever shared in chat or screenshots.
- Demo roles are for assessment only; production should use real SSO/RBAC.
