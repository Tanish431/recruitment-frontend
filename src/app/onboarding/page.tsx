"use client";
import { useState, useEffect } from "react";
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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 20,
      }}
    >
      <Card style={{ width: 400 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>One more step</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 20px" }}>
          We need a phone and WhatsApp number to reach you about your slot.
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Phone number</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
          placeholder="10-digit number"
          inputMode="numeric"
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13 }}>
          <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} />
          WhatsApp number is the same
        </label>

        {!sameAsPhone && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>WhatsApp number</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(sanitizePhoneInput(e.target.value))}
              placeholder="10-digit number"
              inputMode="numeric"
            />
          </div>
        )}

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <Button variant="primary" onClick={submit} disabled={busy} style={{ marginTop: 20, width: "100%" }}>
          {busy ? "Saving…" : "Continue"}
        </Button>
      </Card>
    </main>
  );
}
