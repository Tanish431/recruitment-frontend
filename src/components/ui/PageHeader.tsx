export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 18, marginBottom: "var(--space-6)", paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
      <div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", lineHeight: 1, letterSpacing: "-0.06em", margin: "13px 0 0" }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.55, margin: "8px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
