export function Chip({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px 4px 12px",
        borderRadius: "var(--radius-full)",
        background: "var(--accent-soft)",
        color: "var(--accent)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            border: "none",
            background: "transparent",
            color: "var(--accent)",
            cursor: "pointer",
            fontSize: 15,
            lineHeight: 1,
            padding: 0,
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
