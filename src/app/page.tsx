import Link from "next/link";
import { api } from "@/lib/api";

const STEPS = [
  { num: "01", title: "Say what you think", desc: "A short speech on a topic. No perfect answer, just your point of view." },
  { num: "02", title: "Think out loud", desc: "A friendly AP-style debate with a small team. Bring your curiosity." },
  { num: "03", title: "Have a real chat", desc: "A relaxed conversation with the DebSoc team. We want to meet you." },
];

export default function Home() {
  const loginUrl = api.auth.loginUrl();

  return (
    <main className="app-shell" style={{ overflow: "hidden" }}>
      <header className="page-frame" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", fontWeight: 800, letterSpacing: "-0.04em" }}>
          <span>DebSoc <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Recruitment</span></span>
        </Link>
        <a href={loginUrl} style={{ padding: "10px 16px", borderRadius: "var(--radius-full)", background: "var(--ink)", color: "var(--bg)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          Sign in <span style={{ marginLeft: 6 }}>↗</span>
        </a>
      </header>

      <section id="top" className="page-frame" style={{ padding: "72px 0 102px", position: "relative" }}>
        <div style={{ position: "absolute", top: 40, right: -120, width: 300, height: 300, borderRadius: "48% 52% 60% 40%", background: "var(--accent-soft)", transform: "rotate(18deg)", opacity: 0.8, zIndex: -1 }} />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, .9fr)", gap: 58, alignItems: "center" }}>
          <div className="fade-up">
            <div className="eyebrow">2026 intake · come as you are</div>
            <h1 className="display-title" style={{ maxWidth: 700, margin: "24px 0 24px" }}>
              Got thoughts?<br />
              <span style={{ color: "var(--accent)" }}>We want to hear them.</span>
            </h1>
            <p style={{ maxWidth: 560, margin: 0, color: "var(--text-muted)", fontSize: 17, lineHeight: 1.7 }}>
              You do not need to sound like a news anchor or have every answer ready. Just bring an opinion, an open mind, and a little bit of your own flavour.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 34 }}>
              <a href={loginUrl} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: "var(--radius-full)", background: "var(--accent)", color: "var(--accent-contrast)", fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "var(--shadow-md)" }}>
                I&apos;m curious — let&apos;s go <span style={{ fontSize: 17 }}>→</span>
              </a>
              <span style={{ color: "var(--text-faint)", fontSize: 12 }}>Campus email only · super quick</span>
            </div>
          </div>

          <div className="surface-card fade-up delay-1" style={{ padding: 20, position: "relative", minHeight: 300, overflow: "hidden", background: "var(--ink)", color: "var(--bg)" }}>
            <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", right: -36, top: -44, background: "var(--accent)", opacity: 0.9 }} />
            <div style={{ position: "absolute", width: 75, height: 75, borderRadius: "24px", right: 30, bottom: -20, background: "var(--blue)", transform: "rotate(18deg)", opacity: 0.9 }} />
            <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono-label" style={{ color: "color-mix(in srgb, var(--bg) 60%, transparent)" }}>A note from the team</span>
                <span style={{ fontSize: 22, transform: "rotate(12deg)" }}>✳</span>
              </div>
              <div>
                <div style={{ fontSize: 29, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.065em", maxWidth: 310 }}>The best conversations usually start with, “Wait, but hear me out…”</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
                  {['ideas', 'banter', 'big questions'].map((tag) => <span key={tag} style={{ padding: "7px 10px", borderRadius: "var(--radius-full)", background: "color-mix(in srgb, var(--bg) 12%, transparent)", color: "var(--bg)", fontSize: 11, fontWeight: 700 }}>{tag}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-frame" style={{ padding: "20px 0 110px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginBottom: 28 }}>
          <div>
            <div className="eyebrow">What to expect</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1, letterSpacing: "-0.06em", margin: "16px 0 0" }}>Three chances to<br />be very much yourself.</h2>
          </div>
          <p style={{ maxWidth: 260, margin: 0, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, textAlign: "right" }}>There is no secret personality type we are looking for.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {STEPS.map((step, index) => (
            <article key={step.num} className={`surface-card fade-up delay-${index + 1}`} style={{ padding: 22, minHeight: 238, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: index === 0 ? "var(--accent)" : "var(--text-faint)", font: "500 12px var(--font-mono)" }}>{step.num}</span>
                  <span style={{ width: 28, height: 28, borderRadius: index === 1 ? 8 : "50%", display: "grid", placeItems: "center", background: index === 1 ? "var(--accent-soft)" : "var(--bg-subtle)", color: "var(--accent-strong)", transform: index === 2 ? "rotate(12deg)" : undefined }}>{index === 0 ? "+" : index === 1 ? "↗" : "~"}</span>
                </div>
                <h3 style={{ fontSize: 22, margin: "34px 0 10px", letterSpacing: "-0.05em" }}>{step.title}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
              <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid var(--border)", color: "var(--accent-strong)", fontSize: 12, fontWeight: 800 }}>{index === 0 ? "No script required" : index === 1 ? "Team effort" : "Just a conversation"}</div>
            </article>
          ))}
        </div>

        <div className="surface-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginTop: 18, padding: "19px 22px", background: "var(--accent-soft)", borderColor: "transparent" }}>
          <div><div style={{ fontSize: 15, fontWeight: 800 }}>Still deciding?</div><div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 12 }}>That is completely fair. Start anyway and see where the conversation takes you.</div></div>
          <a href={loginUrl} style={{ flexShrink: 0, color: "var(--accent-strong)", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Take the first step →</a>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "22px 0 26px" }}>
        <div className="page-frame" style={{ display: "flex", justifyContent: "space-between", gap: 20, color: "var(--text-faint)", fontSize: 12 }}>
          <span>DebSoc Recruitment · 2026 intake</span>
          <span>Sign-in requires a valid campus email address.</span>
        </div>
      </footer>

      <style>{`@media (max-width: 760px) { .page-frame > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; gap: 36px !important; } .page-frame > div[style*="repeat(3"] { grid-template-columns: 1fr !important; } footer .page-frame { flex-direction: column; } footer .page-frame span:last-child { text-align: left !important; } }`}</style>
    </main>
  );
}
