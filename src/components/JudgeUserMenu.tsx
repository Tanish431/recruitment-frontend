"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function JudgeUserMenu({
  user, size = 40, align = "right", showAdminLink = false, showJudgeLink = false,
}: {
  user: User;
  size?: number;
  align?: "left" | "right";
  showAdminLink?: boolean;
  showJudgeLink?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (current) setTheme(current);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: size, height: size, borderRadius: "50%",
          border: "2px solid var(--accent)", background: "var(--accent-soft)",
          color: "var(--accent)", fontWeight: 700, fontSize: 13,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {initials(user.name, user.campus_email)}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            [align]: 0,
            top: size + 8,
            width: 250,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "var(--space-4)",
            zIndex: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: "var(--accent-soft)",
              color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14,
            }}>
              {initials(user.name, user.campus_email)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name || user.campus_email.split("@")[0]}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>{user.role}</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{user.campus_email}</div>

          <button
            onClick={toggleTheme}
            style={{
              width: "100%", marginTop: 10, padding: "8px 10px", display: "flex",
              justifyContent: "space-between", alignItems: "center",
              borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
              background: "var(--bg-subtle)", color: "var(--text)", fontSize: 13, cursor: "pointer",
            }}
          >
            <span>{theme === "light" ? "Light mode" : "Dark mode"}</span>
            <span>{theme === "light" ? "🌙" : "☀️"}</span>
          </button>

          {showAdminLink && (
            <Link
              href="/admin"
              style={{
                display: "block", marginTop: 8, padding: "8px 10px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text)", fontSize: 13, textDecoration: "none",
              }}
            >
              Admin panel
            </Link>
          )}

          {showJudgeLink && (
            <Link
              href="/judge"
              style={{
                display: "block", marginTop: 8, padding: "8px 10px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text)", fontSize: 13, textDecoration: "none",
              }}
            >
              Judge tools
            </Link>
          )}

          <button
            onClick={() => api.auth.logout().then(() => router.replace("/"))}
            style={{
              width: "100%", marginTop: 8, padding: "8px 0", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--danger)", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
