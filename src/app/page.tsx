import Link from "next/link";
import { api } from "@/lib/api";
import TeamMark from "./debsoc_logo-removebg-preview.png";

const STEPS = [
  {
    num: "01",
    title: "Speech Round",
    desc: "A short speech on a topic of youur choosing.",
  },
  {
    num: "02",
    title: "Debate Round",
    desc: "A friendly AP-style debate with a team. We will assess your speech and your teamwork.",
  },
  {
    num: "03",
    title: "Interview Round",
    desc: "A final interview round with the DebSoc team.",
  },
];

export default function Home() {
  const loginUrl = api.auth.loginUrl();

  return (
    <main className="app-shell" style={{ overflow: "hidden" }}>
      <header
        className="page-frame"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 0",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          <span>
            DebSoc {" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
              Recruitment
            </span>
          </span>
        </Link>
        <a
          href={loginUrl}
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-full)",
            background: "var(--ink)",
            color: "var(--bg)",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Sign in <span style={{ marginLeft: 6 }}>↗</span>
        </a>
      </header>

      <section
        id="top"
        className="page-frame"
        style={{ padding: "72px 0 102px", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            right: -120,
            width: 300,
            height: 300,
            borderRadius: "48% 52% 60% 40%",
            background: "var(--accent-soft)",
            transform: "rotate(18deg)",
            opacity: 0.8,
            zIndex: -1,
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(340px, 1fr)",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div className="fade-up">
            <h1
              className="display-title"
              style={{ maxWidth: 700, margin: "24px 0 24px" }}
            >
              DEBSOC
              <br />
              <span style={{ color: "var(--accent)" }}>
                Words and ideas can change the world.
              </span>
            </h1>
            <p
              style={{
                maxWidth: 560,
                margin: 0,
                color: "var(--text-muted)",
                fontSize: 17,
                lineHeight: 1.7,
              }}
            >
              Debating is not just conflicts and endless deadlocks, it is about critical thinking and problem solving in the most realistic way.
              We learn and compete throughtout the year in this club. If you feel like you can speak your mind and sought out better outcomes, come join us.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 14,
                marginTop: 34,
              }}
            >
              <a
                href={loginUrl}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent)",
                  color: "var(--accent-contrast)",
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                I&apos;m curious — let&apos;s go{" "}
                <span style={{ fontSize: 17 }}>→</span>
              </a>
              <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                Campus email only.
              </span>
            </div>
          </div>

          <div
            className="surface-card fade-up delay-1"
            style={{
              padding: 28,
              position: "relative",
              minHeight: 392,
              overflow: "hidden",
              background: "var(--ink)",
              color: "var(--bg)",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 132,
                height: 132,
                borderRadius: "50%",
                right: 22,
                top: 18,
                background: "#101114",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 18px 36px rgba(0, 0, 0, 0.22)",
              }}
            >
              <img
                src={TeamMark.src}
                alt=""
                width={94}
                height={94}
                style={{ display: "block", objectFit: "contain" }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                width: 75,
                height: 75,
                borderRadius: "24px",
                right: 30,
                bottom: -20,
                background: "var(--blue)",
                transform: "rotate(18deg)",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 336,
                paddingTop: 8,
                paddingRight: 152,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  className="mono-label"
                  style={{
                    color: "color-mix(in srgb, var(--bg) 60%, transparent)",
                  }}
                >
                  A note from the team
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 31,
                    lineHeight: 1.14,
                    fontWeight: 800,
                    letterSpacing: "-0.065em",
                    maxWidth: 332,
                  }}
                >
                  Knowing how to form arguments means knowing how to be clear in your thoughts and ideas.
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 24,
                  }}
                >
                  {["ideas", "banter", "flow"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "var(--radius-full)",
                        background:
                          "color-mix(in srgb, var(--bg) 12%, transparent)",
                        color: "var(--bg)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-frame" style={{ padding: "20px 0 110px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                lineHeight: 1,
                letterSpacing: "-0.06em",
                margin: "16px 0 0",
              }}
            >
              Three rounds for
              <br />
              the whole recruitment.
            </h2>
          </div>
          <p
            style={{
              maxWidth: 260,
              margin: 0,
              color: "var(--text-muted)",
              fontSize: 13,
              lineHeight: 1.6,
              textAlign: "right",
            }}
          >
            BTW there is no secret personality type we are looking for.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {STEPS.map((step, index) => (
            <article
              key={step.num}
              className={`surface-card fade-up delay-${index + 1}`}
              style={{
                padding: 22,
                minHeight: 238,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color:
                        index === 0 ? "var(--accent)" : "var(--text-faint)",
                      font: "500 12px var(--font-mono)",
                    }}
                  >
                    {step.num}
                  </span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: index === 1 ? 8 : "50%",
                      display: "grid",
                      placeItems: "center",
                      background:
                        index === 1 ? "var(--accent-soft)" : "var(--bg-subtle)",
                      color: "var(--accent-strong)",
                      transform: index === 2 ? "rotate(12deg)" : undefined,
                    }}
                  >
                    {index === 0 ? "+" : index === 1 ? "↗" : "~"}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 22,
                    margin: "34px 0 10px",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-muted)",
                    fontSize: 13,
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 14,
                  borderTop: "1px solid var(--border)",
                  color: "var(--accent-strong)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {index === 0
                  ? "No script required"
                  : index === 1
                    ? "Team effort"
                    : "Just a conversation"}
              </div>
            </article>
          ))}
        </div>

        <div
          className="surface-card"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginTop: 18,
            padding: "19px 22px",
            background: "var(--accent-soft)",
            borderColor: "transparent",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Still deciding?</div>
            <div
              style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 12 }}
            >
              That is completely fair. We would still encourage you to take the first step and then decide for yourself.
            </div>
          </div>
          <a
            href={loginUrl}
            style={{
              flexShrink: 0,
              color: "var(--accent-strong)",
              fontSize: 13,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Take the first step →
          </a>
        </div>
      </section>

      <footer
        style={{ borderTop: "1px solid var(--border)", padding: "22px 0 26px" }}
      >
        <div
          className="page-frame"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            color: "var(--text-faint)",
            fontSize: 12,
          }}
        >
          <span>DebSoc Recruitment · 2026 intake</span>
          <span>Sign-in requires a valid campus email address.</span>
        </div>
      </footer>

      <style>{`@media (max-width: 760px) { .page-frame > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; gap: 36px !important; } .page-frame > div[style*="repeat(3"] { grid-template-columns: 1fr !important; } footer .page-frame { flex-direction: column; } footer .page-frame span:last-child { text-align: left !important; } }`}</style>
    </main>
  );
}
