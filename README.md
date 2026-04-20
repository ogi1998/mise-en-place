# Mise en Place

Restaurant Booking & Management SaaS Platform

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Forms:** React Hook Form + Zod
- **State:** Zustand
- **Email:** SendGrid
- **SMS:** Twilio

## Architecture

- Multi-tenant SaaS — each restaurant gets its own subdomain (e.g. `restaurantname.miseenplace.si`)
- Two user types: Restaurant Managers and Guests (separate auth flows)
- Row Level Security enforced at the database level

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
4. Run the development server: `npm run dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## Project Structure

```
src/
├── app/              # Next.js App Router (auth, manager panel, widget)
├── components/       # UI, manager, and widget components
├── services/         # External integrations (Supabase, Twilio, SendGrid)
├── hooks/            # Custom React hooks
├── schemas/          # Zod validation schemas
├── types/            # TypeScript types
├── store/            # Zustand stores
├── lib/              # Supabase clients and utilities
├── helpers/          # Pure utility functions
└── constants/        # App-wide constants
```