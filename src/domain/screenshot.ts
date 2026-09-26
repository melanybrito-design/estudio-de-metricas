import { emptyMetrics, type Field, type Metrics } from "./model.ts";
export type OcrLine = {
  text: string;
  confidence: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
};
export type MetricCandidate = {
  field: Field;
  value: number | null;
  evidence: string;
  warning: string;
  approximate: boolean;
};
export const screenshotFields: Field[] = [
  "likes",
  "comments",
  "shares",
  "saves",
  "reach",
  "views",
  "impressions",
  "followers",
];
const labels: Record<string, Field> = {
  "me gusta": "likes",
  likes: "likes",
  reacciones: "likes",
  comentarios: "comments",
  comments: "comments",
  "veces que se compartio": "shares",
  compartidos: "shares",
  shares: "shares",
  guardados: "saves",
  saves: "saves",
  "cuentas alcanzadas": "reach",
  alcance: "reach",
  "accounts reached": "reach",
  reach: "reach",
  visualizaciones: "views",
  reproducciones: "views",
  views: "views",
  plays: "views",
  impresiones: "impressions",
  impressions: "impressions",
  "total de seguidores": "followers",
  seguidores: "followers",
  "total followers": "followers",
  followers: "followers",
};
const normalized = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
export function parseScreenshotCount(
  raw: string,
): { value: number; approximate: boolean } | null {
  const s = normalized(raw).replace(/[\u00a0\u202f]/g, " ");
  if (!s || /[%+−-]/.test(s)) return null;
  const compact = s.match(/^(\d+(?:[.,]\d{1,2})?)\s*(mil|k|m|millones?)$/);
  if (compact) {
    const value =
      Number(compact[1].replace(",", ".")) *
      (/^(m|millon|millones)$/.test(compact[2]) ? 1e6 : 1e3);
    return Number.isSafeInteger(value) ? { value, approximate: true } : null;
  }
  if (!/^\d+$/.test(s) && !/^\d{1,3}([., ])\d{3}(?:\1\d{3})*$/.test(s))
    return null;
  const value = Number(s.replace(/[., ]/g, ""));
  return Number.isSafeInteger(value) ? { value, approximate: false } : null;
}
function labelFor(text: string) {
  const s = normalized(text);
  for (const [label, field] of Object.entries(labels).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    if (s === label) return { field, number: "" };
    if (s.startsWith(label + " ") || s.startsWith(label + ":"))
      return {
        field,
        number: s
          .slice(label.length)
          .replace(/^\s*[:|·]\s*/, "")
          .trim(),
      };
  }
  return null;
}
export function mapScreenshot(lines: OcrLine[]): MetricCandidate[] {
  const found = new Map<Field, MetricCandidate[]>();
  const add = (c: MetricCandidate) =>
    found.set(c.field, [...(found.get(c.field) || []), c]);
  lines.forEach((line, i) => {
    const label = labelFor(line.text);
    if (!label) return;
    let raw = label.number;
    let evidence = line.text.trim();
    let confidence = line.confidence;
    if (!raw) {
      const neighbors = [lines[i - 1], lines[i + 1]]
        .filter(
          (n): n is OcrLine => !!n && parseScreenshotCount(n.text) !== null,
        )
        .filter((n) => {
          if (!line.bbox || !n.bbox) return true;
          const h = Math.max(
            line.bbox.y1 - line.bbox.y0,
            n.bbox.y1 - n.bbox.y0,
            10,
          );
          const gap =
            Math.max(line.bbox.y0, n.bbox.y0) -
            Math.min(line.bbox.y1, n.bbox.y1);
          return (
            gap < h * 2.5 &&
            Math.abs(line.bbox.x0 - n.bbox.x0) <
              Math.max(100, line.bbox.x1 - line.bbox.x0)
          );
        });
      if (neighbors.length === 1) {
        raw = neighbors[0].text;
        evidence += ` / ${raw}`;
        confidence = Math.min(confidence, neighbors[0].confidence);
      } else if (neighbors.length > 1) {
        add({
          field: label.field,
          value: null,
          evidence,
          warning: "Hay varios números cercanos. Comprueba cuál corresponde.",
          approximate: false,
        });
        return;
      }
    }
    const count = parseScreenshotCount(raw);
    if (!count) {
      add({
        field: label.field,
        value: null,
        evidence,
        warning: "No hay un conteo inequívoco junto a esta etiqueta.",
        approximate: false,
      });
      return;
    }
    add({
      field: label.field,
      value: confidence < 55 ? null : count.value,
      evidence,
      warning:
        confidence < 55
          ? "Lectura poco clara. Introduce el valor mirando la imagen."
          : count.approximate
            ? "La captura abrevia el dato: es una aproximación. Usa el conteo exacto si lo tienes."
            : "Compara el número con la captura.",
      approximate: count.approximate,
    });
  });
  return screenshotFields.map((field) => {
    const candidates = found.get(field) || [];
    if (candidates.length === 0)
      return {
        field,
        value: null,
        evidence: "Etiqueta no identificada",
        warning: "Sin dato. No se sustituye por cero.",
        approximate: false,
      };
    if (
      candidates.length > 1 &&
      new Set(candidates.map((c) => c.value)).size > 1
    )
      return {
        field,
        value: null,
        evidence: candidates.map((c) => c.evidence).join(" | "),
        warning:
          "La captura contiene valores distintos para esta métrica. Elige el correcto.",
        approximate: false,
      };
    return candidates[0];
  });
}
export function reviewedMetrics(
  values: Partial<Record<Field, string>>,
): Metrics {
  const metrics = emptyMetrics();
  for (const field of screenshotFields) {
    const raw = values[field]?.trim();
    if (!raw) continue;
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)))
      throw new Error(
        "Usa conteos enteros, sin separadores ni valores negativos.",
      );
    metrics[field] = Number(raw);
  }
  return metrics;
}
