"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon?: string;
}

export function Sidebar({
  title,
  subtitle,
  navItems,
  footer,
  banner,
  emptyMessage,
  userMenu,
}: {
  title: string;
  subtitle?: string;
  navItems: SidebarNavItem[];
  footer?: React.ReactNode;
  banner?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  userMenu?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const effectiveCollapsed = isMobile ? false : collapsed;
  const mobileOpen = isMobile && mobileOpenPath === pathname;

  useEffect(() => {
    document.body.style.overflow = mobileOpen && isMobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, isMobile]);

  function toggleCollapse() {
    setCollapsed((current) => {
      localStorage.setItem("sidebar-collapsed", String(!current));
      return !current;
    });
  }

  const navContent = (
    <>
      <div style={{ display: "flex", justifyContent: effectiveCollapsed ? "center" : "space-between", alignItems: "center", gap: 10, marginBottom: 22 }}>
        {!effectiveCollapsed ? (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.035em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
            {subtitle && <div style={{ color: "var(--text-faint)", fontSize: 10, marginTop: 2 }}>{subtitle}</div>}
          </div>
        ) : (
          <div aria-hidden="true" style={{ flex: 1 }} />
        )}
        {!effectiveCollapsed && userMenu}
        {isMobile ? <button onClick={() => setMobileOpenPath(null)} style={closeBtnStyle} aria-label="Close navigation">×</button> : <button onClick={toggleCollapse} style={collapseBtnStyle} title={collapsed ? "Expand" : "Collapse"} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? "»" : "«"}</button>}
      </div>

      {banner && !effectiveCollapsed && <div style={{ marginBottom: 18 }}>{banner}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {!effectiveCollapsed && <div className="mono-label" style={{ padding: "0 10px", marginBottom: 7 }}>Workspace</div>}
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} title={effectiveCollapsed ? item.label : undefined} style={{ display: "flex", alignItems: "center", gap: 11, padding: effectiveCollapsed ? "11px 0" : "10px 11px", justifyContent: effectiveCollapsed ? "center" : "flex-start", borderRadius: 11, fontSize: 12, fontWeight: active ? 800 : 600, color: active ? "var(--accent-strong)" : "var(--text-muted)", background: active ? "var(--accent-soft)" : "transparent", textDecoration: "none", border: active ? "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" : "1px solid transparent", transition: "background .18s ease, color .18s ease, transform .18s ease" }}>
              <span style={{ width: 17, textAlign: "center", opacity: active ? 1 : 0.72, flexShrink: 0, fontSize: 14 }}>{item.icon}</span>
              {!effectiveCollapsed && item.label}
            </Link>
          );
        })}
        {navItems.length === 0 && !effectiveCollapsed && emptyMessage}
      </div>
      {!effectiveCollapsed && footer}
    </>
  );

  if (isMobile) {
    return (
      <>
        <div style={topbarStyle}>
          <button onClick={() => setMobileOpenPath(pathname)} style={hamburgerStyle} aria-label="Open navigation">☰</button>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.035em" }}>{title}</span>
          {userMenu ? <div>{userMenu}</div> : <span style={{ width: 24 }} />}
        </div>
        {mobileOpen && <div onClick={() => setMobileOpenPath(null)} style={overlayStyle} />}
        <nav style={{ ...drawerBaseStyle, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}>{navContent}</nav>
      </>
    );
  }

  return <nav style={{ ...desktopBaseStyle, width: collapsed ? 72 : 248 }}>{navContent}</nav>;
}

const topbarStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--bg-elevated) 92%, transparent)", backdropFilter: "blur(16px)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 30 };
const hamburgerStyle: React.CSSProperties = { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text)", padding: 0 };
const closeBtnStyle: React.CSSProperties = { ...hamburgerStyle, fontSize: 24, lineHeight: 1 };
const collapseBtnStyle: React.CSSProperties = { background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 9, width: 28, height: 28, cursor: "pointer", color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(26, 21, 17, 0.48)", backdropFilter: "blur(2px)", zIndex: 40 };
const drawerBaseStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, bottom: 0, width: 270, background: "var(--bg-elevated)", borderRight: "1px solid var(--border)", padding: "22px 16px", display: "flex", flexDirection: "column", zIndex: 50, transition: "transform 0.24s ease", overflowY: "auto" };
const desktopBaseStyle: React.CSSProperties = { flexShrink: 0, minHeight: "100vh", background: "color-mix(in srgb, var(--bg-elevated) 64%, transparent)", borderRight: "1px solid var(--border)", padding: "22px 14px", display: "flex", flexDirection: "column", transition: "width 0.18s ease" };
