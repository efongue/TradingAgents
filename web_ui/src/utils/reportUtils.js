export function cleanReportText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```|!\[[^\]]*\]\([^)]*\)|<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[\s>*#\d.)-]+/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function reportHighlights(value, count = 1) {
  const ignored = /^(analyse|résumé|conclusion|recommandation|note|rapport sur|fin du rapport|key observations|recommendations?|[A-Z]\.\s)\b/i;
  const lines = String(value || "")
    .split(/\n+/)
    .map(cleanReportText)
    .filter((line) => line.length >= 45 && !ignored.test(line) && !/:\s*$/.test(line));
  return [...new Set(lines)].slice(0, count).map((line) => (
    line.length > 210 ? `${line.slice(0, 207).replace(/\s+\S*$/, "")}…` : line
  ));
}
