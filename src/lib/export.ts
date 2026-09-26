import type { Report, Store } from "../domain/model";
import { fieldLabels, platforms } from "../domain/model";
import {
  businessCalculate,
  businessMethods,
  type BusinessKey,
  calculate,
  fmt,
  methodById,
} from "../domain/metrics";
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
type RGB = [number, number, number];
const ink: RGB = [27, 36, 58];
const muted: RGB = [88, 101, 125];
const blue: RGB = [58, 85, 218];

async function pdfDocument(brand: string, id: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 22;
  const clean = (text: string) =>
    text
      .replace(/−/g, "-")
      .replace(/→/g, "> ")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  const space = (height: number) => {
    if (y + height > 274) {
      doc.addPage();
      y = 22;
    }
  };
  const text = (value: string, size = 10, color: RGB = muted, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(value), 170) as string[];
    const height = size * 0.45 + 1.8;
    for (const line of lines) {
      space(height);
      doc.text(line, 20, y);
      y += height;
    }
    y += 2;
  };
  const heading = (value: string) => {
    space(23);
    y += 3;
    text(value, 13, ink, true);
  };
  const result = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const labels = doc.splitTextToSize(clean(label), 154) as string[];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(27);
    const values = doc.splitTextToSize(clean(value), 154) as string[];
    const height = 17 + labels.length * 5 + values.length * 10;
    space(height + 7);
    doc.setFillColor(239, 243, 255);
    doc.roundedRect(20, y, 170, height, 4, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(labels, 28, y + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(27);
    doc.setTextColor(...blue);
    doc.text(values, 28, y + 20 + labels.length * 5);
    y += height + 9;
  };
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const labels = doc.splitTextToSize(clean(label), 104) as string[];
    const values = doc.splitTextToSize(clean(value), 48) as string[];
    const height = Math.max(labels.length, values.length) * 5 + 4;
    space(height);
    doc.setDrawColor(228, 233, 242);
    doc.line(20, y - 4, 190, y - 4);
    doc.setTextColor(...muted);
    doc.text(labels, 22, y + 1);
    doc.setTextColor(...ink);
    doc.text(values, 188, y + 1, { align: "right" });
    y += height;
  };
  const finish = (title: string, date: string) => {
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
      doc.setPage(page);
      doc.setDrawColor(228, 233, 242);
      doc.line(20, 281, 190, 281);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      const footer = doc.splitTextToSize(
        clean(brand || "Estudio de Métricas"),
        110,
      )[0];
      doc.text(footer, 20, 287);
      doc.text(`${id.slice(0, 8)} | ${page} / ${pages}`, 190, 287, {
        align: "right",
      });
    }
    doc.setProperties({ title, author: brand, subject: "Informe de métricas" });
    const slug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70)
      .toLowerCase();
    doc.save(`${slug || "informe"}-${date}.pdf`);
  };
  text("ESTUDIO DE MÉTRICAS / INFORME", 10, blue, true);
  return { text, heading, result, row, finish, space };
}

