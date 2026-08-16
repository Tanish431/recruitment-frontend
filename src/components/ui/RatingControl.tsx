import type { PropertyRating } from "@/lib/types";

const OPTIONS: { value: PropertyRating; label: string; color: string }[] = [
  { value: "bad", label: "Bad", color: "var(--danger)" },
  { value: "meh", label: "Meh", color: "var(--warning)" },
  { value: "good", label: "Good", color: "var(--success)" },
];

export function RatingControl({ value, onChange }: { value: PropertyRating | null; onChange: (r: PropertyRating) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${active ? o.color : "var(--border)"}`,
              background: active ? o.color : "var(--bg-elevated)",
              color: active ? "#fff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.12s ease",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
