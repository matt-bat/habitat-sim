import type { ReactNode } from "react";

export function formatAge(ageMyr: number): string {
  if (ageMyr >= 1000) return `${(ageMyr / 1000).toFixed(2)} Gyr`;
  return `${Math.round(ageMyr).toLocaleString()} Myr`;
}

export function formatPopulation(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return Math.round(value).toLocaleString();
}

export function Metric({ label, value, hint, tone = "neutral" }: { label: string; value: ReactNode; hint?: string; tone?: "neutral" | "good" | "warn" | "danger" }) {
  return <div className={`metric tone-${tone}`} title={hint}><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>;
}

export function Meter({ label, value, color = "var(--life)", detail }: { label: string; value: number; color?: string; detail?: string }) {
  const percent = Math.max(0, Math.min(100, value * 100));
  return <div className="meter" title={detail}><div><span>{label}</span><strong>{percent.toFixed(0)}%</strong></div><i><b style={{ width: `${percent}%`, background: color }} /></i></div>;
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "grounded" | "coarse" | "speculative" | "good" | "warn" }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function PanelTitle({ eyebrow, title, aside }: { eyebrow?: string; title: string; aside?: ReactNode }) {
  return <header className="panel-title"><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>{aside}</header>;
}

