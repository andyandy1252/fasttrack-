import { createClient } from "@supabase/supabase-js";

const NCAA_D2_MEN =
  "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=II&sportCode=MSO";
const NCAA_D2_WOMEN =
  "https://web3.ncaa.org/directory/api/directory/memberList?type=12&division=II&sportCode=WSO";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
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
  if (!Array.isArray(data)) throw new Error(`Unexpected response (not array) for ${url}`);
  return data;
}

async function fetchD2SoccerSchools() {
  const [men, women] = await Promise.all([
    fetchJson(NCAA_D2_MEN),
    fetchJson(NCAA_D2_WOMEN),
  ]);

  const menSet = new Set();
  const womenSet = new Set();

  const merged = new Map();
  for (const row of men) {
    const school = (row?.nameOfficial || "").trim();
    if (!school) continue;
    menSet.add(school);
    const state = (row?.memberOrgAddress?.state || "").trim();
    const conference = (row?.conferenceName || "").trim() || "Independent";
    const athleticWebUrl = (row?.athleticWebUrl || "").trim();

    merged.set(school, {
      school_name: school,
      division: "D2",
      mens_division: "D2",
      womens_division: null,
      conference,
      state,
      athletics_url: athleticWebUrl,
      mens_soccer_url: athleticWebUrl || "__HAS_MENS_SOCCER__",
      womens_soccer_url: null,
      notes: "NCAA Directory DII men's soccer institutions",
      _hasMen: true,
      _hasWomen: false,
    });
  }

  for (const row of women) {
    const school = (row?.nameOfficial || "").trim();
    if (!school) continue;
    womenSet.add(school);
    const state = (row?.memberOrgAddress?.state || "").trim();
    const conference = (row?.conferenceName || "").trim() || "Independent";
    const athleticWebUrl = (row?.athleticWebUrl || "").trim();

    const existing = merged.get(school);
    if (existing) {
      existing._hasWomen = true;
      existing.womens_soccer_url = athleticWebUrl || "__HAS_WOMENS_SOCCER__";
      existing.womens_division = "D2";
      if (!existing.athletics_url && athleticWebUrl) existing.athletics_url = athleticWebUrl;
      if ((!existing.conference || existing.conference === "Independent") && conference)
        existing.conference = conference;
      if (!existing.state && state) existing.state = state;
      existing.notes = "NCAA Directory DII men's & women's soccer institutions";
    } else {
      merged.set(school, {
        school_name: school,
        division: "D2",
        mens_division: null,
        womens_division: "D2",
        conference,
        state,
        athletics_url: athleticWebUrl,
        mens_soccer_url: null,
        womens_soccer_url: athleticWebUrl || "__HAS_WOMENS_SOCCER__",
        notes: "NCAA Directory DII women's soccer institutions",
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

async function fetchDivisionRows(supabase, division) {
  const rows = [];
  let from = 0;
  const pageSize = 1000;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("schools")
      .select("school_name,mens_division,womens_division,mens_soccer_url,womens_soccer_url")
      .eq("division", division)
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function main() {
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("Fetching D2 soccer institutions (NCAA Directory)...");
  const { menCount, womenCount, menSet, womenSet, schools } =
    await fetchD2SoccerSchools();
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
      division: row.division,
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
      patch.division !== ex.division ||
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

  console.log("Reconciling D2 men/women divisions to match NCAA Directory...");
  const existingD2 = await fetchDivisionRows(supabase, "D2");
  const clearMen = [];
  const clearWomen = [];
  for (const r of existingD2) {
    const name = r?.school_name;
    if (!name) continue;
    if (r.mens_division === "D2" && !menSet.has(name)) {
      clearMen.push({ school_name: name, mens_division: null, mens_soccer_url: null });
    }
    if (r.womens_division === "D2" && !womenSet.has(name)) {
      clearWomen.push({
        school_name: name,
        womens_division: null,
        womens_soccer_url: null,
      });
    }
  }
  if (clearMen.length) {
    console.log(`Clearing mens_division for ${clearMen.length} schools...`);
    await updateInBatches(supabase, clearMen, 200);
  }
  if (clearWomen.length) {
    console.log(`Clearing womens_division for ${clearWomen.length} schools...`);
    await updateInBatches(supabase, clearWomen, 200);
  }

  const [{ count: menTotal, error: menErr }, { count: womenTotal, error: womenErr }] =
    await Promise.all([
      supabase
        .from("schools")
        .select("id", { count: "exact", head: true })
        .eq("mens_division", "D2"),
      supabase
        .from("schools")
        .select("id", { count: "exact", head: true })
        .eq("womens_division", "D2"),
    ]);
  if (menErr) throw menErr;
  if (womenErr) throw womenErr;
  console.log("D2 counts in Supabase after import:");
  console.log(JSON.stringify({ mens: menTotal, womens: womenTotal }, null, 2));
  console.log("Import complete.");
}

main().catch((err) => {
  console.error("Import failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

