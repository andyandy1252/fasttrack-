import { createClient } from "@supabase/supabase-js";
import { fetchHtml } from "./lib/browserFetch.mjs";

const NCAA = {
  D1: {
    men: "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=I&sportCode=MSO",
    women: "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=I&sportCode=WSO",
  },
  D2: {
    men: "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=II&sportCode=MSO",
    women: "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=II&sportCode=WSO",
  },
  D3: {
    men: "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=III&sportCode=MSO",
    women: "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=III&sportCode=WSO",
  },
};

const NAIA = {
  men: "https://naiastats.prestosports.com/sports/msoc/2025-26/standings",
  women: "https://naiastats.prestosports.com/sports/wsoc/2025-26/standings",
};

const NJCAA = {
  men: "https://njcaastats.prestosports.com/sports/msoc/teams-page",
  women: "https://njcaastats.prestosports.com/sports/wsoc/teams-page",
};

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.json();
}

async function fetchHtmlMaybe(url) {
  try {
    return await fetchHtml(url);
  } catch (e) {
    console.warn(`Skipping official scrape for ${url}: ${e?.message || e}`);
    return null;
  }
}

function countNaiaTeamsFromStandings(html) {
  // counts unique team links on the standings page
  const re = /\]\(https:\/\/naiastats\.prestosports\.com\/sports\/(msoc|wsoc)\/[0-9]{4}-[0-9]{2}\/teams\/[^)]+\)/g;
  const m = html.match(re) || [];
  return new Set(m).size;
}

function countNjcaaTeamsFromTeamsPage(html) {
  const re = /\]\(https:\/\/njcaastats\.prestosports\.com\/sports\/(msoc|wsoc)\/[0-9]{4}-[0-9]{2}\/div[0-9]\/teams\/[^)]+\)/g;
  const m = html.match(re) || [];
  return new Set(m).size;
}

async function dbCount(supabase, table, division) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { head: true, count: "exact" })
    .eq("division", division);
  if (error) throw error;
  return count ?? 0;
}

async function main() {
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const official = { mens: {}, womens: {} };

  for (const div of ["D1", "D2", "D3"]) {
    const [men, women] = await Promise.all([
      fetchJson(NCAA[div].men),
      fetchJson(NCAA[div].women),
    ]);
    official.mens[div] = Array.isArray(men) ? men.length : 0;
    official.womens[div] = Array.isArray(women) ? women.length : 0;
  }

  const [naiaMenHtml, naiaWomenHtml, njcaaMenHtml, njcaaWomenHtml] =
    await Promise.all([
      fetchHtmlMaybe(NAIA.men),
      fetchHtmlMaybe(NAIA.women),
      fetchHtmlMaybe(NJCAA.men),
      fetchHtmlMaybe(NJCAA.women),
    ]);

  official.mens.NAIA = naiaMenHtml
    ? countNaiaTeamsFromStandings(naiaMenHtml)
    : null;
  official.womens.NAIA = naiaWomenHtml
    ? countNaiaTeamsFromStandings(naiaWomenHtml)
    : null;
  official.mens.JUCO = njcaaMenHtml
    ? countNjcaaTeamsFromTeamsPage(njcaaMenHtml)
    : null;
  official.womens.JUCO = njcaaWomenHtml
    ? countNjcaaTeamsFromTeamsPage(njcaaWomenHtml)
    : null;

  const db = { mens: {}, womens: {} };
  for (const div of ["D1", "D2", "D3", "NAIA", "JUCO"]) {
    db.mens[div] = await dbCount(supabase, "mens_programs", div);
    db.womens[div] = await dbCount(supabase, "womens_programs", div);
  }

  console.log(
    JSON.stringify(
      { official_counts: official, supabase_counts: db },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("Verify failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

