import { createClient } from "@supabase/supabase-js";

const WIKI_D1_MEN_RAW =
  "https://en.wikipedia.org/w/index.php?title=List_of_NCAA_Division_I_men%27s_soccer_programs&action=raw";
const WIKI_D1_WOMEN_RAW =
  "https://en.wikipedia.org/w/index.php?title=List_of_NCAA_Division_I_women%27s_soccer_programs&action=raw";

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

function normalizeStateOrProvince(v) {
  const s = (v || "").trim();
  if (!s) return "";
  return US_STATE_ABBR[s] || s;
}

function stripWikiMarkup(s) {
  if (!s) return "";
  let out = String(s).trim();

  out = out.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "");
  out = out.replace(/<ref[^\/]*\/>/g, "");
  out = out.replace(/\{\{efn\|[\s\S]*?\}\}/g, "");

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

  // remove parenthetical abbreviations like "(Albany)" etc.
  out = out.replace(/\s*\([^)]*\)\s*/g, " ");

  return out.replace(/\s+/g, " ").trim();
}

function parseWikitableRows(wikitext) {
  const lines = wikitext.split(/\r?\n/);
  const tables = [];

  let inWikitable = false;
  let rows = [];
  let current = [];

  const flushRow = () => {
    if (current.length) {
      rows.push(current);
      current = [];
    }
  };

  const flushTable = () => {
    flushRow();
    if (rows.length) tables.push(rows);
    rows = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("{|") && line.includes("wikitable")) {
      inWikitable = true;
      continue;
    }
    if (inWikitable && line.startsWith("|}")) {
      inWikitable = false;
      flushTable();
      continue;
    }
    if (!inWikitable) continue;

    if (line.startsWith("|-")) {
      flushRow();
      continue;
    }

    if (line.startsWith("!")) continue;

    if (line.startsWith("|")) {
      const cell = line.replace(/^\|\s?/, "");
      current.push(cell);
    }
  }
  flushTable();
  return tables;
}

