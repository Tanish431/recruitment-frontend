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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");

    function checkMobile() {
      setIsMobile(window.innerWidth <= 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen && isMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isMobile]);

  function toggleCollapse() {
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  }

  const effectiveCollapsed = isMobile ? false : collapsed;

  const navContent = (
    <>
      <div style={{ display: "flex", justifyContent: effectiveCollapsed ? "center" : "space-between", alignItems: "center", marginBottom: 16 }}>
        {!effectiveCollapsed && (
          <div style={{ padding: "0 8px" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
          </div>
        )}
        {!effectiveCollapsed && userMenu}
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} style={closeBtnStyle}>✕</button>
        ) : (
          <button onClick={toggleCollapse} style={collapseBtnStyle} title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? "»" : "«"}
          </button>
        )}
      </div>

      {banner && !effectiveCollapsed && (
        <div style={{ marginBottom: 16 }}>{banner}</div>
      )}

      <div
        style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={effectiveCollapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: effectiveCollapsed ? "10px 0" : "9px 10px",
                justifyContent: effectiveCollapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--accent)" : "var(--text-muted)",
                background: active ? "var(--accent-soft)" : "transparent",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 16,
                  textAlign: "center",
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
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
          <button onClick={() => setMobileOpen(true)} style={hamburgerStyle}>
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
          {userMenu ? <div>{userMenu}</div> : <span style={{ width: 22 }} />}
        </div>

        {mobileOpen && (
          <div onClick={() => setMobileOpen(false)} style={overlayStyle} />
        )}

        <nav
          style={{
            ...drawerBaseStyle,
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          {navContent}
        </nav>
      </>
    );
  }

  return (
    <nav style={{ ...desktopBaseStyle, width: collapsed ? 64 : 232 }}>
      {navContent}
    </nav>
  );
}

const topbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 30,
};
const hamburgerStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  color: "var(--text)",
  padding: 0,
};
const closeBtnStyle: React.CSSProperties = { ...hamburgerStyle };
const collapseBtnStyle: React.CSSProperties = {
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  width: 26,
  height: 26,
  cursor: "pointer",
  color: "var(--text-muted)",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 40,
};
const drawerBaseStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  width: 240,
  background: "var(--bg)",
  borderRight: "1px solid var(--border)",
  padding: "var(--space-4)",
  display: "flex",
  flexDirection: "column",
  zIndex: 50,
  transition: "transform 0.2s ease",
  overflowY: "auto",
};
const desktopBaseStyle: React.CSSProperties = {
  flexShrink: 0,
  borderRight: "1px solid var(--border)",
  padding: "var(--space-4)",
  display: "flex",
  flexDirection: "column",
  transition: "width 0.15s ease",
};
