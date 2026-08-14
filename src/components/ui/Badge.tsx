type Tone = "neutral" | "success" | "warning" | "danger" | "accent";

const tones: Record<Tone, React.CSSProperties> = {
  neutral: { background: "var(--bg-subtle)", color: "var(--text-muted)" },
  success: { background: "var(--success-soft)", color: "var(--success)" },
  warning: { background: "var(--warning-soft)", color: "var(--warning)" },
  danger: { background: "var(--danger-soft)", color: "var(--danger)" },
  accent: { background: "var(--accent-soft)", color: "var(--accent)" },
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: 12,
        fontWeight: 600,
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}
