import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
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

  // Real demat-style calculations
  const portfolioValue = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  }, [holdings]);

  const totalInvested = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.totalInvestment || 0), 0);
  }, [holdings]);

  const totalHoldings = holdings.length;

  const totalShares = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [holdings]);

  // P&L = Current Market Value - Total Investment (like a real demat)
  const totalPnL = useMemo(() => {
    return holdings.reduce((sum, item) => sum + (item.pnl || 0), 0);
  }, [holdings]);

  const totalPnLPercent = useMemo(() => {
    return totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;
  }, [totalPnL, totalInvested]);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse font-headline tracking-widest uppercase">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary">
      <div className="scanline-overlay"></div>
      
      {/* SideNavBar */}
      <aside className="flex flex-col fixed left-0 top-0 h-full py-8 bg-[#191c1b] docked left-0 h-screen w-64 border-r border-[#6bfb9a]/5 z-50 hidden lg:flex">
        <div className="px-6 mb-10">
          <h1 className="text-[#4ade80] font-black italic text-xl tracking-tighter">180Degree Consulting MLNCE</h1>
          <p className="text-[#e2e3e0]/40 font-['Inter'] text-[10px] uppercase tracking-[0.2em] mt-1">Active Session</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 bg-[#6bfb9a]/10 text-[#6bfb9a] border-r-4 border-[#6bfb9a] transition-all duration-150 ease-in-out font-['Inter'] text-sm uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="terminal">terminal</span>
            <span>Terminal</span>
          </a>

        </nav>
        <div className="px-6 mt-auto">
          <button onClick={handleLogout} className="w-full py-3 bg-error/20 text-error font-bold rounded-lg scale-95 active:opacity-80 transition-all flex items-center justify-center gap-2 hover:bg-error/30">
            LOGOUT
          </button>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-[#e2e3e0]/40 hover:text-[#e2e3e0] cursor-pointer font-['Inter'] text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm" data-icon="sensors">sensors</span>
              <span>System Status</span>
            </div>
            <div className="flex items-center gap-3 text-[#e2e3e0]/40 hover:text-[#e2e3e0] cursor-pointer font-['Inter'] text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm" data-icon="help_outline">help_outline</span>
              <span>Help</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen pb-12">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-6 h-16 bg-[#111413]/80 backdrop-blur-xl docked full-width top-0 sticky border-b border-[#6bfb9a]/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] z-40">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-tighter text-[#4ade80] font-['Space_Grotesk']">Market Odyssey</div>
            <div className="hidden md:flex items-center gap-6">
              <a className="text-[#e2e3e0]/60 hover:text-[#e2e3e0] font-['Space_Grotesk'] tracking-tight transition-colors" href="#">Markets</a>
              <a className="text-[#6bfb9a] border-b-2 border-[#6bfb9a] pb-1 font-['Space_Grotesk'] tracking-tight" href="#">Portfolio</a>
              <a className="text-[#e2e3e0]/60 hover:text-[#e2e3e0] font-['Space_Grotesk'] tracking-tight transition-colors" href="#">Orders</a>
              <a className="text-[#e2e3e0]/60 hover:text-[#e2e3e0] font-['Space_Grotesk'] tracking-tight transition-colors" href="#">Vault</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchDashboardData} 
              className="flex items-center gap-2 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-all active:scale-95 group"
              title="Refresh Dashboard Data"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} data-icon="refresh">refresh</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Refresh</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#6bfb9a]"></div>
              <span className="text-[10px] font-bold tracking-widest text-primary font-label">LIVE FEED</span>
            </div>
            <button onClick={handleLogout} className="lg:hidden material-symbols-outlined text-[#e2e3e0]/60 hover:bg-error/20 hover:text-error p-2 rounded-lg transition-all" data-icon="logout">logout</button>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border border-primary/20 uppercase">
              {user?.username?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-6">
          {/* Account Overview HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-primary/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Current Value</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(portfolioValue)}</h2>
                <span className={`text-xs font-mono ${totalPnL >= 0 ? 'text-primary' : 'text-error'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-on-surface-variant text-[10px] mt-1">Invested: {formatCurrency(totalInvested)}</p>
            </div>
            
            <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-outline-variant">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Current Cash Balance</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(user?.balance)}</h2>
              <p className="text-on-surface-variant text-[10px] mt-1">Available for immediate trade</p>
            </div>
            
            <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-outline-variant">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Total Holdings</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">{totalHoldings} Assets</h2>
              <p className="text-on-surface-variant text-[10px] mt-1">Total shares: {totalShares}</p>
            </div>
            
            <div className={`bg-surface-container-low p-5 rounded-lg border-l-2 ${totalPnL >= 0 ? 'border-primary' : 'border-error'} relative overflow-hidden`}>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Net Profit & Loss</p>
              <h2 className={`text-3xl font-headline font-bold ${totalPnL >= 0 ? 'text-primary' : 'text-error'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
              </h2>
              <div className="absolute bottom-0 right-0 w-24 h-12">
                <svg className={`w-full h-full fill-none stroke-2 opacity-40 ${totalPnL >= 0 ? 'stroke-primary' : 'stroke-error'}`} viewBox="0 0 100 40">
                  <path d={totalPnL >= 0 ? "M0 40 Q 20 10 40 30 T 100 5" : "M0 5 Q 20 30 40 10 T 100 40"}></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Active Holdings & Order Book */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              {/* Active Holdings */}
              <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/20">
                  <h3 className="font-headline font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="grid_view">grid_view</span>
                    Active Holdings
                  </h3>
                  <button className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container/50">
                        <th className="px-6 py-3 font-bold">Symbol</th>
                        <th className="px-6 py-3 font-bold">Qty</th>
                        <th className="px-6 py-3 font-bold">Avg Cost</th>
                        <th className="px-6 py-3 font-bold">LTP</th>
                        <th className="px-6 py-3 font-bold">Invested</th>
                        <th className="px-6 py-3 font-bold">Current</th>
                        <th className="px-6 py-3 font-bold text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono divide-y divide-outline-variant/5">
                      {holdings.length > 0 ? holdings.map((holding, index) => (
                        <tr key={holding.holdingId || index} className="hover:bg-surface-container-high/40 transition-colors">
                          <td className="px-6 py-4 text-on-surface font-bold">{holding.stockName}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{holding.quantity}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{formatCurrency(holding.avgBuyPrice)}</td>
                          <td className="px-6 py-4 text-on-surface">{formatCurrency(holding.currentPrice)}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{formatCurrency(holding.totalInvestment)}</td>
                          <td className="px-6 py-4 text-on-surface">{formatCurrency(holding.totalValue)}</td>
                          <td className={`px-6 py-4 text-right ${holding.pnl >= 0 ? 'text-primary' : 'text-error'}`}>
                            <div>{holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}</div>
                            <div className="text-[9px]">({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent?.toFixed(2)}%)</div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant text-xs uppercase tracking-widest">NO HOLDINGS AVAILABLE</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Market Overview */}
              <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/20">
                  <h3 className="font-headline font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="inventory_2">inventory_2</span>
                    Market Inventory
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container/50">
                        <th className="px-6 py-3 font-bold">Symbol</th>
                        <th className="px-6 py-3 font-bold">Market Price</th>
                        <th className="px-6 py-3 font-bold text-center">Min Bid (80%)</th>
                        <th className="px-6 py-3 font-bold text-center">Max Bid (120%)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono divide-y divide-outline-variant/5">
                      {stocks.length > 0 ? stocks.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-container-high/40 transition-colors">
                          <td className="px-6 py-4 text-on-surface font-bold">{s.name}</td>
                          <td className="px-6 py-4 text-primary font-bold">{formatCurrency(s.price)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-error/10 text-error rounded border border-error/20">
                              {formatCurrency(getMinBid(s.price))}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                              {formatCurrency(getMaxBid(s.price))}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant text-xs uppercase tracking-widest">MARKET CLOSED</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Dual View Order Book */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                  <div className="px-4 py-3 border-b border-outline-variant/10 bg-primary/5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg" data-icon="shopping_cart">shopping_cart</span>
                    <h3 className="font-headline font-bold uppercase tracking-wider text-xs">Buy Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono min-w-[400px]">
                      <thead className="text-on-surface-variant border-b border-outline-variant/5">
                        <tr>
                          <th className="p-3 text-left">Asset</th>
                          <th className="p-3 text-left">Seller</th>
                          <th className="p-3 text-left">Price</th>
                          <th className="p-3 text-left">Qty</th>
                          <th className="p-3 text-left">Value</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {buyOrders.length > 0 ? buyOrders.map(order => (
                          <tr key={order.id}>
                            <td className="p-3 text-on-surface font-bold">{order.stockName}</td>
                            <td className="p-3 text-error">{order.sellerUsername}</td>
                            <td className="p-3 text-primary">{formatCurrency(order.price)}</td>
                            <td className="p-3 text-on-surface-variant">{order.quantity}</td>
                            <td className="p-3 text-on-surface-variant">{formatCurrency(order.orderValue)}</td>
                            <td className="p-3 text-right"><span className={`px-2 py-0.5 rounded-full text-[8px] ${order.status === 'PENDING' ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{order.status}</span></td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="p-4 text-center text-on-surface-variant/50 text-[10px] uppercase">No pending buy orders</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                  <div className="px-4 py-3 border-b border-outline-variant/10 bg-error/5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-lg" data-icon="sell">sell</span>
                    <h3 className="font-headline font-bold uppercase tracking-wider text-xs">Sell Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono min-w-[400px]">
                      <thead className="text-on-surface-variant border-b border-outline-variant/5">
                        <tr>
                          <th className="p-3 text-left">Asset</th>
                          <th className="p-3 text-left">Buyer</th>
                          <th className="p-3 text-left">Price</th>
                          <th className="p-3 text-left">Qty</th>
                          <th className="p-3 text-left">Value</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {sellOrders.length > 0 ? sellOrders.map(order => (
                          <tr key={order.id}>
                            <td className="p-3 text-on-surface font-bold">{order.stockName}</td>
                            <td className="p-3 text-primary">{order.buyerUsername}</td>
                            <td className="p-3 text-error">{formatCurrency(order.price)}</td>
                            <td className="p-3 text-on-surface-variant">{order.quantity}</td>
                            <td className="p-3 text-on-surface-variant">{formatCurrency(order.orderValue)}</td>
                            <td className="p-3 text-right"><span className={`px-2 py-0.5 rounded-full text-[8px] ${order.status === 'PENDING' ? 'bg-error/10 text-error' : 'bg-surface-container-highest text-on-surface-variant'}`}>{order.status}</span></td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="p-4 text-center text-on-surface-variant/50 text-[10px] uppercase">No pending sell orders</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>

            {/* Right: Live Market Pulse */}
            <aside className="col-span-12 xl:col-span-4 space-y-6">
              <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10 glass-panel">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline font-bold uppercase tracking-wider text-sm">Market Pulse</h3>
                  <span className="text-[10px] font-mono text-primary animate-pulse">● SIGNAL ACTIVE</span>
                </div>
                <div className="space-y-4">
                  {stocks.length > 0 ? stocks.map(s => (
                    <div key={s.id} className="bg-surface-container p-4 rounded-lg group hover:bg-surface-container-high transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-lg font-headline font-bold">{s.name}</span>
                          <p className="text-[10px] text-on-surface-variant">Market Index</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-mono text-on-surface font-bold">{formatCurrency(s.price)}</span>
                          <p className="text-[10px] text-on-surface-variant">MIN: {getMinBid(s.price)} | MAX: {getMaxBid(s.price)}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-xs text-on-surface-variant py-4">No market data available</div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Strategy Alert</h4>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Market Odyssey Automated Signals are running. Ensure optimal portfolio balancing based on the latest market prints.
                  </p>
                </div>
              </div>

              {/* News Widget */}
              <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold uppercase tracking-wider text-sm mb-4">Industrial News Feed</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start pb-4 border-b border-outline-variant/5">
                    <div className="w-12 h-12 rounded bg-surface-container overflow-hidden shrink-0 flex items-center justify-center text-primary/50">
                      <span className="material-symbols-outlined">newspaper</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-primary mb-1">08:42 AM</p>
                      <p className="text-xs font-bold leading-snug">Market Regulators Approve New High-Frequency Trading Protocol</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start pb-4 border-b border-outline-variant/5">
                    <div className="w-12 h-12 rounded bg-surface-container overflow-hidden shrink-0 flex items-center justify-center text-on-surface-variant/50">
                      <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-on-surface-variant mb-1">07:15 AM</p>
                      <p className="text-xs font-bold leading-snug">Global Sector Predicted to Surge by Q4 Following Massive Investment</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-error/5 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
}