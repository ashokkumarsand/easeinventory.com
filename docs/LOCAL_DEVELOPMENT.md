# Local Development with Supabase

This guide explains how to run EaseInventory locally without affecting production data.

## Prerequisites

1. Docker Desktop (required for local Supabase)
2. Node.js 20+

## Quick Start

```bash
# 1. Copy the local environment template
cp .env.local.example .env.local

# 2. Start local Supabase (Docker must be running)
npm run supabase:start

# 3. Push the Prisma schema to local database
npm run db:push

# 4. Start the development server
npm run dev
```

Or use the combined command:
```bash
npm run dev:local
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run supabase:start` | Start local Supabase containers |
| `npm run supabase:stop` | Stop local Supabase containers |
| `npm run supabase:status` | Show local Supabase status and URLs |
| `npm run supabase:reset` | Reset local database (deletes all data) |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Create and apply new migrations |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run dev:local` | Start Supabase + push schema + dev server |

## Local Supabase URLs

After running `npm run supabase:start`:

- **API URL**: http://127.0.0.1:54321
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL**: http://127.0.0.1:54323 (GUI for database)
- **Inbucket**: http://127.0.0.1:54324 (Email testing)

## Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env` | Production secrets (Vercel) | No |
| `.env.local` | Local overrides | No |
| `.env.example` | Template for production | Yes |
| `.env.local.example` | Template for local dev | Yes |

### How Environment Override Works

Next.js loads environment files in this order:
1. `.env` (base values)
2. `.env.local` (overrides for local development)

So your local `.env.local` will override the production DATABASE_URL with the local Supabase URL.

## Seeding Local Database

To add test data to your local database:

```bash
# Seed demo data (if configured)
npm run db:seed

# Or use Prisma Studio to add data manually
npm run db:studio
```

## Production Safety

- Local Supabase runs completely isolated from production
- `.env.local` is gitignored and never deployed to Vercel
- Vercel uses your `.env` values from the Vercel dashboard
- Database migrations should be tested locally before deploying

## Troubleshooting

### Docker not running
```
Error: Cannot connect to Docker
```
Solution: Start Docker Desktop

### Port already in use
```bash
# Stop any existing Supabase containers
npm run supabase:stop

# Or kill processes using the ports
lsof -ti:54321 | xargs kill -9
```

### Database schema out of sync
```bash
# Reset local database and re-push schema
npm run supabase:reset
npm run db:push
```
