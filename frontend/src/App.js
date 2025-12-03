// App.js
import React, { useState, useEffect } from 'react';
import config from './config';

const STR = {
  en: {
    addProduct: 'Add Product',
    addCustomer: 'Add Customer',
    paidNow: 'Paid Now',
    remaining: 'Remaining',
    previousPending: 'Previous Pending',
    savePrint: 'Save & Print',
    products: 'Products',
    customers: 'Customers',
    purchases: 'Purchases',
    sales: 'Sales',
    reports: 'Reports',
    debits: 'Debits',
    settings: 'Settings',
    login: 'Welcome Back',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Login',
    vendorName: 'Vendor Name',
    modeOfPayment: 'Mode of Payment',
    cash: 'Cash',
    card: 'Card',
    cheque: 'Cheque',
    online: 'Online',
    availableproducts: 'Available Products',
    recycleBin: 'Recycle Bin',
  },
  ur: {
    addProduct: 'مصنوع شامل کریں',
    addCustomer: 'کسٹمر شامل کریں',
    paidNow: 'ادائیگی',
    remaining: 'بقیہ',
    previousPending: 'پچھلا بقایا',
    savePrint: 'محفوظ کریں اور پرنٹ کریں',
    products: 'پراڈکٹس',
    customers: 'کسٹمرز',
    purchases: 'خریداری',
    sales: 'فروخت',
    reports: 'رپورٹس',
    debits: 'ادائیگیاں',
    settings: 'سیٹنگز',
    login: 'لاگ ان کریں',
    username: 'یوزر',
    password: 'پاس ورڈ',
    loginBtn: 'لاگ ان',
    vendorName: 'سپلائر کا نام',
    modeOfPayment: 'ادائیگی کا طریقہ',
    cash: 'نقد',
    card: 'کارڈ',
    cheque: 'چیک',
    online: 'آن لائن',
    availableproducts: 'دستیاب مصنوعات',
    recycleBin: 'ری سائیکل بن',
    login: 'خوش آمدید',
  }
};


// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${config.apiUrl}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return { ok: false, message: 'Network error' };
  }
};



