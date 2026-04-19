import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [tradeModal, setTradeModal] = useState({ isOpen: false, stockId: "" });
  const [tradeQty, setTradeQty] = useState("");
  const [processingTrade, setProcessingTrade] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://stock-market-backend-production-bf5f.up.railway.app/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
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

  const executeTrade = async (type) => {
    if (!tradeModal.stockId || !tradeQty) return alert("Select a stock and quantity.");
    setProcessingTrade(true);
    try {
      const res = await axios.post(`${API_BASE}/${type}`, null, {
        params: {
          userId: Number(userId),
          stockId: Number(tradeModal.stockId),
          qty: Number(tradeQty)
        }
      });
      alert(res.data);
      setTradeModal({ isOpen: false, stockId: "" });
      setTradeQty("");
      fetchDashboardData();
    } catch (err) {
      alert("Trade failed");
    } finally {
      setProcessingTrade(false);
    }
  };

  const portfolioValue = useMemo(() => holdings.reduce((sum, item) => sum + (item.totalValue || 0), 0), [holdings]);
  const totalHoldings = holdings.length;
  const totalPnL = useMemo(() => holdings.reduce((sum, item) => sum + ((item.currentPrice || 0) * (item.quantity || 0) - (item.totalInvestment || 0)), 0), [holdings]);

  const buyOrders = useMemo(() => userOrders.filter(o => o.buyerUserId === Number(userId) && o.status !== "COMPLETED" && o.status !== "FAILED"), [userOrders, userId]);
  const sellOrders = useMemo(() => userOrders.filter(o => o.sellerUserId === Number(userId) && o.status !== "COMPLETED" && o.status !== "FAILED"), [userOrders, userId]);

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return <div className="bg-background h-screen flex items-center justify-center text-primary font-headline uppercase tracking-widest animate-pulse">Initializing Terminal...</div>;
  }

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary min-h-screen relative dark">
      <style>{`
        .scanline-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
            background-size: 100% 4px, 3px 100%;
            pointer-events: none;
            z-index: 999;
        }
        .glow-primary {
            box-shadow: 0 0 15px rgba(107, 251, 154, 0.2);
        }
        .glass-panel {
            background: rgba(51, 53, 52, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(61, 74, 62, 0.15);
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(74,222,128,0.4); }
      `}</style>

      <div className="scanline-overlay"></div>

      {/* SideNavBar */}
      <aside className="flex flex-col fixed left-0 top-0 h-full py-8 bg-[#191c1b] docked left-0 h-screen w-64 border-r border-[#6bfb9a]/5 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-[#4ade80] font-black italic text-2xl tracking-tighter">Kinetic Vault</h1>
          <p className="text-[#e2e3e0]/40 font-['Inter'] text-[10px] uppercase tracking-[0.2em] mt-1">Active Session</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#6bfb9a]/10 text-[#6bfb9a] border-r-4 border-[#6bfb9a] transition-all duration-150 ease-in-out font-['Inter'] text-sm uppercase tracking-widest cursor-pointer">
            <span className="material-symbols-outlined text-lg">terminal</span>
            <span>Terminal</span>
          </div>
        </nav>
        
        <div className="px-6 mt-auto">
          <button onClick={() => setTradeModal({ isOpen: true, stockId: "" })} className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:scale-105 active:scale-95 transition-all glow-primary flex items-center justify-center gap-2">
            Trade Now
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-6 h-16 bg-[#111413]/80 backdrop-blur-xl docked full-width top-0 sticky border-b border-[#6bfb9a]/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] z-40">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-tighter text-[#4ade80] font-['Space_Grotesk']">Market Odyssey</div>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-[#e2e3e0]/60 font-['Space_Grotesk'] tracking-tight">Portfolio Overview</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#6bfb9a]"></div>
              <span className="text-[10px] font-bold tracking-widest text-primary font-label">LIVE FEED</span>
            </div>
            <div className="flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase tracking-widest text-on-surface/40">Logged in as</span>
              <span className="text-xs font-bold text-primary">{user?.username}</span>
            </div>
            <button onClick={handleLogout} className="material-symbols-outlined text-[#e2e3e0]/60 hover:text-error hover:bg-[#282b29] p-2 rounded-lg transition-all">logout</button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Account Overview HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-primary/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Total Portfolio Value</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(portfolioValue)}</h2>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-outline-variant">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Current Cash Balance</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(user?.balance)}</h2>
              <p className="text-on-surface-variant text-[10px] mt-1">Available for immediate trade</p>
            </div>
            
            <div className="bg-surface-container-low p-5 rounded-lg border-l-2 border-outline-variant">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Total Holdings</p>
              <h2 className="text-3xl font-headline font-bold text-on-surface">{totalHoldings} Assets</h2>
              <p className="text-on-surface-variant text-[10px] mt-1">Actively managed</p>
            </div>
            
            <div className={`bg-surface-container-low p-5 rounded-lg border-l-2 ${totalPnL >= 0 ? 'border-primary' : 'border-error'} relative overflow-hidden`}>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">Net Profit &amp; Loss</p>
              <h2 className={`text-3xl font-headline font-bold ${totalPnL >= 0 ? 'text-primary' : 'text-error'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
              </h2>
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
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    Active Holdings
                  </h3>
                  <button onClick={fetchDashboardData} className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">refresh</span> Sync
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-surface-container/90 backdrop-blur z-10">
                      <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        <th className="px-6 py-3 font-bold">Symbol</th>
                        <th className="px-6 py-3 font-bold">Quantity</th>
                        <th className="px-6 py-3 font-bold">Avg Buy</th>
                        <th className="px-6 py-3 font-bold">Market Price</th>
                        <th className="px-6 py-3 font-bold text-right">P&amp;L</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono divide-y divide-outline-variant/5">
                      {holdings.length > 0 ? holdings.map((h, i) => {
                        const avgPrice = h.totalInvestment / h.quantity;
                        const pnl = (h.currentPrice * h.quantity) - h.totalInvestment;
                        return (
                          <tr key={i} className="hover:bg-surface-container-high/40 transition-colors">
                            <td className="px-6 py-4 text-on-surface font-bold">{h.stockName}</td>
                            <td className="px-6 py-4 text-on-surface-variant">{h.quantity}</td>
                            <td className="px-6 py-4 text-on-surface-variant">{formatCurrency(avgPrice)}</td>
                            <td className="px-6 py-4 text-on-surface">{formatCurrency(h.currentPrice)}</td>
                            <td className={`px-6 py-4 text-right ${pnl >= 0 ? 'text-primary' : 'text-error'}`}>
                              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface/40 text-xs tracking-widest uppercase">No Active Holdings</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Dual View Order Book */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buy Orders */}
                <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                  <div className="px-4 py-3 border-b border-outline-variant/10 bg-primary/5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">shopping_cart</span>
                    <h3 className="font-headline font-bold uppercase tracking-wider text-xs">Buy Orders</h3>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="text-on-surface-variant border-b border-outline-variant/5 sticky top-0 bg-surface-container-low">
                        <tr>
                          <th className="p-3 text-left">Stock</th>
                          <th className="p-3 text-left">Qty</th>
                          <th className="p-3 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {buyOrders.length > 0 ? buyOrders.map(o => (
                          <tr key={o.id}>
                            <td className="p-3 font-bold">{o.stockName}</td>
                            <td className="p-3 text-on-surface-variant">{o.quantity}</td>
                            <td className="p-3 text-right text-primary">{formatCurrency(o.price)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="3" className="p-4 text-center text-on-surface/40 text-[10px] tracking-widest uppercase">No Pending Buys</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Sell Orders */}
                <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                  <div className="px-4 py-3 border-b border-outline-variant/10 bg-error/5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-lg">sell</span>
                    <h3 className="font-headline font-bold uppercase tracking-wider text-xs">Sell Orders</h3>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="text-on-surface-variant border-b border-outline-variant/5 sticky top-0 bg-surface-container-low">
                        <tr>
                          <th className="p-3 text-left">Stock</th>
                          <th className="p-3 text-left">Qty</th>
                          <th className="p-3 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {sellOrders.length > 0 ? sellOrders.map(o => (
                          <tr key={o.id}>
                            <td className="p-3 font-bold">{o.stockName}</td>
                            <td className="p-3 text-on-surface-variant">{o.quantity}</td>
                            <td className="p-3 text-right text-error">{formatCurrency(o.price)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="3" className="p-4 text-center text-on-surface/40 text-[10px] tracking-widest uppercase">No Pending Sells</td></tr>
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
                  <span className="text-[10px] font-mono text-primary animate-pulse">● LIVE TICKER</span>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {stocks.length > 0 ? stocks.map(stock => (
                    <div 
                      key={stock.id} 
                      onClick={() => setTradeModal({ isOpen: true, stockId: stock.id })}
                      className="bg-surface-container p-4 rounded-lg group hover:bg-surface-container-high transition-all cursor-pointer border border-transparent hover:border-primary/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-lg font-headline font-bold">{stock.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-mono text-primary font-bold">{formatCurrency(stock.price)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-outline-variant/10 text-[10px] font-mono text-on-surface-variant">
                        <span>MIN: {formatCurrency(Math.max(stock.price * 0.80, 0.01))}</span>
                        <span>MAX: {formatCurrency(stock.price * 1.20)}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-on-surface/40 text-xs tracking-widest uppercase py-4">Market Offline</div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Quick Action</h4>
                  <p className="text-xs text-on-surface leading-relaxed mb-4">Select any asset from the Market Pulse to initialize a trade sequence instantly.</p>
                  <button onClick={() => setTradeModal({ isOpen: true, stockId: "" })} className="w-full py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-all">
                    Initialize Trade
                  </button>
                </div>
              </div>
            </aside>
            
          </div>
        </div>
      </main>

      {/* FAB: Contextual Trading Action */}
      <div className="fixed bottom-8 right-8 z-50">
        <button onClick={() => setTradeModal({ isOpen: true, stockId: "" })} className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_0_20px_#6bfb9a66] flex items-center justify-center group hover:scale-110 transition-transform active:scale-95">
          <span className="material-symbols-outlined text-3xl">add_chart</span>
          <span className="absolute right-full mr-4 bg-surface-container-high px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-primary/20 pointer-events-none text-white">New Position</span>
        </button>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-10]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-error/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Trade Modal */}
      {tradeModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-lg max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <h2 className="font-headline text-lg font-bold uppercase text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">currency_exchange</span>
                Execute Trade
              </h2>
              <button onClick={() => setTradeModal({isOpen: false, stockId: ""})} className="text-on-surface/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface/40">Select Asset</label>
                <select 
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary rounded p-3 font-mono text-sm text-white outline-none"
                  value={tradeModal.stockId}
                  onChange={(e) => setTradeModal({ ...tradeModal, stockId: e.target.value })}
                >
                  <option value="">-- Choose Stock --</option>
                  {stocks.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-on-surface/40">Quantity</label>
                <input 
                  type="number" 
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary rounded p-3 font-mono text-sm text-white outline-none"
                  placeholder="e.g. 10"
                  value={tradeQty}
                  onChange={(e) => setTradeQty(e.target.value)}
                />
              </div>
              
              {tradeModal.stockId && tradeQty && (
                <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant/20 flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant uppercase tracking-widest">Est. Value</span>
                  <span className="font-mono text-primary font-bold">
                    {formatCurrency(stocks.find(s => s.id === Number(tradeModal.stockId))?.price * Number(tradeQty))}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                disabled={processingTrade}
                onClick={() => executeTrade("buy")} 
                className="flex-1 bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-on-primary py-3 rounded font-headline text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Buy
              </button>
              <button 
                disabled={processingTrade}
                onClick={() => executeTrade("sell")} 
                className="flex-1 bg-error/20 border border-error text-error hover:bg-error hover:text-white py-3 rounded font-headline text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}