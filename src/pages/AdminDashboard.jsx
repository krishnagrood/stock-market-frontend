import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [price, setPrice] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  const [newStock, setNewStock] = useState({ name: "", price: "" });
  const [tradingOpen, setTradingOpen] = useState(false);

  const [orderForm, setOrderForm] = useState({
    buyerTeam: "", sellerTeam: "", buyerUsername: "", sellerUsername: "", stockName: "", price: "", quantity: ""
  });

  const [userForm, setUserForm] = useState({
    username: "", password: "", balance: "500000"
  });

  const [orders, setOrders] = useState([]);
  const [previewPrices, setPreviewPrices] = useState([]);
  const [processingOrders, setProcessingOrders] = useState(false);
  const [approvingPrices, setApprovingPrices] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://stock-market-backend-production-bf5f.up.railway.app/api";

  useEffect(() => {
    fetchStocks();
    fetchUsers();
    fetchTradingStatus();
    fetchOrders();
    fetchPreviewPrices();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stocks`);
      setStocks(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`);
      setUsers(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchTradingStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/trading-status`);
      setTradingOpen(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders`);
      setOrders(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchPreviewPrices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders/preview`);
      setPreviewPrices(res.data || []);
    } catch (err) { console.error(err); }
  };

  const startTrading = async () => {
    try {
      await axios.post(`${API_BASE}/admin/start`);
      setTradingOpen(true);
      alert("Trading Started 🚀");
    } catch (err) { alert("Failed to start trading"); }
  };

  const stopTrading = async () => {
    try {
      await axios.post(`${API_BASE}/admin/stop`);
      setTradingOpen(false);
      alert("Trading Stopped ⛔");
    } catch (err) { alert("Failed to stop trading"); }
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", data: null, message: "" });
  const confirmAction = (type, data, message) => setConfirmModal({ isOpen: true, type, data, message });

  const executeConfirm = async () => {
    const { type, data } = confirmModal;
    setConfirmModal({ isOpen: false, type: "", data: null, message: "" });

    if (type === "RESET") {
      try {
        const res = await axios.post(`${API_BASE}/admin/masterReset`);
        if (res.data.success) {
          alert("Success: " + res.data.message);
          await Promise.all([fetchStocks(), fetchUsers(), fetchOrders(), fetchPreviewPrices()]);
          setTradingOpen(false);
        } else alert("Reset failed");
      } catch (err) { alert("Error: Could not complete Master Reset"); }
    } else if (type === "DELETE_USER") {
      try {
        const res = await axios.delete(`${API_BASE}/admin/deleteUser`, { params: { userId: data } });
        if (res.data.success) { alert("User deleted!"); fetchUsers(); }
      } catch (err) { alert("Failed to delete user"); }
    } else if (type === "DELETE_STOCK") {
      try {
        const res = await axios.delete(`${API_BASE}/admin/deleteStock`, { params: { stockId: data } });
        if (res.data.success) { alert("Deleted!"); fetchStocks(); }
      } catch (err) { alert("Delete failed"); }
    }
  };

  const cancelConfirm = () => setConfirmModal({ isOpen: false, type: "", data: null, message: "" });

  const masterReset = (e) => {
    if (e) e.preventDefault();
    confirmAction("RESET", null, "MASTER RESET WARNING:\n\n1. All Stocks will be deleted\n2. All Orders will be cleared\n3. All User Holdings will be wiped\n4. All Balances reset to 500,000\n\nProceed with Reset?");
  };

  const deleteUser = (userId) => confirmAction("DELETE_USER", userId, "Permanently DELETE this user account?");
  const deleteStock = (stockId) => confirmAction("DELETE_STOCK", stockId, "Permanently DELETE this stock?");

  const addOrder = async () => {
    const { buyerTeam, sellerTeam, buyerUsername, sellerUsername, stockName, price, quantity } = orderForm;
    if (!buyerUsername && !sellerUsername) { alert("Enter at least one username"); return; }
    if (!stockName || !price || !quantity) { alert("Fill all stock details"); return; }
    try {
      const res = await axios.post(`${API_BASE}/admin/orders/add`, {
        buyerTeam, sellerTeam, buyerUsername: buyerUsername.trim(), sellerUsername: sellerUsername.trim(), stockName, price: Number(price), quantity: Number(quantity)
      });
      if (res.data.success) {
        alert("Order added successfully ✅");
        setOrderForm({ buyerTeam: "", sellerTeam: "", buyerUsername: "", sellerUsername: "", stockName: "", price: "", quantity: "" });
        fetchOrders();
      } else alert(res.data.message || "Failed to add order");
    } catch (err) { alert(err.response?.data?.message || "Failed to add order"); }
  };

  const processOrders = async () => {
    if (!orders.length) return alert("No pending orders to process");
    try {
      setProcessingOrders(true);
      const res = await axios.post(`${API_BASE}/admin/orders/process`);
      if (res.data.success) { alert("Preview generated ✅"); fetchPreviewPrices(); }
    } catch (err) { alert("Failed to process orders"); } finally { setProcessingOrders(false); }
  };

  const approvePrices = async () => {
    if (!previewPrices.length) return alert("No preview prices available");
    try {
      setApprovingPrices(true);
      const res = await axios.post(`${API_BASE}/admin/orders/approve`);
      if (res.data.success) {
        alert("Prices approved and holdings updated ✅");
        fetchStocks(); fetchUsers(); fetchOrders(); fetchPreviewPrices();
      }
    } catch (err) { alert("Failed to approve prices"); } finally { setApprovingPrices(false); }
  };

  const addStock = async (e) => {
    e.preventDefault();
    if (!newStock.name || !newStock.price) return alert("Fill both stock name and price");
    try {
      const res = await axios.post(`${API_BASE}/admin/addStock`, { name: newStock.name, price: Number(newStock.price) });
      if (res.data.success) { alert("Stock Added!"); setNewStock({ name: "", price: "" }); fetchStocks(); }
    } catch (err) { alert("Failed to add stock"); }
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password || !userForm.balance) return alert("Please fill all user fields");
    try {
      setCreatingUser(true);
      const res = await axios.post(`${API_BASE}/admin/createUser`, {
        username: userForm.username, password: userForm.password, balance: Number(userForm.balance)
      });
      if (res.data.success) { alert("User Created!"); setUserForm({ username: "", password: "", balance: "500000" }); fetchUsers(); }
    } catch (err) { alert("Failed to create user"); } finally { setCreatingUser(false); }
  };

  const updatePrice = async (stockId) => {
    const newPrice = price[stockId];
    if (!newPrice) return alert("Enter a price");
    try {
      setLoadingId(stockId);
      const res = await axios.post(`${API_BASE}/admin/updateStock`, { stockId: Number(stockId), price: Number(newPrice) });
      if (res.data.success) { alert("Stock updated"); setPrice({ ...price, [stockId]: "" }); fetchStocks(); }
    } catch (err) { alert("Failed to update stock"); } finally { setLoadingId(null); }
  };

  return (
    <div className="bg-background text-on-surface h-screen flex flex-col antialiased dark overflow-hidden relative">
      <style>
        {`
          .scanline-overlay {
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
            background-size: 100% 4px, 3px 100%;
            pointer-events: none;
          }
          .glass-panel {
            backdrop-filter: blur(20px);
            background: rgba(25, 28, 27, 0.6);
            border: 1px solid rgba(107, 251, 154, 0.08);
          }
          .pulsate {
            animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 1; filter: drop-shadow(0 0 2px #4ade80); }
            50% { opacity: 0.7; filter: drop-shadow(0 0 8px #4ade80); }
          }
          
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(74,222,128,0.4); }
        `}
      </style>
      
      <div className="scanline-overlay fixed inset-0 z-[100] opacity-5"></div>
      
      {/* TopAppBar */}
      <header className="bg-[#111413]/80 backdrop-blur-xl border-b border-[#6bfb9a]/10 shadow-[0_0_20px_rgba(74,222,128,0.1)] flex justify-between items-center px-6 h-16 w-full shrink-0 relative z-50">
        <div className="flex items-center gap-6">
          <div className="text-[#4ade80] font-black text-xl tracking-tighter flex items-center gap-2">
            <span className="material-symbols-outlined">terminal</span>
            <span className="font-headline">Administrator Terminal</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${tradingOpen ? 'bg-primary/10 border-primary/20' : 'bg-error/10 border-error/20'}`}>
            <span className={`pulsate w-2 h-2 rounded-full ${tradingOpen ? 'bg-primary-container' : 'bg-error'}`}></span>
            <span className={`font-headline uppercase tracking-widest text-[10px] font-bold ${tradingOpen ? 'text-primary' : 'text-error'}`}>
              {tradingOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 text-on-surface/50 hover:text-error transition-colors px-3 py-2 hover:bg-error/5 rounded-lg group">
            <span className="font-headline uppercase tracking-widest text-xs">logout</span>
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative z-40">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Top Control Panel */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-xs uppercase tracking-widest text-on-surface/60">Market Status</h3>
                <span className="material-symbols-outlined text-primary/30">sensors</span>
              </div>
              <button 
                onClick={tradingOpen ? stopTrading : startTrading}
                className={`${tradingOpen ? 'bg-error/20 text-error hover:bg-error/30' : 'bg-primary text-on-primary hover:opacity-90'} font-headline text-sm font-bold uppercase py-3 rounded tracking-wider transition-all active:scale-[0.98]`}
              >
                {tradingOpen ? 'Close Market' : 'Start Trading'}
              </button>
            </div>
            
            <div className="glass-panel p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-xs uppercase tracking-widest text-on-surface/60">Data Integrity</h3>
                <span className="material-symbols-outlined text-error/30">dangerous</span>
              </div>
              <button onClick={masterReset} className="border border-error/50 text-error font-headline text-sm font-bold uppercase py-3 rounded tracking-wider hover:bg-error/10 transition-all active:scale-[0.98]">
                RESET ALL DATA
              </button>
            </div>
            
            <div className="glass-panel p-5 rounded-lg h-32 grid grid-cols-3 gap-2">
              <div className="flex flex-col justify-center items-center text-center border-r border-outline-variant/20">
                <div className="text-primary font-mono text-lg font-bold">{stocks.length}</div>
                <div className="text-[9px] uppercase font-headline tracking-tighter text-on-surface/40">Stocks</div>
              </div>
              <div className="flex flex-col justify-center items-center text-center border-r border-outline-variant/20">
                <div className="text-on-surface font-mono text-lg font-bold">{users.length}</div>
                <div className="text-[9px] uppercase font-headline tracking-tighter text-on-surface/40">Users</div>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <div className="text-on-surface font-mono text-lg font-bold">{orders.length}</div>
                <div className="text-[9px] uppercase font-headline tracking-tighter text-on-surface/40">Orders</div>
              </div>
            </div>
          </section>

          {/* Main Operational Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-6">
            
            {/* Left Column */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* Process & Manual Orders Section */}
              <div className="glass-panel rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-headline text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">engineering</span>
                    Order Execution Network
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={processOrders} disabled={processingOrders} className="bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all px-3 py-1.5 text-[10px] font-headline font-black uppercase tracking-widest border border-outline-variant/30 rounded">
                      {processingOrders ? 'Processing...' : 'Run Processing Engine'}
                    </button>
                    <button onClick={approvePrices} disabled={approvingPrices} className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-on-primary transition-all px-3 py-1.5 text-[10px] font-headline font-black uppercase tracking-widest rounded">
                      {approvingPrices ? 'Approving...' : 'Approve Execution'}
                    </button>
                  </div>
                </div>
                
                {/* Manual Order Entry */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                   <div className="space-y-1">
                    <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs placeholder:text-on-surface/20 text-white" placeholder="Buyer" value={orderForm.buyerUsername} onChange={e => setOrderForm({...orderForm, buyerUsername: e.target.value})} type="text"/>
                  </div>
                  <div className="space-y-1">
                    <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs placeholder:text-on-surface/20 text-white" placeholder="Seller" value={orderForm.sellerUsername} onChange={e => setOrderForm({...orderForm, sellerUsername: e.target.value})} type="text"/>
                  </div>
                  <div className="space-y-1">
                    <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs placeholder:text-on-surface/20 text-white" placeholder="Ticker" value={orderForm.stockName} onChange={e => setOrderForm({...orderForm, stockName: e.target.value})} type="text"/>
                  </div>
                  <div className="space-y-1">
                    <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs placeholder:text-on-surface/20 text-white" placeholder="Price" type="number" value={orderForm.price} onChange={e => setOrderForm({...orderForm, price: e.target.value})}/>
                  </div>
                  <div className="space-y-1">
                    <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs placeholder:text-on-surface/20 text-white" placeholder="Qty" type="number" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})}/>
                  </div>
                  <div className="flex items-end">
                    <button onClick={addOrder} className="w-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all py-2 text-[10px] font-headline font-black uppercase tracking-widest border border-outline-variant/30 rounded">
                      Inject Order
                    </button>
                  </div>
                </div>

                {/* Live Order Queue Table */}
                <div className="max-h-[250px] overflow-y-auto mt-4 border border-outline-variant/20 rounded">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur text-on-surface/50 uppercase tracking-tighter border-b border-outline-variant/20">
                      <tr>
                        <th className="p-2 font-medium">B</th>
                        <th className="p-2 font-medium">S</th>
                        <th className="p-2 font-medium">Ticker</th>
                        <th className="p-2 font-medium">Qty</th>
                        <th className="p-2 font-medium text-right">Price</th>
                        <th className="p-2 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-2 text-on-surface/80">{o.buyerUsername || 'SYS'}</td>
                          <td className="p-2 text-on-surface/80">{o.sellerUsername || 'SYS'}</td>
                          <td className="p-2 font-bold text-primary">{o.stockName}</td>
                          <td className="p-2">{o.quantity}</td>
                          <td className="p-2 text-right">${o.price}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${o.status === 'COMPLETED' ? 'bg-primary/10 text-primary' : o.status === 'FAILED' ? 'bg-error/10 text-error' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-4 rounded-lg space-y-4">
                  <h3 className="font-headline text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">add_box</span>
                    Add New Stock
                  </h3>
                  <form onSubmit={addStock} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface/40">Ticker</label>
                        <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs uppercase placeholder:text-on-surface/20 text-white" placeholder="e.g. MSFT" type="text" value={newStock.name} onChange={e => setNewStock({...newStock, name: e.target.value.toUpperCase()})}/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface/40">Price</label>
                        <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs placeholder:text-on-surface/20 text-white" placeholder="0.00" type="number" value={newStock.price} onChange={e => setNewStock({...newStock, price: e.target.value})}/>
                      </div>
                    </div>
                    <button className="w-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all py-2 text-[10px] font-headline font-black uppercase tracking-widest border border-outline-variant/30 rounded" type="submit">
                      Initialize Asset
                    </button>
                  </form>
                </div>
                
                <div className="glass-panel p-4 rounded-lg">
                  <h3 className="font-headline text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">show_chart</span>
                    Current Listings
                  </h3>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {stocks.map(s => (
                      <div key={s.id} className="flex justify-between items-center bg-surface-container-lowest p-2 rounded border-l-2 border-primary group">
                        <span className="font-mono text-xs font-bold w-12">{s.name}</span>
                        <div className="flex gap-2 items-center flex-1 ml-2">
                          <input 
                            className="bg-transparent border-b border-outline-variant/30 text-primary text-xs font-mono w-16 focus:outline-none focus:border-primary" 
                            placeholder={`$${s.price}`}
                            type="number"
                            value={price[s.id] || ""}
                            onChange={e => setPrice({...price, [s.id]: e.target.value})}
                          />
                          <button onClick={() => updatePrice(s.id)} className="text-primary hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[14px]">save</span>
                          </button>
                        </div>
                        <button onClick={() => deleteStock(s.id)} className="text-on-surface/20 hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>

            {/* Right Column */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* User Creation */}
              <div className="glass-panel p-5 rounded-lg">
                <h2 className="font-headline text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">person_add</span>
                  Create User
                </h2>
                <form onSubmit={createUser} className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-on-surface/40">Username</label>
                      <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs text-white" type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})}/>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-on-surface/40">Password</label>
                      <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 font-mono text-xs text-white" type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}/>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-on-surface/40">Initial Cash</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/30 font-mono text-xs">$</span>
                        <input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded p-2 pl-6 font-mono text-xs text-white" type="number" value={userForm.balance} onChange={e => setUserForm({...userForm, balance: e.target.value})}/>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button disabled={creatingUser} type="submit" className="bg-primary-container text-on-primary-container px-6 h-9 rounded font-bold hover:scale-105 active:scale-95 transition-all text-xs">
                        {creatingUser ? '...' : 'ADD'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* User Registry */}
              <div className="glass-panel rounded-lg flex flex-col h-[525px]">
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                  <h2 className="font-headline text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">group</span>
                    User Registry
                  </h2>
                  <div className="text-[10px] font-mono text-on-surface/40 uppercase">Central DB</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur text-on-surface/50 uppercase tracking-tighter border-b border-outline-variant/20">
                      <tr>
                        <th className="p-3 font-medium">Username</th>
                        <th className="p-3 font-medium">Role</th>
                        <th className="p-3 font-medium text-right">Balance</th>
                        <th className="p-3 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className={`p-3 font-bold ${u.role === 'ADMIN' ? 'text-primary' : 'text-on-surface'}`}>{u.username}</td>
                          <td className="p-3">
                            <span className={`text-[9px] border px-1.5 py-0.5 rounded uppercase ${u.role === 'ADMIN' ? 'border-primary/40 text-primary' : 'border-outline-variant text-on-surface/50'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-on-surface/80">${u.balance}</td>
                          <td className="p-3 text-center">
                            {u.role !== 'ADMIN' ? (
                              <button onClick={() => deleteUser(u.id)} className="text-on-surface/20 hover:text-error transition-colors">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            ) : (
                              <span className="material-symbols-outlined text-on-surface/10 text-base">lock</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="h-6 shrink-0 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center px-6 justify-between z-50">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[9px] font-mono text-on-surface/30">DB_CONNECTION: SECURE</span>
          </div>
        </div>
        <div className="text-[9px] font-mono text-on-surface/20 uppercase tracking-widest">
          Market Odyssey // Unified Admin Architecture
        </div>
      </footer>

      {/* Confirmation Modal Overlay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-lg max-w-md w-full shadow-2xl">
            <h2 className={`font-headline text-lg font-bold mb-4 uppercase ${confirmModal.type === 'RESET' || confirmModal.type.includes('DELETE') ? 'text-error' : 'text-primary'}`}>
              Confirm Action
            </h2>
            <p className="font-mono text-sm text-on-surface/80 whitespace-pre-wrap mb-8 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelConfirm} className="px-4 py-2 border border-outline-variant text-on-surface/60 hover:bg-white/5 rounded font-headline text-xs font-bold uppercase tracking-wider transition-colors">
                Cancel
              </button>
              <button onClick={executeConfirm} className={`px-4 py-2 rounded font-headline text-xs font-bold uppercase tracking-wider transition-colors ${confirmModal.type === 'RESET' || confirmModal.type.includes('DELETE') ? 'bg-error/20 text-error hover:bg-error' : 'bg-primary-container text-on-primary-container hover:bg-primary'} hover:text-black`}>
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}