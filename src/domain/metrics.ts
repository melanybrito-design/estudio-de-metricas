import {
  fieldLabels,
  type Analysis,
  type Field,
  type Metrics,
  type Platform,
} from "./model.ts";
export type Method = {
  id: string;
  platform: Platform;
  label: string;
  fields: Field[];
  denominator: Field;
  official?: boolean;
  pageOnly?: boolean;
};
const social: Field[] = ["likes", "comments", "shares"];
export const methods: Method[] = [
  {
    id: "ig-reach",
    platform: "instagram",
    label: "Interacción por alcance",
    fields: [...social, "saves"],
    denominator: "reach",
  },
  {
    id: "ig-views",
    platform: "instagram",
    label: "Interacción por visualizaciones",
    fields: [...social, "saves"],
    denominator: "views",
  },
  {
    id: "ig-followers",
    platform: "instagram",
    label: "Interacción social por seguidores",
    fields: social,
    denominator: "followers",
  },
  {
    id: "tt-views",
    platform: "tiktok",
    label: "Interacción social por visualizaciones",
    fields: social,
    denominator: "views",
  },
  {
    id: "tt-extended",
    platform: "tiktok",
    label: "Interacción ampliada por visualizaciones",
    fields: [...social, "saves"],
    denominator: "views",
  },
  {
    id: "tt-followers",
    platform: "tiktok",
    label: "Interacción social por seguidores",
    fields: social,
    denominator: "followers",
  },
  {
    id: "li-social",
    platform: "linkedin",
    label: "Interacción social por impresiones",
    fields: social,
    denominator: "impressions",
  },
  {
    id: "li-page",
    platform: "linkedin",
    label: "Engagement de página por impresiones",
    fields: [...social, "clicks"],
    denominator: "impressions",
    official: true,
    pageOnly: true,
  },
  {
    id: "li-followers",
    platform: "linkedin",
    label: "Interacción social por seguidores",
    fields: social,
    denominator: "followers",
  },
];
export const methodById = (id: string) => methods.find((m) => m.id === id);
export function calculate(id: string, metrics: Metrics) {
  const method = methodById(id);
  if (!method)
    return {
      value: null,
      interactions: null,
      denominator: null,
      error: "Método desconocido.",
    };
  const fields = [...method.fields, method.denominator];
  if (fields.some((k) => metrics[k] === null || metrics[k] === undefined))
    return {
      value: null,
      interactions: null,
      denominator: null,
      error:
        "Completa todos los campos del método. Si el valor observado es cero, escribe 0.",
    };
  if (fields.some((k) => !Number.isSafeInteger(metrics[k]) || metrics[k]! < 0))
    return {
      value: null,
      interactions: null,
      denominator: null,
      error: "Usa conteos enteros, no negativos y dentro del rango seguro.",
    };
  const interactions = method.fields.reduce((sum, k) => sum + metrics[k]!, 0);
  const denominator = metrics[method.denominator]!;
  if (!Number.isSafeInteger(interactions))
    return {
      value: null,
      interactions: null,
      denominator: null,
      error: "La suma excede el rango numérico seguro.",
    };
  if (!denominator)
    return {
      value: null,
      interactions,
      denominator,
      error: "No calculable: el denominador es cero.",
    };
  return {
    value: (100 * interactions) / denominator,
    interactions,
    denominator,
    error: null,
  };
}
export function groupKey(a: Analysis) {
  return [
    a.accountId,
    a.method,
    a.methodVersion,
    a.mode,
    a.scope,
    a.timing,
    a.format,
  ].join("|");
}
export function aggregate(rows: Analysis[]) {
  const valid = rows.filter(
    (r) => calculate(r.method, r.metrics).value !== null,
  );
  if (!valid.length)
    return {
      value: null,
      count: 0,
      total: rows.length,
      label: "Sin datos completos",
      interactions: 0,
    };
  if (new Set(valid.map(groupKey)).size > 1)
    return {
      value: null,
      count: valid.length,
      total: rows.length,
      label: "Métodos o ámbitos diferentes",
      interactions: 0,
    };
  const m = methodById(valid[0].method)!;
  if (valid.length > 1 && valid.some((a) => a.mode === "period"))
    return {
      value: null,
      count: valid.length,
      total: rows.length,
      label: "Resúmenes de período: revisar individualmente",
      interactions: 0,
    };
  const seen = new Set<string>();
  if (
    valid.some((a) => {
      const key = a.postId || a.id;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    })
  )
    return {
      value: null,
      count: valid.length,
      total: rows.length,
      label: "Varias capturas del mismo contenido",
      interactions: 0,
    };
  const values = valid.map((a) => calculate(a.method, a.metrics));
  const interactions = values.reduce((s, r) => s + r.interactions!, 0);
  const value =
    m.denominator === "followers"
      ? values.reduce((s, r) => s + r.value!, 0) / values.length
      : (100 * interactions) / values.reduce((s, r) => s + r.denominator!, 0);
  return {
    value,
    count: valid.length,
    total: rows.length,
    interactions,
    label:
      m.denominator === "followers"
        ? "Promedio de tasas por publicación"
        : m.denominator === "reach" && valid.length > 1
          ? "Ponderada por alcance de publicaciones; audiencia no deduplicada"
          : m.label,
  };
}
export function delta(current: number, previous: number) {
  return {
    points: current - previous,
    relative: previous === 0 ? null : (100 * (current - previous)) / previous,
  };
}
export const fmt = (value: number | null, digits = 2) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("es-EC", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      }).format(value);
export function summary(a: Analysis) {
  const r = calculate(a.method, a.metrics);
  const m = methodById(a.method)!;
  return `${a.title}. ${a.start} a ${a.end}. ${m.label}: ${r.value === null ? "no calculable" : fmt(r.value) + " %"}. ${r.interactions === null ? "Interacciones pendientes" : r.interactions + " interacciones"} / ${r.denominator === null ? "denominador pendiente" : r.denominator + " " + fieldLabels[m.denominator]}. Incluye ${m.fields.map((k) => fieldLabels[k]).join(", ")}. Ámbito: ${{ organic: "orgánico", paid: "pagado", mixed: "mixto" }[a.scope]}; ${a.timing === "activity" ? "actividad del período" : "acumulado a fecha de captura"}. Fuente: ${a.source || "Manual"}. Método ${m.id} v1.`;
}
export const businessMethods = {
  conversion: {
    label: "Tasa de conversión",
    unit: "%",
    fields: ["Conversiones", "Oportunidades elegibles"],
    formula: "Conversiones ÷ oportunidades × 100",
  },
  ctr: {
    label: "CTR",
    unit: "%",
    fields: ["Clics en enlace", "Impresiones"],
    formula: "Clics en enlace ÷ impresiones × 100",
  },
  cpc: {
    label: "Costo por clic",
    unit: "money",
    fields: ["Gasto publicitario", "Clics en enlace"],
    formula: "Gasto ÷ clics",
  },
  cpm: {
    label: "Costo por mil impresiones",
    unit: "money",
    fields: ["Gasto publicitario", "Impresiones"],
    formula: "Gasto ÷ impresiones × 1.000",
  },
  cpl: {
    label: "Costo por lead",
    unit: "money",
    fields: ["Costo de captación", "Leads nuevos"],
    formula: "Costo de captación ÷ leads nuevos",
  },
  cac: {
    label: "Costo de adquisición",
    unit: "money",
    fields: ["Costos de marketing", "Costos de ventas", "Clientes nuevos"],
    formula: "(Marketing + ventas) ÷ clientes nuevos",
  },
  roas: {
    label: "ROAS",
    unit: "×",
    fields: ["Ingresos atribuidos", "Gasto publicitario"],
    formula: "Ingresos atribuidos ÷ gasto publicitario",
  },
  roi: {
    label: "ROI de campaña",
    unit: "%",
    fields: ["Contribución antes de campaña", "Costo de campaña"],
    formula: "(Contribución − costo de campaña) ÷ costo de campaña × 100",
  },
  clv: {
    label: "Valor de vida por ingresos",
    unit: "money",
    fields: ["Ticket medio", "Compras por año", "Años de relación"],
    formula: "Ticket medio × frecuencia anual × años; estimación de ingresos",
  },
  clvm: {
    label: "CLV por contribución",
    unit: "money",
    fields: [
      "Ticket medio",
      "Compras por año",
      "Años de relación",
      "Margen de contribución (%)",
    ],
    formula:
      "Ticket × frecuencia × años × margen / 100; estimación sin descuento temporal",
  },
};
export type BusinessKey = keyof typeof businessMethods;
export function businessCalculate(key: BusinessKey, v: (number | null)[]) {
  const result = businessResult(key, v);
  return result !== null && Number.isFinite(result) ? result : null;
}
function businessResult(key: BusinessKey, v: (number | null)[]) {
  const expected = businessMethods[key].fields.length;
  if (v.length !== expected || v.some((n) => n === null || !Number.isFinite(n)))
    return null;
  const n = v as number[];
  if (n.some((x, i) => x < 0 && !(key === "roi" && i === 0))) return null;
  if (key === "clvm" && n[3] > 100) return null;
  if (["clv", "clvm"].includes(key))
    return n[0] * n[1] * n[2] * (key === "clvm" ? n[3] / 100 : 1);
  const denominator = key === "cac" ? n[2] : n[1];
  if (denominator <= 0) return null;
  switch (key) {
    case "cac":
      return (n[0] + n[1]) / denominator;
    case "roi":
      return ((n[0] - n[1]) / denominator) * 100;
    case "conversion":
    case "ctr":
      return (n[0] / denominator) * 100;
    case "cpm":
      return (n[0] / denominator) * 1000;
    default:
      return n[0] / denominator;
  }
}
