"use client";
import { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/types";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "2px solid var(--accent)",
          background: "var(--accent-soft)",
          color: "var(--accent)",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {initials(user.name, user.campus_email)}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 48,
            width: 260,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "var(--space-4)",
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--accent-soft)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 15,
              }}
            >
              {initials(user.name, user.campus_email)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name || "Candidate"}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.role}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <InfoRow label="Email" value={user.campus_email} />
            <InfoRow label="Phone" value={user.phone || "-"} />
            <InfoRow label="WhatsApp" value={user.whatsapp || "-"} />
          </div>

          <button
            onClick={onLogout}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "8px 0",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--danger)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "76px minmax(0, 1fr)",
        gap: 12,
        alignItems: "start",
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span
        style={{
          fontWeight: 500,
          minWidth: 0,
          textAlign: "right",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}
