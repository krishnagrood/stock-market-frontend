import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [price, setPrice] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  const [newStock, setNewStock] = useState({
    name: "",
    price: ""
  });

  const [tradingOpen, setTradingOpen] = useState(false);

  const [orderForm, setOrderForm] = useState({
    buyerTeam: "",
    sellerTeam: "",
    buyerUsername: "",
    sellerUsername: "",
    stockName: "",
    price: "",
    quantity: ""
  });

  const [allocationForm, setAllocationForm] = useState({
    userId: "",
    stockId: "",
    quantity: ""
  });

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    balance: "500000"
  });

  const [creatingUser, setCreatingUser] = useState(false);

  const [orders, setOrders] = useState([]);
  const [previewPrices, setPreviewPrices] = useState([]);
  const [processingOrders, setProcessingOrders] = useState(false);
  const [approvingPrices, setApprovingPrices] = useState(false);
  const [allocating, setAllocating] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://stock-market-backend-production-bf5f.up.railway.app/api";

  
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/");
  };

  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stocks`);
      setStocks(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch stocks");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    }
  };

  const fetchTradingStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/trading-status`);
      setTradingOpen(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch orders");
    }
  };

  const fetchPreviewPrices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/orders/preview`);
      setPreviewPrices(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch preview prices");
    }
  };

  const getMinBid = (price) => Math.max((price * 0.80), 0.01).toFixed(2);
  const getMaxBid = (price) => (price * 1.20).toFixed(2);

  useEffect(() => {
    fetchStocks();
    fetchUsers();
    fetchTradingStatus();
    fetchOrders();
    fetchPreviewPrices();
  }, []);

  const addStock = async () => {
    const { name, price } = newStock;
    if (!name || !price) {
      alert("Please fill all stock fields");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/admin/addStock`, {
        name: name.trim().toUpperCase(),
        price: Number(price)
      });

      if (res.data.success) {
        alert("Stock added successfully ✅");
        setNewStock({ name: "", price: "" });
        fetchStocks();
      } else {
        alert(res.data.message || "Failed to add stock");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding stock");
    }
  };

  const createUser = async () => {
    const { username, password, balance } = userForm;
    if (!username || !password || !balance) {
      alert("Please fill all user fields");
      return;
    }

    try {
      setCreatingUser(true);
      const res = await axios.post(`${API_BASE}/admin/createUser`, {
        username: username.trim(),
        password: password.trim(),
        balance: Number(balance)
      });

      if (res.data.success) {
        alert(res.data.message || "User created successfully ✅");
        setUserForm({ username: "", password: "", balance: "500000" });
        fetchUsers();
      } else {
        alert(res.data.message || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating user");
    } finally {
      setCreatingUser(false);
    }
  };
  const startTrading = async () => {
    try {
      await axios.post(`${API_BASE}/admin/start`);
      setTradingOpen(true);
      alert("Trading Started 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to start trading");
    }
  };

  const stopTrading = async () => {
    try {
      await axios.post(`${API_BASE}/admin/stop`);
      setTradingOpen(false);
      alert("Trading Stopped ⛔");
    } catch (err) {
      console.error(err);
      alert("Failed to stop trading");
    }
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", data: null, message: "" });

  const confirmAction = (type, data, message) => {
    setConfirmModal({ isOpen: true, type, data, message });
  };

  const executeConfirm = async () => {
    const { type, data } = confirmModal;
    setConfirmModal({ isOpen: false, type: "", data: null, message: "" });

    if (type === "RESET") {
      try {
        const res = await axios.post(`${API_BASE}/admin/masterReset`);
        if (res.data.success) {
          alert("Success: " + res.data.message);
          await Promise.all([
            fetchStocks(),
            fetchUsers(),
            fetchOrders(),
            fetchPreviewPrices()
          ]);
          setTradingOpen(false);
        } else {
          alert("Reset failed: " + (res.data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Master Reset Error:", err);
        alert("Error: Could not complete Master Reset");
      }
    } else if (type === "DELETE_USER") {
      try {
        const res = await axios.delete(`${API_BASE}/admin/deleteUser`, {
          params: { userId: data }
        });

        if (res.data.success) {
          alert("User deleted!");
          fetchUsers();
        } else {
          alert(res.data.message || "Delete failed");
        }
      } catch (err) {
        console.error("Delete User Error:", err);
        alert("Failed to delete user");
      }
    } else if (type === "DELETE_STOCK") {
      try {
        const res = await axios.delete(`${API_BASE}/admin/deleteStock`, {
          params: { stockId: data }
        });

        if (res.data.success) {
          alert("Deleted!");
          fetchStocks();
        } else {
          alert(res.data.message || "Delete failed");
        }
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }
    }
  };

  const cancelConfirm = () => {
    setConfirmModal({ isOpen: false, type: "", data: null, message: "" });
  };

  const masterReset = (e) => {
    if (e) e.preventDefault();
    confirmAction("RESET", null, "MASTER RESET WARNING:\n\n1. All Stocks will be deleted\n2. All Orders will be cleared\n3. All User Holdings will be wiped\n4. All Balances reset to 500,000\n\nProceed with Reset?");
  };

  const deleteUser = (userId) => {
    confirmAction("DELETE_USER", userId, "Permanently DELETE this user account?");
  };

  const deleteStock = (stockId) => {
    confirmAction("DELETE_STOCK", stockId, "Delete this stock?");
  };


  const allocateStockToUser = async () => {
    const { userId, stockId, quantity } = allocationForm;

    if (!userId || !stockId || !quantity) {
      alert("Please fill all allocation fields");
      return;
    }

    if (Number(quantity) <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {
      setAllocating(true);

      const res = await axios.post(`${API_BASE}/admin/allocateStock`, {
        userId: Number(userId),
        stockId: Number(stockId),
        quantity: Number(quantity)
      });

      if (res.data.success) {
        alert(
          `Stock allocated successfully\n\n` +
            `User: ${res.data.username}\n` +
            `Stock: ${res.data.stockName}\n` +
            `Quantity: ${res.data.allocatedQuantity}\n` +
            `Deducted Amount: ₹${Number(res.data.deductedAmount).toFixed(2)}\n` +
            `Remaining Balance: ₹${Number(res.data.remainingBalance).toFixed(2)}`
        );

        setAllocationForm({
          userId: "",
          stockId: "",
          quantity: ""
        });

        fetchUsers();
      } else {
        alert(res.data.message || "Allocation failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to allocate stock");
    } finally {
      setAllocating(false);
    }
  };

  const addOrder = async () => {
    const {
      buyerTeam,
      sellerTeam,
      buyerUsername,
      sellerUsername,
      stockName,
      price,
      quantity
    } = orderForm;

    if (
      !buyerUsername ||
      !sellerUsername ||
      !stockName ||
      !price ||
      !quantity
    ) {
      alert("Fill all order fields");
      return;
    }

    if (buyerUsername.trim().toLowerCase() === sellerUsername.trim().toLowerCase()) {
      alert("Buyer and seller username cannot be same");
      return;
    }

    const orderValue = Number(price) * Number(quantity);

    if (orderValue > 50000) {
      alert("Order rejected: order value cannot exceed 50000");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/admin/orders/add`, {
        buyerTeam,
        sellerTeam,
        buyerUsername: buyerUsername.trim(),
        sellerUsername: sellerUsername.trim(),
        stockName,
        price: Number(price),
        quantity: Number(quantity)
      });

      if (res.data.success) {
        alert("Order added successfully ✅");
        setOrderForm({
          buyerTeam: "",
          sellerTeam: "",
          buyerUsername: "",
          sellerUsername: "",
          stockName: "",
          price: "",
          quantity: ""
        });
        fetchOrders();
      } else {
        alert(res.data.message || "Failed to add order");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add order");
    }
  };

  const processOrders = async () => {
    if (!orders.length) {
      alert("No pending orders to process");
      return;
    }

    try {
      setProcessingOrders(true);

      const res = await axios.post(`${API_BASE}/admin/orders/process`);

      if (res.data.success) {
        alert("Preview generated ✅");
        fetchPreviewPrices();
      } else {
        alert(res.data.message || "Processing failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process orders");
    } finally {
      setProcessingOrders(false);
    }
  };

  const approvePrices = async () => {
    if (!previewPrices.length) {
      alert("No preview prices available");
      return;
    }

    try {
      setApprovingPrices(true);

      const res = await axios.post(`${API_BASE}/admin/orders/approve`);

      if (res.data.success) {
        alert("Prices approved and holdings updated ✅");
        fetchStocks();
        fetchUsers();
        fetchOrders();
        fetchPreviewPrices();
      } else {
        alert(res.data.message || "Approval failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve prices");
    } finally {
      setApprovingPrices(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary">
      <div className="scanline-overlay"></div>
      
      {/* SideNavBar */}
      <aside className="flex flex-col fixed left-0 top-0 h-full py-8 bg-[#191c1b] docked left-0 h-screen w-64 border-r border-[#6bfb9a]/5 z-50 hidden lg:flex">
        <div className="px-6 mb-10">
          <h1 className="text-[#4ade80] font-black italic text-xl tracking-tighter">180Degree Consulting MLNCE</h1>
          <p className="text-[#e2e3e0]/40 font-['Inter'] text-[10px] uppercase tracking-[0.2em] mt-1">Command Center</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 bg-[#6bfb9a]/10 text-[#6bfb9a] border-r-4 border-[#6bfb9a] transition-all duration-150 ease-in-out font-['Inter'] text-sm uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="admin_panel_settings">admin_panel_settings</span>
            <span>Controls</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#e2e3e0]/40 hover:bg-[#1d201f] hover:text-[#e2e3e0] transition-all duration-150 ease-in-out font-['Inter'] text-sm uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="group">group</span>
            <span>Users</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#e2e3e0]/40 hover:bg-[#1d201f] hover:text-[#e2e3e0] transition-all duration-150 ease-in-out font-['Inter'] text-sm uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined text-lg" data-icon="storefront">storefront</span>
            <span>Markets</span>
          </a>
        </nav>
        <div className="px-6 mt-auto">
          <button onClick={handleLogout} className="w-full py-3 bg-error/20 text-error font-bold rounded-lg scale-95 active:opacity-80 transition-all flex items-center justify-center gap-2 hover:bg-error/30">
            LOGOUT
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen pb-12">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-6 h-16 bg-[#111413]/80 backdrop-blur-xl docked full-width top-0 sticky border-b border-[#6bfb9a]/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] z-40">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-tighter text-[#4ade80] font-['Space_Grotesk']">Market Odyssey</div>
            <div className="hidden md:flex items-center gap-6">
              <span className="text-[#6bfb9a] border-b-2 border-[#6bfb9a] pb-1 font-['Space_Grotesk'] tracking-tight">Admin Terminal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${tradingOpen ? 'bg-primary/20' : 'bg-error/20'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${tradingOpen ? 'bg-primary shadow-[0_0_8px_#6bfb9a]' : 'bg-error shadow-[0_0_8px_#ffb4ab]'}`}></div>
              <span className={`text-[10px] font-bold tracking-widest font-label ${tradingOpen ? 'text-primary' : 'text-error'}`}>
                {tradingOpen ? 'MARKET LIVE' : 'MARKET CLOSED'}
              </span>
            </div>
            <button onClick={handleLogout} className="lg:hidden material-symbols-outlined text-[#e2e3e0]/60 hover:bg-error/20 hover:text-error p-2 rounded-lg transition-all" data-icon="logout">logout</button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Column: Orders, Previews, Controls */}
            <div className="col-span-12 xl:col-span-7 space-y-6">
              
              {/* Market Control Panel */}
              <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10 glass-panel">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">settings_power</span>
                    Market Control
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button onClick={startTrading} className="flex-1 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-all">Start Trading</button>
                  <button onClick={stopTrading} className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-[10px] font-bold uppercase tracking-widest rounded transition-all">Stop Trading</button>
                  <button onClick={masterReset} className="flex-1 py-3 bg-error/20 hover:bg-error/30 border border-error/30 text-error text-[10px] font-bold uppercase tracking-widest rounded transition-all">Master Reset</button>
                </div>
              </section>

              {/* Admin Order Terminal */}
              <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold uppercase tracking-wider text-sm mb-4">Admin Order Terminal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Buyer Username</label>
                    <select className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" value={orderForm.buyerUsername} onChange={e => setOrderForm({...orderForm, buyerUsername: e.target.value, buyerTeam: e.target.value})}>
                      <option value="">Select Buyer</option>
                      {users.map(u => <option key={u.id} value={u.username}>{u.username}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Seller Username</label>
                    <select className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" value={orderForm.sellerUsername} onChange={e => setOrderForm({...orderForm, sellerUsername: e.target.value, sellerTeam: e.target.value})}>
                      <option value="">Select Seller</option>
                      {users.map(u => <option key={u.id} value={u.username}>{u.username}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Select Stock</label>
                    <select className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" value={orderForm.stockName} onChange={e => setOrderForm({...orderForm, stockName: e.target.value})}>
                      <option value="">Select Stock</option>
                      {stocks.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Quantity</label>
                    <input type="number" className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" placeholder="Qty" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Price</label>
                    <input type="number" className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" placeholder="Price" value={orderForm.price} onChange={e => setOrderForm({...orderForm, price: e.target.value})} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addOrder} className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-all">Submit Order</button>
                  </div>
                </div>
              </section>

              {/* Queued Operations */}
              <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/20">
                  <h3 className="font-headline font-bold uppercase tracking-wider text-sm">Queued Operations</h3>
                  <button onClick={processOrders} disabled={processingOrders} className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest rounded hover:bg-primary-fixed transition-all">{processingOrders ? 'Processing...' : 'Generate Preview'}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container/50">
                        <th className="px-6 py-3 font-bold">B</th>
                        <th className="px-6 py-3 font-bold">S</th>
                        <th className="px-6 py-3 font-bold">Asset</th>
                        <th className="px-6 py-3 font-bold">Qty</th>
                        <th className="px-6 py-3 font-bold">Price</th>
                        <th className="px-6 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono divide-y divide-outline-variant/5">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-surface-container-high/40 transition-colors">
                          <td className="px-6 py-3 text-primary">{o.buyerUsername}</td>
                          <td className="px-6 py-3 text-error">{o.sellerUsername}</td>
                          <td className="px-6 py-3 text-on-surface font-bold">{o.stockName}</td>
                          <td className="px-6 py-3 text-on-surface-variant">{o.quantity}</td>
                          <td className="px-6 py-3 text-on-surface-variant">₹{o.price}</td>
                          <td className="px-6 py-3"><span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[8px]">{o.status}</span></td>
                        </tr>
                      ))}
                      {orders.length === 0 && <tr><td colSpan="6" className="px-6 py-6 text-center text-on-surface-variant text-xs">No pending orders</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Market Preview */}
              <section className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/20">
                  <h3 className="font-headline font-bold uppercase tracking-wider text-sm">Market Preview</h3>
                  {previewPrices.length > 0 && <button onClick={approvePrices} disabled={approvingPrices} className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest rounded hover:bg-primary-fixed transition-all">{approvingPrices ? 'Approving...' : 'Commit Price Vector'}</button>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container/50">
                        <th className="px-6 py-3 font-bold">Ticker</th>
                        <th className="px-6 py-3 font-bold text-right">Reference</th>
                        <th className="px-6 py-3 font-bold text-center">Min (80%)</th>
                        <th className="px-6 py-3 font-bold text-center">Max (120%)</th>
                        <th className="px-6 py-3 font-bold text-right">Target</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono divide-y divide-outline-variant/5">
                      {previewPrices.map(item => (
                        <tr key={item.id} className="hover:bg-surface-container-high/40 transition-colors">
                          <td className="px-6 py-3 text-on-surface font-bold">{item.stockName}</td>
                          <td className="px-6 py-3 text-on-surface-variant text-right">₹{item.oldPrice}</td>
                          <td className="px-6 py-3 text-center text-error font-bold">₹{getMinBid(item.oldPrice)}</td>
                          <td className="px-6 py-3 text-center text-primary font-bold">₹{getMaxBid(item.oldPrice)}</td>
                          <td className={`px-6 py-3 text-right font-bold ${item.newPrice > item.oldPrice ? 'text-primary' : 'text-error'}`}>₹{item.newPrice}</td>
                        </tr>
                      ))}
                      {previewPrices.length === 0 && <tr><td colSpan="5" className="px-6 py-6 text-center text-on-surface-variant text-xs">No preview generated</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>

            {/* Right Column: User & Stock Management */}
            <div className="col-span-12 xl:col-span-5 space-y-6">
              
              {/* User Registry */}
              <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold uppercase tracking-wider text-sm mb-4">User Registry</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <input className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" placeholder="Username" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                  <input type="password" className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" placeholder="Password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                  <input type="number" className="col-span-2 w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" placeholder="Initial Balance" value={userForm.balance} onChange={e => setUserForm({...userForm, balance: e.target.value})} />
                  <button onClick={createUser} disabled={creatingUser} className="col-span-2 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-all">Create Account</button>
                </div>
                
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Active Users</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                  {users.map(u => (
                    <div key={u.id} className="bg-surface-container p-3 rounded flex justify-between items-center group">
                      <div>
                        <div className="text-sm font-bold">{u.username}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">₹{u.balance}</div>
                      </div>
                      <button onClick={() => deleteUser(u.id)} className="text-error/50 hover:text-error transition-colors p-1"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  ))}
                  {users.length === 0 && <div className="text-xs text-on-surface-variant text-center py-2">No users registered</div>}
                </div>
              </section>

              {/* Add New Stock */}
              <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold uppercase tracking-wider text-sm mb-4">Add New Stock</h3>
                <div className="flex gap-4">
                  <input className="w-1/3 bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none uppercase font-mono" placeholder="Symbol" value={newStock.name} onChange={e => setNewStock({...newStock, name: e.target.value.toUpperCase()})} />
                  <input type="number" className="w-1/3 bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none font-mono" placeholder="Price" value={newStock.price} onChange={e => setNewStock({...newStock, price: e.target.value})} />
                  <button onClick={addStock} className="w-1/3 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-all">Initialize</button>
                </div>
              </section>

              {/* Allocate Stock */}
              <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold uppercase tracking-wider text-sm mb-4">Allocate Stock To User</h3>
                <div className="space-y-4">
                  <select className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" value={allocationForm.userId} onChange={e => setAllocationForm({...allocationForm, userId: e.target.value})}>
                    <option value="">Select User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                  <select className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" value={allocationForm.stockId} onChange={e => setAllocationForm({...allocationForm, stockId: e.target.value})}>
                    <option value="">Select Stock</option>
                    {stocks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input type="number" className="w-full bg-surface-container border border-outline-variant/20 rounded p-2 text-sm text-on-surface focus:border-primary/50 focus:outline-none" placeholder="Quantity" value={allocationForm.quantity} onChange={e => setAllocationForm({...allocationForm, quantity: e.target.value})} />
                  <button onClick={allocateStockToUser} disabled={allocating} className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest rounded transition-all">{allocating ? 'Processing...' : 'Execute Transfer'}</button>
                </div>
              </section>

              {/* Active Listings */}
              <section className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold uppercase tracking-wider text-sm mb-4">Active Listings</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                  {stocks.map(s => (
                    <div key={s.id} className="bg-surface-container p-3 rounded flex justify-between items-center group">
                      <div className="flex-1">
                        <div className="text-sm font-bold font-headline">{s.name}</div>
                        <div className="flex gap-4 mt-1">
                          <div className="text-[10px] text-primary font-mono font-bold">NOW: ₹{s.price}</div>
                          <div className="text-[10px] text-error font-mono">MIN: ₹{getMinBid(s.price)}</div>
                          <div className="text-[10px] text-primary font-mono opacity-80">MAX: ₹{getMaxBid(s.price)}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteStock(s.id)} className="text-error/50 hover:text-error transition-colors p-1"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  ))}
                  {stocks.length === 0 && <div className="text-xs text-on-surface-variant text-center py-2">No active listings</div>}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Modals for Confirmation */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-lg max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <h3 className="text-lg font-bold font-headline text-error mb-4">Confirm Action</h3>
            <pre className="text-sm text-on-surface whitespace-pre-wrap font-body mb-6">{confirmModal.message}</pre>
            <div className="flex gap-4">
              <button onClick={cancelConfirm} className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high rounded text-sm transition-colors">Cancel</button>
              <button onClick={executeConfirm} className="flex-1 py-2 bg-error/20 hover:bg-error/30 text-error rounded text-sm transition-colors font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
