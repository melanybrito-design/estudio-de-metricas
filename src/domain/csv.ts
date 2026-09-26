import { emptyMetrics, fieldLabels, type Analysis } from "./model.ts";
import { validateAnalysis } from "./validation.ts";
export const csvHeaders = [
  "title",
  "postId",
  "platform",
  "method",
  "start",
  "end",
  "mode",
  "scope",
  "timing",
  "format",
  "source",
  ...Object.keys(fieldLabels),
];
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function parseCSV(text: string): string[][] {
  if (text.length > 5_000_000) throw new Error("El archivo supera 5 MB.");
  text = text.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/)[0];
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("Hay comillas sin cerrar.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function importCSV(
  text: string,
  accountId: string,
  batchId: string,
): { rows: Analysis[]; errors: string[] } {
  const table = parseCSV(text);
  if (table.length < 2) throw new Error("El archivo no contiene registros.");
  const headers = table[0].map((x) => x.trim());
  if (new Set(headers).size !== headers.length)
    throw new Error("Hay encabezados repetidos.");
  for (const h of csvHeaders)
    if (!headers.includes(h))
      throw new Error(`Falta la columna ${h}. Usa la plantilla descargable.`);
  const rows: Analysis[] = [],
    errors: string[] = [];
  table.slice(1).forEach((row, i) => {
    try {
      if (row.length !== headers.length)
        throw new Error("Número de columnas incorrecto.");
      const data = Object.fromEntries(
        headers.map((h, j) => [h, row[j].trim()]),
      );
      const metrics = emptyMetrics();
      for (const k of Object.keys(metrics) as (keyof typeof metrics)[]) {
        if (data[k] === "") metrics[k] = null;
        else {
          if (!/^\d+$/.test(data[k]))
            throw new Error(
              `${k}: escribe un entero sin separadores de miles.`,
            );
          metrics[k] = Number(data[k]);
        }
      }
      const a = {
        ...data,
        id: crypto.randomUUID(),
        accountId,
        campaignId: "",
        capturedAt: new Date().toISOString(),
        methodVersion: 1,
        notes: "",
        goal: null,
        metrics,
        batchId,
      } as Analysis;
      validateAnalysis(a);
      rows.push(a);
    } catch (e) {
      errors.push(`Fila ${i + 2}: ${(e as Error).message}`);
    }
  });
  return { rows, errors };
}
export function fingerprint(a: Analysis) {
  return [
    a.accountId,
    a.postId || a.title,
    a.method,
    a.start,
    a.end,
    a.mode,
    a.scope,
    a.timing,
    a.format,
  ].join("|");
}
export function exportCSV(rows: Analysis[]) {
  return (
    "\uFEFF" +
    [
      csvHeaders.join(","),
      ...rows.map((a) =>
        csvHeaders
          .map((k) =>
            csvCell(
              k in a.metrics
                ? a.metrics[k as keyof typeof a.metrics]
                : a[k as keyof Analysis],
            ),
          )
          .join(","),
      ),
    ].join("\r\n")
  );
}
export const templateCSV =
  csvHeaders.join(",") +
  "\r\n" +
  [
    "Mi publicación",
    "post-001",
    "tiktok",
    "tt-views",
    "2026-09-01",
    "2026-09-01",
    "post",
    "organic",
    "lifetime",
    "video",
    "TikTok Studio",
    "240",
    "45",
    "15",
    "",
    "",
    "",
    "8000",
    "",
    "",
  ].join(",") +
  "\r\n";
