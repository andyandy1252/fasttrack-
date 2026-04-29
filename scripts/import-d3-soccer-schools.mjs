import { createClient } from "@supabase/supabase-js";

const NCAA_D3_MEN =
  "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=III&sportCode=MSO";
const NCAA_D3_WOMEN =
  "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=III&sportCode=WSO";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function toStateAbbr(v) {
  if (!v) return "";
  const s = String(v).trim();
  if (s.length === 2) return s.toUpperCase();
  // NCAA API already returns abbreviations for US states; keep as-is otherwise.
  return s;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "fast-track-recruitment-import/1.0 (contact: local script)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected response (not array) for ${url}`);
  }
  return data;
}

function normalizeConferenceName(v) {
  const s = (v || "").trim();
  return s || "Independent";
}

function normalizeSchoolName(v) {
  return (v || "").trim();
}

async function fetchD3SoccerSchools() {
  const [men, women] = await Promise.all([
    fetchJson(NCAA_D3_MEN),
    fetchJson(NCAA_D3_WOMEN),
  ]);

  const menSet = new Set();
  const womenSet = new Set();

  const merged = new Map();

  for (const row of men) {
    const school = normalizeSchoolName(row?.nameOfficial);
    if (!school) continue;
    menSet.add(school);
    const state = toStateAbbr(row?.memberOrgAddress?.state);
    const conference = normalizeConferenceName(row?.conferenceName);
    merged.set(school, {
      school_name: school,
      division: "D3",
      mens_division: "D3",
      womens_division: null,
      conference,
      state,
      athletics_url: row?.athleticWebUrl || "",
      mens_soccer_url: row?.athleticWebUrl || "__HAS_MENS_SOCCER__",
      womens_soccer_url: null,
      notes: "NCAA Directory DIII men's soccer institutions",
      _hasMen: true,
      _hasWomen: false,
    });
  }

  for (const row of women) {
    const school = normalizeSchoolName(row?.nameOfficial);
    if (!school) continue;
    womenSet.add(school);
    const state = toStateAbbr(row?.memberOrgAddress?.state);
    const conference = normalizeConferenceName(row?.conferenceName);
    const athleticWebUrl = row?.athleticWebUrl || "";

    const ex = merged.get(school);
    if (ex) {
      ex._hasWomen = true;
      ex.womens_soccer_url = athleticWebUrl || "__HAS_WOMENS_SOCCER__";
      ex.womens_division = "D3";
      // Prefer non-empty
      if (!ex.athletics_url && athleticWebUrl) ex.athletics_url = athleticWebUrl;
      if ((!ex.conference || ex.conference === "Independent") && conference)
        ex.conference = conference;
      if (!ex.state && state) ex.state = state;
      ex.notes = "NCAA Directory DIII men's & women's soccer institutions";
    } else {
      merged.set(school, {
        school_name: school,
        division: "D3",
        mens_division: null,
        womens_division: "D3",
        conference,
        state,
        athletics_url: athleticWebUrl,
        mens_soccer_url: null,
        womens_soccer_url: athleticWebUrl || "__HAS_WOMENS_SOCCER__",
        notes: "NCAA Directory DIII women's soccer institutions",
        _hasMen: false,
        _hasWomen: true,
      });
    }
  }

  return {
    menCount: men.length,
    womenCount: women.length,
    menSet,
    womenSet,
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
        "id,school_name,division,mens_division,womens_division,conference,state,athletics_url,mens_soccer_url,womens_soccer_url,notes"
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

  console.log("Fetching D3 soccer institutions (NCAA Directory)...");
  const { menCount, womenCount, schools } = await fetchD3SoccerSchools();
  console.log(`Men institutions returned: ${menCount}`);
  console.log(`Women institutions returned: ${womenCount}`);
  console.log(`Unique schools in merged set: ${schools.length}`);

  console.log("Reading existing schools from Supabase...");
  const existing = await fetchExistingSchools(supabase);
  console.log(`Existing schools in DB: ${existing.size}`);

  const toInsert = [];
  const toUpdate = [];

  for (const row of schools) {
    const ex = existing.get(row.school_name);
    if (!ex) {
      toInsert.push(row);
      continue;
    }

    const patch = {
      school_name: row.school_name,
      division: ex.division || row.division,
      mens_division: row.mens_division ?? ex.mens_division,
      womens_division: row.womens_division ?? ex.womens_division,
      conference: coalescePreferNonEmpty(ex.conference, row.conference),
      state: coalescePreferNonEmpty(ex.state, row.state),
      athletics_url: coalescePreferNonEmpty(ex.athletics_url, row.athletics_url),
      notes: coalescePreferNonEmpty(ex.notes, row.notes),
      mens_soccer_url: ex.mens_soccer_url,
      womens_soccer_url: ex.womens_soccer_url,
    };

    const hasMen = row.mens_soccer_url && row.mens_soccer_url !== "";
    const hasWomen = row.womens_soccer_url && row.womens_soccer_url !== "";

    if (hasMen && (!patch.mens_soccer_url || patch.mens_soccer_url === "")) {
      patch.mens_soccer_url = row.mens_soccer_url;
    }
    if (
      hasWomen &&
      (!patch.womens_soccer_url || patch.womens_soccer_url === "")
    ) {
      patch.womens_soccer_url = row.womens_soccer_url;
    }

    const changed =
      patch.mens_division !== ex.mens_division ||
      patch.womens_division !== ex.womens_division ||
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

  const [{ count: menTotal, error: menErr }, { count: womenTotal, error: womenErr }] =
    await Promise.all([
      supabase
        .from("schools")
        .select("id", { count: "exact", head: true })
        .eq("mens_division", "D3"),
      supabase
        .from("schools")
        .select("id", { count: "exact", head: true })
        .eq("womens_division", "D3"),
    ]);
  if (menErr) throw menErr;
  if (womenErr) throw womenErr;
  console.log("D3 counts in Supabase after import:");
  console.log(JSON.stringify({ mens: menTotal, womens: womenTotal }, null, 2));
  console.log("Import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

