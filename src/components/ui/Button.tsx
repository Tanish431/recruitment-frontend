"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const base: React.CSSProperties = {
  fontWeight: 600,
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
  whiteSpace: "nowrap",
};

const sizes = {
  sm: { padding: "6px 12px", fontSize: 13 },
  md: { padding: "9px 16px", fontSize: 14 },
};

const borders: Record<Variant, string> = {
  primary: "1px solid transparent",
  secondary: "1px solid var(--border)",
  ghost: "1px solid transparent",
  danger: "1px solid transparent",
};

const variants: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--accent)", color: "var(--accent-contrast)" },
  secondary: { background: "var(--bg-elevated)", color: "var(--text)" },
  ghost: { background: "transparent", color: "var(--text-muted)" },
  danger: { background: "var(--danger-soft)", color: "var(--danger)" },
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "secondary", size = "md", style, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        border: borders[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    />
  )
);
Button.displayName = "Button";
