"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { sanitizePhoneInput, isValidPhone } from "@/lib/validation";
import { Card, Input, Button } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => {
        if (u.phone && u.whatsapp) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      })
      .catch(() => router.replace("/"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    setError(null);
    if (!isValidPhone(phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    const wa = sameAsPhone ? phone : whatsapp;
    if (!isValidPhone(wa)) {
      setError("WhatsApp number must be exactly 10 digits.");
      return;
    }
    setBusy(true);
    try {
      await api.auth.updateProfile(phone, wa);
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save profile");
    } finally {
      setBusy(false);
    }
  }

  if (checking) return null;

  return (
    <main className="app-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "min(920px, 100%)", display: "grid", gridTemplateColumns: "minmax(0, .9fr) minmax(360px, 1.1fr)", gap: 18, alignItems: "stretch" }}>
        <section className="surface-card subtle-grid" style={{ padding: "clamp(26px, 5vw, 48px)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 520, position: "relative", overflow: "hidden" }}>
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", fontWeight: 800, fontSize: 14 }}>
              DebSoc Recruitment
            </Link>
            <div className="eyebrow" style={{ marginTop: 74 }}>Almost there</div>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1, letterSpacing: "-0.07em", margin: "20px 0 18px" }}>Let&apos;s keep<br /><span style={{ color: "var(--accent)" }}>in touch.</span></h1>
            <p style={{ maxWidth: 330, margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>A few contact details help us reach you about interview slots, round updates, and anything time-sensitive.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 42 }}>
            {[
              ["01", "Add your phone number", "Required for scheduling updates"],
              ["02", "Confirm WhatsApp", "We keep this strictly recruitment-only"],
              ["03", "See your candidate dashboard", "Track every round from one place"],
            ].map(([num, title, desc], index) => (
              <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: "50%", background: index === 0 ? "var(--accent)" : "var(--bg-elevated)", color: index === 0 ? "var(--accent-contrast)" : "var(--text-muted)", border: "1px solid var(--border)", font: "500 10px var(--font-mono)" }}>{num}</span>
                <div><div style={{ fontSize: 12, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 3, fontSize: 11, color: "var(--text-faint)" }}>{desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", right: -44, bottom: -55, width: 170, height: 170, borderRadius: "50%", border: "28px solid var(--accent)", opacity: 0.13 }} />
        </section>

        <Card style={{ padding: "clamp(24px, 5vw, 42px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="mono-label">Candidate profile · step 1 of 1</div>
          <h2 style={{ fontSize: 25, letterSpacing: "-0.055em", margin: "16px 0 8px" }}>Your contact details</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, margin: "0 0 28px" }}>Use a number you&apos;ll have access to throughout the recruitment cycle.</p>

          <label className="form-label" htmlFor="phone">Phone number</label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} placeholder="10-digit number" inputMode="numeric" />

          <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 0", fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
            WhatsApp number is the same
          </label>

          {!sameAsPhone && (
            <div style={{ marginTop: 18 }}>
              <label className="form-label" htmlFor="whatsapp">WhatsApp number</label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(sanitizePhoneInput(e.target.value))} placeholder="10-digit number" inputMode="numeric" />
            </div>
          )}

          {error && <div role="alert" style={{ padding: "11px 12px", borderRadius: 10, background: "var(--danger-soft)", color: "var(--danger)", fontSize: 12, lineHeight: 1.45, marginTop: 18 }}>{error}</div>}

          <Button variant="primary" onClick={submit} disabled={busy} style={{ marginTop: 28, width: "100%", borderRadius: "var(--radius-full)", padding: "12px 18px" }}>
            {busy ? "Saving…" : "Save and continue →"}
          </Button>
          <p style={{ color: "var(--text-faint)", textAlign: "center", fontSize: 11, lineHeight: 1.5, margin: "16px 0 0" }}>Your information is only used for recruitment coordination.</p>
        </Card>
      </div>
      <style>{`@media (max-width: 700px) { main > div { grid-template-columns: 1fr !important; } main section:first-child { min-height: auto !important; } main section:first-child > div:last-of-type { margin-top: 36px !important; } }`}</style>
    </main>
  );
}
