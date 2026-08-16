export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { border, borderColor, ...rest } = style ?? {};
  const resolvedBorder = borderColor
    ? `1px solid ${borderColor}`
    : border ?? "1px solid var(--border)";

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-sm)",
        ...rest,
        border: resolvedBorder,
      }}
    >
      {children}
    </div>
  );
}
