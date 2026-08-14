"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireRole } from "@/lib/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageLoading } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/candidates", label: "Candidates", icon: "◍" },
  { href: "/admin/slots", label: "Slots & Schedule", icon: "▦" },
  { href: "/admin/assignments", label: "Assignment Board", icon: "▤" },
  { href: "/admin/judges", label: "Judges", icon: "◑" },
  { href: "/admin/queries", label: "Queries", icon: "◎" },
  { href: "/admin/unavailability", label: "Unavailability", icon: "◔" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireRole(["admin"]);
  const pathname = usePathname();

  if (loading) return <PageLoading />;
  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <nav
        style={{
          width: 232,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 8px", marginBottom: "var(--space-5)" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Admin</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{user.campus_email}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV.map((item) => {
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
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                <span style={{ width: 16, textAlign: "center", opacity: 0.8 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <Link href="/judge" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
            Judge tools →
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <main style={{ flex: 1, padding: "var(--space-6)", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
