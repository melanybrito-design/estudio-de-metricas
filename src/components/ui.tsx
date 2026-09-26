import { ArrowUpRight, BarChart3, Camera, Square, Music2 } from "lucide-react";
import type { Platform } from "@/domain/model";
import { platforms } from "@/domain/model";
import { fmt } from "@/domain/metrics";
export function PlatformIcon({ platform }: { platform: Platform }) {
  const I =
    platform === "instagram"
      ? Camera
      : platform === "linkedin"
        ? Square
        : Music2;
  return <I size={17} />;
}
export function PlatformTag({ platform }: { platform: Platform }) {
  return (
    <span className={`platform-tag ${platform}`}>
      <PlatformIcon platform={platform} />
      {platforms[platform]}
    </span>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <BarChart3 size={28} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {help && <small>{help}</small>}
    </label>
  );
}
export function Gauge({
  value,
  goal,
}: {
  value: number | null;
  goal: number | null;
}) {
  const progress = value !== null && goal ? Math.min(value / goal, 1) : 0;
  return (
    <div className="gauge">
      <svg
        viewBox="0 0 300 180"
        role="img"
        aria-label={
          value === null
            ? "Resultado pendiente"
            : `${fmt(value)} por ciento${goal ? `, meta ${fmt(goal)} por ciento` : ""}`
        }
      >
        <defs>
          <linearGradient id="gauge-gradient">
            <stop stopColor="#3155d9" />
            <stop offset="1" stopColor="#b79afa" />
          </linearGradient>
        </defs>
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke="#edf0f8"
          strokeWidth="22"
          strokeLinecap="round"
        />
        {progress > 0 && (
          <path
            d="M 30 150 A 120 120 0 0 1 270 150"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="22"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${progress * 100} 100`}
          />
        )}
      </svg>
      <div className="gauge-value">
        <span>ENGAGEMENT RATE</span>
        <strong>
          {fmt(value)}
          <em>%</em>
        </strong>
        <small>
          {goal
            ? `Meta personal: ${fmt(goal)} %`
            : "Tu resultado, con contexto"}
        </small>
      </div>
    </div>
  );
}
export function SectionHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function ArrowLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-button" onClick={onClick}>
      {children}
      <ArrowUpRight size={17} />
    </button>
  );
}
