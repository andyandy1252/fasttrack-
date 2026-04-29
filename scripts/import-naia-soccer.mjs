import { createClient } from "@supabase/supabase-js";
import { fetchHtml } from "./lib/browserFetch.mjs";
import { normalizeSchoolName } from "./lib/normalizeSchoolName.mjs";

const NAIA_MSOC_STANDINGS =
  "https://naiastats.prestosports.com/sports/msoc/2025-26/standings";
const NAIA_WSOC_STANDINGS =
  "https://naiastats.prestosports.com/sports/wsoc/2025-26/standings";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function normConf(s) {
  const v = (s ?? "").toString().trim();
  return v.length ? v : "Independent";
}

function parseNaiaStandings(html) {
  // The standings page contains conference blocks with team links.
  // We'll extract:
  // - conference name (from heading-like text)
  // - team name and a team page link (naiastats ... /teams/<slug>)
  //
  // This is not a perfect HTML parser, but the PrestoSports markup is stable
  // and the markdown-ish conversion keeps link anchors.
  const lines = html.split(/\r?\n/);
  const teams = [];
  let currentConference = null;

  // Conference headings appear as plain text line containing "Conference"
  // and preceded by "Conference" list. We'll track when we're inside a block
  // by spotting a "Conference" header in the rendered content.
  for (const line of lines) {
    const trimmed = line.trim();

    // Heuristic: if line is a standalone conference name from the page's
    // "Conference" list section, set currentConference.
    if (
      trimmed.length > 4 &&
      trimmed.includes("Conference") &&
      !trimmed.includes("http") &&
      !trimmed.includes("|")
    ) {
      currentConference = trimmed;
    }

    const m = trimmed.match(
      /\[([^\]]+)\]\(https:\/\/naiastats\.prestosports\.com\/sports\/(msoc|wsoc)\/[0-9]{4}-[0-9]{2}\/teams\/([^)]+)\)/
    );
    if (m) {
      const school = m[1].trim();
      const url = `https://naiastats.prestosports.com/sports/${m[2]}/2025-26/teams/${m[3]}`;
      teams.push({
        school_name: school,
        school_name_normalized: normalizeSchoolName(school),
        conference: normConf(currentConference),
        soccer_url: url,
      });
    }
  }

  // de-dupe by normalized name (keep longest display name)
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
    source: "NAIA Stats (PrestoSports) standings",
    source_updated_at: new Date().toISOString(),
    notes: "Imported from NAIA Stats standings team links",
  }));

  // Upsert requires a unique constraint; we created (school_name_normalized, division).
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
    fetchHtml(NAIA_MSOC_STANDINGS),
    fetchHtml(NAIA_WSOC_STANDINGS),
  ]);

  const menTeams = parseNaiaStandings(menHtml);
  const womenTeams = parseNaiaStandings(womenHtml);

  console.log(`NAIA men teams parsed: ${menTeams.length}`);
  console.log(`NAIA women teams parsed: ${womenTeams.length}`);

  await upsertPrograms(supabase, "mens_programs", "NAIA", menTeams);
  await upsertPrograms(supabase, "womens_programs", "NAIA", womenTeams);

  console.log("NAIA import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

