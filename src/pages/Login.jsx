import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logoRipples, setLogoRipples] = useState([]);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://stock-market-backend-production-bf5f.up.railway.app/api";
      const response = await axios.post(`${API_BASE}/login`, {
        username,
        password,
      });

      const user = response.data;

      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials");
    }
  };

  const handleLogoClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.3;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setLogoRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setLogoRipples((prev) =>
        prev.filter((ripple) => ripple.id !== newRipple.id)
      );
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#050706] text-white">
      <style>
        {`
          @keyframes titleGlow {
            0% {
              filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.14))
                      drop-shadow(0 0 26px rgba(34, 197, 94, 0.08));
            }
            100% {
              filter: drop-shadow(0 0 24px rgba(34, 197, 94, 0.34))
                      drop-shadow(0 0 54px rgba(34, 197, 94, 0.16));
            }
          }

          @keyframes shimmerSweep {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          @keyframes rippleEffect {
            0% {
              transform: scale(0);
              opacity: 0.48;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }

          @keyframes logoFloat {
            0% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-3px) rotate(1.5deg);
            }
            100% {
              transform: translateY(0px) rotate(0deg);
            }
          }

          @keyframes bgDriftOne {
            0% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(18px, -16px) scale(1.05);
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }

          @keyframes bgDriftTwo {
            0% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-14px, 20px) scale(1.06);
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }

          @keyframes panelBreath {
            0% {
              box-shadow:
                0 30px 90px rgba(0, 0, 0, 0.72),
                0 0 0 1px rgba(255,255,255,0.03) inset,
                0 0 26px rgba(34, 197, 94, 0.04);
            }
            100% {
              box-shadow:
                0 38px 110px rgba(0, 0, 0, 0.82),
                0 0 0 1px rgba(255,255,255,0.04) inset,
                0 0 42px rgba(34, 197, 94, 0.09);
            }
          }

          @keyframes linePulse {
            0% {
              opacity: 0.45;
              transform: scaleX(0.9);
            }
            100% {
              opacity: 1;
              transform: scaleX(1.1);
            }
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.24]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(34,197,94,0.16) 0%, transparent 58%)",
          }}
        />

        <div
          className="absolute -top-[18%] -left-[10%] h-[58%] w-[58%] rounded-full bg-green-500/10 blur-[150px]"
          style={{ animation: "bgDriftOne 11s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[6%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-400/10 blur-[130px]"
          style={{ animation: "bgDriftTwo 12s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-[12%] right-[4%] h-[42%] w-[42%] rounded-full bg-green-500/10 blur-[120px]"
          style={{ animation: "bgDriftOne 10s ease-in-out infinite reverse" }}
        />
      </div>

      <header className="fixed top-0 left-0 z-50 flex items-center px-8 py-6">
        <button
          type="button"
          onClick={handleLogoClick}
          className="relative overflow-hidden rounded-full p-2 transition duration-300 hover:scale-[1.05] active:scale-95"
          aria-label="MockStock Logo"
          style={{
            background:
              "radial-gradient(circle at center, rgba(34,197,94,0.12), rgba(255,255,255,0.01) 62%, transparent 78%)",
          }}
        >
          <img
            src={logo}
            alt="MockStock Logo"
            className="relative z-10 h-28 w-auto object-contain drop-shadow-[0_0_34px_rgba(34,197,94,0.88)]"
            style={{
              animation: "logoFloat 6s ease-in-out infinite",
            }}
          />

          {logoRipples.map((ripple) => (
            <span
              key={ripple.id}
              className="pointer-events-none absolute rounded-full border border-green-300/60 bg-green-400/20"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                animation: "rippleEffect 700ms ease-out forwards",
              }}
            />
          ))}
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-24 w-80 rounded-full bg-green-500/10 blur-3xl" />

          <h1
            className="relative -mt-16 text-5xl font-black uppercase md:text-7xl"
            style={{
              letterSpacing: "0.11em",
              backgroundImage:
                "linear-gradient(115deg, #ffffff 16%, #f7fff9 28%, #bbf7d0 40%, #4ade80 52%, #22c55e 60%, #d9fbe4 72%, #ffffff 86%)",
              backgroundSize: "220% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation:
                "titleGlow 3.2s ease-in-out infinite alternate, shimmerSweep 6.2s linear infinite",
            }}
          >
            MARKET ODYSSEY
          </h1>

          <p className="mt-3 text-[11px] uppercase tracking-[0.45em] text-green-400/90 md:text-xs">
            INCEPTION 2026
          </p>

          <div
            className="mx-auto mt-5 h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-green-400 to-transparent"
            style={{ animation: "linePulse 2.4s ease-in-out infinite alternate" }}
          />
        </div>

        <div className="w-full max-w-md">
          <div
            className="relative rounded-[30px] border border-green-500/15 px-9 py-9"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,18,18,0.86) 0%, rgba(12,12,12,0.74) 100%)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              animation: "panelBreath 4s ease-in-out infinite alternate",
            }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_38%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[29px] border border-white/5" />

            <div className="relative space-y-6">
              <div>
                <label className="mb-2.5 block text-[13px] tracking-[0.08em] text-gray-400">
                  USERNAME
                </label>
                <input
                  type="text"
                  placeholder="Enter your handle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-[18px] border border-white/5 bg-white/[0.045] px-4 text-[15px] text-white placeholder:text-gray-500 outline-none transition duration-300 focus:border-green-400/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_1px_rgba(34,197,94,0.16),0_0_22px_rgba(34,197,94,0.12)]"
                  style={{
                    height: "56px",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.18)",
                  }}
                />
              </div>

              <div>
                <label className="mb-2.5 block text-[13px] tracking-[0.08em] text-gray-400">
                  PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="Enter your secret"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[18px] border border-white/5 bg-white/[0.045] px-4 text-[15px] text-white placeholder:text-gray-500 outline-none transition duration-300 focus:border-green-400/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_1px_rgba(34,197,94,0.16),0_0_22px_rgba(34,197,94,0.12)]"
                  style={{
                    height: "56px",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.18)",
                  }}
                />
              </div>

              <button
                onClick={login}
                className="relative h-[56px] w-full overflow-hidden rounded-[18px] font-extrabold tracking-[0.05em] text-black transition duration-300 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(34,197,94,0.3)] active:translate-y-0"
                style={{
                  background:
                    "linear-gradient(180deg, #8cf5ae 0%, #4ade80 44%, #22c55e 100%)",
                  boxShadow:
                    "0 14px 34px rgba(34,197,94,0.18), inset 0 1px 0 rgba(255,255,255,0.34)",
                }}
              >
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.32) 45%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmerSweep 4.8s linear infinite",
                    opacity: 0.85,
                  }}
                />
                <span className="relative z-10">LOGIN</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-[11px] tracking-[0.07em] text-gray-500">
                <span className="cursor-pointer transition duration-300 hover:text-green-400">
                  FORGOT ACCESS?
                </span>
                <span className="cursor-pointer transition duration-300 hover:text-green-400">
                  CREATE ENTITY
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-5 text-gray-600">
            <span className="cursor-pointer rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 transition duration-300 hover:border-green-400/20 hover:bg-white/[0.05] hover:text-green-400">
              🔒
            </span>
            <span className="cursor-pointer rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 transition duration-300 hover:border-green-400/20 hover:bg-white/[0.05] hover:text-green-400">
              🌐
            </span>
            <span className="cursor-pointer rounded-full border border-white/5 bg-white/[0.03] px-3 py-2 transition duration-300 hover:border-green-400/20 hover:bg-white/[0.05] hover:text-green-400">
              ⚙️
            </span>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-6 pt-4 text-center text-[11px] tracking-[0.08em] text-gray-600">
        © 2026 MARKET ODYSSEY • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}

export default Login;