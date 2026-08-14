import { api } from "@/lib/api";

const STEPS = [
  { num: "01", title: "Speech", desc: "A 5 minute speech round where you present your ideas on a given topic." },
  { num: "02", title: "AP Debate", desc: "Teams of three go head to head in an Asian Parliamentary style of debate" },
  { num: "03", title: "Final interview", desc: "A one-on-one interview with the DebSoc team" },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px var(--space-6)", maxWidth: 1100, margin: "0 auto",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>DebSoc Recruitment</div>
          <a
          href={api.auth.loginUrl()}
          style={{
            padding: "8px 18px", borderRadius: "var(--radius-md)",
            background: "var(--accent)", color: "var(--accent-contrast)",
            fontWeight: 600, fontSize: 14, textDecoration: "none",
          }}
        >
          Sign in
        </a>
      </header>

      <section style={{ maxWidth: 720, margin: "80px auto 0", textAlign: "center", padding: "0 20px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
          Recruitments Open<br />
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 18, lineHeight: 1.6 }}>
          View your interview slot, track your progress through debates and finals,
          raise a query in one tap if a time doesn&apos;t work and give unavailability information to avoid hassle
        </p>
        <a
          href={api.auth.loginUrl()}
          style={{
            display: "inline-block", marginTop: 32, padding: "13px 28px",
            borderRadius: "var(--radius-md)", background: "var(--accent)", color: "var(--accent-contrast)",
            fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "var(--shadow-md)",
            lineHeight: 1.5,
          }}
        >
          Sign in with campus email
        </a>
      </section>

      <section style={{ maxWidth: 1000, margin: "100px auto 0", padding: "0 20px 100px" }}>
        <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 40 }}>
          How the cycle works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760, margin: "0 auto" }}>
          {STEPS.map((s, index) => {
            const isLast = index === STEPS.length - 1;

            return (
              <div key={s.num} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 }}>
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: "999px", display: "grid", placeItems: "center",
                      background: "var(--accent)", color: "var(--accent-contrast)", fontSize: 12, fontWeight: 800,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {s.num}
                  </div>
                  {!isLast && <div style={{ width: 2, flex: 1, minHeight: 28, background: "var(--border)" }} />}
                </div>

                <div
                  style={{
                    flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)", padding: "var(--space-5)", boxShadow: "var(--shadow-sm)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{s.title}</div>
                    {!isLast && <span style={{ color: "var(--text-faint)", fontSize: 18, lineHeight: 1 }}>→</span>}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "20px", color: "var(--text-faint)", fontSize: 13 }}>
        Sign-in requires a valid campus email address.
      </footer>
    </main>
  );
}
