"use client";
import Link from "next/link";
import { useRequireRole } from "@/lib/useAuth";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PageLoading } from "@/components/ui";
import { Sidebar, SidebarNavItem } from "@/components/ui/Sidebar";
import { JudgeUserMenu } from "@/components/JudgeUserMenu";
import { useIsMobile } from "@/lib/useIsMobile";

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireRole(["judge", "admin"]);
  const { round, loading: roundLoading } = useActiveRound();
  const isMobile = useIsMobile();

  if (loading || roundLoading) return <PageLoading />;
  if (!user) return null;

  const nav: SidebarNavItem[] = [];
  if (round && round.number === 1) {
    nav.push({ href: "/judge/queue", label: "Round 1 Queue", icon: "◐" });
    nav.push({ href: "/judge/checkin", label: "Round 1 Check-in", icon: "✓" });
  }
  if (round && round.number === 2) {
    nav.push({ href: "/judge/round2", label: "Round 2 Scoring", icon: "◑" });
  }
  if (round && round.number === 3) {
    if (user.role === "admin") {
      nav.push({ href: "/judge/queue", label: "Round 3 Queue", icon: "◐" });
      nav.push({ href: "/judge/checkin", label: "Round 3 Check-in", icon: "✓" });
    }
    if (round && round.number === 3 && user.role === "admin") {
      nav.push({ href: "/judge/round3/manage", label: "Create R3 Slots", icon: "➕" });
    }
    if (round && round.number === 3) {
      nav.push({ href: "/judge/round3", label: user.role === "admin" ? "Round 3 Slots" : "Round 3 — Join Panel", icon: "◒" });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        title="Judge Tools"
        navItems={nav}
        userMenu={<JudgeUserMenu user={user} size={isMobile ? 32 : 36} align={isMobile ? "right" : "left"} showAdminLink={user.role === "admin"} showJudgeLink={false} />}
        emptyMessage={<p style={{ fontSize: 13, color: "var(--text-faint)", padding: "0 10px" }}>Waiting for admin to activate a round.</p>}
        banner={
          <div style={{
            fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: "var(--radius-sm)",
            background: round ? "var(--success-soft)" : "var(--bg-subtle)",
            color: round ? "var(--success)" : "var(--text-muted)",
          }}>
            {round ? `Active: ${round.name}` : "No round active"}
          </div>
        }
      />
      <main style={{ flex: 1, padding: isMobile ? "68px var(--space-4) var(--space-4)" : "var(--space-6)", maxWidth: 900, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
