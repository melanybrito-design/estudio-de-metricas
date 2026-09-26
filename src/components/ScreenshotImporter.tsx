"use client";
import { useEffect, useRef, useState } from "react";
import {
  ScanLine,
  Upload,
  LoaderCircle,
  CheckCircle2,
  ImagePlus,
  X,
} from "lucide-react";
import {
  fieldLabels,
  type Analysis,
  type Field,
  type Metrics,
} from "@/domain/model";
import {
  mapScreenshot,
  reviewedMetrics,
  screenshotFields,
  type MetricCandidate,
} from "@/domain/screenshot";
import { validDate } from "@/domain/validation";
import { readScreenshot } from "@/lib/screenshot";
import { Field as FormField } from "./ui";
export type ScreenshotImport = {
  metrics: Metrics;
  start: string;
  end: string;
  mode: Analysis["mode"];
  scope: Analysis["scope"];
  notes: string;
  source: string;
};
export default function ScreenshotImporter({
  onApply,
}: {
  onApply: (data: ScreenshotImport) => void;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(""),
    [filename, setFilename] = useState(""),
    [error, setError] = useState("");
  const [candidates, setCandidates] = useState<MetricCandidate[]>([]),
    [values, setValues] = useState<Partial<Record<Field, string>>>({});
  const [raw, setRaw] = useState(""),
    [checked, setChecked] = useState(false),
    [applied, setApplied] = useState(false);
  const [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [mode, setMode] = useState<Analysis["mode"]>("period"),
    [scope, setScope] = useState<Analysis["scope"]>("mixed");
  const controller = useRef<AbortController | null>(null),
    run = useRef(0),
    input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      run.current++;
      controller.current?.abort();
    },
    [],
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function reset() {
    run.current++;
    controller.current?.abort();
    setBusy(false);
    setPreview("");
    setCandidates([]);
    setRaw("");
    setValues({});
    setChecked(false);
    setApplied(false);
    setError("");
    setStart("");
    setEnd("");
    if (input.current) input.current.value = "";
  }
  async function read(file: File) {
    reset();
    const id = ++run.current;
    setFilename(file.name);
    setProgress(0);
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 12 * 1024 * 1024
    ) {
      setError("Selecciona una imagen PNG, JPG o WebP de hasta 12 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await readScreenshot(
        file,
        (p) => {
          if (run.current === id) setProgress(p);
        },
        abort.signal,
      );
      if (run.current !== id) return;
      const mapped = mapScreenshot(result.lines);
      setRaw(result.text);
      setCandidates(mapped);
      setValues(
        Object.fromEntries(
          mapped.map((c) => [c.field, c.value === null ? "" : String(c.value)]),
        ),
      );
    } catch (e) {
      if (run.current === id) setError((e as Error).message);
    } finally {
      if (run.current === id) setBusy(false);
    }
  }
  function apply() {
    try {
      if (!checked)
        throw new Error(
          "Revisa los valores y confirma la casilla antes de aplicar.",
        );
      if (!validDate(start) || !validDate(end) || start > end)
        throw new Error("Indica las fechas reales de la captura en orden.");
      const metrics = reviewedMetrics(values);
      if (!Object.values(metrics).some((v) => v !== null))
        throw new Error("Introduce al menos una métrica observada.");
      const approximations = candidates
        .filter((c) => c.approximate && metrics[c.field] === c.value)
        .map((c) => fieldLabels[c.field]);
      onApply({
        metrics,
        start,
        end,
        mode,
        scope,
        source: candidates.some((c) => c.value !== null)
          ? "Captura de Instagram · OCR revisado"
          : "Captura de Instagram · transcripción manual revisada",
        notes: `Datos transcritos de una captura y revisados antes de aplicar.${approximations.length ? ` Valores aproximados por abreviación en la captura: ${approximations.join(", ")}. No interpretar como conteos exactos.` : ""}`,
      });
      setApplied(true);
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="screenshot-import">
      <button
        className="screenshot-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="screenshot-panel"
      >
        <span className="screenshot-icon">
          <ScanLine size={22} />
        </span>
        <span>
          <strong>
            {applied
              ? "Captura aplicada a tus métricas"
              : "Empieza con una captura de Instagram"}
          </strong>
          <small>Sube · revisa · prepara tu informe</small>
        </span>
        <ImagePlus size={20} />
      </button>
      {open && (
        <div id="screenshot-panel" className="screenshot-panel">
          <p>
            Lee etiquetas en español o inglés. La imagen se procesa en este
            navegador y no se guarda en tu historial. Una captura por análisis;
            no combines cuentas ni períodos.
          </p>
          <label className="screenshot-upload">
            <Upload size={20} />
            <span>
              {preview ? "Cambiar captura" : "Seleccionar captura"}
              <small>PNG, JPG o WebP · máximo 12 MB</small>
            </span>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Subir captura de Instagram"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void read(f);
              }}
            />
          </label>
          {busy && (
            <div role="status" className="ocr-progress">
              <LoaderCircle className="spin" size={18} />
              <span>
                Leyendo la captura… {progress}%
                <small>
                  La primera lectura descarga el motor. Puede tardar un momento.
                </small>
              </span>
              <button
                className="text-button"
                onClick={() => controller.current?.abort()}
              >
                Cancelar
              </button>
            </div>
          )}
          {preview && (
            <details className="screenshot-preview" open={!candidates.length}>
              <summary>Ver captura: {filename}</summary>
              <img
                src={preview}
                alt="Captura de estadísticas seleccionada para revisar"
              />
            </details>
          )}
          {error && !candidates.length && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          {!!preview && !busy && (
            <>
              {candidates.length === 0 ? (
                <button
                  className="secondary"
                  onClick={() => {
                    setCandidates(mapScreenshot([]));
                    setValues({});
                    setError("");
                  }}
                >
                  Completar métricas mirando la imagen
                </button>
              ) : (
                <>
                  <div className="review-heading">
                    <span className="eyebrow">02 / REVISA LOS DATOS</span>
                    <h3>
                      {candidates.filter((c) => c.value !== null).length}{" "}
                      métricas propuestas
                    </h3>
                    <p>
                      Confirma cada valor con la imagen. Las etiquetas ausentes,
                      los iconos sin texto y los números ambiguos quedan vacíos.
                      Vacío no significa cero.
                    </p>
                  </div>
                  <div className="ocr-metrics">
                    {candidates.map((c) => (
                      <div className="ocr-metric" key={c.field}>
                        <FormField label={fieldLabels[c.field]}>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Sin dato"
                            value={values[c.field] ?? ""}
                            onChange={(e) => {
                              setValues((v) => ({
                                ...v,
                                [c.field]: e.target.value,
                              }));
                              setChecked(false);
                              setError("");
                            }}
                          />
                        </FormField>
                        <small
                          className={
                            c.value === null || c.approximate
                              ? "ocr-warning"
                              : ""
                          }
                        >
                          {c.warning}
                        </small>
                        <details>
                          <summary>Texto detectado</summary>
                          <p>{c.evidence}</p>
                        </details>
                      </div>
                    ))}
                  </div>
                  <div className="form-grid">
                    <FormField label="La captura corresponde a">
                      <select
                        value={mode}
                        onChange={(e) => {
                          setMode(e.target.value as Analysis["mode"]);
                          setChecked(false);
                        }}
                      >
                        <option value="period">
                          Resumen de la cuenta en un período
                        </option>
                        <option value="post">Una publicación / Reel</option>
                      </select>
                    </FormField>
                    <FormField label="Distribución de la captura">
                      <select
                        value={scope}
                        onChange={(e) => {
                          setScope(e.target.value as Analysis["scope"]);
                          setChecked(false);
                        }}
                      >
                        <option value="organic">Solo orgánico</option>
                        <option value="paid">Solo pagado</option>
                        <option value="mixed">Mixto / sin desglose</option>
                      </select>
                    </FormField>
                    <FormField label="Inicio del período de la captura">
                      <input
                        type="date"
                        value={start}
                        onChange={(e) => {
                          setStart(e.target.value);
                          setChecked(false);
                        }}
                      />
                    </FormField>
                    <FormField label="Fin del período de la captura">
                      <input
                        type="date"
                        value={end}
                        onChange={(e) => {
                          setEnd(e.target.value);
                          setChecked(false);
                        }}
                      />
                    </FormField>
                  </div>
                  <p className="export-hint">
                    Escribe las fechas que ves en Instagram. En una publicación,
                    usa su fecha o el intervalo medido; los datos se marcarán
                    como acumulados a la captura. Alcance, vistas y seguidores
                    son bases diferentes.
                  </p>
                  <label className="review-confirm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                    />
                    <span>
                      Revisé los números, las fechas y el ámbito. Aplicarlos
                      reemplazará las métricas, el contexto y las notas del
                      cálculo actual.
                    </span>
                  </label>
                  {error && (
                    <p className="notice" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    className="primary full"
                    disabled={!checked}
                    onClick={apply}
                  >
                    <CheckCircle2 size={17} />
                    Aplicar métricas revisadas
                  </button>
                  <details className="ocr-raw">
                    <summary>Ver toda la lectura de texto</summary>
                    <pre>{raw || "No se detectó texto legible."}</pre>
                  </details>
                </>
              )}
            </>
          )}
          {preview && (
            <button className="text-button" onClick={reset}>
              <X size={14} />
              Quitar imagen y lectura
            </button>
          )}
        </div>
      )}
    </section>
  );
}
