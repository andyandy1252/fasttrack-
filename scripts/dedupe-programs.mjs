import { createClient } from "@supabase/supabase-js";
import { normalizeSchoolName } from "./lib/normalizeSchoolName.mjs";
import { writeFile } from "node:fs/promises";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function scoreRow(r) {
  const nameLen = (r.school_name || "").trim().length;
  const hasAth = (r.athletics_url || "").trim() ? 1 : 0;
  const hasConf =
    (r.conference || "").trim() && (r.conference || "").trim() !== "Independent"
      ? 1
      : 0;
  const updated = r.source_updated_at ? Date.parse(r.source_updated_at) || 0 : 0;
  return {
    nameLen,
    hasAth,
    hasConf,
    updated,
  };
}

function pickWinner(rows) {
  // Implements plan tie-breaks:
  // longer name > non-empty athletics_url > non-empty conference > most recent source_updated_at
  let best = rows[0];
  for (let i = 1; i < rows.length; i++) {
    const a = scoreRow(best);
    const b = scoreRow(rows[i]);
    if (b.nameLen !== a.nameLen) {
      if (b.nameLen > a.nameLen) best = rows[i];
      continue;
    }
    if (b.hasAth !== a.hasAth) {
      if (b.hasAth > a.hasAth) best = rows[i];
      continue;
    }
    if (b.hasConf !== a.hasConf) {
      if (b.hasConf > a.hasConf) best = rows[i];
      continue;
    }
    if (b.updated !== a.updated) {
      if (b.updated > a.updated) best = rows[i];
    }
  }
  return best;
}

async function fetchAll(supabase, table) {
  const rows = [];
  let from = 0;
  const pageSize = 1000;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(
        "id,school_name,school_name_normalized,division,conference,state,athletics_url,soccer_url,source,source_updated_at,notes"
      )
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function computeDuplicates(rows) {
  const groups = new Map();

  for (const r of rows) {
    const div = (r.division || "").trim();
    const norm =
      (r.school_name_normalized || "").trim() ||
      normalizeSchoolName(r.school_name || "");
    if (!norm || !div) continue;
    const key = `${div}::${norm}`;
    const list = groups.get(key) || [];
    list.push({ ...r, _norm: norm });
    groups.set(key, list);
  }

  const report = [];
  for (const [key, list] of groups) {
    if (list.length < 2) continue;
    const kept = pickWinner(list);
    const del = list.filter((x) => x.id !== kept.id);

    const lostFields = del.map((d) => ({
      id: d.id,
      school_name: d.school_name,
      conference: d.conference,
      state: d.state,
      athletics_url: d.athletics_url,
      soccer_url: d.soccer_url,
      source: d.source,
      source_updated_at: d.source_updated_at,
    }));

    report.push({
      key,
      division: kept.division,
      normalized: kept._norm,
      keep: {
        id: kept.id,
        school_name: kept.school_name,
        conference: kept.conference,
        state: kept.state,
        athletics_url: kept.athletics_url,
        soccer_url: kept.soccer_url,
        source: kept.source,
        source_updated_at: kept.source_updated_at,
      },
      delete: lostFields,
    });
  }

  report.sort((a, b) => a.key.localeCompare(b.key));
  return report;
}

async function applyDeletes(supabase, table, report) {
  // Delete in small chunks to avoid URL size limits.
  const ids = report.flatMap((r) => r.delete.map((d) => d.id));
  const chunkSize = 200;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).delete().in("id", chunk);
    if (error) throw error;
    console.log(`${table}: deleted ${Math.min(i + chunkSize, ids.length)}/${ids.length}`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  for (const table of ["mens_programs", "womens_programs"]) {
    console.log(`\nScanning ${table}...`);
    const rows = await fetchAll(supabase, table);
    const report = computeDuplicates(rows);
    console.log(`${table}: duplicate groups = ${report.length}`);

    const out = `scripts/_duplicates_${table}.json`;
    await writeFile(out, JSON.stringify(report, null, 2), "utf8");
    console.log(`${table}: wrote ${out}`);

    if (apply && report.length) {
      console.log(`${table}: applying deletes...`);
      await applyDeletes(supabase, table, report);
    }
  }
}

main().catch((err) => {
  console.error("Dedupe failed:", err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});

