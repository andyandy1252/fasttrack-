import { createClient } from "@supabase/supabase-js";

const WIKI_MEN_RAW =
  "https://en.wikipedia.org/w/index.php?title=List_of_NCAA_Division_II_men%27s_soccer_programs&action=raw";
const WIKI_WOMEN_RAW =
  "https://en.wikipedia.org/w/index.php?title=List_of_NCAA_Division_II_women%27s_soccer_programs&action=raw";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const US_STATE_ABBR = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "Puerto Rico": "PR",
};

const CA_PROV_ABBR = {
  Alberta: "AB",
  "British Columbia": "BC",
  Manitoba: "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Nova Scotia": "NS",
  Ontario: "ON",
  "Prince Edward Island": "PE",
  Quebec: "QC",
  Saskatchewan: "SK",
  "Northwest Territories": "NT",
  Nunavut: "NU",
  Yukon: "YT",
};

function normalizeStateOrProvince(v) {
  const s = (v || "").trim();
  if (!s) return "";
  return US_STATE_ABBR[s] || CA_PROV_ABBR[s] || s;
}

function stripWikiMarkup(s) {
  if (!s) return "";
  let out = String(s).trim();

  // Remove refs
  out = out.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "");
  out = out.replace(/<ref[^\/]*\/>/g, "");

  // {{sort|...|...}} -> last param
  out = out.replace(/\{\{sort\|[^|]+\|([\s\S]+?)\}\}/g, "$1");

  // [[Target|Display]] or [[Target]]
  out = out.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  out = out.replace(/\[\[([^\]]+)\]\]/g, "$1");

  // ''italics/bold''
  out = out.replace(/''+/g, "");

  // HTML entities and leftover tags
  out = out.replace(/&amp;/g, "&");
  out = out.replace(/<br\s*\/?>/gi, " ");
  out = out.replace(/<[^>]+>/g, "");

  return out.trim();
}

function parseWikiProgramsTable(wikitext) {
  // The page includes multiple tables; we want the main "NCAA Division II ... soccer programs" table.
  // We'll parse all wikitable rows with the expected column order.
  const lines = wikitext.split(/\r?\n/);
  const rows = [];

  let inWikitable = false;
  let currentCells = [];

  const flushRow = () => {
    if (currentCells.length) {
      rows.push(currentCells);
      currentCells = [];
    }
  };

  for (const lineRaw of lines) {
    const line = lineRaw.trimEnd();

    if (line.startsWith("{|") && line.includes("wikitable")) {
      inWikitable = true;
      continue;
    }
    if (inWikitable && line.startsWith("|}")) {
      flushRow();
      inWikitable = false;
      continue;
    }
    if (!inWikitable) continue;

    if (line.startsWith("|-")) {
      flushRow();
      continue;
    }

    // Header cells start with "!".
    if (line.startsWith("!")) continue;

    // Data cells start with "|"
    if (line.startsWith("|")) {
      const cell = line.replace(/^\|\s?/, "");
      currentCells.push(cell);
    }
  }

  // Expected columns:
  // 0 School, 1 Nickname, 2 City, 3 State/Province, 4 Conference, 5 Note
  const programs = [];
  for (const cells of rows) {
    if (cells.length < 5) continue;
    const schoolRaw = cells[0];
    const stateRaw = cells[3];
    const confRaw = cells[4];

    const school = stripWikiMarkup(schoolRaw);
    const state = normalizeStateOrProvince(stripWikiMarkup(stateRaw));
    const conference = stripWikiMarkup(confRaw);

    if (!school) continue;
    programs.push({ school, state, conference });
  }

  // De-dupe by school
  const bySchool = new Map();
  for (const p of programs) {
    if (!bySchool.has(p.school)) bySchool.set(p.school, p);
  }
  return [...bySchool.values()];
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "fast-track-recruitment-import/1.0 (contact: local script)",
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`);
  }
  return await res.text();
}

async function fetchD2SoccerSchools() {
  const [menRaw, womenRaw] = await Promise.all([
    fetchText(WIKI_MEN_RAW),
    fetchText(WIKI_WOMEN_RAW),
  ]);

  const menPrograms = parseWikiProgramsTable(menRaw);
  const womenPrograms = parseWikiProgramsTable(womenRaw);

  const merged = new Map();
  for (const p of menPrograms) {
    merged.set(p.school, {
      school_name: p.school,
      division: "D2",
      conference: p.conference || "",
      state: p.state || "",
      athletics_url: "",
      mens_soccer_url: "",
      womens_soccer_url: "",
      notes: "Wikipedia D2 soccer programs (men)",
      _hasMen: true,
      _hasWomen: false,
    });
  }
  for (const p of womenPrograms) {
    const existing = merged.get(p.school);
    if (existing) {
      existing._hasWomen = true;
      // Prefer non-empty fields if missing
      if (!existing.conference && p.conference) existing.conference = p.conference;
      if (!existing.state && p.state) existing.state = p.state;
      existing.notes = "Wikipedia D2 soccer programs (men & women)";
    } else {
      merged.set(p.school, {
        school_name: p.school,
        division: "D2",
        conference: p.conference || "",
        state: p.state || "",
        athletics_url: "",
        mens_soccer_url: "",
        womens_soccer_url: "",
        notes: "Wikipedia D2 soccer programs (women)",
        _hasMen: false,
        _hasWomen: true,
      });
    }
  }

  return {
    menCount: menPrograms.length,
    womenCount: womenPrograms.length,
    schools: [...merged.values()].map(({ _hasMen, _hasWomen, ...row }) => row),
  };
}

async function fetchExistingSchoolNames(supabase) {
  const existing = new Set();
  let from = 0;
  const pageSize = 1000;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("schools")
      .select("school_name")
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row?.school_name) existing.add(row.school_name);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return existing;
}

async function insertInBatches(supabase, rows, batchSize = 500) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("schools").insert(chunk);
    if (error) throw error;
    inserted += chunk.length;
    console.log(`Inserted ${inserted}/${rows.length}...`);
  }
}

async function main() {
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("Fetching D2 soccer programs (Wikipedia)...");
  const { menCount, womenCount, schools } = await fetchD2SoccerSchools();
  console.log(`Men programs parsed: ${menCount}`);
  console.log(`Women programs parsed: ${womenCount}`);
  console.log(`Unique schools to consider: ${schools.length}`);

  console.log("Reading existing schools from Supabase...");
  const existing = await fetchExistingSchoolNames(supabase);
  console.log(`Existing schools in DB: ${existing.size}`);

  const toInsert = schools.filter((s) => !existing.has(s.school_name));
  console.log(`New schools to insert (skip duplicates): ${toInsert.length}`);

  if (toInsert.length === 0) {
    console.log("Nothing to insert. Done.");
    return;
  }

  console.log("Inserting...");
  await insertInBatches(supabase, toInsert, 500);
  console.log("Import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

