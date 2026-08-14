"use client";
import { useState } from "react";
import { formatLocalDate } from "@/lib/dates";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(d: Date): string {
  return formatLocalDate(d);
}

export function MultiDateCalendar({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (dates: string[]) => void;
}) {
  const [cursor, setCursor] = useState(new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function toggle(date: Date) {
    const iso = toISODate(date);
    if (selected.includes(iso)) {
      onChange(selected.filter((d) => d !== iso));
    } else {
      onChange([...selected, iso]);
    }
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
        background: "var(--bg-elevated)",
        maxWidth: 320,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          style={navBtnStyle}
        >
          ‹
        </button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          style={navBtnStyle}
        >
          ›
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = toISODate(date);
          const isSelected = selected.includes(iso);
          const isPast = date < today;
          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => toggle(date)}
              style={{
                aspectRatio: "1",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: isSelected ? 700 : 500,
                cursor: isPast ? "default" : "pointer",
                background: isSelected ? "var(--accent)" : "transparent",
                color: isPast ? "var(--text-faint)" : isSelected ? "var(--accent-contrast)" : "var(--text)",
                opacity: isPast ? 0.4 : 1,
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isPast) e.currentTarget.style.background = "var(--bg-subtle)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  borderRadius: "var(--radius-sm)",
  width: 26,
  height: 26,
  cursor: "pointer",
  fontSize: 14,
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
