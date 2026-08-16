"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

const MESSAGES = {
  advanced: {
    icon: "🎉",
    title: (round: number) => `You've advanced to Round ${round + 1}!`,
    body: "Great work - keep that momentum going into the next round.",
    tone: "success" as const,
  },
  eliminated: {
    icon: "💙",
    title: () => "Thanks for taking part",
    body: "You didn't make it through this round, but we genuinely appreciated your effort - we hope to see you try again next cycle.",
    tone: "neutral" as const,
  },
};

export function ResultToast({ user }: { user: User }) {
  const [visible, setVisible] = useState<{ round: 1 | 2; result: "advanced" | "eliminated" } | null>(null);

  useEffect(() => {
    if (user.round1_result && !user.round1_result_seen) {
      setVisible({ round: 1, result: user.round1_result as "advanced" | "eliminated" });
      return;
    }
    if (user.round2_result && !user.round2_result_seen) {
      setVisible({ round: 2, result: user.round2_result as "advanced" | "eliminated" });
    }
  }, [user]);

  if (!visible) return null;

  const msg = MESSAGES[visible.result];

  async function dismiss() {
    await api.candidate.acknowledgeResult(visible!.round);
    setVisible(null);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        maxWidth: 360,
        background: "var(--bg-elevated)",
        border: `1px solid ${msg.tone === "success" ? "var(--success)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        padding: "var(--space-4)",
        zIndex: 200,
        animation: "toast-in 0.25s ease",
      }}
    >
      <style>{`@keyframes toast-in { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ fontSize: 24 }}>{msg.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{msg.title(visible.round)}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{msg.body}</div>
          <button
            onClick={dismiss}
            style={{
              marginTop: 10,
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
