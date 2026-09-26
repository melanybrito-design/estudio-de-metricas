"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Calculator as CalculatorIcon,
  Users,
  FileText,
  Settings,
  Upload,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Download,
  Check,
  X,
  Search,
  Trash2,
  Pencil,
  Heart,
  BarChart3,
  Layers,
  Clock3,
  Menu,
  SlidersHorizontal,
  Database,
  Info,
} from "lucide-react";
import {
  emptyStore,
  fieldLabels,
  localDate,
  platforms,
  uid,
  type Store,
  type Analysis,
  type Platform,
} from "@/domain/model";
import {
  aggregate,
  calculate,
  delta,
  fmt,
  groupKey,
  methodById,
} from "@/domain/metrics";
import { validateStore } from "@/domain/validation";
import { loadStore, saveStore } from "@/lib/storage";
import { backup, download, readBackup } from "@/lib/export";
import { exportCSV } from "@/domain/csv";
import Calculator, { initialAnalysis } from "./Calculator";
import Clients from "./Clients";
import Reports, { Importer } from "./Reports";
import { Empty, Field, Gauge, PlatformTag, SectionHead } from "./ui";
type Page =
  | "overview"
  | "calculator"
  | "clients"
  | "reports"
  | "imports"
  | "settings";
const nav = [
  { id: "overview" as Page, label: "Resumen", icon: LayoutDashboard },
  { id: "calculator" as Page, label: "Calculadora", icon: CalculatorIcon },
  { id: "clients" as Page, label: "Clientes", icon: Users },
  { id: "reports" as Page, label: "Reportes", icon: FileText },
];
export default function Workspace() {
  const [store, setStore] = useState<Store>(emptyStore);
  const [loaded, setLoaded] = useState(false);
  const [fatal, setFatal] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<Page>("overview");
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const [client, setClient] = useState("");
  const [platform, setPlatform] = useState("");
  const [account, setAccount] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [initial, setInitial] = useState<Analysis | undefined>();
  const [calcKey, setCalcKey] = useState(0);
  const lock = useRef(false);
  const [datePreset, setDatePreset] = useState("all");
  const dirty = useRef(false);
  const onDirty = useCallback((v: boolean) => {
    dirty.current = v;
  }, []);
  useEffect(() => {
    loadStore()
      .then((s) => {
        setStore(s);
        setLoaded(true);
      })
      .catch(() => {
        setFatal(
          "No pudimos abrir tu almacenamiento. No se sobrescribirán tus datos. Permite el almacenamiento del navegador o prueba con otro perfil.",
        );
        setLoaded(true);
      });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (lock.current || dirty.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const notify = (s: string) => setToast(s);
  async function commit(next: Store) {
    if (lock.current) {
      notify("Espera a que termine el guardado actual.");
      return false;
    }
    if (fatal) {
      notify(
        "El almacenamiento no está disponible. Descarga un respaldo o recarga antes de continuar.",
      );
      return false;
    }
    lock.current = true;
    setSaving(true);
    try {
      validateStore(next);
      await saveStore(next);
      setStore(next);
      return true;
    } catch (e) {
      notify(`No se guardó el cambio: ${(e as Error).message}`);
      return false;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  function navigate(p: Page) {
    if (
      dirty.current &&
      !confirm(
        "Hay cambios sin guardar en la calculadora. ¿Salir de este formulario?",
      )
    )
      return;
    dirty.current = false;
    setPage(p);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function newAnalysis(accountId?: string) {
    if (
      dirty.current &&
      !confirm("Hay cambios sin guardar. ¿Empezar un nuevo análisis?")
    )
      return;
    dirty.current = false;
    const acc = store.accounts.find((a) => a.id === accountId);
    const a = initialAnalysis(acc?.platform || "instagram");
    if (acc) a.accountId = acc.id;
    setInitial(a);
    setCalcKey((k) => k + 1);
    navigate("calculator");
  }
  function edit(a: Analysis) {
    setInitial(a);
    setCalcKey((k) => k + 1);
    navigate("calculator");
  }
  const accounts = store.accounts.filter(
    (a) => !client || a.clientId === client,
  );
  const rows = store.analyses.filter(
    (a) =>
      (!client || accounts.some((x) => x.id === a.accountId)) &&
      (!account || a.accountId === account) &&
      (!platform || a.platform === platform) &&
      (!start || a.start >= start) &&
      (!end || a.end <= end),
  );
  const actualStart =
    start || rows.map((r) => r.start).sort()[0] || localDate();
  const actualEnd =
    end ||
    rows
      .map((r) => r.end)
      .sort()
      .at(-1) ||
    localDate();
  function period(p: string) {
    setDatePreset(p);
    const now = new Date();
    if (p === "all") {
      setStart("");
      setEnd("");
    } else if (p === "month") {
      setStart(localDate().slice(0, 7) + "-01");
      setEnd(localDate());
    } else if (p === "last") {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      const f = (x: Date) =>
        `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
      setStart(f(d));
      setEnd(f(e));
    }
  }
  if (!loaded)
    return (
      <div className="loading">
        <span className="brand-mark">m.</span>
        <p>Abriendo tu espacio de métricas…</p>
      </div>
    );
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      {menu && (
        <button
          className="sidebar-shade"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-mark">m.</span>
          <div>
            <strong>
              estudio<span>de métricas</span>
            </strong>
          </div>
        </a>
        <div className="workspace-label">
          <span className="status-dot" />
          ESPACIO PERSONAL
        </div>
        <nav aria-label="Navegación principal">
          {nav.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() =>
                item.id === "calculator" ? newAnalysis() : navigate(item.id)
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.id === "calculator" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="nav-divider" />
        <span className="nav-label">HERRAMIENTAS</span>
        <nav aria-label="Herramientas">
          <button
            className={page === "imports" ? "active" : ""}
            onClick={() => navigate("imports")}
          >
            <Upload size={19} />
            Importar datos
          </button>
          <button
            className={page === "settings" ? "active" : ""}
            onClick={() => navigate("settings")}
          >
            <Settings size={19} />
            Configuración
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="local-card">
            <ShieldCheck size={23} />
            <strong>Tu trabajo, tu espacio.</strong>
            <p>Tus datos permanecen en este navegador.</p>
            <button onClick={() => navigate("settings")}>
              Gestionar respaldo <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="profile">
            <span>MB</span>
            <div>
              <strong>{store.settings.brand}</strong>
              <small>Mi espacio de trabajo</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={menu}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Abrir menú"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Mi espacio</span>
            <ChevronRight size={14} />
            <strong>
              {nav.find((n) => n.id === page)?.label ||
                (page === "imports" ? "Importar datos" : "Configuración")}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="save-status">
              <span className="status-dot" />
              {saving ? "Guardando…" : "Guardado local"}
            </span>
            <button
              className="avatar small-avatar"
              aria-label="Abrir configuración"
              onClick={() => navigate("settings")}
            >
              MB
            </button>
          </div>
        </header>
        <main id="main">
          {fatal && (
            <div className="error" role="alert">
              {fatal}
              <button className="secondary" onClick={() => location.reload()}>
                Reintentar
              </button>
            </div>
          )}
          {["overview", "reports"].includes(page) && (
            <div className="global-filters">
              <SlidersHorizontal size={17} />
              <select
                aria-label="Filtrar por cliente"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  setAccount("");
                }}
              >
                <option value="">Todos los clientes</option>
                {store.clients.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                    {c.archived ? " (archivado)" : ""}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar por red"
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setAccount("");
                }}
              >
                <option value="">Todas las redes</option>
                {Object.entries(platforms).map(([k, v]) => (
                  <option value={k} key={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar por cuenta"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              >
                <option value="">Todas las cuentas</option>
                {accounts
                  .filter((a) => !platform || a.platform === platform)
                  .map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
              <select
                aria-label="Seleccionar período"
                value={datePreset}
                onChange={(e) => period(e.target.value)}
              >
                <option value="all">Todo el historial</option>
                <option value="month">Este mes</option>
                <option value="last">Mes anterior</option>
                <option value="custom">Personalizado</option>
              </select>
              {datePreset === "custom" && (
                <>
                  <input
                    type="date"
                    aria-label="Inicio del filtro"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                  <input
                    type="date"
                    aria-label="Fin del filtro"
                    min={start}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </>
              )}
            </div>
          )}
          {page === "overview" && (
            <Overview
              store={store}
              rows={rows}
              onNew={() => newAnalysis()}
              onEdit={edit}
              onClients={() => navigate("clients")}
              onImport={() => navigate("imports")}
              onReports={() => navigate("reports")}
              commit={commit}
              notify={notify}
            />
          )}
          {page === "calculator" && (
            <Calculator
              key={calcKey}
              initial={initial}
              onDirty={onDirty}
              store={store}
              notify={notify}
              onClient={() => navigate("clients")}
              onSave={async (a) => {
                const exists = store.analyses.some((x) => x.id === a.id);
                const next = {
                  ...store,
                  analyses: exists
                    ? store.analyses.map((x) => (x.id === a.id ? a : x))
                    : [a, ...store.analyses],
                };
                const ok = await commit(next);
                if (ok)
                  notify(
                    exists
                      ? "Análisis actualizado."
                      : "Análisis guardado en el historial del cliente.",
                  );
                return ok;
              }}
            />
          )}
          {page === "clients" && (
            <Clients
              store={store}
              commit={commit}
              notify={notify}
              onAnalyze={newAnalysis}
            />
          )}{" "}
          {page === "reports" && (
            <Reports
              key={[client, account, platform, start, end].join("|")}
              store={store}
              commit={commit}
              notify={notify}
              rows={rows}
              start={actualStart}
              end={actualEnd}
            />
          )}{" "}
          {page === "imports" && (
            <Importer store={store} commit={commit} notify={notify} />
          )}{" "}
          {page === "settings" && (
            <SettingsPanel store={store} commit={commit} notify={notify} />
          )}
          <footer className="app-footer">
            <span>
              Estudio de Métricas <span>·</span> Hecho para decisiones con
              intención.
            </span>
            <span>Instagram · TikTok · LinkedIn</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Info size={18} />
          <span>{toast}</span>
          <button aria-label="Cerrar aviso" onClick={() => setToast("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
function Overview({
  store,
  rows,
  onNew,
  onEdit,
  onClients,
  onImport,
  onReports,
  commit,
  notify,
}: {
  store: Store;
  rows: Analysis[];
  onNew: () => void;
  onEdit: (a: Analysis) => void;
  onClients: () => void;
  onImport: () => void;
  onReports: () => void;
  commit: (s: Store) => Promise<boolean>;
  notify: (s: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const groups = Object.values(
    rows.reduce<Record<string, Analysis[]>>((acc, a) => {
      (acc[groupKey(a)] ??= []).push(a);
      return acc;
    }, {}),
  );
  const group =
    groups.find((g) => groupKey(g[0]) === selectedGroup) || groups[0] || [];
  const stats = aggregate(group);
  const latest = group.slice().sort((a, b) => b.end.localeCompare(a.end))[0];
  const goal = latest?.goal || null;
  const complete = rows.filter(
    (a) => calculate(a.method, a.metrics).value !== null,
  ).length;
  const shown = rows.filter((a) =>
    `${a.title} ${a.source}`.toLowerCase().includes(search.toLowerCase()),
  );
  const a = rows.find((x) => x.id === compareA),
    b = rows.find((x) => x.id === compareB);
  const ar = a ? calculate(a.method, a.metrics).value : null,
    br = b ? calculate(b.method, b.metrics).value : null;
  const comparable =
    a &&
    b &&
    a.id !== b.id &&
    groupKey(a) === groupKey(b) &&
    ar !== null &&
    br !== null &&
    a.end < b.start &&
    new Date(a.end).getTime() - new Date(a.start).getTime() ===
      new Date(b.end).getTime() - new Date(b.start).getTime();
  const diff = comparable ? delta(br!, ar!) : null;
  return (
    <>
      <SectionHead
        eyebrow="TU VISIÓN, MÁS CLARA"
        title="El pulso de tu contenido."
        description="Todo lo que necesitas para medir, entender y hacer crecer tus resultados."
        action={
          <button className="primary" onClick={onNew}>
            <Plus size={18} />
            Nuevo análisis
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          label="Análisis guardados"
          value={String(rows.length).padStart(2, "0")}
          sub="En el período seleccionado"
          icon={<Layers size={20} />}
          color="blue"
        />
        <Stat
          label="Clientes en tu espacio"
          value={String(
            store.clients.filter((c) => !c.archived).length,
          ).padStart(2, "0")}
          sub="Clientes activos en total"
          icon={<Users size={20} />}
          color="purple"
        />
        <Stat
          label="Cobertura de datos"
          value={
            rows.length ? `${Math.round((complete / rows.length) * 100)}%` : "—"
          }
          sub={`${complete} de ${rows.length} análisis completos`}
          icon={<Check size={20} />}
          color="cyan"
        />
        <Stat
          label="Reportes preparados"
          value={String(store.reports.length).padStart(2, "0")}
          sub="Versiones guardadas en total"
          icon={<FileText size={20} />}
          color="orange"
        />
      </div>
      <div className="dashboard-grid">
        <section className="card overview-gauge">
          <div className="card-top">
            <div>
              <h2>Engagement, con contexto</h2>
              <p>Una cuenta. Un método. Una lectura clara.</p>
            </div>
            <BarChart3 size={20} className="muted" />
          </div>
          {groups.length > 0 && (
            <select
              aria-label="Grupo de métricas"
              className="group-select"
              value={groupKey(group[0])}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={groupKey(g[0])} value={groupKey(g[0])}>
                  {store.accounts.find((a) => a.id === g[0].accountId)?.name ||
                    "Sin cuenta"}{" "}
                  · {methodById(g[0].method)?.label} · {g[0].scope} ·{" "}
                  {g[0].format} ·{" "}
                  {g[0].mode === "period" ? "período" : "publicación"} ·{" "}
                  {g[0].timing === "activity" ? "actividad" : "acumulado"}
                </option>
              ))}
            </select>
          )}
          <Gauge value={stats.value} goal={goal} />
          <div className="gauge-caption">{stats.label}</div>
          <div className="gauge-bottom">
            <div>
              <span className="legend-dot" /> {stats.count} análisis completos
            </div>
            <span>
              {goal ? `Meta: ${fmt(goal)} %` : "Sin meta configurada"}
            </span>
          </div>
        </section>
        <section className="card evolution">
          <div className="card-top">
            <div>
              <h2>Evolución del contenido</h2>
              <p>Tasas individuales del grupo seleccionado.</p>
            </div>
            <span className="chip">Historial</span>
          </div>
          {group.filter((a) => calculate(a.method, a.metrics).value !== null)
            .length >= 2 ? (
            <Trend rows={group} />
          ) : (
            <div className="chart-empty">
              <div className="chart-grid">
                <span />
                <span />
                <span />
                <span />
                <div className="chart-placeholder-line" />
              </div>
              <div className="chart-empty-label">
                <Clock3 size={20} />
                <strong>Tu evolución empieza aquí</strong>
                <span>
                  Guarda al menos dos análisis compatibles
                  <br />
                  para visualizar sus resultados.
                </span>
              </div>
            </div>
          )}
          <div className="evolution-footer">
            <span className="legend-dot purple-dot" />
            Mismo método y ámbito<span>Sin promediar redes</span>
          </div>
        </section>
      </div>
      {!rows.length && (
        <section className="onboarding">
          <div>
            <span className="eyebrow">TU PRIMER REPORTE ESTÁ CERCA</span>
            <h2>De cero a claridad, en tres pasos.</h2>
            <p>Empieza con un cliente y los datos que ya tienes.</p>
          </div>
          <button onClick={onClients}>
            <span>01</span>
            <div>
              <strong>Crea un cliente</strong>
              <small>Organiza sus cuentas</small>
            </div>
            <ArrowUpRight size={18} />
          </button>
          <button onClick={onNew}>
            <span>02</span>
            <div>
              <strong>Calcula el engagement</strong>
              <small>Introduce tus métricas</small>
            </div>
            <ArrowUpRight size={18} />
          </button>
          <button onClick={onReports}>
            <span>03</span>
            <div>
              <strong>Comparte el resultado</strong>
              <small>Tu reporte, listo</small>
            </div>
            <ArrowUpRight size={18} />
          </button>
        </section>
      )}
      <section className="card history-card">
        <div className="card-top">
          <div>
            <h2>Historial de análisis</h2>
            <p>El detalle detrás de cada resultado.</p>
          </div>
          <div className="button-row">
            <button className="secondary" onClick={onImport}>
              <Upload size={16} />
              Importar CSV
            </button>
            <button
              className="secondary"
              disabled={!rows.length}
              onClick={() =>
                download(
                  exportCSV(rows),
                  "historial-metricas.csv",
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>
        <div className="search table-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar un análisis…"
            aria-label="Buscar análisis"
          />
        </div>
        {shown.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Contenido / cuenta</th>
                  <th>Red</th>
                  <th>Período</th>
                  <th>Engagement</th>
                  <th>Estado</th>
                  <th>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <button className="table-title" onClick={() => onEdit(a)}>
                        {a.title}
                      </button>
                      <small>
                        {store.accounts.find((x) => x.id === a.accountId)?.name}{" "}
                        · {methodById(a.method)?.label}
                      </small>
                    </td>
                    <td>
                      <PlatformTag platform={a.platform} />
                    </td>
                    <td>
                      {a.start}
                      <small>
                        {a.start === a.end ? "Publicación" : `hasta ${a.end}`}
                      </small>
                    </td>
                    <td className="rate-cell">
                      {fmt(calculate(a.method, a.metrics).value)} %
                    </td>
                    <td>
                      <span
                        className={
                          calculate(a.method, a.metrics).value === null
                            ? "badge warning"
                            : "badge"
                        }
                      >
                        {calculate(a.method, a.metrics).value === null
                          ? "Por completar"
                          : "Completo"}
                      </span>
                    </td>
                    <td>
                      <div className="button-row">
                        <button
                          className="icon-button"
                          aria-label={`Editar análisis ${a.title}`}
                          onClick={() => onEdit(a)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Eliminar análisis ${a.title}`}
                          onClick={async () => {
                            if (
                              confirm(
                                "¿Eliminar este análisis? Las versiones de reportes guardadas se conservan.",
                              )
                            )
                              if (
                                await commit({
                                  ...store,
                                  analyses: store.analyses.filter(
                                    (x) => x.id !== a.id,
                                  ),
                                })
                              )
                                notify("Análisis eliminado.");
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={search ? "No hay coincidencias" : "Todavía no hay análisis"}
            action={
              <button className="text-button" onClick={onNew}>
                Crear un análisis <ArrowRight size={16} />
              </button>
            }
          >
            {search
              ? "Prueba con otro nombre."
              : "Aquí encontrarás el historial de tus clientes. Cada resultado conserva su fórmula y sus datos."}
          </Empty>
        )}
      </section>
      {rows.length >= 2 && (
        <section className="card compare-card">
          <div className="card-top">
            <div>
              <h2>Comparar períodos</h2>
              <p>
                Selecciona dos registros del mismo método, formato y ámbito;
                períodos no superpuestos de igual duración.
              </p>
            </div>
          </div>
          <div className="two-cols">
            <Field label="Período anterior">
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
              >
                <option value="">Seleccionar análisis</option>
                {rows.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} · {a.start}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Período actual">
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
              >
                <option value="">Seleccionar análisis</option>
                {rows.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} · {a.start}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {a &&
            b &&
            (diff ? (
              <div className="comparison-result">
                <strong>
                  {fmt(ar)} % → {fmt(br)} %
                </strong>
                <span>
                  {diff.points >= 0 ? "+" : ""}
                  {fmt(diff.points)} puntos porcentuales
                </span>
                <span>
                  {diff.relative === null
                    ? "Variación relativa no calculable"
                    : `${diff.relative >= 0 ? "+" : ""}${fmt(diff.relative)} % relativo`}
                </span>
              </div>
            ) : (
              <p className="notice">
                No son comparables: revisa cuenta, método, formato, ámbito,
                criterio temporal, orden y duración de los períodos, y campos
                completos.
              </p>
            ))}
        </section>
      )}
    </>
  );
}
function Stat({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="card stat-card">
      <div>
        <span>{label}</span>
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
function Trend({ rows }: { rows: Analysis[] }) {
  const points = rows
    .filter((a) => calculate(a.method, a.metrics).value !== null)
    .slice()
    .sort(
      (a, b) =>
        a.end.localeCompare(b.end) || a.capturedAt.localeCompare(b.capturedAt),
    )
    .slice(-12);
  const max =
    Math.max(...points.map((a) => calculate(a.method, a.metrics).value!), 1) *
    1.15;
  const coords = points.map(
    (a, i) =>
      `${50 + (i * 440) / Math.max(points.length - 1, 1)},${175 - (calculate(a.method, a.metrics).value! / max) * 140}`,
  );
  return (
    <div className="trend">
      <svg
        viewBox="0 0 540 220"
        role="img"
        aria-label="Evolución de las tasas individuales. El detalle se encuentra en el historial."
      >
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#a69aee" stopOpacity=".25" />
            <stop offset="1" stopColor="#a69aee" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1="50"
              x2="500"
              y1={35 + i * 47}
              y2={35 + i * 47}
              stroke="#edf0f5"
              strokeDasharray="4 4"
            />
            <text x="0" y={40 + i * 47} fontSize="11" fill="#6b7387">
              {fmt(max * (1 - i / 3), 1)}%
            </text>
          </g>
        ))}
        <polygon
          points={`50,180 ${coords.join(" ")} 490,180`}
          fill="url(#area)"
        />
        <polyline
          points={coords.join(" ")}
          fill="none"
          stroke="#8068d8"
          strokeWidth="3"
        />
        {coords.map((p, i) => (
          <g key={points[i].id}>
            <circle
              cx={p.split(",")[0]}
              cy={p.split(",")[1]}
              r="5"
              fill="#8068d8"
              stroke="white"
              strokeWidth="2"
            >
              <title>
                {points[i].title}:{" "}
                {fmt(calculate(points[i].method, points[i].metrics).value)} %
              </title>
            </circle>
            {(i === 0 || i === coords.length - 1) && (
              <text
                x={p.split(",")[0]}
                y="211"
                textAnchor="middle"
                fontSize="11"
                fill="#6b7387"
              >
                {points[i].end.slice(5)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <small>
        Ordenado por fecha. Cada punto representa un análisis; no un intervalo
        continuo.
      </small>
    </div>
  );
}
function SettingsPanel({
  store,
  commit,
  notify,
}: {
  store: Store;
  commit: (s: Store) => Promise<boolean>;
  notify: (s: string) => void;
}) {
  const [brand, setBrand] = useState(store.settings.brand);
  const [currency, setCurrency] = useState(store.settings.currency);
  const [timezone, setTimezone] = useState(store.settings.timezone);
  const [restored, setRestored] = useState<Store | null>(null);
  const [busy, setBusy] = useState(false);
  async function exportBackup() {
    setBusy(true);
    try {
      const next = {
        ...store,
        settings: { ...store.settings, lastBackup: new Date().toISOString() },
      };
      download(
        await backup(next),
        `respaldo-metricas-${localDate()}.json`,
        "application/json",
      );
      await commit(next);
      notify("Respaldo descargado. Consérvalo en un lugar privado.");
    } catch (e) {
      notify(`No se pudo exportar: ${(e as Error).message}`);
    }
    setBusy(false);
  }
  return (
    <>
      <SectionHead
        eyebrow="A TU MANERA"
        title="Tu espacio, bien cuidado."
        description="Personaliza tus reportes y mantén una copia de tu trabajo."
      />
      <div className="two-cols">
        <section className="card calculator-form">
          <div className="card-top">
            <h2>Identidad y preferencias</h2>
            <Settings size={20} />
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              if (
                await commit({
                  ...store,
                  settings: {
                    ...store.settings,
                    brand: brand.trim(),
                    currency,
                    timezone,
                  },
                })
              )
                notify("Preferencias guardadas.");
              setBusy(false);
            }}
          >
            <Field label="Firma profesional en los reportes">
              <input
                value={brand}
                required
                maxLength={150}
                onChange={(e) => setBrand(e.target.value)}
              />
            </Field>
            <Field label="Moneda para indicadores de negocio">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {["USD", "EUR", "COP", "MXN", "PEN"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Zona horaria de referencia">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {[
                  "America/Guayaquil",
                  "America/Bogota",
                  "America/Lima",
                  "America/Mexico_City",
                  "Europe/Madrid",
                  "UTC",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <p className="muted">
              Las fechas de los análisis son las que introduces. Usa esta zona
              al consultar y exportar los datos de tus plataformas.
            </p>
            <button className="primary" disabled={busy}>
              <Check size={17} />
              Guardar preferencias
            </button>
          </form>
        </section>
        <section className="card calculator-form">
          <div className="card-top">
            <h2>Respaldos y recuperación</h2>
            <ShieldCheck size={22} />
          </div>
          <div className="storage-summary">
            <Database size={26} />
            <div>
              <strong>
                {store.clients.length} clientes · {store.analyses.length}{" "}
                análisis
              </strong>
              <span>{store.reports.length} reportes guardados</span>
            </div>
          </div>
          <p>
            Tus datos se guardan en este navegador, en este dispositivo. No se
            sincronizan automáticamente.
          </p>
          <p className="muted">
            Último respaldo:{" "}
            {store.settings.lastBackup
              ? new Date(store.settings.lastBackup).toLocaleString("es-EC")
              : "todavía no has creado uno"}
            .
          </p>
          <button
            className="primary full"
            disabled={busy}
            onClick={exportBackup}
          >
            <Download size={17} />
            Descargar respaldo completo
          </button>
          <label className="upload-zone small-upload">
            <Upload size={21} />
            <strong>Restaurar un respaldo JSON</strong>
            <span>Revisión de integridad antes de guardar · hasta 20 MB</span>
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setBusy(true);
                try {
                  if (f.size > 20_000_000) throw new Error("Máximo 20 MB.");
                  setRestored(await readBackup(await f.text()));
                } catch (e) {
                  notify((e as Error).message);
                }
                setBusy(false);
              }}
            />
          </label>
          {restored && (
            <div className="notice restore-preview">
              <strong>Respaldo válido</strong>
              <span>
                {restored.clients.length} clientes · {restored.analyses.length}{" "}
                análisis · {restored.reports.length} reportes
              </span>
              <p>
                Reemplazará los datos actuales. Descarga primero un respaldo de
                tu espacio si necesitas conservarlo.
              </p>
              <div className="button-row">
                <button
                  className="primary"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      confirm(
                        "¿Reemplazar el espacio actual por este respaldo validado?",
                      )
                    ) {
                      setBusy(true);
                      if (await commit(restored)) {
                        setBrand(restored.settings.brand);
                        setCurrency(restored.settings.currency);
                        setTimezone(restored.settings.timezone);
                        setRestored(null);
                        notify("Respaldo restaurado correctamente.");
                      }
                      setBusy(false);
                    }
                  }}
                >
                  Restaurar ahora
                </button>
                <button className="secondary" onClick={() => setRestored(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      <section className="card methodology">
        <h2>Una medición que puedes explicar</h2>
        <div className="three-cols">
          <div>
            <span className="number-dot">01</span>
            <h3>Fórmulas visibles</h3>
            <p>
              Cada método identifica las interacciones incluidas y su
              denominador. No confundimos alcance, vistas e impresiones.
            </p>
          </div>
          <div>
            <span className="number-dot">02</span>
            <h3>Comparaciones honestas</h3>
            <p>
              Sin benchmarks inventados ni tasas globales entre redes. Tú
              defines tus metas y comparas contextos compatibles.
            </p>
          </div>
          <div>
            <span className="number-dot">03</span>
            <h3>Datos bajo tu control</h3>
            <p>
              La aplicación no envía las métricas de tus clientes a un servidor.
              Borrar los datos del navegador elimina el historial sin respaldo.
            </p>
          </div>
        </div>
        <p className="muted">
          Versión 1.0 · Métodos v1 · LinkedIn páginas incluye clics, reacciones,
          comentarios y compartidos sobre impresiones. Instagram y TikTok usan
          definiciones analíticas explícitas.{" "}
          <a
            href="https://www.linkedin.com/help/lms/answer/a564051"
            target="_blank"
            rel="noreferrer"
          >
            Consultar metodología de LinkedIn
          </a>
          .
        </p>
      </section>
    </>
  );
}
