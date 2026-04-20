import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import kineticBull from "../assets/kinetic_bull.png";

const TICKERS = [
  { label: "BTC/USD", value: "+5.24%", color: "#6CB33E", top: "22%", left: "8%" },
  { label: "ETH/USD", value: "+2.1%", color: "#6CB33E", top: "26%", right: "6%" },
  { label: "SPX500", value: "-1.12%", color: "#ef4444", top: "52%", right: "5%" },
  { label: "NDX", value: "-0.8%", color: "#ef4444", top: "58%", left: "7%" },
  { label: "GOLD", value: "+0.43%", color: "#6CB33E", top: "42%", left: "3%" },
];

function Landing() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [tickerVisible, setTickerVisible] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Stagger entrance animations
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setTickerVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Particle grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(78, 222, 163, 0.25)";
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(78, 222, 163, ${0.06 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes kineticFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes kineticPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes kineticGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(108, 179, 62, 0.15), 0 0 80px rgba(108, 179, 62, 0.08); }
          50% { box-shadow: 0 0 60px rgba(108, 179, 62, 0.3), 0 0 120px rgba(108, 179, 62, 0.15); }
        }
        @keyframes tickerSlide {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroReveal {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes statCountUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes navFade {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .kinetic-cta:hover {
          background: #6CB33E !important;
          color: #050706 !important;
          box-shadow: 0 0 40px rgba(108, 179, 62, 0.5), 0 0 80px rgba(108, 179, 62, 0.2) !important;
          transform: translateY(-2px) !important;
        }
        .kinetic-nav-link:hover {
          color: #6CB33E !important;
        }
        .kinetic-footer-link:hover {
          color: #ccc !important;
        }
      `}</style>

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={styles.particleCanvas} />

      {/* Background image with overlay */}
      <div style={styles.bgImageWrap}>
        <img src={kineticBull} alt="" style={{
          ...styles.bgImage,
          animation: visible ? "kineticFloat 8s ease-in-out infinite" : "none",
        }} />
        <div style={styles.bgOverlay} />
        <div style={styles.scanLine} />
      </div>

      {/* Floating Tickers */}
      {TICKERS.map((t, i) => (
        <div
          key={t.label}
          style={{
            ...styles.tickerBadge,
            top: t.top,
            left: t.left || "auto",
            right: t.right || "auto",
            color: t.color,
            animation: tickerVisible
              ? `tickerSlide 0.6s ease-out ${i * 0.15}s both, kineticPulse 3s ease-in-out ${i * 0.5}s infinite`
              : "none",
            opacity: tickerVisible ? 1 : 0,
          }}
        >
          <span style={styles.tickerLabel}>{t.label}</span>{" "}
          <span style={{ fontWeight: 800 }}>{t.value}</span>
        </div>
      ))}

      {/* Navigation */}
      <nav style={{
        ...styles.nav,
        animation: visible ? "navFade 0.8s ease-out both" : "none",
      }}>
        <div style={styles.navBrand}>180DC MLNCE</div>
        <div style={styles.navLinks}>
          <span className="kinetic-nav-link" style={styles.navLink}>MARKETS</span>
          <span className="kinetic-nav-link" style={styles.navLink}>TERMINALS</span>
          <span className="kinetic-nav-link" style={styles.navLink}>INSIGHTS</span>
          <span className="kinetic-nav-link" style={styles.navLink}>INSTITUTIONS</span>
        </div>
        <div style={styles.navRight}>
          <button
            style={styles.navAccessBtn}
            onClick={() => navigate("/login")}
          >
            ACCESS
          </button>
          <button
            className="kinetic-cta"
            style={styles.navExecuteBtn}
            onClick={() => navigate("/login")}
          >
            EXECUTE
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div style={{
        ...styles.heroWrap,
        animation: visible ? "heroReveal 1s ease-out 0.4s both" : "none",
      }}>
        <h1 style={styles.heroTitle}>
          MASTER THE<br />
          <span style={styles.heroAccent}>MARKET.</span>
        </h1>
        <p style={styles.heroSubtitle}>
          High-frequency decision engine built for the professional apex.<br />
          Execute with brutal precision.
        </p>
        <button
          className="kinetic-cta"
          style={styles.heroCta}
          onClick={() => navigate("/login")}
        >
          ENTER THE TERMINAL &nbsp;→
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{
        ...styles.statsBar,
        animation: visible ? "statCountUp 0.8s ease-out 1.6s both" : "none",
      }}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>LATENCY</span>
          <span style={styles.statValueGreen}>&lt;1ms</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statLabel}>UPTIME</span>
          <span style={styles.statValue}>99.999%</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statLabel}>EXECUTION SPEED</span>
          <span style={styles.statValue}>Microsecond</span>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerCopyright}>
          © 2026 180DC MLNCE. HIGH-FREQUENCY CONSULTING ENGINE.
        </span>
        <div style={styles.footerLinks}>
          <span className="kinetic-footer-link" style={styles.footerLink}>LEGAL AUTHORITY</span>
          <span className="kinetic-footer-link" style={styles.footerLink}>RISK DISCLOSURE</span>
          <span className="kinetic-footer-link" style={styles.footerLink}>PRIVACY API</span>
          <span className="kinetic-footer-link" style={styles.footerLink}>SYSTEM STATUS</span>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    background: "#050706",
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  particleCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    pointerEvents: "none",
  },

  bgImageWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  bgImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.35,
    filter: "brightness(0.7) contrast(1.2) saturate(0.8)",
  },

  bgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, rgba(5,7,6,0.6) 0%, rgba(5,7,6,0.85) 50%, rgba(5,7,6,0.95) 100%)",
  },

  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "2px",
    background: "linear-gradient(90deg, transparent, rgba(108, 179, 62, 0.15), transparent)",
    animation: "scanLine 4s linear infinite",
    zIndex: 2,
    pointerEvents: "none",
  },

  // Tickers
  tickerBadge: {
    position: "absolute",
    zIndex: 10,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(108, 179, 62, 0.15)",
    borderRadius: "6px",
    padding: "6px 14px",
    backdropFilter: "blur(10px)",
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },
  tickerLabel: {
    opacity: 0.6,
    fontWeight: 400,
  },

  // Nav
  nav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 48px",
    zIndex: 20,
  },
  navBrand: {
    fontSize: "16px",
    fontWeight: 900,
    letterSpacing: "0.2em",
    color: "#6CB33E",
    fontStyle: "italic",
  },
  navLinks: {
    display: "flex",
    gap: "36px",
  },
  navLink: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    color: "rgba(255,255,255,0.55)",
    cursor: "pointer",
    transition: "color 0.3s ease",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navAccessBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    cursor: "pointer",
    padding: "8px 16px",
  },
  navExecuteBtn: {
    background: "rgba(108, 179, 62, 0.12)",
    border: "1px solid rgba(108, 179, 62, 0.4)",
    color: "#6CB33E",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.15em",
    cursor: "pointer",
    padding: "10px 24px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },

  // Hero
  heroWrap: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  heroTitle: {
    fontSize: "clamp(48px, 8vw, 96px)",
    fontWeight: 900,
    lineHeight: 1.0,
    letterSpacing: "-0.02em",
    margin: 0,
    textShadow: "0 0 60px rgba(255,255,255,0.08)",
  },
  heroAccent: {
    color: "#6CB33E",
    textShadow: "0 0 80px rgba(108, 179, 62, 0.4), 0 0 160px rgba(108, 179, 62, 0.15)",
  },
  heroSubtitle: {
    fontSize: "16px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.5)",
    maxWidth: "480px",
    margin: 0,
    fontWeight: 400,
  },
  heroCta: {
    marginTop: "12px",
    background: "rgba(108, 179, 62, 0.08)",
    border: "1px solid rgba(108, 179, 62, 0.35)",
    color: "#6CB33E",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.2em",
    padding: "18px 48px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.35s ease",
    animation: "kineticGlow 3s ease-in-out infinite",
  },

  // Stats
  statsBar: {
    position: "absolute",
    bottom: "80px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: "48px",
    padding: "0 48px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  statLabel: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.01em",
  },
  statValueGreen: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#6CB33E",
    letterSpacing: "-0.01em",
  },
  statDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(255,255,255,0.08)",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 48px",
    zIndex: 10,
  },
  footerCopyright: {
    fontSize: "9px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
  },
  footerLinks: {
    display: "flex",
    gap: "28px",
  },
  footerLink: {
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    transition: "color 0.3s ease",
    textTransform: "uppercase",
  },
};

export default Landing;
