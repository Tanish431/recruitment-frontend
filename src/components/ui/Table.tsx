export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr style={{ background: "var(--bg-subtle)" }}>{children}</tr>
    </thead>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 14px",
        fontWeight: 600,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        color: "var(--text-muted)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td
      style={{
        padding: "10px 14px",
        borderTop: "1px solid var(--border)",
        color: muted ? "var(--text-muted)" : "var(--text)",
      }}
    >
      {children}
    </td>
  );
}
