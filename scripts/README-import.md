## Soccer program imports (Supabase)

Imports fill **`mens_programs`** and **`womens_programs`** (and legacy **`schools`** for NCAA scripts). Use **`.env.local`** with:

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

Run from the project root:

```bash
npm install
node --env-file=.env.local scripts/import-d1-soccer-schools.mjs
node --env-file=.env.local scripts/import-d2-soccer-schools.mjs
node --env-file=.env.local scripts/import-d3-soccer-schools.mjs
node --env-file=.env.local scripts/import-naia-soccer.mjs
node --env-file=.env.local scripts/import-juco-soccer.mjs
```

### Dedupe (keep longer formal names)

After imports, merge duplicate rows that share the same normalized name + division (e.g. short vs long school name):

```bash
node --env-file=.env.local scripts/dedupe-programs.mjs
node --env-file=.env.local scripts/dedupe-programs.mjs --apply
```

Reports are written to `scripts/_duplicates_mens_programs.json` and `scripts/_duplicates_womens_programs.json` (gitignored).

### Verify counts

```bash
node --env-file=.env.local scripts/verify-programs.mjs
```

Compares NCAA D1/D2/D3 to the official NCAA Directory API. NAIA/NJCAA pages may return **403** from some networks (Cloudflare); if so, official NAIA/JUCO counts show as `null` but your DB counts still print — **re-run NAIA/JUCO imports on a normal home/office PC** if needed.

### Sources

- **NCAA D1/D2/D3:** NCAA Directory API (`web3.ncaa.org`)
- **NAIA:** NAIA Stats (PrestoSports)
- **JUCO:** NJCAA Stats (PrestoSports)
