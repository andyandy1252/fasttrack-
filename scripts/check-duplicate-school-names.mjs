import { createClient } from "@supabase/supabase-js";
import { normalizeSchoolName } from "./lib/normalizeSchoolName.mjs";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/** Second pass: strip common prefixes/suffixes so "Alabama" vs "University of Alabama" can match. */
function coreKey(name) {
  let n = normalizeSchoolName(name);
  if (!n) return "";
  n = n.replace(/^the\s+/, "");
  n = n.replace(/^university of\s+/, "");
  n = n.replace(/^college of\s+/, "");
  n = n.replace(/\s+university$/, "");
  n = n.replace(/\s+college$/, "");
  n = n.replace(/\s+community college$/, "");
  return n.replace(/\s+/g, " ").trim();
}

async function fetchAll(supabase, table) {
  const rows = [];
  let from = 0;
  const page = 1000;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("id,school_name,division,school_name_normalized")
      .range(from, from + page - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < page) break;
    from += page;
  }
  return rows;
}

function exactDupesByNorm(rows) {
  const m = new Map();
  for (const r of rows) {
    const div = (r.division || "").trim();
    const norm =
      (r.school_name_normalized || "").trim() ||
      normalizeSchoolName(r.school_name);
    const k = `${div}||${norm}`;
    if (!norm) continue;
    const list = m.get(k) || [];
    list.push(r);
    m.set(k, list);
  }
  return [...m.entries()].filter(([, list]) => list.length > 1);
}

function coreDupes(rows) {
  const m = new Map();
  for (const r of rows) {
    const div = (r.division || "").trim();
    const ck = coreKey(r.school_name);
    if (!ck) continue;
    const k = `${div}||${ck}`;
    const list = m.get(k) || [];
    list.push(r);
    m.set(k, list);
  }
  return [...m.entries()].filter(([, list]) => {
    if (list.length < 2) return false;
    const names = new Set(list.map((x) => x.school_name.trim().toLowerCase()));
    return names.size > 1;
  });
}

/** Short string is full substring of longer at word boundary-ish (simple check). */
function shortLongPairs(rows) {
  const byDiv = new Map();
  for (const r of rows) {
    const d = (r.division || "").trim();
    if (!byDiv.has(d)) byDiv.set(d, []);
    byDiv.get(d).push(r);
  }
  const pairs = [];
  for (const [, list] of byDiv) {
    const sorted = [...list].sort(
      (a, b) => a.school_name.length - b.school_name.length
    );
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const short = sorted[i].school_name.trim().toLowerCase();
        const long = sorted[j].school_name.trim().toLowerCase();
        if (short.length < 4) continue;
        if (long.includes(short) && short !== long) {
          pairs.push({
            shorter: sorted[i],
            longer: sorted[j],
          });
        }
      }
    }
  }
  return pairs;
}

async function main() {
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  for (const table of ["mens_programs", "womens_programs"]) {
    console.log(`\n========== ${table} ==========`);
    const rows = await fetchAll(supabase, table);

    const exact = exactDupesByNorm(rows);
    console.log(
      `\n1) Exact duplicates (same division + same school_name_normalized): ${exact.length} groups`
    );
    if (exact.length) {
      for (const [key, list] of exact.slice(0, 50)) {
        console.log("  ", key, list.map((x) => x.school_name));
      }
      if (exact.length > 50) console.log(`  ... and ${exact.length - 50} more`);
    }

    const core = coreDupes(rows);
    console.log(
      `\n2) Same \"core\" name after stripping Univ./College prefixes (different display names): ${core.length} groups`
    );
    if (core.length) {
      for (const [key, list] of core.slice(0, 40)) {
        console.log(
          "  ",
          key,
          "=>",
          list.map((x) => `${x.school_name} (id=${x.id})`)
        );
      }
      if (core.length > 40) console.log(`  ... and ${core.length - 40} more`);
    }

    const pairs = shortLongPairs(rows);
    console.log(
      `\n3) Substring pairs (shorter name contained in longer; same division): ${pairs.length} pairs`
    );
    for (const p of pairs.slice(0, 30)) {
      console.log(
        `   "${p.shorter.school_name}"  ⊂  "${p.longer.school_name}"  (${p.shorter.division})`
      );
    }
    if (pairs.length > 30) console.log(`   ... and ${pairs.length - 30} more`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
