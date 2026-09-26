import type { Report, Store } from "../domain/model";
import { fieldLabels, platforms } from "../domain/model";
import { calculate, fmt, methodById } from "../domain/metrics";
import { validateStore } from "../domain/validation";
export function download(
  content: Blob | string,
  filename: string,
  type = "text/plain;charset=utf-8",
) {
  const blob =
    typeof content === "string" ? new Blob([content], { type }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function hash(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export async function backup(store: Store) {
  const payload = JSON.stringify(store);
  return JSON.stringify(
    {
      format: "estudio-metricas",
      schema: 1,
      checksum: await hash(payload),
      payload,
    },
    null,
    2,
  );
}
export async function readBackup(text: string) {
  if (text.length > 20_000_000) throw new Error("El respaldo supera 20 MB.");
  const envelope = JSON.parse(text);
  if (
    envelope.format !== "estudio-metricas" ||
    envelope.schema !== 1 ||
    typeof envelope.payload !== "string" ||
    (await hash(envelope.payload)) !== envelope.checksum
  )
    throw new Error("Respaldo incompatible o integridad incorrecta.");
  return validateStore(JSON.parse(envelope.payload));
}
export async function exportPDF(report: Report) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 24;
  const line = (text: string, size = 10, color = [62, 73, 94]) => {
    doc.setFontSize(size);
    doc.setTextColor(...(color as [number, number, number]));
    const lines = doc.splitTextToSize(text, 170) as string[];
    for (const l of lines) {
      if (y > 273) {
        doc.addPage();
        y = 24;
      }
      doc.text(l, 20, y);
      y += size * 0.48 + 2;
    }
    y += 3;
  };
  line("ESTUDIO DE MÉTRICAS", 11, [49, 85, 217]);
  line(report.title, 24, [23, 32, 51]);
  line(`${report.clientName} | ${report.start} - ${report.end}`, 11);
  line(
    `Preparado por ${report.brand} · ${new Date(report.createdAt).toLocaleDateString("es-EC")}`,
    10,
  );
  y += 4;
  for (const a of report.rows) {
    if (y > 195) {
      doc.addPage();
      y = 24;
    }
    const m = methodById(a.method)!;
    const r = calculate(a.method, a.metrics);
    line(`${platforms[a.platform]} · ${a.accountName}`, 10, [49, 85, 217]);
    line(a.title, 15, [23, 32, 51]);
    line(
      `${m.label}: ${r.value === null ? "No calculable" : fmt(r.value) + " %"}`,
      12,
    );
    line(
      `Fórmula: (${m.fields.map((k) => fieldLabels[k]).join(" + ")}) / ${fieldLabels[m.denominator]} x 100. Método ${m.id} v1.`,
    );
    line(
      m.fields
        .concat(m.denominator)
        .map((k) => `${fieldLabels[k]}: ${a.metrics[k] ?? "Sin dato"}`)
        .join(" · "),
    );
    line(
      `Período: ${a.start} - ${a.end}. Fuente: ${a.source}. Ámbito: ${{ organic: "orgánico", paid: "pagado", mixed: "mixto" }[a.scope]}. ${a.timing === "lifetime" ? "Acumulado a fecha de captura" : "Actividad del período"}. Captura: ${a.capturedAt.slice(0, 10)}.`,
    );
    if (r.error) line(r.error, 10, [156, 66, 25]);
    if (a.notes) line(a.notes);
    y += 4;
  }
  if (report.notes) {
    if (y > 245) {
      doc.addPage();
      y = 24;
    }
    line("Observaciones y próximos pasos", 16, [23, 32, 51]);
    line(report.notes);
  }
  line("Metodología", 14, [23, 32, 51]);
  line(
    "Las tasas de distintas redes o métodos se presentan por separado. Un dato ausente no equivale a cero. El engagement describe interacciones y no demuestra ventas ni causalidad. No se deduplican audiencias entre publicaciones o redes.",
  );
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(95, 105, 124);
    doc.text(
      `${report.brand} · Reporte ${report.id.slice(0, 8)} · ${i}/${pages}`,
      20,
      287,
    );
  }
  doc.save(`reporte-${report.start}-${report.id.slice(0, 8)}.pdf`);
}
