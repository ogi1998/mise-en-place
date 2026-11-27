# db/ — schema snapshot of the Supabase cloud database

> **Frozen snapshot (2026-11-19), kept for a future move off Supabase.** The source of truth for the schema is now `supabase/migrations/` — every later change lives there, not here. Before moving off Supabase, regenerate this folder from the current cloud schema (see "Re-pulling from Supabase" below).

Schema-only snapshot of the Supabase cloud project (`aocpvyjykotqwkuvwrpi`, Postgres 17), taken 2026-11-19. It is the baseline for moving to local Postgres + ORM + app-managed auth.

| Path | What |
|---|---|
| `init/00-bootstrap.sql` | Hand-written local stand-ins for Supabase platform objects: `anon`/`authenticated`/`service_role` roles, `auth` schema, `auth.uid()`/`role()`/`jwt()` |
| `init/01-auth-tables.sql` | DDL of `auth.users` + `auth.identities` (FK target of `profiles.id`, `guests.auth_user_id`) |
| `init/02-schema.sql` | Full `public` schema: tables, enum, functions, trigger, indexes, RLS policies |
| `rls.sql` | Readable RLS reference: every policy per table, grants, storage policies |

## Load locally

Native Postgres (17 recommended; on 16 the `SET transaction_timeout` line errors harmlessly):

```bash
createdb mise
psql -d mise -f db/init/00-bootstrap.sql -f db/init/01-auth-tables.sql -f db/init/02-schema.sql
```

Or Docker (init scripts only run on an empty volume):

```bash
docker compose down -v && docker compose up -d --wait
# postgresql://postgres:postgres@localhost:5433/mise
```

## Re-pulling from Supabase (if ever needed)

Needs `pg_dump` 17+. Use the **Session pooler** URI from Dashboard → Connect, because the direct `db.<ref>.supabase.co` host is IPv6-only.

```bash
pg_dump -d "<session pooler URI>" --schema-only --schema=public --no-owner --no-privileges --no-comments > db/init/02-schema.sql
pg_dump -d "<session pooler URI>" --schema-only -t auth.users -t auth.identities --no-owner --no-privileges --no-comments > db/init/01-auth-tables.sql
```

Afterwards, change `CREATE SCHEMA public;` to `CREATE SCHEMA IF NOT EXISTS public;`, and delete the `\restrict` / `\unrestrict` lines.

## Not included

- **Data.** This is a schema-only snapshot; there was no production data.
- **Storage files** in the `event-covers` bucket.
- **`ensure_rls` event trigger.** A database-level trigger that turns on RLS for new `public` tables. Its function `public.rls_auto_enable` is in the schema.
- **Other `auth.*` tables** (sessions, tokens, MFA). Not needed once auth moves into the app.

## Migration notes

- `profiles.id = auth.users.id` (1:1). `guests.auth_user_id = auth.users.id`. `guests.auth_id` is a legacy duplicate.
- Supabase passwords are bcrypt (`$2a$`), so they can be checked with `bcrypt.compare`.
- RLS relies on `auth.uid()`. With an ORM, enforce `restaurant_id` scoping in the data-access layer instead, using `rls.sql` as the checklist. Do not port the `USING (true)` SELECT policies on `bookings`, `booking_tables` and `guests`: they expose all guest data.
