"use client";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Archive,
  Pencil,
  ArrowRight,
  Users,
  X,
  Folder,
} from "lucide-react";
import {
  platforms,
  uid,
  localDate,
  type Client,
  type Store,
  type Platform,
} from "@/domain/model";
import { Empty, Field, PlatformTag, SectionHead } from "./ui";
type Props = {
  store: Store;
  commit: (s: Store) => Promise<boolean>;
  notify: (s: string) => void;
  onAnalyze: (accountId: string) => void;
};
export default function Clients({ store, commit, notify, onAnalyze }: Props) {
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [edit, setEdit] = useState<Client | null>(null);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [type, setType] = useState<"personal" | "business">("business");
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (show) dialogRef.current?.showModal();
  }, [show]);
  const [campaign, setCampaign] = useState({
    name: "",
    objective: "",
    start: localDate(),
    end: localDate(),
  });
  const clients = store.clients.filter(
    (c) =>
      (archived || !c.archived) &&
      `${c.name} ${c.sector}`.toLowerCase().includes(search.toLowerCase()),
  );
  const active = store.clients.find((c) => c.id === selected);
  async function saveClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edit || !edit.name.trim()) return;
    setBusy(true);
    const exists = store.clients.some((c) => c.id === edit.id);
    if (
      await commit({
        ...store,
        clients: exists
          ? store.clients.map((c) => (c.id === edit.id ? edit : c))
          : [...store.clients, edit],
      })
    ) {
      setShow(false);
      setSelected(edit.id);
      notify("Cliente guardado.");
    }
    setBusy(false);
  }
  async function addAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !accountName.trim()) return;
    setBusy(true);
    if (
      await commit({
        ...store,
        accounts: editingAccount
          ? store.accounts.map((a) =>
              a.id === editingAccount ? { ...a, name: accountName.trim() } : a,
            )
          : [
              ...store.accounts,
              {
                id: uid(),
                clientId: active.id,
                name: accountName.trim(),
                platform,
                type,
                archived: false,
              },
            ],
      })
    ) {
      setAccountName("");
      setEditingAccount("");
      notify(
        editingAccount
          ? "Cuenta actualizada."
          : "Cuenta creada. Ya puedes guardar sus análisis.",
      );
    }
    setBusy(false);
  }
  async function addCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!active || campaign.start > campaign.end) {
      notify("Revisa las fechas de la campaña.");
      return;
    }
    setBusy(true);
    if (
      await commit({
        ...store,
        campaigns: [
          ...store.campaigns,
          { ...campaign, id: uid(), clientId: active.id },
        ],
      })
    ) {
      setCampaign({
        name: "",
        objective: "",
        start: localDate(),
        end: localDate(),
      });
      notify("Campaña creada.");
    }
    setBusy(false);
  }
  return (
    <>
      <SectionHead
        eyebrow="RELACIONES QUE CRECEN"
        title="Un espacio para cada cliente."
        description="Mantén sus cuentas, objetivos y resultados en el mismo lugar."
        action={
          <button
            className="primary"
            onClick={() => {
              setEdit({
                id: uid(),
                name: "",
                sector: "",
                objective: "",
                archived: false,
              });
              setShow(true);
            }}
          >
            <Plus size={18} />
            Nuevo cliente
          </button>
        }
      />
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="Buscar clientes"
            placeholder="Buscar por nombre o sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />
          Mostrar archivados
        </label>
      </div>
      {clients.length === 0 ? (
        <section className="card">
          <Empty
            title="Tus clientes empiezan aquí"
            action={
              <button
                className="primary"
                onClick={() => {
                  setEdit({
                    id: uid(),
                    name: "",
                    sector: "",
                    objective: "",
                    archived: false,
                  });
                  setShow(true);
                }}
              >
                <Plus size={17} />
                Crear mi primer cliente
              </button>
            }
          >
            Añade un cliente y sus cuentas de redes. Cada análisis quedará
            organizado en su propio historial.
          </Empty>
        </section>
      ) : (
        <div className="client-grid">
          {clients.map((c) => (
            <article
              className={`card client-card ${selected === c.id ? "chosen" : ""}`}
              key={c.id}
            >
              <div className="client-card-head">
                <span className="avatar">
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="button-row">
                  <button
                    className="icon-button"
                    aria-label={`Editar ${c.name}`}
                    onClick={() => {
                      setEdit({ ...c });
                      setShow(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={
                      c.archived ? `Restaurar ${c.name}` : `Archivar ${c.name}`
                    }
                    onClick={async () => {
                      if (
                        await commit({
                          ...store,
                          clients: store.clients.map((x) =>
                            x.id === c.id ? { ...x, archived: !x.archived } : x,
                          ),
                        })
                      )
                        notify(
                          c.archived
                            ? "Cliente restaurado."
                            : "Cliente archivado. Sus datos se conservan.",
                        );
                    }}
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </div>
              <h2>{c.name}</h2>
              <span className="muted">
                {c.sector || "Sector sin especificar"}
                {c.archived ? " · Archivado" : ""}
              </span>
              <p>
                {c.objective ||
                  "Añade un objetivo para dar contexto a sus resultados."}
              </p>
              <div className="tags">
                {[
                  ...new Set(
                    store.accounts
                      .filter((a) => a.clientId === c.id && !a.archived)
                      .map((a) => a.platform),
                  ),
                ].map((p) => (
                  <PlatformTag key={p} platform={p} />
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setSelected(c.id);
                  setEditingAccount("");
                  setAccountName("");
                }}
              >
                Gestionar cuentas y campañas <ArrowRight size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
      {active && (
        <section className="card client-detail">
          <div className="card-top">
            <div>
              <span className="eyebrow">ESPACIO DEL CLIENTE</span>
              <h2>{active.name}</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar detalle"
              onClick={() => setSelected("")}
            >
              <X size={18} />
            </button>
          </div>
          <div className="two-cols">
            <div>
              <h3>Cuentas conectadas a tu espacio</h3>
              <p className="muted">
                Registro manual. No solicita acceso a la red social.
              </p>
              {store.accounts
                .filter((a) => a.clientId === active.id)
                .map((a) => (
                  <div className="account-row" key={a.id}>
                    <PlatformTag platform={a.platform} />
                    <strong>{a.name}</strong>
                    <span>
                      {a.type === "business" ? "Empresa" : "Personal"}
                      {a.archived ? " · Archivada" : ""}
                    </span>
                    <button
                      className="icon-button"
                      aria-label={`Editar cuenta ${a.name}`}
                      onClick={() => {
                        setEditingAccount(a.id);
                        setAccountName(a.name);
                        setPlatform(a.platform);
                        setType(a.type);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-button"
                      disabled={a.archived || active.archived}
                      onClick={() => onAnalyze(a.id)}
                    >
                      Analizar <ArrowRight size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`${a.archived ? "Restaurar" : "Archivar"} cuenta ${a.name}`}
                      onClick={() =>
                        commit({
                          ...store,
                          accounts: store.accounts.map((x) =>
                            x.id === a.id ? { ...x, archived: !x.archived } : x,
                          ),
                        })
                      }
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                ))}
              <form onSubmit={addAccount} className="sub-form">
                <Field label="Nombre de la cuenta">
                  <input
                    required
                    maxLength={100}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="@marca o nombre de página"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Red social">
                    <select
                      disabled={!!editingAccount}
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as Platform)}
                    >
                      {Object.entries(platforms).map(([k, v]) => (
                        <option value={k} key={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tipo de cuenta">
                    <select
                      disabled={!!editingAccount}
                      value={type}
                      onChange={(e) => setType(e.target.value as typeof type)}
                    >
                      <option value="business">Empresa / profesional</option>
                      <option value="personal">Personal / creador</option>
                    </select>
                  </Field>
                </div>
                <button
                  className="secondary"
                  disabled={busy || active.archived}
                >
                  <Plus size={16} />
                  {editingAccount ? "Guardar cuenta" : "Añadir cuenta"}
                </button>
                {editingAccount && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setEditingAccount("");
                      setAccountName("");
                    }}
                  >
                    Cancelar edición
                  </button>
                )}
              </form>
            </div>
            <div>
              <h3>Campañas</h3>
              <p className="muted">
                Agrupa contenido alrededor de un objetivo.
              </p>
              {store.campaigns
                .filter((c) => c.clientId === active.id)
                .map((c) => (
                  <div className="campaign-row" key={c.id}>
                    <Folder size={18} />
                    <div>
                      <strong>{c.name}</strong>
                      <small>
                        {c.start} → {c.end}
                      </small>
                      <p>{c.objective}</p>
                    </div>
                  </div>
                ))}
              <form className="sub-form" onSubmit={addCampaign}>
                <Field label="Nombre de campaña">
                  <input
                    required
                    maxLength={100}
                    value={campaign.name}
                    onChange={(e) =>
                      setCampaign({ ...campaign, name: e.target.value })
                    }
                    placeholder="Ej. Lanzamiento de temporada"
                  />
                </Field>
                <Field label="Objetivo de campaña">
                  <input
                    maxLength={300}
                    value={campaign.objective}
                    onChange={(e) =>
                      setCampaign({ ...campaign, objective: e.target.value })
                    }
                    placeholder="Qué quieres conseguir"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Inicio de campaña">
                    <input
                      type="date"
                      required
                      value={campaign.start}
                      onChange={(e) =>
                        setCampaign({ ...campaign, start: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Fin de campaña">
                    <input
                      type="date"
                      required
                      value={campaign.end}
                      min={campaign.start}
                      onChange={(e) =>
                        setCampaign({ ...campaign, end: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <button
                  className="secondary"
                  disabled={busy || active.archived}
                >
                  <Plus size={16} />
                  Crear campaña
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
      {show && edit && (
        <div className="modal-backdrop">
          <dialog
            ref={dialogRef}
            onCancel={() => setShow(false)}
            className="modal"
            aria-labelledby="client-dialog-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShow(false);
            }}
          >
            <form onSubmit={saveClient}>
              <div className="card-top">
                <h2 id="client-dialog-title">
                  {store.clients.some((c) => c.id === edit.id)
                    ? "Editar cliente"
                    : "Nuevo cliente"}
                </h2>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Cerrar"
                  onClick={() => setShow(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <Field label="Nombre del cliente">
                <input
                  autoFocus
                  required
                  maxLength={150}
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  placeholder="Nombre de la marca o persona"
                />
              </Field>
              <Field label="Sector">
                <input
                  maxLength={100}
                  value={edit.sector}
                  onChange={(e) => setEdit({ ...edit, sector: e.target.value })}
                  placeholder="Ej. Inmobiliario, gastronomía, educación"
                />
              </Field>
              <Field label="Objetivo principal">
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={edit.objective}
                  onChange={(e) =>
                    setEdit({ ...edit, objective: e.target.value })
                  }
                  placeholder="Ej. Aumentar consultas de clientes potenciales"
                />
              </Field>
              <button className="primary full" disabled={busy}>
                <Users size={17} />
                {busy ? "Guardando…" : "Guardar cliente"}
              </button>
            </form>
          </dialog>
        </div>
      )}
    </>
  );
}
