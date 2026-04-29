## D2 soccer schools import (Supabase)

This repo has a one-time import script that loads **NCAA Division II men’s + women’s soccer programs** from Wikipedia and inserts missing schools into the Supabase `schools` table.

## D1 soccer schools import (Supabase)

This repo also includes a script that imports **NCAA Division I men’s + women’s soccer programs** from Wikipedia and:
- Inserts any missing schools into `schools`
- Updates existing `schools` rows to mark whether the school has **men’s soccer** and/or **women’s soccer**

Because your current table schema does not have boolean flags, the script marks existence using:
- `mens_soccer_url` (set to `athletics_url` when available, otherwise a non-empty placeholder)
- `womens_soccer_url` (same idea)

### 1) Add credentials to `.env.local`

Create or update `.env.local` in the project root:

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

Notes:
- `.env.local` is already gitignored.
- The service role key bypasses RLS; keep it private.

### 2) Run the import

```bash
npm install
node --env-file=.env.local scripts/import-d2-soccer-schools.mjs
node --env-file=.env.local scripts/import-d1-soccer-schools.mjs
node --env-file=.env.local scripts/import-d3-soccer-schools.mjs
```

The script:
- Parses Wikipedia’s D2 **men’s** and **women’s** soccer program tables
- Merges into a unique school list
- Inserts into `schools` with columns:
  - `school_name`, `division`, `conference`, `state`, `athletics_url`, `mens_soccer_url`, `womens_soccer_url`, `notes`
- Skips duplicates by checking existing `school_name` values first

