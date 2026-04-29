export function normalizeSchoolName(name) {
  const s = (name ?? "").toString().trim().toLowerCase();
  if (!s) return "";

  return (
    s
      // remove leading "the "
      .replace(/^the\s+/, "")
      // expand common abbreviations
      .replace(/\buniv\.?\b/g, "university")
      .replace(/\bst\.?\b/g, "saint")
      // normalize ampersand
      .replace(/&/g, "and")
      // drop punctuation
      .replace(/[^a-z0-9\s]/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

