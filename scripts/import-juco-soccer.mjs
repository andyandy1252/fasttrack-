import { createClient } from "@supabase/supabase-js";
import { fetchHtml } from "./lib/browserFetch.mjs";
import { normalizeSchoolName } from "./lib/normalizeSchoolName.mjs";

const NJCAA_MSOC_TEAMS = "https://njcaastats.prestosports.com/sports/msoc/teams-page";
const NJCAA_WSOC_TEAMS = "https://njcaastats.prestosports.com/sports/wsoc/teams-page";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function normConf(s) {
  const v = (s ?? "").toString().trim();
  return v.length ? v : "Independent";
}

function parseNjcaaTeamsPage(html) {
  // The teams page includes a table per division with lines like:
  // | [School School](https://njcaastats.prestosports.com/sports/msoc/2025-26/div1/teams/slug?view=profile...) | 14 |
  //
  // Above tables, the page sometimes lists the region and conference name; but not consistently for all.
  // We'll treat "conference" as "Region <n>" when we can, otherwise Independent.
  const lines = html.split(/\r?\n/);
  const teams = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const m = trimmed.match(
      /\[([^\]]+?)\s+\1\]\((https:\/\/njcaastats\.prestosports\.com\/sports\/(msoc|wsoc)\/[0-9]{4}-[0-9]{2}\/div[0-9]\/teams\/[^)]+)\)\s*\|\s*([0-9]{1,2})\s*\|/
    );
    if (m) {
      const school = m[1].trim();
      const soccer_url = m[2];
      const region = m[4];
      teams.push({
        school_name: school,
        school_name_normalized: normalizeSchoolName(school),
        conference: normConf(`Region ${region}`),
        soccer_url,
      });
    }
  }

  // de-dupe by normalized name (keep longest)
  const byNorm = new Map();
  for (const t of teams) {
    if (!t.school_name_normalized) continue;
    const ex = byNorm.get(t.school_name_normalized);
    if (!ex || t.school_name.length > ex.school_name.length) byNorm.set(t.school_name_normalized, t);
  }
  return [...byNorm.values()];
}

async function upsertPrograms(supabase, table, division, teams) {
  const rows = teams.map((t) => ({
    school_name: t.school_name,
    school_name_normalized: t.school_name_normalized,
    division,
    conference: t.conference,
    state: null,
    athletics_url: null,
    soccer_url: t.soccer_url,
    source: "NJCAA Stats (PrestoSports) teams-page",
    source_updated_at: new Date().toISOString(),
    notes: "Imported from NJCAA Stats teams-page",
  }));

  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: "school_name_normalized,division" });
  if (error) throw error;
}

async function main() {
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [menHtml, womenHtml] = await Promise.all([
    fetchHtml(NJCAA_MSOC_TEAMS),
    fetchHtml(NJCAA_WSOC_TEAMS),
  ]);

  const menTeams = parseNjcaaTeamsPage(menHtml);
  const womenTeams = parseNjcaaTeamsPage(womenHtml);

  console.log(`NJCAA men teams parsed: ${menTeams.length}`);
  console.log(`NJCAA women teams parsed: ${womenTeams.length}`);

  await upsertPrograms(supabase, "mens_programs", "JUCO", menTeams);
  await upsertPrograms(supabase, "womens_programs", "JUCO", womenTeams);

  console.log("JUCO import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