function parseD1Programs(wikitext, gender) {
  const tables = parseWikitableRows(wikitext);

  // Find the "Current Division I schools" table by looking for a row that contains a "Conference" cell.
  // We'll then parse each row and map columns by gender-specific layout.
  const table = tables.find((t) =>
    t.some((row) => row.some((c) => String(c).includes("Conference")))
  );
  if (!table) return [];

  const programs = [];

  for (const row of table) {
    // Men table columns: Institution, Nickname, Location, State, Type, Conference
    // Women table columns: Institution, Location, State, Type, Nickname, Conference
    const minCols = 6;
    if (row.length < minCols) continue;

    let institutionCell;
    let stateCell;
    let confCell;

    if (gender === "men") {
      institutionCell = row[0];
      stateCell = row[3];
      confCell = row[5];
    } else {
      institutionCell = row[0];
      stateCell = row[2];
      confCell = row[5];
    }

    const school = stripWikiMarkup(institutionCell);
    const state = normalizeStateOrProvince(stripWikiMarkup(stateCell));
    const conference = stripWikiMarkup(confCell);

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
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

async function fetchD1SoccerSchools() {
  const [menRaw, womenRaw] = await Promise.all([
    fetchText(WIKI_D1_MEN_RAW),
    fetchText(WIKI_D1_WOMEN_RAW),
  ]);
  const menPrograms = parseD1Programs(menRaw, "men");
  const womenPrograms = parseD1Programs(womenRaw, "women");

  const merged = new Map();
  for (const p of menPrograms) {
    merged.set(p.school, {
      school_name: p.school,
      division: "D1",
      conference: p.conference || "",
      state: p.state || "",
      athletics_url: "",
      mens_soccer_url: "__HAS_MENS_SOCCER__",
      womens_soccer_url: null,
      notes: "Wikipedia D1 men's soccer programs",
      _hasMen: true,
      _hasWomen: false,
    });
  }
  for (const p of womenPrograms) {
    const ex = merged.get(p.school);
    if (ex) {
      ex._hasWomen = true;
      ex.womens_soccer_url = "__HAS_WOMENS_SOCCER__";
      if (!ex.conference && p.conference) ex.conference = p.conference;
      if (!ex.state && p.state) ex.state = p.state;
      ex.notes = "Wikipedia D1 men's & women's soccer programs";
    } else {
      merged.set(p.school, {
        school_name: p.school,
        division: "D1",
        conference: p.conference || "",
        state: p.state || "",
        athletics_url: "",
        mens_soccer_url: null,
        womens_soccer_url: "__HAS_WOMENS_SOCCER__",
        notes: "Wikipedia D1 women's soccer programs",
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

async function fetchExistingSchools(supabase) {
  const existing = new Map();
  let from = 0;
  const pageSize = 1000;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,school_name,division,conference,state,athletics_url,mens_soccer_url,womens_soccer_url,notes"
      )
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row?.school_name) existing.set(row.school_name, row);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return existing;
}

function coalescePreferNonEmpty(a, b) {
  if (a && String(a).trim() !== "") return a;
  if (b && String(b).trim() !== "") return b;
  return a || b || "";
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

async function updateInBatches(supabase, rows, batchSize = 200) {
  let updated = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    // update row-by-row to avoid requiring a unique constraint for upsert
    for (const r of chunk) {
      const { school_name, ...patch } = r;
      const { error } = await supabase
        .from("schools")
        .update(patch)
        .eq("school_name", school_name);
      if (error) throw error;
      updated += 1;
    }
    console.log(`Updated ${updated}/${rows.length}...`);
  }
}

async function main() {
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("Fetching D1 soccer programs (Wikipedia)...");
  const { menCount, womenCount, schools } = await fetchD1SoccerSchools();
  console.log(`Men programs parsed: ${menCount}`);
  console.log(`Women programs parsed: ${womenCount}`);
  console.log(`Unique schools in merged set: ${schools.length}`);

  console.log("Reading existing schools from Supabase...");
  const existing = await fetchExistingSchools(supabase);
  console.log(`Existing schools in DB: ${existing.size}`);

  const toInsert = [];
  const toUpdate = [];

  for (const row of schools) {
    const ex = existing.get(row.school_name);
    if (!ex) {
      // Insert as-is (ensure nulls instead of placeholders)
      toInsert.push({
        ...row,
        mens_soccer_url:
          row.mens_soccer_url === "__HAS_MENS_SOCCER__"
            ? row.athletics_url || "__HAS_MENS_SOCCER__"
            : row.mens_soccer_url,
        womens_soccer_url:
          row.womens_soccer_url === "__HAS_WOMENS_SOCCER__"
            ? row.athletics_url || "__HAS_WOMENS_SOCCER__"
            : row.womens_soccer_url,
      });
      continue;
    }

    // Only patch fields we can improve; never blank out existing data.
    const patch = {
      school_name: row.school_name,
      division: ex.division || row.division,
      conference: coalescePreferNonEmpty(ex.conference, row.conference),
      state: coalescePreferNonEmpty(ex.state, row.state),
      athletics_url: coalescePreferNonEmpty(ex.athletics_url, row.athletics_url),
      notes: coalescePreferNonEmpty(ex.notes, row.notes),
      mens_soccer_url: ex.mens_soccer_url,
      womens_soccer_url: ex.womens_soccer_url,
    };

    const hasMen = row.mens_soccer_url === "__HAS_MENS_SOCCER__";
    const hasWomen = row.womens_soccer_url === "__HAS_WOMENS_SOCCER__";

    if (hasMen && (!patch.mens_soccer_url || patch.mens_soccer_url === "")) {
      patch.mens_soccer_url = patch.athletics_url || "__HAS_MENS_SOCCER__";
    }
    if (
      hasWomen &&
      (!patch.womens_soccer_url || patch.womens_soccer_url === "")
    ) {
      patch.womens_soccer_url = patch.athletics_url || "__HAS_WOMENS_SOCCER__";
    }

    const changed =
      patch.conference !== ex.conference ||
      patch.state !== ex.state ||
      patch.athletics_url !== ex.athletics_url ||
      patch.notes !== ex.notes ||
      patch.mens_soccer_url !== ex.mens_soccer_url ||
      patch.womens_soccer_url !== ex.womens_soccer_url;

    if (changed) {
      const { school_name, ...rest } = patch;
      toUpdate.push({ school_name, ...rest });
    }
  }

  console.log(`New schools to insert: ${toInsert.length}`);
  console.log(`Existing schools to update: ${toUpdate.length}`);

  if (toInsert.length) {
    console.log("Inserting new rows...");
    await insertInBatches(supabase, toInsert, 500);
  }
  if (toUpdate.length) {
    console.log("Updating existing rows...");
    await updateInBatches(supabase, toUpdate, 200);
  }

  const { count: menTotal, error: menErr } = await supabase
    .from("schools")
    .select("id", { count: "exact", head: true })
    .eq("division", "D1")
    .not("mens_soccer_url", "is", null)
    .neq("mens_soccer_url", "");
  if (menErr) throw menErr;
  const { count: womenTotal, error: womenErr } = await supabase
    .from("schools")
    .select("id", { count: "exact", head: true })
    .eq("division", "D1")
    .not("womens_soccer_url", "is", null)
    .neq("womens_soccer_url", "");
  if (womenErr) throw womenErr;

  console.log("D1 counts in Supabase after import:");
  console.log(JSON.stringify({ mens: menTotal, womens: womenTotal }, null, 2));
  console.log("Import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

