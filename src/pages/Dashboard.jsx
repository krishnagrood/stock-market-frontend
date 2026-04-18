import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
      const [userRes, stocksRes, holdingsRes] = await Promise.all([
        axios.get(`${API_BASE}/user/${userId}`),
        axios.get(`${API_BASE}/stocks`),
        axios.get(`${API_BASE}/holdings/${userId}`),
      ]);

      setUser(userRes.data || null);
      setStocks(stocksRes.data || []);
      setHoldings(holdingsRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const portfolioValue = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }, [holdings]);

  const totalHoldings = holdings.length;

  const totalShares = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [holdings]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.backgroundGlowOne}></div>
        <div style={styles.backgroundGlowTwo}></div>
        <div style={styles.gridOverlay}></div>

        <div style={styles.loadingWrap}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingText}>LOADING USER TERMINAL...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes mockStockGlimmer {
          0% {
            background-position: -220% center;
          }
          100% {
            background-position: 220% center;
          }
        }

        @keyframes mockStockPulse {
          0% {
            text-shadow: 0 0 14px rgba(59, 255, 150, 0.10), 0 0 28px rgba(59, 255, 150, 0.08);
          }
          50% {
            text-shadow: 0 0 18px rgba(59, 255, 150, 0.22), 0 0 42px rgba(59, 255, 150, 0.16);
          }
          100% {
            text-shadow: 0 0 14px rgba(59, 255, 150, 0.10), 0 0 28px rgba(59, 255, 150, 0.08);
          }
        }
      `}</style>

      <div style={styles.backgroundGlowOne}></div>
      <div style={styles.backgroundGlowTwo}></div>
      <div style={styles.gridOverlay}></div>

      <div style={styles.container}>
        <div style={styles.topBrandBlock}>
          <p style={styles.brandTopText}>INVESTOR ACCESS</p>
          <h1 style={styles.brandMain}>MOCK.STOCK</h1>
          <div style={styles.brandLine}></div>
        </div>

        <div style={styles.heroRow}>
          <div>
            <h2 style={styles.heroTitle}>USER PORTFOLIO TERMINAL</h2>
            <p style={styles.heroSubtitle}>PREMIUM INVESTOR INTERFACE</p>
          </div>

          <div style={styles.statusWrap}>
            <div style={styles.statusCard}>
              <p style={styles.statusLabel}>ACCOUNT</p>
              <h3 style={styles.statusValue}>ACTIVE</h3>
            </div>

            <div style={styles.statusCard}>
              <p style={styles.statusLabel}>STATUS</p>
              <h3 style={styles.statusValue}>
                <span style={styles.liveDot}></span> LIVE
              </h3>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.leftColumn}>
            <div style={styles.panel}>
              <div style={styles.panelHeaderRow}>
                <h3 style={styles.panelHeading}>ACCOUNT OVERVIEW</h3>
                <span style={styles.badge}>INVESTOR</span>
              </div>

              <div style={styles.statGrid}>
                <div style={styles.statBox}>
                  <p style={styles.statLabel}>CURRENT BALANCE</p>
                  <h2 style={styles.statValue}>{formatCurrency(user?.balance)}</h2>
                </div>

                <div style={styles.statBox}>
                  <p style={styles.statLabel}>PORTFOLIO VALUE</p>
                  <h2 style={styles.statValue}>{formatCurrency(portfolioValue)}</h2>
                </div>

                <div style={styles.statBox}>
                  <p style={styles.statLabel}>TOTAL HOLDINGS</p>
                  <h2 style={styles.statValue}>{totalHoldings}</h2>
                </div>

                <div style={styles.statBox}>
                  <p style={styles.statLabel}>TOTAL SHARES</p>
                  <h2 style={styles.statValue}>{totalShares}</h2>
                </div>
              </div>

              <button style={styles.primaryButton} onClick={fetchDashboardData}>
                REFRESH DASHBOARD
              </button>
            </div>

            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>CURRENT HOLDINGS</h3>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>STOCK NAME</th>
                      <th style={styles.th}>QUANTITY</th>
                      <th style={styles.th}>CURRENT PRICE</th>
                      <th style={styles.th}>TOTAL VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.length > 0 ? (
                      holdings.map((holding, index) => (
                        <tr key={holding.id || index} style={styles.tr}>
                          <td style={styles.td}>{holding.stockName}</td>
                          <td style={styles.td}>{holding.quantity}</td>
                          <td style={styles.td}>{formatCurrency(holding.currentPrice)}</td>
                          <td style={styles.td}>{formatCurrency(holding.totalValue)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={styles.emptyCell} colSpan="4">
                          NO HOLDINGS AVAILABLE
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>PROFILE SNAPSHOT</h3>

              <div style={styles.infoStack}>
                <div style={styles.infoCard}>
                  <span style={styles.infoTitle}>USER ID</span>
                  <span style={styles.infoText}>{user?.id || "N/A"}</span>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoTitle}>USERNAME</span>
                  <span style={styles.infoText}>{user?.username || "N/A"}</span>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoTitle}>ROLE</span>
                  <span style={styles.infoText}>{user?.role || "USER"}</span>
                </div>
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>MARKET OVERVIEW</h3>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>STOCK NAME</th>
                      <th style={styles.th}>PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.length > 0 ? (
                      stocks.map((stock) => (
                        <tr key={stock.id} style={styles.tr}>
                          <td style={styles.td}>{stock.name}</td>
                          <td style={styles.td}>{formatCurrency(stock.price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={styles.emptyCell} colSpan="2">
                          NO STOCKS AVAILABLE
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>PORTFOLIO SUMMARY</h3>

              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Available Balance</span>
                  <span style={styles.summaryValue}>{formatCurrency(user?.balance)}</span>
                </div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Portfolio Worth</span>
                  <span style={styles.summaryValue}>{formatCurrency(portfolioValue)}</span>
                </div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Number of Holdings</span>
                  <span style={styles.summaryValue}>{totalHoldings}</span>
                </div>

                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Total Shares Owned</span>
                  <span style={styles.summaryValue}>{totalShares}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top left, rgba(17, 71, 48, 0.25), transparent 30%), linear-gradient(135deg, #020504 0%, #010202 45%, #000000 100%)",
    padding: "32px 24px 50px 24px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#ffffff",
  },

  backgroundGlowOne: {
    position: "absolute",
    top: "-120px",
    left: "-120px",
    width: "420px",
    height: "420px",
    background: "radial-gradient(circle, rgba(35, 255, 157, 0.12), transparent 70%)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",
    right: "-120px",
    bottom: "-120px",
    width: "380px",
    height: "380px",
    background: "radial-gradient(circle, rgba(0, 255, 170, 0.08), transparent 70%)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,255,120,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,120,0.03) 1px, transparent 1px)",
    backgroundSize: "64px 64px",
    opacity: 0.25,
    pointerEvents: "none",
  },

  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1420px",
    margin: "0 auto",
  },

  topBrandBlock: {
    textAlign: "center",
    marginBottom: "42px",
  },

  brandTopText: {
    margin: 0,
    color: "#38d996",
    letterSpacing: "8px",
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  brandMain: {
    margin: "18px 0 12px 0",
    fontSize: "82px",
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-2px",
    color: "transparent",
    backgroundImage:
      "linear-gradient(115deg, #f7f7f7 0%, #f7f7f7 32%, #72ffbf 45%, #ffffff 52%, #72ffbf 58%, #f7f7f7 72%, #f7f7f7 100%)",
    backgroundSize: "220% auto",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "mockStockGlimmer 4.2s linear infinite, mockStockPulse 3.2s ease-in-out infinite",
  },

  brandLine: {
    width: "120px",
    height: "2px",
    margin: "0 auto",
    background: "linear-gradient(90deg, transparent, rgba(68,255,170,0.85), transparent)",
  },

  heroRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "34px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "38px",
    lineHeight: 1.1,
    fontWeight: 700,
    color: "#f4f4f4",
    letterSpacing: "-0.5px",
  },

  heroSubtitle: {
    margin: "8px 0 0 2px",
    fontSize: "13px",
    letterSpacing: "2px",
    color: "rgba(255,255,255,0.58)",
    textTransform: "uppercase",
  },

  statusWrap: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
  },

  statusCard: {
    minWidth: "150px",
    background: "rgba(8, 12, 10, 0.7)",
    border: "1px solid rgba(95, 255, 175, 0.12)",
    borderRadius: "22px",
    padding: "18px 24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },

  statusLabel: {
    margin: 0,
    fontSize: "13px",
    letterSpacing: "4px",
    color: "rgba(255,255,255,0.46)",
    textTransform: "uppercase",
  },

  statusValue: {
    margin: "12px 0 0 0",
    fontSize: "20px",
    fontWeight: 700,
    color: "#f5fff8",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  liveDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#66ffb4",
    boxShadow: "0 0 10px rgba(102,255,180,0.95)",
    display: "inline-block",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.9fr",
    gap: "28px",
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },

  panel: {
    background: "linear-gradient(180deg, rgba(7,10,9,0.92), rgba(5,7,6,0.88))",
    border: "1px solid rgba(76, 255, 154, 0.10)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
    backdropFilter: "blur(12px)",
  },

  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  panelHeading: {
    margin: 0,
    fontSize: "18px",
    letterSpacing: "4px",
    color: "rgba(255,255,255,0.58)",
    textTransform: "uppercase",
    fontWeight: 700,
  },

  badge: {
    border: "1px solid rgba(91,255,170,0.28)",
    color: "#62ffb4",
    padding: "9px 16px",
    borderRadius: "12px",
    fontSize: "12px",
    letterSpacing: "2px",
    fontWeight: 700,
    textTransform: "uppercase",
    background: "rgba(13, 33, 23, 0.55)",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },

  statBox: {
    background: "linear-gradient(180deg, rgba(13,18,16,0.95), rgba(7,10,9,0.92))",
    border: "1px solid rgba(90,255,175,0.08)",
    borderRadius: "20px",
    padding: "22px",
  },

  statLabel: {
    margin: 0,
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  statValue: {
    margin: "14px 0 0 0",
    fontSize: "34px",
    lineHeight: 1.1,
    color: "#f6fff9",
    fontWeight: 800,
  },

  primaryButton: {
    width: "100%",
    padding: "18px 22px",
    borderRadius: "18px",
    border: "1px solid rgba(110,255,188,0.18)",
    background: "linear-gradient(90deg, #64e9b4, #118c57)",
    color: "#03140d",
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "2px",
    cursor: "pointer",
    textTransform: "uppercase",
    boxShadow: "0 10px 28px rgba(24, 214, 129, 0.25)",
  },

  tableWrap: {
    overflowX: "auto",
    marginTop: "18px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px 16px",
    color: "rgba(255,255,255,0.55)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  td: {
    padding: "17px 16px",
    color: "#f5fff9",
    fontSize: "15px",
  },

  emptyCell: {
    padding: "24px",
    textAlign: "center",
    color: "rgba(255,255,255,0.46)",
    fontSize: "14px",
    letterSpacing: "1px",
  },

  infoStack: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "18px",
  },

  infoCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 18px",
    borderRadius: "18px",
    border: "1px solid rgba(86,255,172,0.08)",
    background: "rgba(10, 14, 12, 0.88)",
    gap: "14px",
  },

  infoTitle: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.48)",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  infoText: {
    fontSize: "16px",
    color: "#f3fff7",
    fontWeight: 700,
  },

  summaryBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "18px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "16px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: "15px",
  },

  summaryValue: {
    color: "#eafff2",
    fontSize: "17px",
    fontWeight: 700,
  },

  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },

  loadingCard: {
    background: "rgba(8, 12, 10, 0.82)",
    border: "1px solid rgba(95,255,175,0.12)",
    padding: "28px 36px",
    borderRadius: "22px",
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  },

  loadingText: {
    color: "#e7fff0",
    letterSpacing: "3px",
    fontWeight: 700,
    fontSize: "14px",
  },
};

export default Dashboard;