# LeadGen MVP

A minimal SaaS MVP for lead delivery. Built with Next.js App Router, TypeScript, Auth.js (NextAuth), Prisma (PostgreSQL), and Tailwind CSS.

## Folder Structure

- `app/`: App Router pages
  - `page.tsx`: Public landing page
  - `login/`, `signup/`: Auth pages
  - `dashboard/`: Protected area showing user and mock leads
  - `api/`: Auth and signup endpoints
- `lib/`: Server-side helpers (auth, db, leads)
- `prisma/`: Prisma schema (no migrations run yet)
- `middleware.ts`: Protects `/dashboard`

## Environment

Copy `.env.example` to `.env` and fill in values.

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-strong-random-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DATABASE_URL=postgresql://user:password@localhost:5432/leadgen
```

## Setup

Install deps and generate Prisma client:

```bash
npm install
npx prisma generate
```

(Optional) Push schema to a local Postgres:

```bash
npx prisma db push
```

## Run

```bash
npm run dev
```
Open `http://localhost:3000`.

- Create account via credentials at `/signup`
- Login via credentials or Google at `/login`
- Visit `/dashboard` (protected)

## Notes

- Sessions use JWT for simplicity
- Prisma Adapter connects Auth.js to PostgreSQL
- Leads are mocked via `lib/leads.ts`
- Keep code minimal, with comments where decisions matter
