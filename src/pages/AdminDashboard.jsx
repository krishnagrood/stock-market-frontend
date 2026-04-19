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

  const orderValue =
    Number(orderForm.price || 0) * Number(orderForm.quantity || 0);

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes glowPulse {
            0% {
              filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.12))
                      drop-shadow(0 0 24px rgba(34, 197, 94, 0.05));
            }
            100% {
              filter: drop-shadow(0 0 24px rgba(34, 197, 94, 0.34))
                      drop-shadow(0 0 56px rgba(34, 197, 94, 0.14));
            }
          }

          @keyframes shimmerSweep {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          @keyframes panelGlow {
            0% {
              box-shadow:
                0 16px 36px -14px rgba(0, 0, 0, 0.56),
                0 0 24px -6px rgba(78, 222, 163, 0.03);
            }
            100% {
              box-shadow:
                0 24px 56px -14px rgba(0, 0, 0, 0.72),
                0 0 34px -6px rgba(78, 222, 163, 0.07);
            }
          }

          @keyframes bgFloatOne {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(18px, -16px) scale(1.04); }
            100% { transform: translate(0, 0) scale(1); }
          }

          @keyframes bgFloatTwo {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-14px, 18px) scale(1.05); }
            100% { transform: translate(0, 0) scale(1); }
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            background: #080808;
          }

          input::placeholder,
          select {
            color: #6b7280;
          }

          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(78, 222, 163, 0.22);
            border-radius: 10px;
          }

          @media (min-width: 1024px) {
            .admin-main-grid {
              grid-template-columns: 0.92fr 1.08fr;
            }

            .top-bar-layout {
              align-items: end;
            }

            .add-stock-grid {
              grid-template-columns: 2fr 2fr 1fr;
            }

            .order-grid-layout {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }

            .allocation-grid-layout {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .stocks-grid-layout {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 1023px) {
            .admin-main-grid {
              grid-template-columns: 1fr;
            }

            .top-bar-layout {
              flex-direction: column;
              align-items: flex-start;
            }

            .add-stock-grid {
              grid-template-columns: 1fr;
            }

            .order-grid-layout {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .allocation-grid-layout {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .stocks-grid-layout {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .order-grid-layout,
            .allocation-grid-layout {
              grid-template-columns: 1fr;
            }

            .stocks-grid-layout {
              grid-template-columns: 1fr;
            }

            .order-summary-layout {
              flex-direction: column;
              align-items: flex-start;
            }

            .top-stats-layout {
              width: 100%;
              justify-content: space-between;
            }
          }
        `}
      </style>

      <div style={styles.gridOverlay} />
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />
      <div style={styles.bgGlowThree} />

      <header className="admin-header" style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.headerLabel}>Enterprise Access</span>
          <h1 className="header-title-text" style={styles.headerTitle}>MARKET ODYSSEY</h1>
          <div style={styles.headerLine} />
        </div>
      </header>

      <style>
        {`
          @media (max-width: 768px) {
            .admin-main-grid {
              grid-template-columns: 1fr !important;
            }
            .top-bar-layout {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 20px !important;
              margin-bottom: 30px !important;
            }
            .top-stats-layout {
              width: 100% !important;
              flex-wrap: wrap !important;
            }
            .top-stats-layout > div {
              flex: 1 !important;
              min-width: 120px !important;
            }
            .header-title-text {
              font-size: 2.5rem !important;
            }
            .admin-header {
              padding-top: 40px !important;
              padding-bottom: 40px !important;
            }
            .admin-main {
              padding: 0 16px 60px !important;
            }
            .panel-layout {
              padding: 20px !important;
            }
            .order-grid-layout {
               grid-template-columns: 1fr !important;
            }
            .allocation-grid-layout {
               grid-template-columns: 1fr !important;
            }
            .stocks-grid-layout {
               grid-template-columns: 1fr !important;
            }
          }

          @keyframes panelGlow {
            0% { box-shadow: 0 16px 36px -14px rgba(0, 0, 0, 0.56), 0 0 24px -6px rgba(78, 222, 163, 0.03); }
            100% { box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.64), 0 0 32px -4px rgba(78, 222, 163, 0.06); }
          }
          @keyframes glowPulse {
            0% { filter: drop-shadow(0 0 12px rgba(78, 222, 163, 0.1)); }
            100% { filter: drop-shadow(0 0 24px rgba(78, 222, 163, 0.3)); }
          }
          @keyframes bgFloatOne {
            0% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
            100% { transform: translate(0, 0); }
          }
          @keyframes bgFloatTwo {
            0% { transform: translate(0, 0); }
            50% { transform: translate(-30px, 15px); }
            100% { transform: translate(0, 0); }
          }
          @keyframes shimmerSweep {
            0% { background-position: 220% auto; }
            100% { background-position: -220% auto; }
          }
        `}
      </style>


      <main className="admin-main" style={styles.main}>
        <div className="top-bar-layout" style={styles.topBar}>
          <div>
            <h2 style={styles.dashboardTitle}>Administrator Terminal</h2>
            <p style={styles.dashboardSubTitle}>Premium control interface</p>
          </div>

          <div className="top-stats-layout" style={styles.topRightStats}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Market</p>
              <p style={styles.statValue}>
                {tradingOpen ? "OPEN" : "CLOSED"}
              </p>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Status</p>
              <div style={styles.statusRow}>
                <span
                  style={{
                    ...styles.statusDot,
                    background: tradingOpen ? "#4edea3" : "#ef4444"
                  }}
                />
                <p style={styles.statValue}>{tradingOpen ? "LIVE" : "IDLE"}</p>
              </div>
            </div>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </div>

        <div className="admin-main-grid" style={styles.mainGrid}>
          <div style={styles.leftCol}>
            <section className="panel-layout" style={styles.panel}>
              <div style={styles.panelHead}>
                <h3 style={styles.panelTitle}>Market Control</h3>
                <span style={styles.miniBadge}>Operational</span>
              </div>

              <div style={styles.verticalButtonGroup}>
                <button style={styles.greenBtn} onClick={startTrading}>
                  Start
                </button>
                <button style={styles.darkBtn} onClick={stopTrading}>
                  Stop
                </button>
                <button style={styles.masterResetBtn} onClick={(e) => masterReset(e)}>
                  ⚠️ MASTER RESET
                </button>
              </div>
            </section>

            <section className="panel-layout" style={styles.panel}>
              <div style={styles.panelHead}>
                <h3 style={styles.panelTitle}>Market Preview</h3>
              </div>

              {previewPrices.length === 0 ? (
                <p style={styles.emptyText}>No preview generated</p>
              ) : (
                <>
                  <div style={styles.tableWrap}>
                    <table style={styles.previewTable}>
                      <thead>
                        <tr>
                          <th style={styles.smallTh}>Ticker</th>
                          <th style={{ ...styles.smallTh, textAlign: "right" }}>
                            Reference
                          </th>
                          <th style={{ ...styles.smallTh, textAlign: "right" }}>
                            Target
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewPrices.map((item) => (
                          <tr key={item.id} style={styles.previewRow}>
                            <td style={styles.smallTd}>{item.stockName}</td>
                            <td style={{ ...styles.smallTd, textAlign: "right" }}>
                              ₹{item.oldPrice}
                            </td>
                            <td
                              style={{
                                ...styles.smallTd,
                                textAlign: "right",
                                color:
                                  item.newPrice > item.oldPrice
                                    ? "#4edea3"
                                    : "#ff6b6b",
                                fontWeight: 700
                              }}
                            >
                              ₹{item.newPrice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    style={styles.outlineGreenBtn}
                    onClick={approvePrices}
                    disabled={approvingPrices}
                  >
                    {approvingPrices ? "Approving..." : "Commit Price Vector"}
                  </button>
                </>
              )}
            </section>
          </div>

          <div style={styles.rightCol}>
            <section className="panel-layout" style={styles.panel}>
              <h3 style={styles.sectionTitle}>User Registry</h3>

              <div style={{ marginBottom: "26px" }}>
                <p style={styles.fieldLabel}>Create New Account</p>
                <div className="add-stock-grid-layout" style={styles.addStockGrid}>
                  <div style={styles.fieldBlock}>
                    <input
                      style={styles.input}
                      placeholder="Username"
                      value={userForm.username}
                      onChange={(e) =>
                        setUserForm({ ...userForm, username: e.target.value })
                      }
                    />
                  </div>
                  <div style={styles.fieldBlock}>
                    <input
                      style={styles.input}
                      type="password"
                      placeholder="Password"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                    />
                  </div>
                  <div style={styles.fieldBlock}>
                    <input
                      style={styles.inputMono}
                      type="number"
                      placeholder="Initial Balance"
                      value={userForm.balance}
                      onChange={(e) =>
                        setUserForm({ ...userForm, balance: e.target.value })
                      }
                    />
                  </div>
                  <div style={styles.addStockButtonWrap}>
                    <button
                      style={styles.softGreenBtn}
                      onClick={(e) => createUser(e)}
                      disabled={creatingUser}
                    >
                      {creatingUser ? "..." : "Create"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.headerLine} />

              <div style={{ marginTop: "26px" }}>
                <p style={styles.fieldLabel}>Active Users</p>
                {users.length === 0 ? (
                  <p style={styles.emptyText}>No users registered</p>
                ) : (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {users.map((u) => (
                      <div key={u.id} style={styles.userListItem}>
                        <div style={{ flex: 1 }}>
                          <span style={styles.userListUsername}>{u.username}</span>
                          <span style={styles.userListMeta}>
                            ID: {u.id} • ₹{Number(u.balance).toLocaleString()}
                          </span>
                        </div>
                        <button
                          style={styles.miniDeleteBtn}
                          onClick={() => deleteUser(u.id)}
                        >
                          DELETE
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="panel-layout" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Add New Stock</h3>

              <div className="add-stock-grid" className="add-stock-grid-layout" style={styles.addStockGrid}>
                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Stock Name</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. GOLD.X"
                    value={newStock.name}
                    onChange={(e) =>
                      setNewStock({ ...newStock, name: e.target.value })
                    }
                  />
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Price</label>
                  <input
                    style={styles.inputMono}
                    type="number"
                    placeholder="0.00"
                    value={newStock.price}
                    onChange={(e) =>
                      setNewStock({ ...newStock, price: e.target.value })
                    }
                  />
                </div>

                <div style={styles.addStockButtonWrap}>
                  <button style={styles.softGreenBtn} onClick={(e) => addStock(e)}>
                    Register
                  </button>
                </div>
              </div>
            </section>

            <section className="panel-layout" style={styles.panel}>
              <h3 style={styles.sectionTitle}>Allocate Stock To User</h3>

              <div className="allocation-grid-layout" className="allocation-grid-layout" style={styles.allocationGrid}>
                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Select User</label>
                  <select
                    style={styles.selectSmall}
                    value={allocationForm.userId}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        userId: e.target.value
                      })
                    }
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} (ID: {user.id}) - ₹
                        {Number(user.balance).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Select Stock</label>
                  <select
                    style={styles.selectSmall}
                    value={allocationForm.stockId}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        stockId: e.target.value
                      })
                    }
                  >
                    <option value="">Select Stock</option>
                    {stocks.map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.name} - ₹{Number(stock.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Quantity</label>
                  <input
                    style={styles.inputSmallMono}
                    type="number"
                    placeholder="Enter quantity"
                    value={allocationForm.quantity}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        quantity: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <button
                  style={styles.softGreenBtn}
                  onClick={allocateStockToUser}
                  disabled={allocating}
                >
                  {allocating ? "Allocating..." : "Allocate Stock"}
                </button>
              </div>
            </section>

            <section style={{ ...styles.panel, overflow: "hidden" }}>
              <h3 style={styles.sectionTitleWithBorder}>Admin Order Terminal</h3>

              <div className="order-grid-layout" className="order-grid-layout" style={styles.orderGrid}>


                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Buyer Username</label>
                  <select
                    style={styles.selectSmall}
                    value={orderForm.buyerUsername}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, buyerUsername: e.target.value })
                    }
                  >
                    <option value="">Select Buyer</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.username}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Seller Username</label>
                  <select
                    style={styles.selectSmall}
                    value={orderForm.sellerUsername}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, sellerUsername: e.target.value })
                    }
                  >
                    <option value="">Select Seller</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.username}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Ticker</label>
                  <select
                    style={styles.selectSmall}
                    value={orderForm.stockName}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, stockName: e.target.value })
                    }
                  >
                    <option value="">Select Stock</option>
                    {stocks.map((stock) => (
                      <option key={stock.id} value={stock.name}>
                        {stock.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Valuation</label>
                  <input
                    style={styles.inputSmallMono}
                    type="number"
                    placeholder="Trade Price"
                    value={orderForm.price}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, price: e.target.value })
                    }
                  />
                </div>

                <div style={styles.fieldBlock}>
                  <label style={styles.fieldLabel}>Quantity</label>
                  <input
                    style={styles.inputSmallMono}
                    type="number"
                    placeholder="Quantity"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="order-summary-layout" style={styles.orderSummaryPanel}>
                <div style={styles.orderSummaryLeft}>
                  <div>
                    <p style={styles.orderSummaryLabel}>Projected Volume</p>
                    <p style={styles.orderSummaryValue}>₹ {orderValue.toFixed(2)}</p>
                  </div>

                  <div
                    style={{
                      ...styles.warningBox,
                      color: orderValue > 50000 ? "#ff8b8b" : "#9ca3af",
                      borderColor:
                        orderValue > 50000
                          ? "rgba(255, 107, 107, 0.12)"
                          : "rgba(255,255,255,0.06)",
                      background:
                        orderValue > 50000
                          ? "rgba(255, 107, 107, 0.05)"
                          : "rgba(255,255,255,0.03)"
                    }}
                  >
                    <span>
                      {orderValue > 50000
                        ? "Threshold variance detected"
                        : "Within execution threshold"}
                    </span>
                  </div>
                </div>

                <button style={styles.greenBtnWide} onClick={addOrder}>
                  Authorize Order
                </button>
              </div>
            </section>
          </div>

          <section style={{ ...styles.panel, gridColumn: "1 / -1" }}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Queued Operations</h3>
              <button
                style={styles.linkBtn}
                onClick={processOrders}
                disabled={processingOrders}
              >
                {processingOrders ? "Processing..." : "Processing Queue →"}
              </button>
            </div>

            {orders.length === 0 ? (
              <p style={styles.emptyText}>No pending orders</p>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.queueTable}>
                  <thead>
                    <tr>
                      <th style={styles.queueTh}>Buyer</th>
                      <th style={styles.queueTh}>Seller</th>
                      <th style={styles.queueTh}>Ticker</th>
                      <th style={{ ...styles.queueTh, textAlign: "right" }}>
                        Price
                      </th>
                      <th style={{ ...styles.queueTh, textAlign: "right" }}>
                        Volume
                      </th>
                      <th style={{ ...styles.queueTh, textAlign: "right" }}>
                        Net Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={styles.queueRow}>
                        <td style={styles.queueTd}>
                          {order.buyerUsername || "-"}
                        </td>
                        <td style={styles.queueTd}>
                          {order.sellerUsername || "-"}
                        </td>
                        <td style={styles.queueTickerTd}>{order.stockName}</td>
                        <td style={{ ...styles.queueTd, textAlign: "right" }}>
                          ₹{order.price}
                        </td>
                        <td style={{ ...styles.queueTd, textAlign: "right" }}>
                          {order.quantity}
                        </td>
                        <td style={styles.queueValueTd}>₹{order.orderValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={{ ...styles.panel, gridColumn: "1 / -1" }}>
            <h3 style={styles.sectionTitle}>Stocks</h3>

            <div className="stocks-grid-layout" className="stocks-grid-layout" style={styles.stocksGrid}>
              {stocks.map((s) => (
                <div key={s.id} style={styles.stockCard}>
                  <div style={styles.stockCardTop}>
                    <div>
                      <h4 style={styles.stockName}>{s.name}</h4>
                    </div>
                    <div style={styles.stockPriceBlock}>
                      <p style={styles.stockPriceLabel}>Mark Price</p>
                      <p style={styles.stockPrice}>₹{s.price}</p>
                    </div>
                  </div>

                  <div style={styles.stockCardActions}>
                    <div style={{ flex: 1 }}>
                      <input
                        style={styles.stockInput}
                        type="number"
                        placeholder="Adj. Price"
                        onChange={(e) =>
                          setPrice({
                            ...price,
                            [s.id]: Number(e.target.value)
                          })
                        }
                      />
                    </div>

                    <button
                      style={styles.softGreenBtnCompact}
                      disabled={loadingId === s.id}
                      onClick={() => updatePrice(s.id)}
                    >
                      {loadingId === s.id ? "Updating..." : "Update"}
                    </button>

                    <button
                      style={styles.deleteIconBtn}
                      onClick={() => deleteStock(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* CUSTOM CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Confirm Action</h3>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalMessage}>{confirmModal.message}</p>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.modalCancelBtn} onClick={cancelConfirm}>CANCEL</button>
              <button style={styles.modalConfirmBtn} onClick={executeConfirm}>CONFIRM</button>
            </div>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p style={styles.footerText}>PROTOCOL SOVEREIGN ALPHA — SYSTEM SECURED</p>
      </footer>

      <div style={styles.bottomEdge} />
    </div>
  );
}

const panelBase = {
  background:
    "linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(10,10,10,0.92) 100%)",
  border: "1px solid rgba(78, 222, 163, 0.06)",
  boxShadow:
    "0 16px 36px -14px rgba(0, 0, 0, 0.56), 0 0 24px -6px rgba(78, 222, 163, 0.03)",
  transition: "all 0.3s ease",
  animation: "panelGlow 4s ease-in-out infinite alternate",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)"
};

const inputBase = {
  width: "100%",
  background:
    "linear-gradient(180deg, rgba(8,8,8,0.96) 0%, rgba(12,12,12,0.92) 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
  color: "#e5e2e1",
  padding: "16px 18px",
  fontSize: "14px",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)"
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#e5e2e1",
    fontFamily: "Inter, sans-serif",
    position: "relative",
    overflowX: "hidden"
  },

  gridOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.18,
    backgroundImage:
      "linear-gradient(rgba(78, 222, 163, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(78, 222, 163, 0.03) 1px, transparent 1px)",
    backgroundSize: "52px 52px"
  },

  bgGlowOne: {
    position: "fixed",
    top: "-12%",
    left: "-4%",
    width: "42%",
    height: "42%",
    borderRadius: "999px",
    background: "rgba(78, 222, 163, 0.08)",
    filter: "blur(120px)",
    animation: "bgFloatOne 11s ease-in-out infinite",
    pointerEvents: "none"
  },

  bgGlowTwo: {
    position: "fixed",
    top: "18%",
    right: "-5%",
    width: "32%",
    height: "32%",
    borderRadius: "999px",
    background: "rgba(78, 222, 163, 0.06)",
    filter: "blur(110px)",
    animation: "bgFloatTwo 12s ease-in-out infinite",
    pointerEvents: "none"
  },

  bgGlowThree: {
    position: "fixed",
    bottom: "-8%",
    right: "8%",
    width: "28%",
    height: "28%",
    borderRadius: "999px",
    background: "rgba(78, 222, 163, 0.05)",
    filter: "blur(100px)",
    animation: "bgFloatOne 10s ease-in-out infinite reverse",
    pointerEvents: "none"
  },

  header: {
    paddingTop: "72px",
    paddingBottom: "74px",
    textAlign: "center",
    position: "relative",
    zIndex: 2
  },

  headerInner: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center"
  },

  headerLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5em",
    color: "rgba(78, 222, 163, 0.6)",
    fontWeight: 600,
    marginBottom: "14px"
  },

  headerTitle: {
    fontSize: "clamp(2.8rem, 5vw, 4.4rem)",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    color: "#e5e2e1",
    textTransform: "uppercase",
    margin: 0,
    backgroundImage:
      "linear-gradient(110deg, #ffffff 20%, #dcfce7 35%, #4edea3 50%, #dcfce7 65%, #ffffff 80%)",
    backgroundSize: "220% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation:
      "glowPulse 3s ease-in-out infinite alternate, shimmerSweep 6s linear infinite"
  },

  headerLine: {
    height: "1px",
    width: "108px",
    marginTop: "18px",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(78, 222, 163, 0.36) 50%, transparent 100%)"
  },

  main: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "0 24px 96px",
    position: "relative",
    zIndex: 2
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "32px",
    marginBottom: "56px"
  },

  dashboardTitle: {
    fontSize: "clamp(2rem, 3vw, 3.1rem)",
    fontWeight: 900,
    textTransform: "uppercase",
    margin: 0,
    letterSpacing: "-0.04em",
    lineHeight: 1
  },

  dashboardSubTitle: {
    margin: "12px 0 0 0",
    color: "#8a938c",
    fontSize: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase"
  },

  topRightStats: {
    display: "flex",
    gap: "14px"
  },

  statCard: {
    minWidth: "132px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    textAlign: "right"
  },

  statLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    color: "#8a938c",
    fontWeight: 700,
    marginBottom: "6px"
  },

  statValue: {
    margin: 0,
    fontFamily: "monospace",
    fontSize: "1.05rem",
    color: "#e5e2e1",
    textTransform: "uppercase"
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "flex-end"
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "999px",
    boxShadow: "0 0 12px currentColor"
  },

  mainGrid: {
    display: "grid",
    gap: "24px",
    alignItems: "start"
  },

  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },

  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },

  panel: {
    ...panelBase,
    borderRadius: "28px",
    padding: "30px"
  },

  panelHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap"
  },

  panelTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    color: "#8a938c"
  },

  miniBadge: {
    padding: "5px 10px",
    background: "rgba(78, 222, 163, 0.05)",
    border: "1px solid rgba(78, 222, 163, 0.20)",
    color: "#4edea3",
    fontSize: "9px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    borderRadius: "6px"
  },

  verticalButtonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  greenBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #65ebb0 0%, #005f3f 100%)",
    color: "#032816",
    fontWeight: 900,
    padding: "18px",
    border: "none",
    borderRadius: "18px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(78, 222, 163, 0.16)"
  },

  greenBtnWide: {
    background: "linear-gradient(135deg, #65ebb0 0%, #005f3f 100%)",
    color: "#032816",
    fontWeight: 900,
    padding: "18px 28px",
    border: "none",
    borderRadius: "18px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    cursor: "pointer",
    minWidth: "220px",
    boxShadow: "0 12px 30px rgba(78, 222, 163, 0.16)"
  },

  darkBtn: {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(229,226,225,0.78)",
    fontWeight: 800,
    padding: "18px",
    borderRadius: "18px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.05)"
  },

  masterResetBtn: {
    width: "100%",
    background: "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.25))",
    color: "#ff6b6b",
    fontWeight: 800,
    padding: "18px",
    borderRadius: "18px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    cursor: "pointer",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    marginTop: "8px",
    boxShadow: "0 4px 20px rgba(239, 68, 68, 0.15)",
    transition: "all 0.3s ease"
  },

  outlineGreenBtn: {
    width: "100%",
    padding: "16px",
    marginTop: "20px",
    background: "transparent",
    color: "#4edea3",
    border: "1px solid rgba(78, 222, 163, 0.20)",
    borderRadius: "16px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    fontSize: "10px",
    cursor: "pointer"
  },

  sectionTitle: {
    margin: "0 0 26px 0",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    color: "#8a938c"
  },

  userListItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    transition: "all 0.2s ease"
  },

  userListUsername: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#e2e8f0",
    letterSpacing: "0.02em"
  },

  userListMeta: {
    fontSize: "10px",
    color: "rgba(148, 163, 184, 0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: "2px",
    display: "block"
  },

  miniDeleteBtn: {
    padding: "6px 10px",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "8px",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "all 0.2s ease"
  },

  sectionTitleWithBorder: {
    margin: "0 0 26px 0",
    paddingLeft: "16px",
    borderLeft: "2px solid #4edea3",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    color: "#8a938c"
  },

  addStockGrid: {
    display: "grid",
    gap: "18px",
    alignItems: "end"
  },

  allocationGrid: {
    display: "grid",
    gap: "18px",
    alignItems: "end"
  },

  fieldBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  fieldLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(138, 147, 140, 0.7)",
    fontWeight: 800,
    marginLeft: "4px"
  },

  input: {
    ...inputBase
  },

  inputMono: {
    ...inputBase,
    fontFamily: "monospace"
  },

  inputSmall: {
    ...inputBase,
    padding: "14px 16px",
    fontSize: "12px",
    fontWeight: 600
  },

  inputSmallMono: {
    ...inputBase,
    padding: "14px 16px",
    fontSize: "12px",
    fontFamily: "monospace"
  },

  selectSmall: {
    ...inputBase,
    padding: "14px 16px",
    fontSize: "12px",
    fontWeight: 700,
    appearance: "none"
  },

  addStockButtonWrap: {
    display: "flex"
  },

  softGreenBtn: {
    width: "100%",
    background: "rgba(78, 222, 163, 0.10)",
    color: "#4edea3",
    border: "1px solid rgba(78, 222, 163, 0.20)",
    fontWeight: 800,
    padding: "16px",
    borderRadius: "16px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    cursor: "pointer"
  },

  softGreenBtnCompact: {
    background: "rgba(78, 222, 163, 0.08)",
    color: "#4edea3",
    border: "1px solid rgba(78, 222, 163, 0.20)",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    cursor: "pointer"
  },

  orderGrid: {
    display: "grid",
    gap: "18px",
    marginBottom: "28px"
  },

  orderSummaryPanel: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    background: "rgba(255,255,255,0.025)",
    padding: "26px",
    borderRadius: "22px",
    border: "1px solid rgba(255,255,255,0.05)",
    flexWrap: "wrap"
  },

  orderSummaryLeft: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  orderSummaryLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    color: "rgba(138, 147, 140, 0.7)",
    letterSpacing: "0.2em",
    fontWeight: 800,
    marginBottom: "8px"
  },

  orderSummaryValue: {
    fontSize: "2rem",
    fontWeight: 900,
    margin: 0,
    letterSpacing: "-0.03em"
  },

  warningBox: {
    padding: "14px 18px",
    borderRadius: "14px",
    fontSize: "11px",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.06)"
  },

  tableWrap: {
    overflowX: "auto"
  },

  previewTable: {
    width: "100%",
    textAlign: "left",
    borderCollapse: "collapse"
  },

  smallTh: {
    paddingBottom: "12px",
    fontSize: "10px",
    textTransform: "uppercase",
    color: "rgba(138, 147, 140, 0.5)",
    letterSpacing: "0.15em",
    fontWeight: 800,
    borderBottom: "1px solid rgba(255,255,255,0.05)"
  },

  smallTd: {
    padding: "16px 0",
    fontSize: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)"
  },

  previewRow: {},

  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#4edea3",
    fontWeight: 800,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    cursor: "pointer"
  },

  queueTable: {
    width: "100%",
    textAlign: "left",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
    minWidth: "980px"
  },

  queueTh: {
    padding: "0 16px 16px",
    fontSize: "9px",
    textTransform: "uppercase",
    color: "rgba(138, 147, 140, 0.45)",
    letterSpacing: "0.2em",
    fontWeight: 800
  },

  queueRow: {
    background: "rgba(255,255,255,0.02)"
  },

  queueTd: {
    padding: "18px 16px",
    fontSize: "12px",
    fontWeight: 700
  },

  queueTickerTd: {
    padding: "18px 16px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#4edea3",
    textTransform: "uppercase",
    letterSpacing: "0.08em"
  },

  queueValueTd: {
    padding: "18px 16px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#4edea3",
    textAlign: "right",
    fontFamily: "monospace"
  },

  stocksGrid: {
    display: "grid",
    gap: "18px"
  },

  stockCard: {
    background: "rgba(255,255,255,0.022)",
    padding: "22px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "190px"
  },

  stockCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "32px"
  },

  stockName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 900,
    letterSpacing: "-0.02em"
  },

  stockPriceBlock: {
    textAlign: "right"
  },

  stockPriceLabel: {
    fontSize: "9px",
    textTransform: "uppercase",
    color: "rgba(138, 147, 140, 0.45)",
    fontWeight: 800,
    letterSpacing: "0.15em",
    marginBottom: "4px"
  },

  stockPrice: {
    margin: 0,
    fontSize: "18px",
    fontFamily: "monospace",
    color: "#4edea3"
  },

  stockCardActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },

  stockInput: {
    width: "100%",
    background: "rgba(0,0,0,0.44)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    color: "#e5e2e1",
    padding: "12px 14px",
    fontSize: "12px",
    fontFamily: "monospace",
    outline: "none"
  },

  deleteIconBtn: {
    color: "rgba(255, 107, 107, 0.74)",
    background: "rgba(255, 107, 107, 0.04)",
    border: "1px solid rgba(255, 107, 107, 0.10)",
    padding: "12px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 700
  },

  emptyText: {
    margin: 0,
    color: "#8a938c",
    fontSize: "14px"
  },

  footer: {
    paddingBottom: "64px",
    textAlign: "center",
    opacity: 0.34,
    position: "relative",
    zIndex: 2
  },

  footerText: {
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.5em",
    color: "#8a938c",
    fontWeight: 600
  },

  bottomEdge: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "2px",
    background:
      "linear-gradient(90deg, transparent 0%, rgba(78, 222, 163, 0.2) 50%, transparent 100%)"
  },

  logoutBtn: {
    padding: "16px 24px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "14px",
    color: "#ff6b6b",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.15em",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    marginLeft: "20px"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999
  },

  modalContent: {
    background: "linear-gradient(180deg, #121212 0%, #0a0a0c 100%)",
    border: "1px solid rgba(78, 222, 163, 0.2)",
    borderRadius: "24px",
    padding: "32px",
    width: "400px",
    maxWidth: "90%",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    textAlign: "center"
  },

  modalHeader: {
    marginBottom: "20px"
  },

  modalTitle: {
    margin: 0,
    color: "#4edea3",
    fontSize: "18px",
    fontWeight: 900,
    letterSpacing: "0.15em",
    textTransform: "uppercase"
  },

  modalBody: {
    marginBottom: "32px"
  },

  modalMessage: {
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap"
  },

  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: "16px"
  },

  modalCancelBtn: {
    padding: "12px 24px",
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#8a938c",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  modalConfirmBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.25))",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    borderRadius: "12px",
    color: "#ff6b6b",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(239, 68, 68, 0.15)"
  }
};

export default AdminDashboard;