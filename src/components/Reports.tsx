"use client";
import { useState } from "react";
import {
  Download,
  FileText,
  Save,
  Copy,
  Trash2,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { uid, type Store, type Analysis, type Report } from "@/domain/model";
import { calculate, fmt, methodById, summary } from "@/domain/metrics";
import { exportCSV, fingerprint, importCSV, templateCSV } from "@/domain/csv";
import { download, exportPDF } from "@/lib/export";
import { Empty, Field, PlatformTag, SectionHead } from "./ui";
export default function Reports({
  store,
  commit,
  notify,
  rows,
  start,
  end,
}: {
  store: Store;
  commit: (s: Store) => Promise<boolean>;
  notify: (s: string) => void;
  rows: Analysis[];
  start: string;
  end: string;
}) {
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("Reporte de rendimiento");
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<Report | null>(null);
  const [partial, setPartial] = useState(false);
  const clientIds = new Set(
    rows.map(
      (a) => store.accounts.find((x) => x.id === a.accountId)?.clientId || "",
    ),
  );
  const multipleClients = clientIds.size > 1;
  const incomplete = rows.filter(
    (a) => calculate(a.method, a.metrics).value === null,
  ).length;
  function create(): Report {
    const clients = [
      ...new Set(
        rows.map(
          (a) =>
            store.clients.find(
              (c) =>
                c.id ===
                store.accounts.find((x) => x.id === a.accountId)?.clientId,
            )?.name || "Cálculo rápido",
        ),
      ),
    ];
    return {
      id: uid(),
      title,
      clientName: clients.join(" · "),
      brand: store.settings.brand,
      createdAt: new Date().toISOString(),
      start,
      end,
      notes,
      rows: rows.map((a) => ({
        ...structuredClone(a),
        accountName:
          store.accounts.find((c) => c.id === a.accountId)?.name ||
          "Sin cuenta",
      })),
    };
  }
  const shown = snapshot?.rows || rows;
  async function pdf(r: Report) {
    setBusy(true);
    try {
      await exportPDF(r);
      notify("PDF descargado.");
    } catch {
      notify("No se pudo crear el PDF. Inténtalo nuevamente.");
    }
    setBusy(false);
  }
  return (
    <>
      <SectionHead
        eyebrow="RESULTADOS QUE SE ENTIENDEN"
        title="Tu trabajo, bien contado."
        description="Transforma tus análisis en reportes claros y listos para compartir."
      />
      <div className="report-grid">
        <section className="card calculator-form">
          <div className="card-top">
            <h2>Preparar reporte</h2>
            <FileText className="purple" />
          </div>
          <p className="muted">
            Utiliza los filtros superiores para elegir cliente, red y período.
          </p>
          <Field label="Título del reporte">
            <input
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Observaciones y próximos pasos">
            <textarea
              value={notes}
              rows={7}
              maxLength={12000}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qué cambió, qué aprendiste y qué acciones propones. Añade contexto sin atribuir causas que no puedas demostrar."
            />
          </Field>
          <div className="notice">
            <FileText size={17} />
            <span>
              {rows.length} análisis seleccionados · {rows.length - incomplete}{" "}
              completos. Los métodos y redes se presentan por separado.
            </span>
          </div>
          {incomplete > 0 && (
            <label className="check">
              <input
                type="checkbox"
                checked={partial}
                onChange={(e) => setPartial(e.target.checked)}
              />
              Entregar como parcial, identificando los datos faltantes
            </label>
          )}
          {multipleClients && (
            <p className="notice">
              Selecciona un solo cliente en los filtros para crear un reporte de
              entrega. Puedes exportar todos los datos en CSV para tu uso
              interno.
            </p>
          )}
          <div className="button-stack">
            <button
              className="primary"
              disabled={
                busy ||
                !rows.length ||
                multipleClients ||
                !title.trim() ||
                (incomplete > 0 && !partial)
              }
              onClick={() => pdf(snapshot || create())}
            >
              <Download size={17} />
              Descargar PDF
            </button>
            <button
              className="secondary"
              disabled={
                busy ||
                !rows.length ||
                multipleClients ||
                !title.trim() ||
                (incomplete > 0 && !partial)
              }
              onClick={async () => {
                setBusy(true);
                const r = create();
                if (
                  await commit({ ...store, reports: [r, ...store.reports] })
                ) {
                  setSnapshot(r);
                  notify("Versión del reporte guardada.");
                }
                setBusy(false);
              }}
            >
              <Save size={17} />
              Guardar versión del reporte
            </button>
            <button
              className="secondary"
              disabled={!rows.length}
              onClick={() =>
                download(
                  exportCSV(rows),
                  "metricas.csv",
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={17} />
              Exportar datos CSV
            </button>
            <button
              className="text-button"
              disabled={!rows.length || multipleClients}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${title}\n\n${rows.map(summary).join("\n\n")}\n\n${notes}`,
                  );
                  notify("Reporte copiado.");
                } catch {
                  notify(
                    "Selecciona el texto de la vista previa para copiarlo.",
                  );
                }
              }}
            >
              <Copy size={17} />
              Copiar texto del reporte
            </button>
          </div>
        </section>
        <section className="card report-preview">
          <div className="card-top">
            <span className="eyebrow">
              {snapshot ? "VERSIÓN GUARDADA" : "VISTA PREVIA"}
            </span>
            {snapshot && (
              <button className="text-button" onClick={() => setSnapshot(null)}>
                Volver al borrador
              </button>
            )}
          </div>
          <div className="report-brand">
            <span className="brand-mark small">m.</span>
            {snapshot?.brand || store.settings.brand}
          </div>
          <h2>{snapshot?.title || title}</h2>
          <p>
            {snapshot
              ? `${snapshot.start} → ${snapshot.end}`
              : `${start} → ${end}`}
          </p>
          {shown.length ? (
            shown.map((a) => (
              <div className="report-item" key={a.id}>
                <PlatformTag platform={a.platform} />
                <h3>{a.title}</h3>
                <strong>{fmt(calculate(a.method, a.metrics).value)} %</strong>
                <p>{methodById(a.method)?.label}</p>
                <small>
                  {a.start} → {a.end} · {a.source}
                </small>
                {calculate(a.method, a.metrics).error && (
                  <p className="error">
                    Datos incompletos: {calculate(a.method, a.metrics).error}
                  </p>
                )}
              </div>
            ))
          ) : (
            <Empty title="Tu próximo reporte empieza con un análisis">
              Guarda tu primera publicación o importa tus datos para verlos
              aquí.
            </Empty>
          )}
          {(snapshot?.notes || notes) && (
            <div className="report-notes">
              <h3>Observaciones y próximos pasos</h3>
              <p>{snapshot?.notes || notes}</p>
            </div>
          )}
          <div className="report-footer">
            Cada resultado incluye su fórmula, fuente y período en el PDF. El
            engagement no equivale a ventas.
          </div>
        </section>
      </div>
      <section className="card history-card">
        <div className="card-top">
          <h2>Versiones guardadas</h2>
          <span className="counter">{store.reports.length}</span>
        </div>
        {store.reports.length ? (
          store.reports.map((r) => (
            <div className="saved-report" key={r.id}>
              <FileText size={22} />
              <div>
                <strong>{r.title}</strong>
                <small>
                  {r.clientName} · {r.start} → {r.end}
                </small>
              </div>
              <button className="text-button" onClick={() => setSnapshot(r)}>
                Ver versión
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => pdf(r)}
              >
                <Download size={15} />
                PDF
              </button>
              <button
                className="icon-button"
                aria-label={`Eliminar reporte ${r.title}`}
                onClick={() => {
                  if (
                    confirm(
                      "¿Eliminar esta versión guardada? Los análisis originales se conservan.",
                    )
                  )
                    void commit({
                      ...store,
                      reports: store.reports.filter((x) => x.id !== r.id),
                    });
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="muted">
            Guarda una versión para conservar exactamente los datos y notas que
            entregaste.
          </p>
        )}
      </section>
    </>
  );
}
export function Importer({
  store,
  commit,
  notify,
}: {
  store: Store;
  commit: (s: Store) => Promise<boolean>;
  notify: (s: string) => void;
}) {
  const [accountId, setAccountId] = useState("");
  const [preview, setPreview] = useState<{
    rows: Analysis[];
    errors: string[];
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filename, setFilename] = useState("");
  const [batch, setBatch] = useState("");
  const accounts = store.accounts.filter(
    (a) =>
      !a.archived && !store.clients.find((c) => c.id === a.clientId)?.archived,
  );
  const selected = accounts.find((a) => a.id === accountId);
  const duplicate = (a: Analysis, i: number) =>
    store.analyses.some((x) => fingerprint(x) === fingerprint(a)) ||
    !!preview?.rows.slice(0, i).some((x) => fingerprint(x) === fingerprint(a));
  const valid =
    preview?.rows.filter(
      (a, i) =>
        !duplicate(a, i) &&
        a.platform === selected?.platform &&
        (!methodById(a.method)?.pageOnly || selected?.type === "business"),
    ) || [];
  async function file(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setPreview(null);
    try {
      if (f.size > 5_000_000) throw new Error("Máximo 5 MB.");
      const id = uid();
      setBatch(id);
      setFilename(f.name);
      setPreview(importCSV(await f.text(), accountId, id));
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <>
      <SectionHead
        eyebrow="MENOS TRABAJO MANUAL"
        title="Tus datos, en un solo paso."
        description="Importa la plantilla CSV y revisa cada registro antes de guardarlo."
      />
      <div className="two-cols">
        <section className="card calculator-form">
          <div className="card-top">
            <h2>1. Prepara tu archivo</h2>
            <Download size={21} />
          </div>
          <p className="muted">
            La plantilla incluye una fila didáctica de TikTok. Sustitúyela por
            tus datos. Usa enteros sin separadores y fechas AAAA-MM-DD.
          </p>
          <button
            className="secondary"
            onClick={() =>
              download(
                templateCSV,
                "plantilla-metricas.csv",
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={17} />
            Descargar plantilla CSV
          </button>
          <details className="details">
            <summary>Guía de columnas y métodos</summary>
            <p>
              platform: instagram, tiktok o linkedin. mode: post o period.
              scope: organic, paid o mixed. timing: activity o lifetime. format:
              post, video o carousel.
            </p>
            <p>
              method: ig-reach, ig-views, ig-followers, tt-views, tt-extended,
              tt-followers, li-social, li-page o li-followers. Deja vacías las
              métricas desconocidas. postId identifica el contenido; title es su
              nombre.
            </p>
            <p>
              Una plantilla por cuenta. Los datos de otra red y los duplicados
              se omiten. No se importan automáticamente archivos nativos de las
              plataformas.
            </p>
          </details>
        </section>
        <section className="card calculator-form">
          <div className="card-top">
            <h2>2. Elige el destino</h2>
            <Upload size={21} />
          </div>
          <Field label="Cuenta de destino">
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                setPreview(null);
              }}
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {store.clients.find((c) => c.id === a.clientId)?.name} ·{" "}
                  {a.name} ({a.platform})
                </option>
              ))}
            </select>
          </Field>
          <label className={`upload-zone ${!accountId ? "disabled" : ""}`}>
            <Upload size={26} />
            <strong>Seleccionar archivo CSV</strong>
            <span>Hasta 5 MB · datos separados por comas o punto y coma</span>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={!accountId || busy}
              onChange={file}
            />
          </label>
        </section>
      </div>
      {preview && (
        <section className="card history-card">
          <div className="card-top">
            <div>
              <h2>3. Revisa antes de importar</h2>
              <p>
                {filename} · {valid.length} nuevos compatibles ·{" "}
                {preview.rows.length - valid.length} duplicados o incompatibles
                · {preview.errors.length} filas inválidas
              </p>
            </div>
            <button
              className="primary"
              disabled={busy || valid.length === 0}
              onClick={async () => {
                setBusy(true);
                if (
                  await commit({
                    ...store,
                    analyses: [...valid, ...store.analyses],
                  })
                ) {
                  notify(`${valid.length} análisis importados.`);
                  setPreview(null);
                }
                setBusy(false);
              }}
            >
              <CheckCircle2 size={17} />
              {busy ? "Importando…" : `Importar ${valid.length} registros`}
            </button>
          </div>
          {preview.errors.length > 0 && (
            <div className="error-list" role="alert">
              {preview.errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Contenido</th>
                  <th>Red</th>
                  <th>Período</th>
                  <th>Resultado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 100).map((a, i) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.platform}</td>
                    <td>
                      {a.start} → {a.end}
                    </td>
                    <td>{fmt(calculate(a.method, a.metrics).value)} %</td>
                    <td>
                      {duplicate(a, i)
                        ? "Omitir: duplicado"
                        : !valid.includes(a)
                          ? "Omitir: incompatible"
                          : calculate(a.method, a.metrics).error
                            ? "Importar incompleto"
                            : "Listo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.rows.length > 100 && (
            <p className="muted">
              Vista previa de las primeras 100 filas; se procesará el total
              indicado.
            </p>
          )}
        </section>
      )}
      {batch && store.analyses.some((a) => a.batchId === batch) && (
        <div className="notice">
          <CheckCircle2 size={18} />
          <span>Último lote guardado.</span>
          <button
            className="text-button"
            onClick={async () => {
              if (
                confirm(
                  "¿Revertir el último lote? Solo se eliminarán los registros de esta importación.",
                )
              ) {
                if (
                  await commit({
                    ...store,
                    analyses: store.analyses.filter((a) => a.batchId !== batch),
                  })
                )
                  notify("Importación revertida.");
              }
            }}
          >
            Revertir importación
          </button>
        </div>
      )}
    </>
  );
}
