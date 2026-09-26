"use client";
import { useEffect, useState } from "react";
import {
  Copy,
  Save,
  Sparkles,
  Info,
  RotateCcw,
  ArrowRight,
  Target,
  Check,
} from "lucide-react";
import {
  emptyMetrics,
  fieldLabels,
  localDate,
  platforms,
  uid,
  type Analysis,
  type Platform,
  type Store,
} from "@/domain/model";
import {
  calculate,
  fmt,
  methods,
  methodById,
  summary,
  businessMethods,
  businessCalculate,
  type BusinessKey,
} from "@/domain/metrics";
import { Field, Gauge, PlatformIcon, SectionHead } from "./ui";
export function initialAnalysis(platform: Platform = "instagram"): Analysis {
  return {
    id: uid(),
    accountId: "",
    campaignId: "",
    title: "",
    postId: "",
    platform,
    method: methods.find((m) => m.platform === platform)!.id,
    methodVersion: 1,
    start: localDate(),
    end: localDate(),
    capturedAt: new Date().toISOString(),
    mode: "post",
    scope: "organic",
    timing: "lifetime",
    format: platform === "tiktok" ? "video" : "post",
    source: "Registro manual",
    notes: "",
    metrics: emptyMetrics(),
    goal: null,
  };
}
export default function Calculator({
  store,
  onSave,
  notify,
  initial,
  onClient,
  onDirty,
}: {
  store: Store;
  onSave: (a: Analysis) => Promise<boolean>;
  notify: (s: string) => void;
  initial?: Analysis;
  onClient: () => void;
  onDirty: (v: boolean) => void;
}) {
  const [a, setA] = useState<Analysis>(() =>
    initial ? structuredClone(initial) : initialAnalysis(),
  );
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"social" | "business">("social");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  function patch(v: Partial<Analysis>) {
    setDirty(true);
    setError("");
    setA((old) => ({ ...old, ...v }));
  }
  const m = methodById(a.method)!;
  const r = calculate(a.method, a.metrics);
  const account = store.accounts.find((x) => x.id === a.accountId);
  const client = store.clients.find((x) => x.id === account?.clientId);
  async function save() {
    setError("");
    if (!a.title.trim()) {
      setError("Escribe un nombre para identificar este análisis.");
      return;
    }
    if (!a.accountId) {
      setError(
        "Elige una cuenta para guardar el análisis. Puedes crearla en Clientes.",
      );
      return;
    }
    if (a.start > a.end) {
      setError("La fecha final debe ser posterior o igual a la inicial.");
      return;
    }
    setBusy(true);
    if (await onSave({ ...a, capturedAt: new Date().toISOString() })) {
      setDirty(false);
    }
    setBusy(false);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary(a));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify(
        "No se pudo acceder al portapapeles. Selecciona y copia el texto del resumen.",
      );
    }
  }
  function changePlatform(p: Platform) {
    if (
      dirty &&
      !confirm(
        "Cambiar de red limpiará las métricas de este formulario. ¿Continuar?",
      )
    )
      return;
    setA(initialAnalysis(p));
    setDirty(false);
    setError("");
  }
  const fields = [...m.fields, m.denominator];
  return (
    <>
      <SectionHead
        eyebrow="DE LOS DATOS A LAS DECISIONES"
        title="Cada interacción cuenta."
        description="Calcula con precisión. Entiende el resultado. Comparte el valor."
      />
      <div className="mode-tabs">
        <button
          className={tab === "social" ? "active" : ""}
          onClick={() => setTab("social")}
        >
          Engagement de redes
        </button>
        <button
          className={tab === "business" ? "active" : ""}
          onClick={() => setTab("business")}
        >
          Indicadores de negocio <span className="tiny-badge">Extra</span>
        </button>
      </div>
      {tab === "business" ? (
        <Business currency={store.settings.currency} notify={notify} />
      ) : (
        <div className="calculator-grid">
          <section className="card calculator-form">
            <div className="card-top">
              <div>
                <h2>Tu contenido, en números</h2>
                <p>Elige una red para empezar.</p>
              </div>
              <span className="step-label">01 / DATOS</span>
            </div>
            <div className="platform-tabs">
              {(Object.keys(platforms) as Platform[]).map((p) => (
                <button
                  key={p}
                  className={a.platform === p ? "selected" : ""}
                  onClick={() => changePlatform(p)}
                  aria-pressed={a.platform === p}
                >
                  <PlatformIcon platform={p} />
                  {platforms[p]}
                </button>
              ))}
            </div>
            <div className="form-grid">
              <Field label="Cuenta del cliente">
                <select
                  value={a.accountId}
                  onChange={(e) => {
                    const acc = store.accounts.find(
                      (x) => x.id === e.target.value,
                    );
                    patch({
                      accountId: e.target.value,
                      campaignId: "",
                      method:
                        m.pageOnly && acc?.type !== "business"
                          ? "li-social"
                          : a.method,
                    });
                  }}
                >
                  <option value="">Cálculo rápido · sin guardar</option>
                  {store.accounts
                    .filter(
                      (x) =>
                        x.platform === a.platform &&
                        !x.archived &&
                        !store.clients.find((c) => c.id === x.clientId)
                          ?.archived,
                    )
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {store.clients.find((c) => c.id === x.clientId)?.name} ·{" "}
                        {x.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Tipo de análisis">
                <select
                  value={a.mode}
                  onChange={(e) =>
                    patch({
                      mode: e.target.value as Analysis["mode"],
                      timing:
                        e.target.value === "period" ? "activity" : "lifetime",
                      method:
                        e.target.value === "period" &&
                        m.denominator === "followers"
                          ? methods.find((x) => x.platform === a.platform)!.id
                          : a.method,
                    })
                  }
                >
                  <option value="post">Publicación individual</option>
                  <option value="period">Resumen de período</option>
                </select>
              </Field>
            </div>
            {!store.accounts.some((x) => x.platform === a.platform) && (
              <button className="text-button compact" onClick={onClient}>
                Crear una cuenta para guardar tus análisis{" "}
                <ArrowRight size={14} />
              </button>
            )}
            <Field label="Método de cálculo">
              <select
                value={a.method}
                onChange={(e) => patch({ method: e.target.value })}
              >
                {methods
                  .filter(
                    (x) =>
                      x.platform === a.platform &&
                      (!x.pageOnly || account?.type === "business") &&
                      (a.mode === "post" || x.denominator !== "followers"),
                  )
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
              </select>
            </Field>
            <div className="divider" />
            <div className="form-grid">
              <Field label="Nombre del análisis">
                <input
                  maxLength={200}
                  value={a.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Ej. Reel · Consejos para comprar"
                />
              </Field>
              <Field label="Formato">
                <select
                  value={a.format}
                  onChange={(e) =>
                    patch({ format: e.target.value as Analysis["format"] })
                  }
                >
                  <option value="post">Publicación</option>
                  <option value="video">Video / Reel</option>
                  <option value="carousel">Carrusel</option>
                </select>
              </Field>
              <Field label="Desde">
                <input
                  type="date"
                  required
                  value={a.start}
                  onChange={(e) =>
                    patch({
                      start: e.target.value,
                      end: a.mode === "post" ? e.target.value : a.end,
                    })
                  }
                />
              </Field>
              <Field label="Hasta">
                <input
                  type="date"
                  required
                  value={a.end}
                  onChange={(e) => patch({ end: e.target.value })}
                />
              </Field>
            </div>
            <div className="input-heading">
              <h3>Métricas de la publicación</h3>
              <span>Vacío ≠ cero</span>
            </div>
            <div className="form-grid metrics-inputs">
              {fields.map((k) => (
                <Field
                  key={k}
                  label={fieldLabels[k]}
                  help={
                    k === m.denominator
                      ? "Base de cálculo · mismo ámbito y fechas"
                      : undefined
                  }
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="Sin dato"
                    value={a.metrics[k] ?? ""}
                    onChange={(e) =>
                      patch({
                        metrics: {
                          ...a.metrics,
                          [k]:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        },
                      })
                    }
                  />
                </Field>
              ))}
            </div>
            <details className="details">
              <summary>Contexto, campaña y notas</summary>
              <div className="form-grid">
                <Field label="Ámbito">
                  <select
                    value={a.scope}
                    onChange={(e) =>
                      patch({ scope: e.target.value as Analysis["scope"] })
                    }
                  >
                    <option value="organic">Orgánico</option>
                    <option value="paid">Pagado</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </Field>
                <Field label="Criterio temporal">
                  <select
                    value={a.timing}
                    onChange={(e) =>
                      patch({ timing: e.target.value as Analysis["timing"] })
                    }
                  >
                    <option value="lifetime">
                      Acumulado a fecha de captura
                    </option>
                    <option value="activity">Actividad del período</option>
                  </select>
                </Field>
                <Field
                  label="ID o enlace de publicación"
                  help="Ayuda a identificar nuevas capturas del mismo contenido."
                >
                  <input
                    value={a.postId}
                    maxLength={500}
                    onChange={(e) => patch({ postId: e.target.value })}
                    placeholder="URL o identificador"
                  />
                </Field>
                <Field label="Fuente">
                  <input
                    value={a.source}
                    maxLength={200}
                    onChange={(e) => patch({ source: e.target.value })}
                  />
                </Field>
                <Field label="Campaña">
                  <select
                    value={a.campaignId}
                    onChange={(e) => patch({ campaignId: e.target.value })}
                  >
                    <option value="">Sin campaña</option>
                    {store.campaigns
                      .filter((c) => c.clientId === client?.id)
                      .map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </Field>
              </div>
              <Field label="Notas">
                <textarea
                  rows={3}
                  maxLength={10000}
                  value={a.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  placeholder="Contexto que quieras conservar para tu reporte"
                />
              </Field>
            </details>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button className="primary" disabled={busy} onClick={save}>
                <Save size={17} />
                {busy ? "Guardando…" : "Guardar análisis"}
              </button>
              <button
                className="icon-button"
                title="Limpiar formulario"
                aria-label="Limpiar formulario"
                onClick={() => {
                  if (
                    !dirty ||
                    confirm("¿Limpiar los cambios de este formulario?")
                  ) {
                    setA(initialAnalysis(a.platform));
                    setDirty(false);
                    setError("");
                  }
                }}
              >
                <RotateCcw size={18} />
              </button>
              <small>
                {dirty
                  ? "Cambios sin guardar"
                  : store.analyses.some((x) => x.id === a.id)
                    ? "Análisis guardado"
                    : "Cálculo privado"}
              </small>
            </div>
          </section>
          <aside className="result-column">
            <section className="card result-card">
              <div className="card-top">
                <h2>Tu resultado</h2>
                <span className="live-pill">
                  <i />
                  En tiempo real
                </span>
              </div>
              <Gauge value={r.value} goal={a.goal} />
              <p className="method-label">{m.label}</p>
              <div className="result-stats">
                <div>
                  <span>Interacciones</span>
                  <strong>{fmt(r.interactions, 0)}</strong>
                </div>
                <div>
                  <span>{fieldLabels[m.denominator]}</span>
                  <strong>{fmt(r.denominator, 0)}</strong>
                </div>
              </div>
              {r.error ? (
                <div className="notice">
                  <Info size={17} />
                  <span>{r.error}</span>
                </div>
              ) : (
                <div className="notice success">
                  <Check size={17} />
                  <span>
                    {a.goal
                      ? r.value! >= a.goal
                        ? "Alcanzaste tu meta personal."
                        : `Faltan ${fmt(a.goal - r.value!)} puntos porcentuales para tu meta.`
                      : "Resultado listo. Añade una meta para ponerlo en perspectiva."}
                    {r.value! > 100
                      ? " La tasa supera 100 %: una persona puede generar varias acciones."
                      : ""}
                  </span>
                </div>
              )}
              <Field label="Tu meta de engagement (%) · opcional">
                <div className="input-icon">
                  <Target size={16} />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={a.goal ?? ""}
                    placeholder="Ej. 5"
                    onChange={(e) =>
                      patch({
                        goal:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </Field>
              <button
                className="primary full"
                disabled={r.value === null}
                onClick={copy}
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
                {copied
                  ? "Resumen copiado"
                  : "Copiar resultado para mi reporte"}
              </button>
              <details className="details">
                <summary>Ver fórmula y texto del reporte</summary>
                <p className="formula">
                  ({m.fields.map((k) => fieldLabels[k]).join(" + ")}) ÷{" "}
                  {fieldLabels[m.denominator]} × 100
                </p>
                <p className="selectable">{summary(a)}</p>
                <small>
                  {m.official
                    ? "Método documentado para páginas de LinkedIn."
                    : "Definición analítica de esta herramienta; no es un benchmark oficial."}
                </small>
              </details>
            </section>
            <div className="insight-card">
              <span className="insight-icon">
                <Sparkles size={21} />
              </span>
              <div>
                <h3>Un número es solo el comienzo.</h3>
                <p>
                  Compara la misma cuenta y el mismo método a lo largo del
                  tiempo. Así conviertes métricas en decisiones.
                </p>
              </div>
            </div>
            <div className="privacy-note">
              <span className="status-dot" />
              Tus datos se guardan en este navegador.
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
function Business({
  currency,
  notify,
}: {
  currency: string;
  notify: (s: string) => void;
}) {
  const [key, setKey] = useState<BusinessKey>("conversion");
  const [values, setValues] = useState<(number | null)[]>([null, null]);
  const [context, setContext] = useState("");
  const m = businessMethods[key];
  const result = businessCalculate(key, values);
  const text =
    result === null
      ? "—"
      : m.unit === "money"
        ? new Intl.NumberFormat("es-EC", {
            style: "currency",
            currency,
          }).format(result)
        : `${fmt(result)} ${m.unit}`;
  const report = `${m.label}: ${text}. ${m.formula}. Datos: ${m.fields.map((f, i) => `${f}: ${values[i] ?? "sin dato"}`).join("; ")}. Contexto: ${context || "No especificado"}.`;
  return (
    <div className="calculator-grid">
      <section className="card calculator-form">
        <div className="card-top">
          <div>
            <h2>Del contenido al negocio</h2>
            <p>Calcula con los datos reales de tu campaña.</p>
          </div>
          <Sparkles className="purple" />
        </div>
        <Field label="Indicador">
          <select
            value={key}
            onChange={(e) => {
              const k = e.target.value as BusinessKey;
              setKey(k);
              setValues(businessMethods[k].fields.map(() => null));
            }}
          >
            {Object.entries(businessMethods).map(([k, m]) => (
              <option key={k} value={k}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          {m.fields.map((f, i) => (
            <Field key={f} label={f}>
              <input
                type="number"
                step="any"
                min={key === "roi" && i === 0 ? undefined : 0}
                value={values[i] ?? ""}
                placeholder="Sin dato"
                onChange={(e) =>
                  setValues((v) =>
                    v.map((n, j) =>
                      i === j
                        ? e.target.value === ""
                          ? null
                          : Number(e.target.value)
                        : n,
                    ),
                  )
                }
              />
            </Field>
          ))}
        </div>
        <Field label="Cliente, período y criterio de atribución">
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            placeholder="Ej. Cliente A · septiembre · ventas atribuidas por UTM. La contribución ya descuenta costos de producto, pero no la campaña."
          />
        </Field>
        <div className="notice">
          <Info size={17} />
          <span>
            Calculadora independiente: no modifica tu historial de engagement.
            Copia el resultado para incorporarlo a las observaciones del
            reporte.
          </span>
        </div>
      </section>
      <section className="card business-result">
        <span className="eyebrow">{m.label}</span>
        <strong>{text}</strong>
        <p className="formula">{m.formula}</p>
        <p>
          {key === "roi"
            ? "La contribución debe descontar costos de venta antes del costo de campaña. No restes la campaña dos veces."
            : key === "roas"
              ? "El ROAS mide ingresos atribuidos por unidad de gasto; no representa beneficio neto."
              : key.startsWith("clv")
                ? "Estimación con frecuencia y duración constantes. No sustituye un modelo de retención."
                : "Usa el mismo período, población y moneda para todos los datos."}
        </p>
        {result === null && (
          <p className="notice">
            Completa valores válidos. Los denominadores deben ser mayores que
            cero.
          </p>
        )}
        <button
          className="primary"
          disabled={result === null}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(report);
              notify("Resultado de negocio copiado.");
            } catch {
              notify("Selecciona y copia el texto del resultado.");
            }
          }}
        >
          <Copy size={17} />
          Copiar resultado
        </button>
        <details className="details">
          <summary>Texto para el reporte</summary>
          <p className="selectable">{report}</p>
        </details>
      </section>
    </div>
  );
}