function App() {
  const [lang, setLang] = useState(localStorage.getItem('erp_lang') || 'en');
  const [route, setRoute] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [logo, setLogo] = useState(localStorage.getItem('erp_logo') || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  function t(k) { return STR[lang][k] || k; }

  useEffect(() => {
    if (user) setRoute('dashboard');
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return (
      <Login
        onSuccess={u => { setUser(u); }}
        logo={logo}
        t={t}
        setLang={setLang}
        lang={lang}
      />
    );
  }

  const titleMap = {
    dashboard: 'Dashboard',
    products: t('products'),
    sales: t('sales'),
    purchases: t('purchases'),
    reports: t('reports'),
    debits: t('debits'),
    settings: t('settings'),
    RecycleBin: t('Recycle Bin'),
  };
  const currentTitle = titleMap[route] || 'Recycle Bin';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-900">
      {/* Mobile header */}
      <div className="md:hidden bg-slate-950 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <div className="font-semibold text-white text-sm">Ethehad Traders</div>
            <div className="text-xs text-cyan-400">ET & Co</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={e => { const l = e.target.value; setLang(l); localStorage.setItem('erp_lang', l); }}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
          >
            <option value="en">EN</option>
            <option value="ur">UR</option>
          </select>
          <button
            onClick={() => { setUser(null); setRoute('login'); }}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SIDEBAR - Mobile responsive */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-40
        w-64 bg-slate-950 text-slate-50 flex flex-col transition-transform duration-300
        md:w-64 md:flex
      `}>
        {/* Top: DP + title */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-slate-800">
          {logo ? (
            <img
              src={logo}
              alt="DP"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-cyan-400 shadow-md"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
              Recycle Bin
            </div>
          )}
          <div>
            <div className="font-semibold text-white">Ethehad Traders</div>
            <div className="text-xs text-cyan-400">ET & Co</div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-auto p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {[
            ['dashboard', 'Dashboard'],
            ['products', t('products')],
            ['sales', t('sales')],
            ['purchases', t('purchases')],
            ['reports', t('reports')],
            ['debits', t('debits')],
            ['settings', t('settings')],
            ['recycleBin', t('Recycle Bin')],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setRoute(value);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center px-3 py-3 rounded-lg text-sm text-left transition
                ${route === value
                  ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-transparent text-white border-l-4 border-cyan-400'
                  : 'text-slate-300 hover:bg-slate-800/60'
                }
              `}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom: user + logout + language - Desktop only */}
        <div className="hidden md:block px-4 py-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>{user?.username}</span>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={e => { const l = e.target.value; setLang(l); localStorage.setItem('erp_lang', l); }}
              className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs"
            >
              <option value="en">EN</option>
              <option value="ur">UR</option>
            </select>
            <button
              onClick={() => { setUser(null); setRoute('login'); }}
              className="text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN AREA */}
      <main className="flex-1 relative overflow-x-hidden">
        {/* Faded background DP / logo */}
        {logo && (
          <img
            src={logo}
            alt="background"
            className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-10"
          />
        )}

        <div className="relative h-full p-3 md:p-6">
          {/* Glass top bar */}
          <div className="mb-4 md:mb-6 bg-white/80 backdrop-blur-xl shadow-lg rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4">
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">
              {currentTitle}
            </h1>
          </div>

          {/* Page content */}
          <div className="relative z-10">
            {route === 'dashboard' && <Dashboard t={t} />}
            {route === 'products' && <Products t={t} />}
            {route === 'sales' && <Sales t={t} />}
            {route === 'purchases' && <Purchases t={t} />}
            {route === 'reports' && <Reports t={t} />}
            {route === 'debits' && <Debits t={t} />}
            {route === 'recycleBin' && <RecycleBin t={t} />}
            {route === 'settings' && <Settings t={t} onLogoChange={l => { setLogo(l); localStorage.setItem('erp_logo', l); }} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ setRoute, setUser, logo, setLogo, lang, setLang, t }) {
  return (
    <header className="bg-white shadow mb-4">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt="logo"
              className="h-10 w-10 object-contain"
            />
          ) : (
            <div className="h-10 w-10 bg-sky-100 rounded flex items-center justify-center text-sky-600">
              Logo
            </div>
          )}
          <h1 className="text-lg md:text-xl font-semibold text-sky-600">
            ERP
          </h1>
        </div>

        {/* Right: nav */}
        <nav className="flex flex-wrap items-center gap-2">
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('dashboard')}
          >
            {t('Dashboard')}
          </button>
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('products')}
          >
            {t('products')}
          </button>
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('sales')}
          >
            {t('sales')}
          </button>
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('purchases')}
          >
            {t('purchases')}
          </button>
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('reports')}
          >
            {t('reports')}
          </button>
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('debits')}
          >
            {t('debits')}
          </button>
          <button
            className="px-3 py-1 rounded-md hover:bg-sky-50 transition text-xs sm:text-sm"
            onClick={() => setRoute('settings')}
          >
            {t('settings')}
          </button>

          <select
            value={lang}
            onChange={e => {
              setLang(e.target.value);
              localStorage.setItem('erp_lang', e.target.value);
            }}
            className="border rounded px-2 py-1 text-xs sm:text-sm"
          >
            <option value="en">EN</option>
            <option value="ur">UR</option>
          </select>

          <button
            className="px-3 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition text-xs sm:text-sm"
            onClick={() => {
              setUser(null);
              localStorage.removeItem('erp_lang');
            }}
          >
            {t('login')}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Login({ onSuccess, logo, t, setLang, lang }) {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
      if (!res.ok) throw new Error('login failed');
      const j = await res.json();
      onSuccess(j.user);
    } catch (err) {
      setErr('Wrong Password or Username');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex justify-center mb-4">
          {logo ?
            <img src={logo} className="h-20 md:h-24 w-20 md:w-24 object-contain" alt="logo" /> :
            <div className="h-20 md:h-24 w-20 md:w-24 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
              Logo
            </div>
          }
        </div>
        <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">{t('login')}</h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder={t('username')}
            className="w-full px-4 py-2 border rounded-md focus:outline-sky-300 text-sm md:text-base"
            value={u}
            onChange={e => setU(e.target.value)}
          />
          <input
            type="password"
            placeholder={t('password')}
            className="w-full px-4 py-2 border rounded-md focus:outline-sky-300 text-sm md:text-base"
            value={p}
            onChange={e => setP(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <select
              value={lang}
              onChange={e => { setLang(e.target.value); localStorage.setItem('erp_lang', e.target.value); }}
              className="border p-2 rounded text-sm md:text-base flex-1"
            >
              <option value="en">EN</option>
              <option value="ur">UR</option>
            </select>
            <button className="w-full sm:flex-1 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition text-sm md:text-base">
              {t('loginBtn')}
            </button>
          </div>
        </form>
        {err && <p className="text-red-500 mt-3 text-sm">{err}</p>}
      </div>
    </div>
  );
}

function Dashboard({ t }) {
  const [activeTab, setActiveTab] = useState("customers");
  const [sales, setSales] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const logoUrl = localStorage.getItem("erp_logo") || "";

  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockErr, setStockErr] = useState("");

  useEffect(() => {
    loadSales();
    loadStockData();
  }, []);

  async function loadSales() {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch("http://localhost:4000/api/sales");
      const j = await res.json();
      if (!j.ok) {
        setErr(j.message || "Failed to load sales");
        return;
      }
      setSales(j.sales || []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load sales");
    } finally {
      setLoading(false);
    }
  }

  async function loadStockData() {
    try {
      setStockLoading(true);
      setStockErr("");

      const [pRes, sRes] = await Promise.all([
        fetch("http://localhost:4000/api/purchases"),
        fetch("http://localhost:4000/api/sales"),
      ]);

      const [pJson, sJson] = await Promise.all([pRes.json(), sRes.json()]);

      if (!pJson.ok) throw new Error(pJson.message || "Failed to load purchases");
      if (!sJson.ok) throw new Error(sJson.message || "Failed to load sales");

      const purchases = pJson.purchases || [];
      const salesData = sJson.sales || [];

      const mvts = [];

      purchases.forEach((p) => {
        (p.products || p.lines || []).forEach((line) => {
          mvts.push({
            date: p.date,
            type: "Purchase",
            productName: line.productName || "",
            bagWeight: Number(line.weight || 0),
            bagsDelta: Number(line.qty || line.quantity || 0),
          });
        });
      });

      salesData.forEach((s) => {
        (s.products || s.lines || []).forEach((line) => {
          mvts.push({
            date: s.date,
            type: "Sale",
            productName: line.productName || "",
            bagWeight: Number(line.weight || 0),
            bagsDelta: Number(line.quantity || line.qty || 0),
          });
        });
      });

      setMovements(mvts);
      setStock(mvts);
    } catch (e) {
      console.error(e);
      setStockErr(e.message || "Failed to load stock data");
    } finally {
      setStockLoading(false);
    }
  }

  const customerGroup = new Map();

  (sales || []).forEach((s) => {
    const name = s.customerName || "Unknown";
    if (!customerGroup.has(name)) {
      customerGroup.set(name, {
        customerName: name,
        invoices: [],
        totalGrand: 0,
        totalPaid: 0,
      });
    }

    const entry = customerGroup.get(name);
    entry.invoices.push(s);
    entry.totalGrand += Number(s.grandTotal || 0);
    entry.totalPaid += Number(s.paidNow || 0);
  });

  const customersWithPending = Array.from(customerGroup.values())
    .map((entry) => {
      const sortedInvoices = [...entry.invoices].sort(
        (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
      );
      const last = sortedInvoices[sortedInvoices.length - 1];
      const latestPending = Number(last?.pending || 0);

      return {
        ...entry,
        invoices: sortedInvoices,
        totalPending: latestPending,
      };
    })
    .filter((entry) => entry.totalPending > 0)
    .sort((a, b) => b.totalPending - a.totalPending);

  const selectedCustomer =
    customersWithPending.find(
      (c) => c.customerName === selectedCustomerName
    ) || null;

  const stockSummaryMap = new Map();

  (movements || []).forEach((mv) => {
    const name = mv.productName || '';
    const bagWt = Number(mv.bagWeight || mv.bagWt || 0);
    if (!name || !bagWt) return;

    const key = `${name}||${bagWt}`;
    if (!stockSummaryMap.has(key)) {
      stockSummaryMap.set(key, {
        productName: name,
        bagWeight: bagWt,
        purchased: 0,
        sold: 0,
      });
    }
    const row = stockSummaryMap.get(key);

    const qty = Number(mv.bagsDelta || mv.qty || mv.bags || 0);

    if (mv.type === 'Purchase') {
      row.purchased += Math.abs(qty);
    } else if (mv.type === 'Sale') {
      row.sold += Math.abs(qty);
    }
  });

  const stockSummaryRows = Array.from(stockSummaryMap.values())
    .map((r) => ({
      ...r,
      available: r.purchased - r.sold,
    }))
    .sort(
      (a, b) =>
        a.productName.localeCompare(b.productName) ||
        a.bagWeight - b.bagWeight
    );

  const maxStockValue =
    stockSummaryRows.length === 0
      ? 1
      : Math.max(
        ...stockSummaryRows.map((r) =>
          Math.max(r.purchased, r.sold, r.available)
        ),
        1
      );

  const productTotalsMap = new Map();
  stockSummaryRows.forEach((r) => {
    if (!productTotalsMap.has(r.productName)) {
      productTotalsMap.set(r.productName, {
        productName: r.productName,
        purchased: 0,
        sold: 0,
        available: 0,
      });
    }
    const entry = productTotalsMap.get(r.productName);
    entry.purchased += r.purchased;
    entry.sold += r.sold;
    entry.available += r.available;
  });

  const productTotals = Array.from(productTotalsMap.values()).sort(
    (a, b) => b.available - a.available
  );

  const maxProductValue =
    productTotals.length === 0
      ? 1
      : Math.max(
        ...productTotals.map((p) =>
          Math.max(p.purchased, p.sold, p.available)
        ),
        1
      );

  const totalAvailableBags = productTotals.reduce(
    (sum, p) => sum + Math.max(p.available, 0),
    0
  );

  const totalProductsInStock = productTotals.filter(
    (p) => p.available > 0
  ).length;

  const lowStockCount = productTotals.filter(
    (p) => p.available > 0 && p.available <= 20
  ).length;

  const topProductsForBars = productTotals.slice(0, 8);

  function printInvoiceForRecord(record) {
    if (!record) return;

    const dateTime = record.date
      ? new Date(record.date).toLocaleString()
      : new Date().toLocaleString();

    const items = record.products || record.lines || [];
    const customerTotal = Number(record.customerTotal || 0);
    const previousPending = Number(record.previousPending || 0);
    const grandTotal = Number(record.grandTotal || 0);
    const paidNow = Number(record.paidNow || 0);
    const remaining = Number(record.pending || 0);

    const html = `
      <html><body>
      <img src='${logoUrl}' style='display:block;margin:0 auto;width:180px;opacity:0.9' />
      <h2 style='text-align:center'>Invoice</h2>
      <div>Customer: ${record.customerName || ''}</div>
      <div>Date &amp; Time: ${dateTime}</div>
      <table border='1' style='width:100%;border-collapse:collapse'>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Weight</th>
          <th>Price</th>
          <th>Line Total</th>
        </tr>
        ${items
        .map(
          (it, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${it.productName || ''}</td>
            <td>${it.quantity || it.qty || 0}</td>
            <td>${it.weight || 0}</td>
            <td>${it.pricePerKg || it.price || 0}</td>
            <td>${Number(
            it.lineTotal ||
            Number(it.quantity || it.qty || 0) *

            Number(it.pricePerKg || it.price || 0)
          ).toFixed(2)}</td>
          </tr>`
        )
        .join('')}
      </table>
      <h3>Customer Total: ${customerTotal.toFixed(2)}</h3>
      <div>Previous Pending: ${previousPending.toFixed(2)}</div>
      <div>Grand Total: ${grandTotal.toFixed(2)}</div>
      <div>Paid: ${paidNow.toFixed(2)}</div>
      <div>Remaining: ${remaining.toFixed(2)}</div>
      </body></html>
    `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  async function deleteSaleFromDashboard(id) {
    if (!window.confirm("Delete this sale?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/sales/${id}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || "Failed to delete sale");
        return;
      }
      setSales((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error deleting sale");
    }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Dashboard</h2>

      {/* Tabs */}
      <div className="flex flex-wrap mb-4 gap-2">
        <button
          onClick={() => setActiveTab("customers")}
          className={
            "px-3 py-2 rounded text-sm " +
            (activeTab === "customers"
              ? "bg-sky-600 text-white"
              : "bg-white text-sky-700 border")
          }
        >
          Customer Records
        </button>
        <button
          onClick={() => setActiveTab("stock")}
          className={
            "px-3 py-2 rounded text-sm " +
            (activeTab === "stock"
              ? "bg-sky-600 text-white"
              : "bg-white text-sky-700 border")
          }
        >
          Stocks Updates
        </button>

        <button
          onClick={() => {
            if (activeTab === "customers") {
              loadSales();
            } else if (activeTab === "stock") {
              loadStockData();
            }
          }}
          className="ml-auto px-3 py-2 text-xs bg-gray-100 border rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {activeTab === "customers" && loading && (
        <p className="text-sm text-gray-500 mb-2">Loading sales…</p>
      )}
      {activeTab === "customers" && err && (
        <p className="text-sm text-red-600 mb-2">{err}</p>
      )}

      {activeTab === "stock" && stockLoading && (
        <p className="text-sm text-gray-500 mb-2">Loading stock…</p>
      )}
      {activeTab === "stock" && stockErr && (
        <p className="text-sm text-red-600 mb-2">{stockErr}</p>
      )}

      {/* ===================== Customer Records Tab ===================== */}
      {activeTab === "customers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Customers with remaining */}
          <div className="bg-white p-4 rounded shadow lg:col-span-1 overflow-x-auto">
            <h3 className="font-semibold mb-2 text-sm">
              Customers with Remaining Amount
            </h3>

            {customersWithPending.length === 0 ? (
              <p className="text-xs text-gray-500">
                No customers with pending amounts.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left whitespace-nowrap">Customer</th>
                      <th className="p-2 text-right whitespace-nowrap">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersWithPending.map((c) => (
                      <tr
                        key={c.customerName}
                        className={
                          "border-t cursor-pointer " +
                          (c.customerName === selectedCustomerName
                            ? "bg-sky-50"
                            : "")
                        }
                        onClick={() => setSelectedCustomerName(c.customerName)}
                      >
                        <td className="p-2 whitespace-nowrap">{c.customerName}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {c.totalPending.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Selected customer details */}
          <div className="bg-white p-4 rounded shadow lg:col-span-2 overflow-x-auto">
            {!selectedCustomer ? (
              <p className="text-sm text-gray-500">
                Select a customer on the left to see full record of their
                purchases, paid amounts, and remaining balance.
              </p>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:justify-between mb-3 text-sm">
                  <div className="mb-2 md:mb-0">
                    <div className="font-semibold">
                      {selectedCustomer.customerName}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Total Pending:{" "}
                      <strong>
                        {selectedCustomer.totalPending.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>
                      Total Grand:{" "}
                      <strong>
                        {selectedCustomer.totalGrand.toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      Total Paid:{" "}
                      <strong>
                        {selectedCustomer.totalPaid.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {selectedCustomer.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="border rounded mb-3 p-3 text-xs overflow-x-auto"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between mb-1">
                      <div className="mb-1 md:mb-0">
                        <span className="font-semibold">Date: </span>
                        {inv.date}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span><span className="font-semibold">Grand: </span>{inv.grandTotal}</span>
                        <span>|</span>
                        <span><span className="font-semibold">Paid: </span>{inv.paidNow}</span>
                        <span>|</span>
                        <span><span className="font-semibold">Remaining: </span>{inv.pending}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] border mt-1 min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-1 py-0.5 whitespace-nowrap">#</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Product</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Qty</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Weight</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Price</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(inv.products || inv.lines || []).map((p, idx) => (
                            <tr key={idx}>
                              <td className="border px-1 py-0.5">{idx + 1}</td>
                              <td className="border px-1 py-0.5 whitespace-nowrap">
                                {p.productName}
                              </td>
                              <td className="border px-1 py-0.5">
                                {p.quantity || p.qty}
                              </td>
                              <td className="border px-1 py-0.5">
                                {p.weight}
                              </td>
                              <td className="border px-1 py-0.5">
                                {p.pricePerKg || p.price}
                              </td>
                              <td className="border px-1 py-0.5">
                                {p.lineTotal}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => printInvoiceForRecord(inv)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                      >
                        Print Invoice
                      </button>
                      <button
                        onClick={() => deleteSaleFromDashboard(inv.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== Stock Updates Tab ===================== */}
      {activeTab === 'stock' && (
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <h3 className="font-semibold text-base mb-2 md:mb-0">Stock Updates</h3>
            <button
              onClick={loadStockData}
              className="md:ml-auto px-3 py-1 text-xs border rounded hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {stockLoading && (
            <p className="text-xs text-gray-500 mb-2">Loading stock…</p>
          )}
          {stockErr && (
            <p className="text-xs text-red-600 mb-2">{stockErr}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
            <div className="border rounded-lg px-3 py-2 bg-sky-50">
              <div className="text-[11px] text-sky-700 uppercase">
                Total Products in Stock
              </div>
              <div className="text-xl font-semibold">
                {totalProductsInStock}
              </div>
            </div>
            <div className="border rounded-lg px-3 py-2 bg-emerald-50">
              <div className="text-[11px] text-emerald-700 uppercase">
                Total Available Bags
              </div>
              <div className="text-xl font-semibold">
                {totalAvailableBags}
              </div>
            </div>
            <div className="border rounded-lg px-3 py-2 bg-amber-50">
              <div className="text-[11px] text-amber-700 uppercase">
                Low Stock Items (&le; 20 bags)
              </div>
              <div className="text-xl font-semibold">
                {lowStockCount}
              </div>
            </div>
          </div>

          {stockSummaryRows.length === 0 ? (
            <p className="text-xs text-gray-500">
              No stock calculated yet. Add some purchases / sales first.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                  <h4 className="font-semibold text-sm mb-2">
                    Available Stock (by product &amp; bag weight)
                  </h4>
                  <table className="w-full text-xs mb-4 min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left whitespace-nowrap">Product</th>
                        <th className="p-2 text-right whitespace-nowrap">Bag Wt</th>
                        <th className="p-2 text-right whitespace-nowrap">Purchased</th>
                        <th className="p-2 text-right whitespace-nowrap">Sold</th>
                        <th className="p-2 text-right whitespace-nowrap">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockSummaryRows.map((r) => (
                        <tr
                          key={`${r.productName}-${r.bagWeight}`}
                          className="border-t"
                        >
                          <td className="p-2 whitespace-nowrap">{r.productName}</td>
                          <td className="p-2 text-right">{r.bagWeight}</td>
                          <td className="p-2 text-right">{r.purchased}</td>
                          <td className="p-2 text-right">{r.sold}</td>
                          <td
                            className={
                              'p-2 text-right ' +
                              (r.available < 0
                                ? 'text-red-600 font-semibold'
                                : '')
                            }
                          >
                            {r.available}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Stock Overview by Product (bags)
                  </h4>

                  {topProductsForBars.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No products with stock yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topProductsForBars.map((p) => (
                        <div key={`prod-bar-${p.productName}`}>
                          <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] mb-1">
                            <span className="truncate">{p.productName}</span>
                            <span>Available: {p.available}</span>
                          </div>

                          <div className="h-3 bg-gray-100 rounded overflow-hidden flex">
                            <div
                              style={{
                                width:
                                  (p.purchased / maxProductValue) * 100 + '%',
                              }}
                              className="bg-blue-500"
                              title={`Purchased: ${p.purchased}`}
                            />
                            <div
                              style={{
                                width:
                                  (p.sold / maxProductValue) * 100 + '%',
                              }}
                              className="bg-red-400"
                              title={`Sold: ${p.sold}`}
                            />
                            <div
                              style={{
                                width:
                                  (Math.max(p.available, 0) /
                                    maxProductValue) *
                                  100 + '%',
                              }}
                              className="bg-green-500"
                              title={`Available: ${p.available}`}
                            />
                          </div>

                          <div className="flex flex-col xs:flex-row xs:justify-between text-[10px] text-gray-500 mt-0.5">
                            <span>Purchased: {p.purchased}</span>
                            <span>Sold: {p.sold}</span>
                            <span>Available: {p.available}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 mt-3">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-blue-500 inline-block rounded-sm" />{' '}
                      Purchased
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-red-400 inline-block rounded-sm" />{' '}
                      Sold
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-green-500 inline-block rounded-sm" />{' '}
                      Available
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Products({ t }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [list, setList] = useState([]);
  useEffect(() => { 
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch('http://localhost:4000/api/products');
      const j = await res.json();
      if (j.ok) {
        setList(j.products || []);
      }
    } catch (error) {
      console.error('Failed to load products', error);
    }
  }

  async function add() {
    if (!name) return alert('Enter product name');
    try {
      const res = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity })
      });
      const j = await res.json();
      if (j.ok) {
        await loadProducts();
        setName('');
        setQuantity(1);
      }
    } catch (error) {
      console.error('Failed to add product', error);
      alert('Failed to add product');
    }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{t('products')}</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            placeholder="Product name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded text-sm md:text-base"
          />
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="border p-2 rounded text-sm md:text-base"
          />
          <button
            onClick={add}
            className="bg-sky-600 text-white px-4 rounded hover:bg-sky-700 transition text-sm md:text-base"
          >
            {t('addProduct')}
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h3 className="font-semibold mb-2">Available Products</h3>
        <table className="w-full text-sm min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left whitespace-nowrap">ID</th>
              <th className="p-2 text-left whitespace-nowrap">Name</th>
              <th className="p-2 text-left whitespace-nowrap">Qty</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{p.id}</td>
                <td className="p-2 whitespace-nowrap">{p.name}</td>
                <td className="p-2 whitespace-nowrap">{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Sales({ t }) {
  const [customers, setCustomers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [previousPending, setPreviousPending] = useState(0);
  const [items, setItems] = useState([
    { productName: '', quantity: 1, weight: 0, pricePerKg: 0 },
  ]);
  const [paidNow, setPaidNow] = useState(0);
  const [calc, setCalc] = useState(null);
  const [salesRecords, setSalesRecords] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadSales();
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetch('http://localhost:4000/api/customers');
      const j = await res.json();
      if (j.ok) setCustomers(j.customers || []);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch('http://localhost:4000/api/products');
      const j = await res.json();
      if (j.ok) setProductsList(j.products || []);
    } catch (error) {
      console.error('Failed to load products', error);
    }
  }

  async function loadSales() {
    try {
      const res = await fetch('http://localhost:4000/api/sales');
      const j = await res.json();
      if (j.ok) setSalesRecords(j.sales || []);
    } catch (error) {
      console.error('Failed to load sales', error);
    }
  }

  async function addCustomer() {
    const name = prompt('Customer name');
    if (!name) return;
    const location = prompt('Location') || '';
    const prev = Number(prompt('Previous Pending') || 0);
    
    try {
      const res = await fetch('http://localhost:4000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, previousPending: prev }),
      });
      const j = await res.json();
      if (j.ok) {
        await loadCustomers();
        alert('Customer added');
      }
    } catch (error) {
      console.error('Failed to add customer', error);
      alert('Failed to add customer');
    }
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { productName: '', quantity: 1, weight: 0, pricePerKg: 0 },
    ]);
  }

  function updateItem(i, key, value) {
    const copy = [...items];
    copy[i][key] = value;
    setItems(copy);
  }

  function onSelectCustomer(id) {
    setSelectedCustomerId(id);
    if (!id) {
      setPreviousPending(0);
      setCustomerName('');
      return;
    }
    const c = customers.find((x) => x.id === id);
    if (c) {
      setCustomerName(c.name);
      setPreviousPending(c.previous_pending || 0);
    }
  }

  async function calculate() {
    try {
      const res = await fetch('http://localhost:4000/api/calculate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: items, previousPending }),
      });
      const j = await res.json();
      setCalc(j);
    } catch (error) {
      console.error('Failed to calculate', error);
      alert('Failed to calculate invoice');
    }
  }

  const customerTotal =
    calc && typeof calc.customerTotal !== 'undefined'
      ? Number(calc.customerTotal || 0)
      : items.reduce(
        (s, it) =>
          s +
          Number(it.quantity || 0) *
          Number(it.pricePerKg || 0),
        0
      );

  const grandTotal = +(customerTotal + Number(previousPending || 0)).toFixed(2);
  const remaining = +(grandTotal - Number(paidNow || 0)).toFixed(2);
  const logoUrl = localStorage.getItem('erp_logo') || '';

  function printGate() {
    const html = `
      <html><body>
      <img src='${logoUrl}' style='display:block;margin:0 auto;width:220px;opacity:0.9' />
      <h2 style='text-align:center'>Gate Pass</h2>
      <div>Customer: ${customerName}</div>
      <div>Time: ${new Date().toLocaleString()}</div>
      <table border='1' style='width:100%;border-collapse:collapse'>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Weight</th>
          <th>Qty</th>
        </tr>
        ${items.map((it, i) =>
      `<tr>
            <td>${i + 1}</td>
            <td>${it.productName}</td>
            <td>${it.quantity}</td>
            <td>${it.weight}</td>
          </tr>`
    ).join('')}
      </table>
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  function printInvoice(record) {
    const dateTime =
      record && record.date
        ? new Date(record.date).toLocaleString()
        : new Date().toLocaleString();

    const html = `
      <html><body>
      <img src='${logoUrl}' style='display:block;margin:0 auto;width:180px;opacity:0.9' />
      <h2 style='text-align:center'>Invoice</h2>
      <div>Customer: ${customerName}</div>
      <div>Date &amp; Time: ${dateTime}</div>
      <table border='1' style='width:100%;border-collapse:collapse'>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Weight</th>
          <th>Price</th>
          <th>Line Total</th>
        </tr>
        ${items
        .map(
          (it, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${it.productName}</td>
            <td>${it.quantity}</td>
            <td>${it.weight}</td>
            <td>${it.pricePerKg}</td>
            <td>${(
            Number(it.quantity || 0) *
            Number(it.pricePerKg || 0)
          ).toFixed(2)}</td>
          </tr>`
        )
        .join('')}
      </table>
      <h3>Customer Total: ${customerTotal.toFixed(2)}</h3>
      <div>Previous Pending: ${Number(previousPending || 0).toFixed(2)}</div>
      <div>Grand Total: ${grandTotal.toFixed(2)}</div>
      <div>Paid: ${Number(paidNow || 0).toFixed(2)}</div>
      <div>Remaining: ${remaining.toFixed(2)}</div>
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  async function saveAndPrint() {
    try {
      const res = await fetch('http://localhost:4000/api/save-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          customerName,
          previousPending,
          products: items,
          paidNow,
        }),
      });
      const j = await res.json();
      if (j.ok) {
        alert(
          'Saved. Remaining added to customer previous pending: ' +
          j.record.pending
        );
        await loadSales();
        await loadCustomers();
        printInvoice(j.record);
      } else {
        alert(j.message || 'Failed to save sale');
      }
    } catch (error) {
      console.error('Failed to save sale', error);
      alert('Failed to save sale');
    }
  }

  async function deleteSale(id) {
    if (!window.confirm('Delete this sale?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/sales/${id}`, {
        method: 'DELETE',
      });
      const j = await res.json();
      if (j.ok) {
        await loadSales();
      } else {
        alert('Failed to delete sale');
      }
    } catch (error) {
      console.error('Failed to delete sale', error);
      alert('Failed to delete sale');
    }
  }

  function editSales(index) {
    const s = salesRecords[index];
    if (!s) return;

    setSelectedCustomerId(s.customerId || "");
    setCustomerName(s.customerName || "");
    setPreviousPending(Number(s.previousPending || 0));
    setPaidNow(Number(s.paidNow || 0));

    const restoredItems = (s.products || s.lines || []).map((item) => ({
      productName: item.productName || "",
      quantity: Number(item.quantity ?? item.qty ?? 0),
      weight: Number(item.weight ?? 0),
      pricePerKg: Number(item.pricePerKg ?? item.price ?? 0),
    }));

    setItems(
      restoredItems.length
        ? restoredItems
        : [{ productName: "", quantity: 1, weight: 0, pricePerKg: 0 }]
    );

    setEditingIndex(index);
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Sales / Invoice</h2>
      
      <div className="bg-white/80 p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            className="border p-2 rounded text-sm md:text-base"
            value={selectedCustomerId}
            onChange={(e) => onSelectCustomer(e.target.value)}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.location}
              </option>
            ))}
          </select>
          <input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border p-2 rounded text-sm md:text-base"
          />
          <input
            type="number"
            placeholder="Previous Pending"
            value={previousPending}
            onChange={(e) => setPreviousPending(Number(e.target.value))}
            className="border p-2 rounded text-sm md:text-base"
          />
        </div>
        <div className="mt-3">
          <button
            onClick={addCustomer}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm md:text-base"
          >
            {t('addCustomer')}
          </button>
        </div>
      </div>

      <div className="bg-white/80 p-4 rounded shadow mb-4 overflow-x-auto">
        <table className="w-full text-sm min-w-full">
          <thead className="bg-sky-100">
            <tr>
              <th className="p-2 text-left whitespace-nowrap">#</th>
              <th className="p-2 text-left whitespace-nowrap">Product</th>
              <th className="p-2 text-right whitespace-nowrap">Qty</th>
              <th className="p-2 text-right whitespace-nowrap">Weight</th>
              <th className="p-2 text-right whitespace-nowrap">Price</th>
              <th className="p-2 text-right whitespace-nowrap">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">
                  <input
                    className="border p-1 rounded w-full text-sm md:text-base"
                    value={it.productName}
                    onChange={(e) =>
                      updateItem(i, 'productName', e.target.value)
                    }
                    list="products-list"
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    className="border p-1 rounded w-16 md:w-20 text-right text-sm md:text-base"
                    type="number"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(i, 'quantity', Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    className="border p-1 rounded w-20 md:w-24 text-right text-sm md:text-base"
                    type="number"
                    value={it.weight}
                    onChange={(e) =>
                      updateItem(i, 'weight', Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    className="border p-1 rounded w-20 md:w-24 text-right text-sm md:text-base"
                    type="number"
                    value={it.pricePerKg}
                    onChange={(e) =>
                      updateItem(i, 'pricePerKg', Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 text-right">
                  {(
                    Number(it.quantity || 0) *
                    Number(it.pricePerKg || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <datalist id="products-list">
          {productsList.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={addItem}
            className="px-3 py-1 bg-white border rounded hover:shadow transition text-sm md:text-base"
          >
            ➕ Add Item
          </button>
          <button
            onClick={calculate}
            className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 transition text-sm md:text-base"
          >
            Calculate
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="text-sm">Paid Now</label>
            <input
              type="number"
              value={paidNow}
              onChange={(e) => setPaidNow(Number(e.target.value))}
              className="border p-1 rounded w-24 md:w-28 text-right text-sm md:text-base"
            />
            <button
              onClick={saveAndPrint}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm md:text-base"
            >
              {t('savePrint')}
            </button>
          </div>

          <button
            onClick={printGate}
            className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-800 transition text-sm md:text-base"
          >
            Gate Pass
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded text-sm space-y-1">
          <div>
            Customer Total:{' '}
            <strong>{customerTotal.toFixed(2)}</strong>
          </div>
          <div>
            Previous Pending:{' '}
            <strong>{Number(previousPending || 0).toFixed(2)}</strong>
          </div>
          <div>
            Grand Total:{' '}
            <strong>{grandTotal.toFixed(2)}</strong>
          </div>
          <div>
            Paid Now:{' '}
            <strong>{Number(paidNow || 0).toFixed(2)}</strong>
          </div>
          <div>
            Remaining:{' '}
            <strong>{remaining.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="bg-white/80 p-4 rounded shadow overflow-x-auto">
        <h3 className="font-semibold mb-2 text-sm md:text-base">Saved Invoices</h3>
        {salesRecords.length === 0 ? (
          <p className="text-xs text-gray-500">No invoices saved yet.</p>
        ) : (
          <table className="w-full text-xs min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left whitespace-nowrap">#</th>
                <th className="p-2 text-left whitespace-nowrap">Customer</th>
                <th className="p-2 text-left whitespace-nowrap">Date/Time</th>
                <th className="p-2 text-right whitespace-nowrap">Grand Total</th>
                <th className="p-2 text-right whitespace-nowrap">Paid</th>
                <th className="p-2 text-right whitespace-nowrap">Remaining</th>
                <th className="p-2 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesRecords.map((s, idx) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2 whitespace-nowrap">{s.customerName}</td>
                  <td className="p-2 whitespace-nowrap">{s.date}</td>
                  <td className="p-2 text-right">{s.grandTotal}</td>
                  <td className="p-2 text-right">{s.paidNow}</td>
                  <td className="p-2 text-right">{s.pending}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => editSales(idx)}
                      className="px-2 py-1 text-xs bg-sky-600 text-white rounded mr-1"
                    >
                      Action
                    </button>
                    <button
                      onClick={() => deleteSale(s.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function VendorPurchaseManagement({ t }) {
  const [vendorsSummary, setVendorsSummary] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadVendorPurchases();
  }, []);

  async function loadVendorPurchases() {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch("http://localhost:4000/api/purchases-with-pending");
      const j = await res.json();
      if (!j.ok) {
        throw new Error(j.message || "Failed to load vendor purchases");
      }

      const list = j.purchases || [];
      const map = new Map();
      list.forEach((p) => {
        const name = p.vendorName || "Unknown";
        if (!map.has(name)) {
          map.set(name, {
            vendorName: name,
            totalPending: 0,
            totalGrand: 0,
            totalPaid: 0,
            purchases: [],
          });
        }
        const g = map.get(name);
        g.totalPending += Number(p.pending || 0);
        g.totalGrand += Number(p.grandTotal || 0);
        g.totalPaid += Number(p.paidNow || 0);
        g.purchases.push(p);
      });

      const groups = Array.from(map.values()).sort(
        (a, b) => b.totalPending - a.totalPending
      );

      setVendorsSummary(groups);

      if (!selectedVendorName && groups.length > 0) {
        setSelectedVendorName(groups[0].vendorName);
      }
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to load vendor purchases");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePurchase(purchase) {
    if (!purchase) return;
    if (!window.confirm("Delete this purchase record?")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/purchases/${purchase.id}`,
        { method: "DELETE" }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || "Purchase not found!");
        return;
      }

      await loadVendorPurchases();
    } catch (e) {
      console.error(e);
      alert("Error deleting purchase");
    }
  }

  const selectedVendorSummary =
    vendorsSummary.find((v) => v.vendorName === selectedVendorName) || null;

  const totalPendingAll = vendorsSummary.reduce(
    (sum, v) => sum + v.totalPending,
    0
  );

  return (
    <div className="bg-white p-4 rounded shadow mt-4 overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-center mb-2">
        <h3 className="font-semibold text-sm md:text-base flex-1 mb-2 md:mb-0">
          Vendor Purchase Management
        </h3>
        <button
          onClick={loadVendorPurchases}
          className="px-2 py-1 text-xs border rounded"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="text-xs text-gray-500 mb-2">Loading vendor purchases…</p>
      )}
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}

      {vendorsSummary.length === 0 ? (
        <p className="text-xs text-gray-500">
          No purchases yet. Once you save purchases, you will see vendor-wise
          summary here.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 border rounded p-3 overflow-x-auto">
            <h4 className="font-semibold mb-2 text-xs md:text-sm">
              Vendors (total purchase & pending)
            </h4>
            <table className="w-full text-[11px] md:text-xs min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1 text-left whitespace-nowrap">Vendor</th>
                  <th className="p-1 text-right whitespace-nowrap">Pending</th>
                </tr>
              </thead>
              <tbody>
                {vendorsSummary.map((v) => (
                  <tr
                    key={v.vendorName}
                    className={
                      "border-t cursor-pointer " +
                      (v.vendorName === selectedVendorName
                        ? "bg-sky-50"
                        : "")
                    }
                    onClick={() => setSelectedVendorName(v.vendorName)}
                  >
                    <td className="p-1 whitespace-nowrap">{v.vendorName}</td>
                    <td className="p-1 text-right whitespace-nowrap">
                      {v.totalPending.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 text-xs text-gray-600">
              <strong>Total Pending: </strong>
              {totalPendingAll.toFixed(2)}
            </div>
          </div>

          <div className="lg:col-span-2 border rounded p-3 overflow-x-auto">
            {!selectedVendorSummary ? (
              <p className="text-xs text-gray-500">
                Select a vendor on the left to see full record of your
                purchases, paid amounts, and remaining balance for that vendor.
              </p>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:justify-between mb-3 text-xs md:text-sm">
                  <div className="mb-2 md:mb-0">
                    <div className="font-semibold">
                      {selectedVendorSummary.vendorName}
                    </div>
                    <div className="text-gray-500">
                      Total Pending:{" "}
                      <strong>
                        {selectedVendorSummary.totalPending.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      Total Grand:{" "}
                      <strong>
                        {selectedVendorSummary.totalGrand.toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      Total Paid:{" "}
                      <strong>
                        {selectedVendorSummary.totalPaid.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {selectedVendorSummary.purchases.map((p) => {
                  const items = p.products || [];
                  return (
                    <div
                      key={p.id}
                      className="border rounded mb-3 p-2 text-[11px] md:text-xs overflow-x-auto"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between mb-1">
                        <div className="mb-1 md:mb-0">
                          <span className="font-semibold">Date: </span>
                          {p.date
                            ? new Date(p.date).toLocaleString()
                            : "-"}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span><span className="font-semibold">Grand: </span>{p.grandTotal}</span>
                          <span>|</span>
                          <span><span className="font-semibold">Paid: </span>{p.paidNow}</span>
                          <span>|</span>
                          <span><span className="font-semibold">Remaining: </span>{p.pending}</span>
                        </div>
                      </div>

                      <table className="w-full text-[11px] md:text-xs border mt-1 min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-1 py-0.5 whitespace-nowrap">#</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Product</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Qty</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Weight</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Price</th>
                            <th className="border px-1 py-0.5 whitespace-nowrap">Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, idx) => (
                            <tr key={idx}>
                              <td className="border px-1 py-0.5">
                                {idx + 1}
                              </td>
                              <td className="border px-1 py-0.5 whitespace-nowrap">
                                {it.productName}
                              </td>
                              <td className="border px-1 py-0.5">
                                {it.qty || it.quantity}
                              </td>
                              <td className="border px-1 py-0.5">
                                {it.weight}
                              </td>
                              <td className="border px-1 py-0.5">
                                {it.pricePerKg || it.price}
                              </td>
                              <td className="border px-1 py-0.5">
                                {it.lineTotal}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() =>
                            alert(
                              "Edit in form: we can wire this to Purchases later."
                            )
                          }
                          className="px-2 py-1 bg-sky-600 text-white rounded text-xs"
                        >
                          Edit in Form
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(p)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Purchases({ t }) {
  const [vendorName, setVendorName] = useState('');
  const [rows, setRows] = useState([
    { productName: '', qty: 1, weight: 0, pricePerKg: 0 },
  ]);
  const [paidNow, setPaidNow] = useState(0);
  const [mode, setMode] = useState('cash');
  const [records, setRecords] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [selectedVendorName, setSelectedVendorName] = useState('');

  // Load purchases from backend
  useEffect(() => {
    loadPurchases();
  }, []);

  async function loadPurchases() {
    try {
      const res = await fetch('http://localhost:4000/api/purchases');
      const j = await res.json();
      if (j.ok) {
        setRecords(j.purchases || []);
      }
    } catch (error) {
      console.error('Error loading purchases', error);
    }
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { productName: '', qty: 1, weight: 0, pricePerKg: 0 },
    ]);
  }

  function updateRow(i, key, value) {
    const a = [...rows];
    a[i][key] = value;
    setRows(a);
  }

  const total = rows.reduce(
    (s, r) =>
      s +
      Number(r.qty || 0) *
      Number(r.pricePerKg || 0),
    0
  );
  const remaining = +(total - Number(paidNow || 0)).toFixed(2);

  async function savePurchase() {
    const payloadProducts = rows.map(r => ({
      productName: r.productName,
      qty: Number(r.qty || 0),
      weight: Number(r.weight || 0),
      pricePerKg: Number(r.pricePerKg || 0),
    }));

    const payload = {
      vendorName,
      products: payloadProducts,
      paidNow,
      modeOfPayment: mode,
    };

    try {
      let j;
      if (editingIndex !== null && editingId) {
        // UPDATE existing purchase
        const res = await fetch(
          `http://localhost:4000/api/purchases/${editingId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        j = await res.json();
        if (!j.ok) {
          alert(j.message || 'Failed to update purchase');
          return;
        }

        alert('Purchase updated');
      } else {
        // CREATE new purchase
        const res = await fetch('http://localhost:4000/api/save-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        j = await res.json();
        if (!j.ok) {
          alert(j.message || 'Failed to save purchase');
          return;
        }
        alert('Purchase saved');
      }

      // Reset form and reload purchases
      setEditingIndex(null);
      setEditingId(null);
      setVendorName('');
      setPaidNow(0);
      setMode('cash');
      setRows([{ productName: '', qty: 1, weight: 0, pricePerKg: 0 }]);
      
      await loadPurchases();
    } catch (e) {
      console.error(e);
      alert('Error saving purchase');
    }
  }

  function editPurchase(index) {
    const r = records[index];
    if (!r) return;

    // Fill form with this purchase
    setVendorName(r.vendor_name || '');
    setPaidNow(Number(r.paid_now || 0));
    setMode(r.mode_of_payment || 'cash');

    const restoredRows = (r.products || []).map((p) => ({
      productName: p.productName,
      qty: p.qty || p.quantity || 0,
      weight: p.weight || 0,
      pricePerKg: p.pricePerKg || p.price || 0,
    }));

    setRows(
      restoredRows.length
        ? restoredRows
        : [{ productName: '', qty: 1, weight: 0, pricePerKg: 0 }]
    );

    // Set editing state
    setEditingIndex(index);
    setEditingId(r.id);
  }

  async function deletePurchase(index) {
    const r = records[index];
    if (!r || !r.id) return;
    if (!window.confirm('Delete this purchase?')) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/purchases/${r.id}`,
        { method: 'DELETE' }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to delete purchase');
        return;
      }

      await loadPurchases();
      alert('Purchase deleted');
    } catch (e) {
      console.error(e);
      alert('Error deleting purchase');
    }
  }

  // Build a map: vendorName -> aggregated info + list of their purchases
  const vendorMap = new Map();

  (records || []).forEach((r) => {
    const name = r.vendor_name || 'Unknown';
    if (!vendorMap.has(name)) {
      vendorMap.set(name, {
        vendorName: name,
        totalGrand: 0,
        totalPaid: 0,
        totalPending: 0,
        purchases: [],
      });
    }
    const entry = vendorMap.get(name);
    entry.totalGrand += Number(r.grand_total || 0);
    entry.totalPaid += Number(r.paid_now || 0);
    entry.totalPending += Number(r.pending || 0);
    entry.purchases.push(r);
  });

  // Sorted list of vendors (by pending desc)
  const vendorsSummary = Array.from(vendorMap.values()).sort(
    (a, b) => b.totalPending - a.totalPending
  );

  const selectedVendorSummary =
    vendorsSummary.find((v) => v.vendorName === selectedVendorName) || null;

  // --- Filtered records by date (yyyy-mm-dd) ---
  const displayedRecords = filterDate
    ? records.filter((r) => {
      if (!r.date) return false;
      return r.date.slice(0, 10) === filterDate;
    })
    : records;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{t('purchases')}</h2>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <input
          placeholder={t('vendorName')}
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className="border p-2 w-full mb-3 text-sm md:text-base"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-full">
            <thead className="bg-sky-100">
              <tr>
                <th className="p-2 text-left whitespace-nowrap">#</th>
                <th className="p-2 text-left whitespace-nowrap">Product</th>
                <th className="p-2 text-left whitespace-nowrap">Qty</th>
                <th className="p-2 text-left whitespace-nowrap">Weight</th>
                <th className="p-2 text-left whitespace-nowrap">Price</th>
                <th className="p-2 text-left whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">
                    <input
                      className="border p-1 w-full text-sm md:text-base"
                      value={r.productName}
                      onChange={(e) =>
                        updateRow(i, 'productName', e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="border p-1 w-16 md:w-20 text-sm md:text-base"
                      type="number"
                      value={r.qty}
                      onChange={(e) =>
                        updateRow(i, 'qty', Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="border p-1 w-20 md:w-24 text-sm md:text-base"
                      type="number"
                      value={r.weight}
                      onChange={(e) =>
                        updateRow(i, 'weight', Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="border p-1 w-24 md:w-28 text-sm md:text-base"
                      type="number"
                      value={r.pricePerKg}
                      onChange={(e) =>
                        updateRow(i, 'pricePerKg', Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2">
                    {(
                      Number(r.qty || 0) *
                      Number(r.pricePerKg || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={addRow}
            className="px-3 py-1 border rounded hover:shadow transition text-sm md:text-base"
          >
            ➕ Add Item
          </button>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border p-1 rounded text-sm md:text-base"
          >
            <option value="cash">{t('cash')}</option>
            <option value="card">{t('card')}</option>
            <option value="cheque">{t('cheque')}</option>
            <option value="online">{t('online')}</option>
          </select>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="text-sm">Amount Paid</label>
            <input
              type="number"
              value={paidNow}
              onChange={(e) => setPaidNow(Number(e.target.value))}
              className="border p-1 w-24 md:w-28 text-sm md:text-base"
            />
            <div className="px-3 py-2 bg-gray-50 rounded text-sm">
              Remaining:{' '}
              <strong>{remaining.toFixed(2)}</strong>
            </div>
            <button
              onClick={savePurchase}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm md:text-base"
            >
              {editingIndex !== null ? 'Update Purchase' : 'Save Purchase'}
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Purchase Management */}
      <VendorPurchaseManagement t={t} />

      {/* Purchase Records List */}
      <div className="bg-white p-4 rounded shadow mt-4 overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center mb-4">
          <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-0">Purchase Records</h3>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border p-1 rounded text-sm"
            />
            <button
              onClick={loadPurchases}
              className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {displayedRecords.length === 0 ? (
          <p className="text-sm text-gray-500">No purchase records found.</p>
        ) : (
          <table className="w-full text-xs min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left whitespace-nowrap">#</th>
                <th className="p-2 text-left whitespace-nowrap">Vendor</th>
                <th className="p-2 text-left whitespace-nowrap">Date</th>
                <th className="p-2 text-right whitespace-nowrap">Grand Total</th>
                <th className="p-2 text-right whitespace-nowrap">Paid</th>
                <th className="p-2 text-right whitespace-nowrap">Pending</th>
                <th className="p-2 text-left whitespace-nowrap">Payment Mode</th>
                <th className="p-2 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((record, index) => (
                <tr key={record.id} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 whitespace-nowrap">{record.vendor_name}</td>
                  <td className="p-2 whitespace-nowrap">
                    {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-2 text-right">{Number(record.grand_total || 0).toFixed(2)}</td>
                  <td className="p-2 text-right">{Number(record.paid_now || 0).toFixed(2)}</td>
                  <td className="p-2 text-right">{Number(record.pending || 0).toFixed(2)}</td>
                  <td className="p-2 whitespace-nowrap">{record.mode_of_payment}</td>
                  <td className="p-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => editPurchase(index)}
                      className="px-2 py-1 text-xs bg-sky-600 text-white rounded mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePurchase(index)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Reports({ t }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function loadReport(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!date) {
      alert('Select a date');
      return;
    }
    setLoading(true);
    setErr('');
    setReport(null);
    try {
      const res = await fetch(`http://localhost:4000/api/reports/day?date=${date}`);
      const j = await res.json();
      if (!j.ok) throw new Error(j.message || 'Failed to load report');
      setReport(j);
    } catch (e) {
      console.error(e);
      setErr('Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Reports</h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={loadReport} className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border p-2 rounded w-full text-sm md:text-base"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition text-sm md:text-base"
          >
            {loading ? 'Loading…' : 'Load Report'}
          </button>
          {err && <span className="text-red-600 text-sm ml-2">{err}</span>}
        </form>
      </div>

      {!report && !loading && !err && (
        <p className="text-sm text-gray-600">Select a date and click "Load Report" to view details.</p>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Total Sales</div>
              <div className="text-xl font-semibold">
                {Number(report.totalSales || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Amount Received</div>
              <div className="text-xl font-semibold">
                {Number(report.totalReceived || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Number of Bills</div>
              <div className="text-xl font-semibold">
                {(report.invoices || []).length}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-4 overflow-x-auto">
            <h3 className="font-semibold mb-2">Products Sold on {report.date}</h3>
            {(report.productsSummary || []).length === 0 ? (
              <p className="text-sm text-gray-500">No products sold on this date.</p>
            ) : (
              <table className="w-full text-sm border min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left whitespace-nowrap">Product</th>
                    <th className="border px-2 py-1 text-right whitespace-nowrap">Total Qty</th>
                    <th className="border px-2 py-1 text-right whitespace-nowrap">Total Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {report.productsSummary.map((p, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1 whitespace-nowrap">{p.productName}</td>
                      <td className="border px-2 py-1 text-right">{p.totalQty}</td>
                      <td className="border px-2 py-1 text-right">{p.totalWeight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="font-semibold mb-2">Bills / Invoices</h3>
            {(report.invoices || []).length === 0 && (
              <p className="text-sm text-gray-500">No invoices on this date.</p>
            )}
            {(report.invoices || []).map(inv => (
              <div key={inv.id} className="border rounded mb-4 p-3">
                <div className="flex flex-col md:flex-row md:justify-between text-sm mb-1">
                  <div className="mb-1 md:mb-0">
                    <span className="font-semibold">Customer: </span>
                    {inv.customerName}
                  </div>
                  <div>
                    <span className="font-semibold">Time: </span>
                    {inv.date}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm mb-2">
                  <div>Grand Total: {inv.grandTotal}</div>
                  <div>Paid: {inv.paidNow}</div>
                  <div>Pending:  {inv.pending}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-1 py-0.5 whitespace-nowrap">#</th>
                        <th className="border px-1 py-0.5 whitespace-nowrap">Product</th>
                        <th className="border px-1 py-0.5 whitespace-nowrap">Qty</th>
                        <th className="border px-1 py-0.5 whitespace-nowrap">Weight</th>
                        <th className="border px-1 py-0.5 whitespace-nowrap">Price</th>
                        <th className="border px-1 py-0.5 whitespace-nowrap">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inv.products || inv.lines || []).map((p, idx) => (
                        <tr key={idx}>
                          <td className="border px-1 py-0.5">{idx + 1}</td>
                          <td className="border px-1 py-0.5 whitespace-nowrap">{p.productName}</td>
                          <td className="border px-1 py-0.5">{p.quantity || p.qty}</td>
                          <td className="border px-1 py-0.5">{p.weight}</td>
                          <td className="border px-1 py-0.5">{p.pricePerKg || p.price}</td>
                          <td className="border px-1 py-0.5">{p.lineTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Debits({ t }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');

  const [vendorName, setVendorName] = useState('');
  const [vendorPlace, setVendorPlace] = useState('');
  const [vendorCompany, setVendorCompany] = useState('');
  const [editingVendorId, setEditingVendorId] = useState(null);

  const [ledger, setLedger] = useState([]);
  const [txType, setTxType] = useState('received');
  const [txAmount, setTxAmount] = useState(0);
  const [txMethod, setTxMethod] = useState('');
  const [txBillRef, setTxBillRef] = useState('');
  const [txDate, setTxDate] = useState('');
  const [editingTxId, setEditingTxId] = useState(null);

  const [purchaseDebits, setPurchaseDebits] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  useEffect(() => {
    loadVendors();
    loadPurchaseDebits();
  }, []);

  async function loadVendors() {
    try {
      const res = await fetch('http://localhost:4000/api/vendors');
      const j = await res.json();
      if (j.ok) setVendors(j.vendors || []);
    } catch (error) {
      console.error('Failed to load vendors', error);
    }
  }

  async function loadLedger(vendorId) {
    if (!vendorId) {
      setLedger([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}/ledger`);
      const j = await res.json();
      if (j.ok) {
        setLedger(j.ledger || []);
        setVendors(prev =>
          prev.map(v => (v.id === vendorId ? j.vendor : v))
        );
      }
    } catch (error) {
      console.error('Failed to load ledger', error);
    }
  }

  async function loadPurchaseDebits() {
    try {
      setLoadingPurchases(true);
      const res = await fetch('http://localhost:4000/api/purchases-with-pending');
      const j = await res.json();
      if (j.ok) setPurchaseDebits(j.purchases || []);
    } catch (error) {
      console.error('Failed to load purchase debits', error);
    } finally {
      setLoadingPurchases(false);
    }
  }

  function onSelectVendor(id) {
    setSelectedVendorId(id);
    setEditingTxId(null);
    resetTxForm();
    if (id) loadLedger(id);
    else setLedger([]);
  }

  function startNewVendor() {
    setVendorName('');
    setVendorPlace('');
    setVendorCompany('');
    setEditingVendorId(null);
  }

  function startEditVendor(vendor) {
    setVendorName(vendor.name || '');
    setVendorPlace(vendor.place || '');
    setVendorCompany(vendor.company || '');
    setEditingVendorId(vendor.id);
  }

  async function saveVendor() {
    if (!vendorName) {
      alert('Vendor name is required');
      return;
    }

    const payload = {
      id: editingVendorId || undefined,
      name: vendorName,
      place: vendorPlace,
      company: vendorCompany,
    };

    try {
      const res = await fetch('http://localhost:4000/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to save vendor');
        return;
      }

      const v = j.vendor;
      setVendors(prev => {
        const idx = prev.findIndex(x => x.id === v.id);
        if (idx === -1) return [...prev, v];
        const copy = [...prev];
        copy[idx] = v;
        return copy;
      });

      setVendorName('');
      setVendorPlace('');
      setVendorCompany('');
      setEditingVendorId(null);
    } catch (error) {
      console.error(error);
      alert('Error saving vendor');
    }
  }

  async function deleteVendor(vendor) {
    if (!window.confirm(`Delete vendor "${vendor.name}" and all its debits?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/vendors/${vendor.id}`, {
        method: 'DELETE',
      });
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to delete vendor');
        return;
      }
      setVendors(prev => prev.filter(v => v.id !== vendor.id));
      if (selectedVendorId === vendor.id) {
        setSelectedVendorId('');
        setLedger([]);
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting vendor');
    }
  }

  async function deletePurchaseDebit(p) {
    if (!p || !p.id) return;
    if (!window.confirm('Delete this pending purchase?')) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/purchases/${p.id}`,
        { method: 'DELETE' }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to delete purchase');
        return;
      }

      await loadPurchaseDebits();
      alert('Purchase deleted');
    } catch (error) {
      console.error(error);
      alert('Error deleting purchase');
    }
  }

  function resetTxForm() {
    setTxType('received');
    setTxAmount(0);
    setTxMethod('');
    setTxBillRef('');
    setTxDate('');
    setEditingTxId(null);
  }

  function startEditTx(tx) {
    setTxType(tx.type);
    setTxAmount(tx.amount);
    setTxMethod(tx.method || '');
    setTxBillRef(tx.billRef || '');
    setTxDate(tx.date ? tx.date.slice(0, 10) : '');
    setEditingTxId(tx.id);
  }

  async function saveTransaction() {
    if (!selectedVendorId) {
      alert('Select a vendor first');
      return;
    }
    if (!txAmount || Number(txAmount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    const payload = {
      type: txType,
      amount: Number(txAmount),
      method: txMethod,
      billRef: txBillRef,
      date: txDate ? new Date(txDate).toISOString() : undefined,
    };

    try {
      let url = `http://localhost:4000/api/vendors/${selectedVendorId}/transactions`;
      let method = 'POST';

      if (editingTxId) {
        url += `/${editingTxId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to save transaction');
        return;
      }

      setLedger(j.ledger || []);
      setVendors(prev =>
        prev.map(v => (v.id === selectedVendorId ? j.vendor : v))
      );
      resetTxForm();
    } catch (error) {
      console.error(error);
      alert('Error saving transaction');
    }
  }

  async function deleteTransaction(tx) {
    if (!selectedVendorId) return;
    if (!window.confirm('Delete this transaction?')) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/vendors/${selectedVendorId}/transactions/${tx.id}`,
        { method: 'DELETE' }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to delete');
        return;
      }
      setLedger(j.ledger || []);
      setVendors(prev =>
        prev.map(v => (v.id === selectedVendorId ? j.vendor : v))
      );
    } catch (error) {
      console.error(error);
      alert('Error deleting transaction');
    }
  }

  async function editPurchaseDebit(p) {
    if (!p || !p.id) return;

    const newPaidStr = prompt(
      'Enter new paid amount for this purchase:',
      String(p.paidNow || 0)
    );
    if (newPaidStr === null) return;
    const newPaid = Number(newPaidStr);
    if (isNaN(newPaid)) {
      alert('Invalid amount');
      return;
    }

    const payload = {
      vendorName: p.vendor_name,
      products: p.products || [],
      paidNow: newPaid,
      modeOfPayment: p.mode_of_payment,
    };

    try {
      const res = await fetch(
        `http://localhost:4000/api/purchases/${p.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to update purchase');
        return;
      }

      await loadPurchaseDebits();
      alert('Purchase updated');

    } catch (error) {
      console.error(error);
      alert('Error updating purchase');
    }
  }

  const totalReceived = ledger
    .filter(tx => tx.type === 'received')
    .reduce((s, tx) => s + Number(tx.amount || 0), 0);

  const totalPaid = ledger
    .filter(tx => tx.type === 'paid')
    .reduce((s, tx) => s + Number(tx.amount || 0), 0);

  const totalGoods = ledger
    .filter(tx => tx.type === 'goods')
    .reduce((s, tx) => s + Number(tx.amount || 0), 0);

  const remaining =
    (vendors.find(v => v.id === selectedVendorId)?.remaining ?? 0);

  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || null;

  const filteredPurchases = selectedVendor
    ? purchaseDebits.filter(p =>
      (p.vendor_name || '').toLowerCase() ===
      (selectedVendor.name || '').toLowerCase()
    )
    : purchaseDebits;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Debits</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3 text-sm md:text-base">Vendor Debit Management</h3>
            <div className="space-y-2 text-sm">
              <input
                className="border p-2 rounded w-full text-sm md:text-base"
                placeholder="Vendor Name"
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
              />
              <input
                className="border p-2 rounded w-full text-sm md:text-base"
                placeholder="Place / Location"
                value={vendorPlace}
                onChange={e => setVendorPlace(e.target.value)}
              />
              <input
                className="border p-2 rounded w-full text-sm md:text-base"
                placeholder="Company Name"
                value={vendorCompany}
                onChange={e => setVendorCompany(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveVendor}
                  className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm md:text-base"
                >
                  {editingVendorId ? 'Update Vendor' : 'Save Vendor'}
                </button>
                <button
                  onClick={startNewVendor}
                  className="px-3 py-1 border rounded text-sm md:text-base"
                >
                  New
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow max-h-[400px] overflow-auto">
            <h3 className="font-semibold mb-3 text-sm md:text-base">Vendors</h3>
            {vendors.length === 0 ? (
              <p className="text-xs text-gray-500">No vendors yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left whitespace-nowrap">Name</th>
                      <th className="p-2 text-right whitespace-nowrap">Remaining</th>
                      <th className="p-2 text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(v => (
                      <tr
                        key={v.id}
                        className={
                          'border-t ' +
                          (v.id === selectedVendorId ? 'bg-sky-50' : '')
                        }
                      >
                        <td className="p-2">
                          <button
                            onClick={() => onSelectVendor(v.id)}
                            className="text-left text-xs hover:underline whitespace-nowrap"
                          >
                            {v.name}
                            {v.company ? ` (${v.company})` : ''}
                          </button>
                        </td>
                        <td className="p-2 text-right whitespace-nowrap">
                          {Number(v.remaining || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <button
                            onClick={() => startEditVendor(v)}
                            className="px-2 py-1 text-xs bg-sky-600 text-white rounded mr-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteVendor(v)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <h3 className="font-semibold mb-3 text-sm md:text-base">
              {selectedVendorId ? 'Vendor Ledger' : 'Select a Vendor'}
            </h3>

            {selectedVendorId && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Total Received</div>
                    <div className="font-semibold">
                      {totalReceived.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Total Paid</div>
                    <div className="font-semibold">
                      {totalPaid.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Goods Purchased</div>
                    <div className="font-semibold">
                      {totalGoods.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded">
                    <div className="text-xs text-gray-500">Remaining</div>
                    <div className="font-semibold">
                      {Number(remaining || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="border rounded p-3 mb-4 text-sm">
                  <h4 className="font-semibold mb-2">
                    {editingTxId ? 'Edit Transaction' : 'Add Transaction'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <select
                      className="border p-2 rounded text-sm md:text-base"
                      value={txType}
                      onChange={e => setTxType(e.target.value)}
                    >
                      <option value="received">Received from Vendor</option>
                      <option value="paid">Paid to Vendor</option>
                      <option value="goods">
                        Goods Purchased (vendor takes goods)
                      </option>
                    </select>
                    <input
                      type="number"
                      className="border p-2 rounded text-sm md:text-base"
                      placeholder="Amount"
                      value={txAmount}
                      onChange={e => setTxAmount(e.target.value)}
                    />
                    <input
                      type="date"
                      className="border p-2 rounded text-sm md:text-base"
                      value={txDate}
                      onChange={e => setTxDate(e.target.value)}
                    />
                    <input
                      className="border p-2 rounded text-sm md:text-base"
                      placeholder="Payment Method"
                      value={txMethod}
                      onChange={e => setTxMethod(e.target.value)}
                    />
                    <input
                      className="border p-2 rounded text-sm md:text-base"
                      placeholder="Remarks"
                      value={txBillRef}
                      onChange={e => setTxBillRef(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveTransaction}
                      className="px-3 py-1 bg-teal-600 text-white rounded text-sm md:text-base"
                    >
                      {editingTxId ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                    <button
                      onClick={resetTxForm}
                      className="px-3 py-1 border rounded text-sm md:text-base"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-[380px] overflow-auto text-xs">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left whitespace-nowrap">Date</th>
                        <th className="p-2 text-left whitespace-nowrap">Type</th>
                        <th className="p-2 text-right whitespace-nowrap">Amount</th>
                        <th className="p-2 text-left whitespace-nowrap">Method</th>
                        <th className="p-2 text-left whitespace-nowrap">Remarks</th>
                        <th className="p-2 text-right whitespace-nowrap">Balance After</th>
                        <th className="p-2 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.map(tx => (
                        <tr key={tx.id} className="border-t">
                          <td className="p-2 whitespace-nowrap">
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="p-2 capitalize whitespace-nowrap">{tx.type}</td>
                          <td className="p-2 text-right whitespace-nowrap">
                            {Number(tx.amount || 0).toFixed(2)}
                          </td>
                          <td className="p-2 whitespace-nowrap">{tx.method}</td>
                          <td className="p-2 whitespace-nowrap">{tx.billRef}</td>
                          <td className="p-2 text-right whitespace-nowrap">
                            {Number(tx.balance_after || 0).toFixed(2)}
                          </td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <button
                              onClick={() => startEditTx(tx)}
                              className="px-2 py-1 text-xs bg-sky-600 text-white rounded mr-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                      {ledger.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-2 text-center text-gray-500"
                          >
                            No transactions yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {!selectedVendorId && (
              <p className="text-xs text-gray-500">
                Select a vendor on the left to view and manage their debits.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center mb-3">
          <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-0">Purchased Vendor (Pending Purchases)</h3>
          <button
            onClick={loadPurchaseDebits}
            className="md:ml-auto px-3 py-1 text-xs border rounded"
          >
            {loadingPurchases ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Showing all purchases where some amount is still pending.
          {selectedVendor
            ? ` (Filtered by vendor: ${selectedVendor.name})`
            : ' (All vendors)'}
        </p>
        <table className="w-full text-xs min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left whitespace-nowrap">Vendor</th>
              <th className="p-2 text-left whitespace-nowrap">Date</th>
              <th className="p-2 text-left whitespace-nowrap">Product</th>
              <th className="p-2 text-right whitespace-nowrap">Qty</th>
              <th className="p-2 text-right whitespace-nowrap">Grand Total</th>
              <th className="p-2 text-right whitespace-nowrap">Paid</th>
              <th className="p-2 text-right whitespace-nowrap">Remaining</th>
              <th className="p-2 text-left whitespace-nowrap">Mode</th>
              <th className="p-2 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map(p => {
              const productsList = (p.products || []).map(x => x.productName).join(', ');
              const totalQty = (p.products || []).reduce(
                (s, x) => s + Number(x.qty || x.quantity || 0),
                0
              );
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{p.vendor_name}</td>
                  <td className="p-2 whitespace-nowrap">
                    {p.date ? new Date(p.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-2 whitespace-nowrap">{productsList || '-'}</td>
                  <td className="p-2 text-right">{totalQty}</td>
                  <td className="p-2 text-right">
                    {Number(p.grand_total || 0).toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    {Number(p.paid_now || 0).toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    {Number(p.pending || 0).toFixed(2)}
                  </td>
                  <td className="p-2 whitespace-nowrap">{p.mode_of_payment}</td>
                  <td className="p-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => editPurchaseDebit(p)}
                      className="px-2 py-1 text-xs bg-sky-600 text-white rounded mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePurchaseDebit(p)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredPurchases.length === 0 && (
              <tr>
                <td
                  className="p-2 text-center text-gray-500"
                  colSpan={9}
                >
                  No pending purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecycleBin({ t }) {
  const [activeType, setActiveType] = useState('sales');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function loadItems(type = activeType) {
    try {
      setLoading(true);
      setErr('');
      const res = await fetch(`http://localhost:4000/api/recycle-bin/${type}`);
      const j = await res.json();
      if (!j.ok) throw new Error(j.message || 'Failed to load recycle bin');
      setItems(j.items || []);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to load recycle bin');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems('sales');
  }, []);

  function changeType(type) {
    setActiveType(type);
    loadItems(type);
  }

  async function handleRestore(id) {
    if (!window.confirm('Restore this record?')) return;
    try {
      const res = await fetch('http://localhost:4000/api/recycle-bin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeType, id }),
      });
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to restore');
        return;
      }
      await loadItems();
      alert('Restored successfully');
    } catch (e) {
      console.error(e);
      alert('Error restoring item');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Permanently delete this item?')) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/recycle-bin/${activeType}/${id}`,
        { method: 'DELETE' }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to delete from recycle bin');
        return;
      }
      await loadItems();
    } catch (e) {
      console.error(e);
      alert('Error deleting item');
    }
  }

  async function handleDeleteAll() {
    if (
      !window.confirm(
        `Permanently delete ALL ${activeType} items from recycle bin?`
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/recycle-bin/${activeType}`,
        { method: 'DELETE' }
      );
      const j = await res.json();
      if (!j.ok) {
        alert(j.message || 'Failed to delete all');
        return;
      }
      await loadItems();
    } catch (e) {
      console.error(e);
      alert('Error deleting all items');
    }
  }

  function renderMainLabel(item) {
    if (activeType === 'sales') {
      return `${item.customer_name || 'Unknown'} — Grand: ${
        item.grand_total
      } | Pending: ${item.pending}`;
    }
    if (activeType === 'purchases') {
      return `${item.vendor_name || 'Unknown'} — Grand: ${
        item.grand_total
      } | Pending: ${item.pending}`;
    }
    if (activeType === 'vendors') {
      return `${item.name || 'Vendor'} — Remaining: ${item.remaining || 0}`;
    }
    if (activeType === 'customers') {
      return `${item.name || 'Customer'} — Pending: ${
        item.previous_pending || 0
      }`;
    }
    return 'Item';
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Recycle Bin</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {['sales', 'purchases', 'vendors', 'customers'].map((type) => (
          <button
            key={type}
            onClick={() => changeType(type)}
            className={
              'px-3 py-1 rounded text-sm ' +
              (activeType === type
                ? 'bg-sky-600 text-white'
                : 'bg-white text-sky-700 border')
            }
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}

        <button
          onClick={() => loadItems()}
          className="ml-auto px-3 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
        >
          Refresh
        </button>
        <button
          onClick={handleDeleteAll}
          className="px-3 py-1 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200"
        >
          Delete All Permanently
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mb-2">Loading recycle bin…</p>
      )}
      {err && <p className="text-sm text-red-600 mb-2">{err}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          No deleted {activeType} records in recycle bin.
        </p>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm"
            >
              <div className="space-y-0.5 mb-2 sm:mb-0">
                <div className="font-medium truncate">{renderMainLabel(item)}</div>
                <div className="text-xs text-gray-500">
                  ID: {item.id}{' '}
                  {item.date && <>| Date: {formatDate(item.date)}</>}
                  {item.deleted_at && (
                    <>
                      {' '}
                      | Deleted:{' '}
                      {formatDate(item.deleted_at)}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(item.id)}
                  className="px-2 py-1 text-xs bg-emerald-600 text-white rounded"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Settings({ t, onLogoChange }) {
  const [logoData, setLogoData] = useState(localStorage.getItem('erp_logo') || '');
  function upload(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setLogoData(ev.target.result);
      onLogoChange(ev.target.result);
    };
    reader.readAsDataURL(f);
  }
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{t('settings')}</h2>
      <div className="bg-white p-4 rounded shadow">
        <label className="block mb-2">Upload Logo (PNG/JPG)</label>
        <input
          type="file"
          accept="image/*"
          onChange={upload}
          className="mt-2 w-full text-sm md:text-base"
        />
        {logoData && (
          <div className="mt-4">
            <img src={logoData} className="h-28 md:h-32" alt="logo" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;