export async function exportPDF(report: Report) {
  const pdf = await pdfDocument(report.brand, report.id);
  pdf.text(report.title, 23, ink, true);
  pdf.text(`${report.clientName} | ${report.start} - ${report.end}`, 11);
  pdf.text(
    `Preparado por ${report.brand || "Estudio de Métricas"} · Emitido ${new Date(report.createdAt).toLocaleDateString("es-EC")}`,
    9,
  );
  for (const a of report.rows) {
    const m = methodById(a.method);
    if (!m) throw new Error("El informe contiene un método desconocido.");
    const r = calculate(a.method, a.metrics);
    pdf.space(85);
    pdf.text(`${platforms[a.platform]} · ${a.accountName}`, 10, blue, true);
    if (report.rows.length > 1 || a.title !== report.title)
      pdf.text(a.title, 15, ink, true);
    pdf.result(
      m.label,
      r.value === null ? "No calculable" : `${fmt(r.value)} %`,
    );
    if (a.goal !== null && r.value !== null) {
      const difference = r.value - a.goal;
      pdf.text(
        `Meta personal: ${fmt(a.goal)} %. Diferencia: ${difference > 0 ? "+" : ""}${fmt(difference)} puntos porcentuales. ${difference >= 0 ? "Meta alcanzada." : "Por debajo de la meta."}`,
        10,
        ink,
      );
      pdf.text(
        "La meta es una referencia definida por ti, no un benchmark del sector.",
        9,
      );
    }
    pdf.heading("Datos del cálculo");
    for (const key of [...m.fields, m.denominator])
      pdf.row(
        fieldLabels[key],
        a.metrics[key] === null ? "Sin dato" : fmt(a.metrics[key], 0),
      );
    pdf.row(
      "Total de interacciones incluidas",
      r.interactions === null ? "Sin dato" : fmt(r.interactions, 0),
    );
    pdf.heading("Fórmula y contexto");
    pdf.text(
      `(${m.fields.map((k) => fieldLabels[k]).join(" + ")}) / ${fieldLabels[m.denominator]} × 100. Método ${m.id} v${a.methodVersion}.`,
    );
    pdf.text(
      `Período: ${a.start} - ${a.end}. Fuente: ${a.source || "Registro manual"}. Ámbito: ${{ organic: "orgánico", paid: "pagado", mixed: "mixto" }[a.scope]}. ${a.mode === "post" ? "Publicación individual" : "Resumen de período"}; ${a.timing === "lifetime" ? "acumulado a fecha de captura" : "actividad del período"}. Captura: ${a.capturedAt.slice(0, 10)}.`,
    );
    if (r.error) pdf.text(r.error, 10, [156, 66, 25]);
    if (a.notes) {
      pdf.heading("Observaciones del análisis");
      pdf.text(a.notes);
    }
  }
  if (report.notes) {
    pdf.heading("Conclusiones y próximos pasos");
    pdf.text(report.notes);
  }
  pdf.heading("Cómo interpretar este informe");
  pdf.text(
    "Las tasas de distintas redes o métodos se presentan por separado. Un dato ausente no equivale a cero. El engagement describe interacciones y no demuestra ventas ni causalidad. No se deduplican audiencias entre publicaciones o redes. Los resultados dependen de los datos y del contexto registrados.",
    9,
  );
  pdf.finish(report.title, report.start);
}

export async function exportBusinessPDF(input: {
  key: BusinessKey;
  values: (number | null)[];
  context: string;
  currency: string;
  brand: string;
}) {
  const value = businessCalculate(input.key, input.values);
  if (value === null || !Number.isFinite(value))
    throw new Error(
      "Completa los datos con valores válidos antes de exportar.",
    );
  const method = businessMethods[input.key];
  const now = new Date();
  const pdf = await pdfDocument(input.brand, crypto.randomUUID());
  pdf.text(`Informe de ${method.label}`, 23, ink, true);
  pdf.text(
    `Preparado por ${input.brand || "Estudio de Métricas"} · Emitido ${now.toLocaleDateString("es-EC")}`,
    10,
  );
  const unit = method.unit === "money" ? input.currency : method.unit;
  pdf.result(method.label, `${fmt(value)} ${unit}`);
  pdf.heading("Datos del cálculo");
  method.fields.forEach((label, i) => pdf.row(label, fmt(input.values[i])));
  pdf.text(`Moneda de los importes: ${input.currency}.`, 9);
  pdf.heading("Fórmula utilizada");
  pdf.text(method.formula);
  pdf.heading("Contexto y observaciones");
  pdf.text(
    input.context.trim() ||
      "No se registró contexto. Identifica cliente, campaña, período y fuente antes de compartir este informe.",
  );
  pdf.heading("Criterios de lectura");
  const notes: Partial<Record<BusinessKey, string>> = {
    roi: "La contribución antes de campaña debe descontar los costos del producto o servicio, sin descontar dos veces el costo de campaña. El ROI puede ser negativo.",
    roas: "El ROAS relaciona ingresos atribuidos con gasto publicitario; no mide beneficio neto.",
    cac: "Incluye marketing y ventas del mismo período, y solo clientes nuevos adquiridos en ese período.",
    clv: "Estimación de ingresos durante la relación. No equivale a beneficio y no incorpora descuento temporal ni variaciones de retención.",
    clvm: "Estimación de contribución según el margen indicado, sin descuento temporal ni variaciones de retención.",
    conversion:
      "Las conversiones y oportunidades deben pertenecer al mismo período y a la misma definición del embudo.",
  };
  pdf.text(
    notes[input.key] ||
      "Mantén el mismo período, fuente y alcance en el numerador y el denominador para interpretar y comparar este indicador.",
  );
  pdf.text(
    "Cálculo basado en los datos ingresados. No implica una auditoría de la fuente ni demuestra causalidad de la campaña.",
    9,
  );
  pdf.finish(`Informe de ${method.label}`, now.toISOString().slice(0, 10));
}
