"use client";
import { useRequireRole } from "@/lib/useAuth";
import { PageLoading } from "@/components/ui";
import { Sidebar, SidebarNavItem } from "@/components/ui/Sidebar";
import { JudgeUserMenu } from "@/components/JudgeUserMenu";
import { useIsMobile } from "@/lib/useIsMobile";

const NAV: SidebarNavItem[] = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/candidates", label: "Candidates", icon: "◍" },
  { href: "/admin/slots", label: "Slots & Schedule", icon: "▦" },
  { href: "/admin/assignments", label: "Assignment Board", icon: "▤" },
  { href: "/admin/judges", label: "Judges", icon: "◑" },
  { href: "/admin/queries", label: "Queries", icon: "◎" },
  { href: "/admin/unavailability", label: "Unavailability", icon: "◔" },
  { href: "/admin/properties", label: "Scoring Properties", icon: "◒" },
  { href: "/admin/results", label: "Results", icon: "◈" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireRole(["admin"]);
  const isMobile = useIsMobile();

  if (loading) return <PageLoading />;
  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        title="Recruitment"
        navItems={NAV}
        userMenu={<JudgeUserMenu user={user} size={isMobile ? 32 : 36} align={isMobile ? "right" : "left"} showAdminLink={false} showJudgeLink />}
      />
      <main style={{ flex: 1, padding: isMobile ? "68px var(--space-4) var(--space-4)" : "var(--space-6)", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
