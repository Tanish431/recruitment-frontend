"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireRole } from "@/lib/useAuth";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageLoading } from "@/components/ui";

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireRole(["judge", "admin"]);
  const { round, loading: roundLoading } = useActiveRound();
  const pathname = usePathname();

  if (loading || roundLoading) return <PageLoading />;
  if (!user) return null;

  const nav = [];
  if (round && (round.number === 1 || round.number === 3)) {
    nav.push({ href: "/judge/queue", label: "Queue", icon: "◐" });
    nav.push({ href: "/judge/checkin", label: "Check-in", icon: "✓" });
  }
  if (round && round.number === 2) {
    nav.push({ href: "/judge/round2", label: "Round 2 Scoring", icon: "◑" });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <nav
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 8px", marginBottom: "var(--space-4)" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Judge Tools</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{user.campus_email}</div>
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            background: round ? "var(--success-soft)" : "var(--bg-subtle)",
            color: round ? "var(--success)" : "var(--text-muted)",
            marginBottom: "var(--space-4)",
          }}
        >
          {round ? `Active: ${round.name}` : "No round active"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  background: active ? "var(--accent-soft)" : "transparent",
                  textDecoration: "none",
                }}
              >
                <span style={{ width: 16, textAlign: "center", opacity: 0.8 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          {nav.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-faint)", padding: "0 10px" }}>
              Waiting for admin to activate a round.
            </p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          {user.role === "admin" && (
            <Link href="/admin" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              ← Admin
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>
      <main style={{ flex: 1, padding: "var(--space-6)", maxWidth: 900, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
