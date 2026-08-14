import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ style, ...props }, ref) => (
    <input
      ref={ref}
      style={{
        width: "100%",
        padding: "9px 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        fontSize: 14,
        ...style,
      }}
      {...props}
    />
  )
);
Input.displayName = "Input";
