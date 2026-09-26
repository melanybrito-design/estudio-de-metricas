import {
  platforms,
  uid,
  type Analysis,
  type Report,
  type Store,
} from "./model.ts";
import { calculate } from "./metrics.ts";
import { validDate, validateAnalysis } from "./validation.ts";

export function quickReportIssue(
  a: Analysis,
  allowPartial = false,
): string | null {
  const result = calculate(a.method, a.metrics);
  if (result.error && !allowPartial) return result.error;
  if (allowPartial && !Object.values(a.metrics).some((v) => v !== null))
    return "Registra al menos una métrica para el informe descriptivo.";
  if (!validDate(a.start) || !validDate(a.end) || a.start > a.end)
    return "Revisa las fechas: el inicio y el fin deben ser válidos y estar en orden.";
  if (a.goal !== null && (!Number.isFinite(a.goal) || a.goal <= 0))
    return "La meta debe ser mayor que cero, o puedes dejarla vacía.";
  return null;
}

export function createQuickReport(
  a: Analysis,
  store: Store,
  recipient = "",
  now = new Date().toISOString(),
  allowPartial = false,
): Report {
  const issue = quickReportIssue(a, allowPartial);
  if (issue) throw new Error(issue);
  const account = store.accounts.find((x) => x.id === a.accountId);
  const client = store.clients.find((x) => x.id === account?.clientId);
  const title =
    a.title.trim() || `Informe de engagement · ${platforms[a.platform]}`;
  const analysis = structuredClone({
    ...a,
    title,
    source: a.source.trim() || "Registro manual",
  });
  validateAnalysis(analysis);
  return {
    id: uid(),
    title,
    clientName: client?.name || recipient.trim() || "Cálculo individual",
    brand: store.settings.brand,
    createdAt: now,
    start: a.start,
    end: a.end,
    notes: "",
    rows: [{ ...analysis, accountName: account?.name || "Cálculo rápido" }],
  };
}
