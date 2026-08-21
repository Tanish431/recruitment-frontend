export function Card({ children, style, borderColor }: { children: React.ReactNode; style?: React.CSSProperties; borderColor?: string }) {
  const { border, ...rest } = style ?? {};
  const resolvedBorder = borderColor ? `1px solid ${borderColor}` : border ?? "1px solid var(--border)";
  return (
    <div style={{ background: "color-mix(in srgb, var(--bg-elevated) 94%, transparent)", borderRadius: "var(--radius-lg)", padding: "clamp(16px, 3vw, var(--space-5))", boxShadow: "var(--shadow-sm)", ...rest, border: resolvedBorder }}>
      {children}
    </div>
  );
}
