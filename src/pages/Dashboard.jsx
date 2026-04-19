import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://stock-market-backend-production-bf5f.up.railway.app/api";
      const [userRes, stocksRes, holdingsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE}/user/${userId}`),
        axios.get(`${API_BASE}/stocks`),
        axios.get(`${API_BASE}/holdings/${userId}`),
        axios.get(`${API_BASE}/admin/orders/user/${userId}`),
      ]);

      setUser(userRes.data || null);
      setStocks(stocksRes.data || []);
      setHoldings(holdingsRes.data || []);
      setUserOrders(ordersRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const portfolioValue = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }, [holdings]);

  const totalHoldings = holdings.length;

  const totalShares = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [holdings]);

  const totalPnL = useMemo(() => {
    return holdings.reduce((sum, item) => {
      const currentVal = (item.currentPrice || 0) * (item.quantity || 0);
      const investedVal = item.totalInvestment || 0;
      return sum + (currentVal - investedVal);
    }, 0);
  }, [holdings]);

  const buyOrders = useMemo(() => {
    return userOrders.filter(o => o.buyerUserId === Number(userId));
  }, [userOrders, userId]);

  const sellOrders = useMemo(() => {
    return userOrders.filter(o => o.sellerUserId === Number(userId));
  }, [userOrders, userId]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getMinBid = (price) => {
    return Math.max((price * 0.80), 0.01).toFixed(2);
  };

  const getMaxBid = (price) => {
    return (price * 1.20).toFixed(2);
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
        @media (max-width: 768px) {
          .user-main-grid {
            grid-template-columns: 1fr !important;
          }
          .stat-grid-layout {
            grid-template-columns: 1fr 1fr !important;
          }
          .order-book-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .top-nav {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        {/* Top Navigation */}
        <div className="top-nav" style={styles.topNav}>
          <h1 style={styles.brandMain}>MARKET ODYSSEY</h1>
          
          <div style={styles.navRight}>
            <div style={styles.statusCard}>
              <span style={styles.liveDot}></span>
              <p style={styles.statusValue}>LIVE</p>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </div>

        {/* Hero Stats Row */}
        <div className="stat-grid-layout" style={styles.statGrid}>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>PORTFOLIO VALUE</p>
            <h2 style={styles.statValue}>{formatCurrency(portfolioValue)}</h2>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>CASH BALANCE</p>
            <h2 style={styles.statValue}>{formatCurrency(user?.balance)}</h2>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>TOTAL HOLDINGS</p>
            <h2 style={styles.statValue}>{totalHoldings}</h2>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>NET P&L</p>
            <h2 style={{ ...styles.statValue, color: totalPnL >= 0 ? "#4ade80" : "#ef4444" }}>
              {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
            </h2>
          </div>
        </div>

        {/* Main Grid */}
        <div className="user-main-grid" style={styles.mainGrid}>
          
          {/* Left Column */}
          <div style={styles.leftColumn}>
            
            {/* Holdings Table */}
            <div style={styles.panel}>
              <div style={styles.panelHeaderRow}>
                <h3 style={styles.panelHeading}>ACTIVE HOLDINGS</h3>
                <button style={{...styles.logoutBtn, color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)'}} onClick={fetchDashboardData}>
                  REFRESH
                </button>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>STOCK</th>
                      <th style={styles.th}>QTY</th>
                      <th style={styles.th}>AVG PRICE</th>
                      <th style={styles.th}>MARKET</th>
                      <th style={styles.th}>VALUE</th>
                      <th style={styles.th}>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.length > 0 ? (
                      holdings.map((holding, index) => {
                        const avgPrice = holding.totalInvestment / holding.quantity;
                        const pnl = (holding.currentPrice * holding.quantity) - holding.totalInvestment;
                        return (
                          <tr key={holding.id || index} style={styles.tr}>
                            <td style={styles.td}>{holding.stockName}</td>
                            <td style={styles.td}>{holding.quantity}</td>
                            <td style={styles.td}>{formatCurrency(avgPrice)}</td>
                            <td style={styles.td}>{formatCurrency(holding.currentPrice)}</td>
                            <td style={styles.td}>{formatCurrency(holding.totalValue)}</td>
                            <td style={{ ...styles.td, color: pnl >= 0 ? "#4ade80" : "#ef4444" }}>
                              {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td style={styles.emptyCell} colSpan="6">
                          NO ACTIVE HOLDINGS
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Book */}
            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>ORDER BOOK</h3>
              
              <div className="order-book-grid-layout" style={styles.orderBookGrid}>
                <div style={styles.orderSection}>
                  <h4 style={styles.orderSubheading}>BUY ORDERS (PENDING)</h4>
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>STOCK</th>
                          <th style={styles.th}>QTY</th>
                          <th style={styles.th}>PRICE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buyOrders.length > 0 ? (
                          buyOrders.map(o => (
                            <tr key={o.id} style={styles.tr}>
                              <td style={styles.td}>{o.stockName}</td>
                              <td style={styles.td}>{o.quantity}</td>
                              <td style={styles.td}>{formatCurrency(o.price)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" style={styles.emptyCell}>NO PENDING BUYS</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={styles.orderSection}>
                  <h4 style={styles.orderSubheading}>SELL ORDERS (PENDING)</h4>
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>STOCK</th>
                          <th style={styles.th}>QTY</th>
                          <th style={styles.th}>PRICE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellOrders.length > 0 ? (
                          sellOrders.map(o => (
                            <tr key={o.id} style={styles.tr}>
                              <td style={styles.td}>{o.stockName}</td>
                              <td style={styles.td}>{o.quantity}</td>
                              <td style={styles.td}>{formatCurrency(o.price)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" style={styles.emptyCell}>NO PENDING SELLS</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            
            {/* Market Pulse */}
            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>MARKET PULSE</h3>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>STOCK</th>
                      <th style={styles.th}>PRICE</th>
                      <th style={styles.th}>MIN BID</th>
                      <th style={styles.th}>MAX BID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.length > 0 ? (
                      stocks.map((stock) => (
                        <tr key={stock.id} style={styles.tr}>
                          <td style={styles.td}>{stock.name}</td>
                          <td style={styles.td}>{formatCurrency(stock.price)}</td>
                          <td style={styles.tdBidMin}>₹{getMinBid(stock.price)}</td>
                          <td style={styles.tdBidMax}>₹{getMaxBid(stock.price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={styles.emptyCell} colSpan="4">
                          MARKET CLOSED
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile Snapshot */}
            <div style={styles.panel}>
              <h3 style={styles.panelHeading}>IDENTITY MODULE</h3>

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
    background: "#050706",
    padding: "32px 24px 50px 24px",
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    color: "#ffffff",
  },

  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1420px",
    margin: "0 auto",
  },

  topNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  brandMain: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 900,
    letterSpacing: "0.2em",
    color: "#4ade80",
    fontStyle: "italic",
    textTransform: "uppercase",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },

  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    background: "rgba(14, 17, 17, 0.6)",
    border: "1px solid rgba(74, 222, 128, 0.15)",
    borderRadius: "12px",
  },

  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 12px rgba(74, 222, 128, 0.8)",
  },

  statusValue: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#f5fff8",
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "8px 16px",
    color: "#ef4444",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
  },

  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    marginBottom: "32px",
  },

  statBox: {
    background: "rgba(14, 17, 17, 0.7)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  statLabel: {
    margin: 0,
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontWeight: 600,
  },

  statValue: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    color: "#ffffff",
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1fr",
    gap: "32px",
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  panel: {
    background: "rgba(14, 17, 17, 0.5)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "20px",
    padding: "24px",
  },

  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  panelHeading: {
    margin: 0,
    fontSize: "14px",
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    fontWeight: 700,
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },

  th: {
    textAlign: "left",
    padding: "0 16px 12px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },

  tr: {
    background: "rgba(255,255,255,0.02)",
  },

  td: {
    padding: "16px",
    color: "#ffffff",
    fontSize: "13px",
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },

  tdBidMin: {
    padding: "16px",
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },

  tdBidMax: {
    padding: "16px",
    color: "#4ade80",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },

  emptyCell: {
    padding: "24px",
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
    letterSpacing: "0.1em",
  },

  infoStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  infoCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
  },

  infoTitle: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontWeight: 600,
  },

  infoText: {
    fontSize: "13px",
    color: "#ffffff",
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },

  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#050706",
  },

  loadingText: {
    color: "#4ade80",
    letterSpacing: "0.2em",
    fontWeight: 700,
    fontSize: "14px",
    textTransform: "uppercase",
  },

  orderBookGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  orderSection: {
    background: "transparent",
  },

  orderSubheading: {
    margin: "0 0 12px 0",
    fontSize: "11px",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.1em",
    fontWeight: 600,
    textTransform: "uppercase",
  },
};

export default Dashboard;