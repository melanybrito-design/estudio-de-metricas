import { fieldLabels, type Store, type Analysis } from "./model.ts";
import { methodById } from "./metrics.ts";
export function validDate(s: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !isNaN(Date.parse(s)) &&
    new Date(s).toISOString().slice(0, 10) === s
  );
}
export function validateAnalysis(a: Analysis) {
  if (!a || typeof a !== "object") throw new Error("Registro inválido.");
  for (const f of [
    "id",
    "accountId",
    "campaignId",
    "title",
    "postId",
    "platform",
    "method",
    "start",
    "end",
    "capturedAt",
    "mode",
    "scope",
    "timing",
    "format",
    "source",
    "notes",
  ] as const)
    if (typeof a[f] !== "string") throw new Error(`Campo inválido: ${f}`);
  if (a.title.length > 500 || !a.title.trim() || a.notes.length > 20000)
    throw new Error("Título o notas inválidos.");
  const m = methodById(a.method);
  if (!m || m.platform !== a.platform || a.methodVersion !== 1)
    throw new Error("Método o versión incompatible.");
  if (
    !validDate(a.start) ||
    !validDate(a.end) ||
    a.start > a.end ||
    isNaN(Date.parse(a.capturedAt))
  )
    throw new Error("Fechas inválidas.");
  if (
    !["post", "period"].includes(a.mode) ||
    !["organic", "paid", "mixed"].includes(a.scope) ||
    !["activity", "lifetime"].includes(a.timing) ||
    !["post", "video", "carousel"].includes(a.format)
  )
    throw new Error("Ámbito inválido.");
  if (m.denominator === "followers" && a.mode !== "post")
    throw new Error("El método por seguidores requiere una publicación.");
  if (
    !a.metrics ||
    Object.keys(fieldLabels).some((k) => {
      const n = a.metrics[k as keyof typeof fieldLabels];
      return n !== null && (!Number.isSafeInteger(n) || n! < 0);
    })
  )
    throw new Error("Métricas inválidas.");
  if (a.goal !== null && (!Number.isFinite(a.goal) || a.goal <= 0))
    throw new Error("Meta inválida.");
  return a;
}
export function validateStore(value: unknown): Store {
  if (!value || typeof value !== "object")
    throw new Error("Respaldo inválido.");
  const s = value as Store;
  if (s.version !== 1) throw new Error("Versión de respaldo no compatible.");
  for (const name of [
    "clients",
    "accounts",
    "campaigns",
    "analyses",
    "reports",
  ] as const) {
    if (!Array.isArray(s[name]) || s[name].length > 50000)
      throw new Error(`Sección inválida: ${name}`);
    const ids = new Set<string>();
    for (const item of s[name]) {
      if (!item || typeof item.id !== "string" || !item.id || ids.has(item.id))
        throw new Error("Identificadores inválidos o duplicados.");
      ids.add(item.id);
    }
  }
  if (
    !s.settings ||
    typeof s.settings.brand !== "string" ||
    s.settings.brand.length > 150 ||
    !["USD", "EUR", "COP", "MXN", "PEN"].includes(s.settings.currency) ||
    typeof s.settings.timezone !== "string"
  )
    throw new Error("Configuración inválida.");
  try {
    new Intl.DateTimeFormat("es", { timeZone: s.settings.timezone });
  } catch {
    throw new Error("Zona horaria inválida.");
  }
  if (
    s.settings.lastBackup !== null &&
    (typeof s.settings.lastBackup !== "string" ||
      isNaN(Date.parse(s.settings.lastBackup)))
  )
    throw new Error("Fecha de respaldo inválida.");
  for (const c of s.clients)
    if (
      typeof c.name !== "string" ||
      !c.name.trim() ||
      c.name.length > 200 ||
      typeof c.objective !== "string" ||
      typeof c.sector !== "string" ||
      typeof c.archived !== "boolean"
    )
      throw new Error("Cliente inválido.");
  for (const a of s.accounts)
    if (
      !s.clients.some((c) => c.id === a.clientId) ||
      typeof a.name !== "string" ||
      !a.name.trim() ||
      !["instagram", "tiktok", "linkedin"].includes(a.platform) ||
      !["personal", "business"].includes(a.type) ||
      typeof a.archived !== "boolean"
    )
      throw new Error("Cuenta inválida.");
  for (const c of s.campaigns)
    if (
      !s.clients.some((a) => a.id === c.clientId) ||
      typeof c.name !== "string" ||
      !c.name.trim() ||
      typeof c.objective !== "string" ||
      !validDate(c.start) ||
      !validDate(c.end) ||
      c.start > c.end
    )
      throw new Error("Campaña inválida.");
  for (const a of s.analyses) {
    validateAnalysis(a);
    const account = s.accounts.find((c) => c.id === a.accountId);
    if (
      a.accountId &&
      (!account ||
        account.platform !== a.platform ||
        (methodById(a.method)?.pageOnly && account.type !== "business"))
    )
      throw new Error("Cuenta incompatible.");
    if (
      a.campaignId &&
      !s.campaigns.some(
        (c) => c.id === a.campaignId && c.clientId === account?.clientId,
      )
    )
      throw new Error("Campaña incompatible.");
  }
  for (const r of s.reports) {
    if (
      typeof r.title !== "string" ||
      typeof r.clientName !== "string" ||
      typeof r.brand !== "string" ||
      typeof r.notes !== "string" ||
      !validDate(r.start) ||
      !validDate(r.end) ||
      r.start > r.end ||
      isNaN(Date.parse(r.createdAt)) ||
      !Array.isArray(r.rows)
    )
      throw new Error("Reporte inválido.");
    r.rows.forEach((a) => {
      validateAnalysis(a);
      if (typeof a.accountName !== "string")
        throw new Error("Cuenta de reporte inválida.");
    });
  }
  return s;
}
