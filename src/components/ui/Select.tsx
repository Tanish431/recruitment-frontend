import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ style, children, ...props }, ref) => (
    <select
      ref={ref}
      style={{
        padding: "9px 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        fontSize: 14,
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
