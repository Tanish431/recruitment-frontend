export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        color: "var(--text-muted)",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <p style={{ fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, marginTop: 6 }}>{subtitle}</p>}
    </div>
  );
}
