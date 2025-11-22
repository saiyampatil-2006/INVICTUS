import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar,
  AreaChart, Area // <--- ADD THIS
} from 'recharts';
import { 
  Wallet, TrendingUp, ShieldCheck, PieChart as PieIcon, 
  Send, ArrowUpRight, ArrowDownLeft, BrainCircuit, 
  User, Bell, Menu, X, Loader2, LogOut, Lock, Mail, PlusCircle, History, Sparkles, MessageCircle
} from 'lucide-react';

const API_URL = "http://localhost:5000/api";

// --- Constants ---
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'General'];
const CATEGORY_COLORS = {
  Food: '#EF4444',
  Transport: '#F59E0B',
  Shopping: '#3B82F6',
  Bills: '#10B981',
  Entertainment: '#8B5CF6',
  Health: '#EC4899',
  General: '#6B7280',
  Income: '#059669'
};

// --- Reusable UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type="button" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    ai: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- Feature Components ---

const AuthScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed');
      onLogin(data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-500 text-sm mt-2">{isRegistering ? 'Start fresh with SmartPay' : 'Access your financial dashboard'}</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"><X size={16} /> {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={18} /><input type="text" className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input type="email" className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input type="password" className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
          </div>
          <Button type="submit" className="w-full py-3 mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Sign Up' : 'Sign In')}</Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">{isRegistering ? 'Has account?' : "No account?"}<button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="ml-2 text-indigo-600 font-bold hover:underline">{isRegistering ? 'Login' : 'Register'}</button></div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setSidebarOpen, user, onLogout }) => (
  <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>
    <div className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold text-xl"><div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>SmartPay</div>
      <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X size={24} /></button>
    </div>
    <nav className="mt-6 px-4 space-y-2 flex-1">
      {[
        { id: 'dashboard', icon: Wallet, label: 'Dashboard' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'analytics', icon: PieIcon, label: 'Analytics' },
        { id: 'advisory', icon: BrainCircuit, label: 'AI Advisory' }
      ].map((item) => (
        <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}><item.icon size={20} />{item.label}</button>
      ))}
    </nav>
    <div className="p-4 border-t border-slate-800">
       {/* Remove the standalone logout button here if you want, or keep it. 
           The profile card below is now the main way to access profile. */}
      <button 
        onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} 
        className="w-full bg-slate-800 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-700 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white uppercase">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">View Profile</p>
        </div>
      </button>
    </div>
  </div>
);

// --- History View Component ---
const HistoryView = ({ transactions }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterTime, setFilterTime] = useState('all');

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];
    if (filterType !== 'all') {
      const targetType = filterType === 'income' ? 'credit' : 'debit';
      data = data.filter(tx => tx.type === targetType);
    }
    const now = new Date();
    if (filterTime === '7days') {
      const limit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      data = data.filter(tx => new Date(tx.date) >= limit);
    } else if (filterTime === '30days') {
      const limit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      data = data.filter(tx => new Date(tx.date) >= limit);
    }
    return data;
  }, [transactions, filterType, filterTime]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        <div className="flex flex-wrap gap-2">
          <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="p-2 border border-gray-200 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 border border-gray-200 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
      <Card className="min-h-[400px]">
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No transactions found matching your filters.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx._id || tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{tx.to}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{tx.date}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="capitalize">{tx.category || 'General'}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
const ProfileView = ({ user, balance, onLogout }) => (
  <div className="max-w-2xl mx-auto animate-fade-in pt-10">
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
      
      <div className="relative z-10">
        <div className="w-28 h-28 bg-white p-1 rounded-full mx-auto mb-4 shadow-lg">
          <div className="w-full h-full bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold uppercase">
            {user.name.charAt(0)}
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
        <p className="text-gray-500 mb-8">{user.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-green-600">₹{balance.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Account ID</p>
            <p className="text-sm font-mono text-gray-600 truncate" title={user._id}>{user._id}</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Button onClick={onLogout} variant="danger" className="mx-auto px-8">
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  </div>
);
const DashboardView = ({ user, balance, transactions, handlePayment, payDescription, setPayDescription, payAmount, setPayAmount, payCategory, setPayCategory, paymentStatus, handleDeposit, depositLoading }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
        <p className="text-indigo-100 text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-3xl font-bold">₹{balance.toLocaleString('en-IN')}</h2>
        <div className="mt-4 flex gap-2">
          <button onClick={handleDeposit} disabled={depositLoading} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-white/30 transition">
             {depositLoading ? <Loader2 size={14} className="animate-spin"/> : <PlusCircle size={14} />} Add ₹5,000
          </button>
        </div>
      </div>
      <Card><div className="flex justify-between items-start"><div><p className="text-gray-500 text-sm">Transactions</p><h3 className="text-2xl font-bold text-gray-800 mt-1">{transactions.length}</h3></div><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div></div><p className="text-xs text-blue-500 mt-2 font-medium">Total activity</p></Card>
      <Card><div className="flex justify-between items-start"><div><p className="text-gray-500 text-sm">Savings</p><h3 className="text-2xl font-bold text-gray-800 mt-1">₹{balance > 0 ? (balance * 0.2).toFixed(0) : 0}</h3></div><div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div></div><p className="text-xs text-green-500 mt-2 font-medium">Potential savings</p></Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Add Expense</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <input type="text" placeholder="e.g. Lunch, Rent, Movie" value={payDescription} onChange={(e) => setPayDescription(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹)</label>
                <input type="number" placeholder="0.00" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
               <select value={payCategory} onChange={(e) => setPayCategory(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                 {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
            </div>
            <Button onClick={handlePayment} disabled={paymentStatus === 'processing'} className={`w-full py-3 ${paymentStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
              {paymentStatus === 'idle' && <><Send size={18} /> Add Expense</>}
              {paymentStatus === 'processing' && <><Loader2 className="animate-spin" size={18} /> Processing...</>}
              {paymentStatus === 'success' && 'Expense Added!'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx._id || tx.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{tx.to}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
              </div>
              <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-800'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const AnalyticsView = ({ transactions, balance }) => {
  const { pieData, barData, lineData } = useMemo(() => {
    // 1. Pie Chart (Expenses by Category)
    const expenseMap = {};
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        const cat = tx.category || 'General';
        expenseMap[cat] = (expenseMap[cat] || 0) + tx.amount;
      }
    });
    const pieData = Object.keys(expenseMap).map(key => ({
      name: key, value: expenseMap[key], color: CATEGORY_COLORS[key] || '#9CA3AF'
    }));

    // 2. Bar Chart (Income vs Expense)
    const income = transactions.filter(t => t.type === 'credit').reduce((a, b) => a + b.amount, 0);
    const expense = transactions.filter(t => t.type === 'debit').reduce((a, b) => a + b.amount, 0);
    const barData = [
      { name: 'Income', amount: income, fill: '#10B981' },
      { name: 'Expense', amount: expense, fill: '#EF4444' }
    ];

    // 3. Line Chart (Balance History - Approximate)
    // We work backwards from current balance
    let currentBal = balance;
    const sortedTx = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first
    
    const history = sortedTx.map(tx => {
      const point = { date: tx.date, balance: currentBal };
      if (tx.type === 'credit') currentBal -= tx.amount;
      else currentBal += tx.amount;
      return point;
    });
    
    // Add starting point and reverse to make it chronological (oldest to newest)
    history.push({ date: 'Start', balance: currentBal }); 
    const lineData = history.reverse();

    return { pieData, barData, lineData };
  }, [transactions, balance]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-gray-800">Financial Analytics</h2>
      
      {/* Row 1: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="min-h-[350px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Expense Breakdown</h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-center mt-20">No expenses recorded yet.</p>}
          </div>
        </Card>

        <Card className="min-h-[350px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Income vs Expense</h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                    {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Line Chart */}
      <Card className="min-h-[400px]">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Balance Trend</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
const AdvisoryView = ({ user }) => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAiAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      console.log("Frontend received:", data); // Check browser console
      setAdvice(data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">AI Wealth Projection</h2>
        <Button onClick={getAiAdvice} disabled={loading} variant="ai">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {loading ? "Calculating..." : "Generate Growth Plan"}
        </Button>
      </div>

      {!advice && !loading && (
        <div className="bg-indigo-900 rounded-2xl p-12 text-center text-white">
          <BrainCircuit size={64} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="text-2xl font-bold mb-2">Unlock Your Future Wealth</h3>
          <p className="text-indigo-200 max-w-md mx-auto">
             See how your money grows over the next 6 months based on your current habits.
          </p>
        </div>
      )}

      {advice && (
        <div className="space-y-6 animate-fade-in">
          
          {/* GROWTH CHART */}
          <Card className="bg-slate-900 border-none text-white overflow-hidden">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <TrendingUp className="text-green-400" /> Projected Net Worth (6 Months)
            </h3>
            {/* Added explicit width/height styles to prevent 0-size rendering */}
            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={advice.forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                  <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickFormatter={(val) => `₹${(val/1000).toFixed(1)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#4ade80' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, "Projected Balance"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#4ade80" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI TEXT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-l-4 border-l-blue-500">
               <div className="flex items-center gap-3 mb-3 text-blue-600">
                 <PieIcon size={24} />
                 <h3 className="font-bold text-lg">Analysis</h3>
               </div>
               <p className="text-gray-600">{advice.analysis}</p>
             </Card>

             <Card className="border-l-4 border-l-green-500">
               <div className="flex items-center gap-3 mb-3 text-green-600">
                 <BrainCircuit size={24} />
                 <h3 className="font-bold text-lg">Smart Strategy</h3>
               </div>
               <p className="text-gray-600">{advice.tip}</p>
             </Card>

             <Card className="border-l-4 border-l-purple-500">
               <div className="flex items-center gap-3 mb-3 text-purple-500">
                 <ShieldCheck size={24} />
                 <h3 className="font-bold text-lg">Prediction</h3>
               </div>
               <p className="text-gray-600">{advice.prediction}</p>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user.name}! I'm your financial assistant. Ask me about your spending, balance, or for savings tips.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = React.useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, message: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || "Sorry, I couldn't process that." 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} />
              <span className="font-bold">FinBot AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded"><X size={18}/></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                }`}>
                  {/* Simple Markdown rendering for bold text */}
                  {m.content.split('**').map((part, idx) => 
                    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-xl rounded-bl-none shadow-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 text-sm p-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

// --- Main App Container ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // State optimized for Add Expense
  const [payAmount, setPayAmount] = useState('');
  const [payDescription, setPayDescription] = useState('');
  const [payCategory, setPayCategory] = useState('Food'); 
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchUserData = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    fetchUserData(userData._id);
  };

  const handleLogout = () => {
    setUser(null);
    setBalance(0);
    setTransactions([]);
  };

  const handlePayment = async () => {
    if (!payAmount || !payDescription) {
      alert("Please enter a Description and an Amount");
      return;
    }
    setPaymentStatus('processing');
    try {
      const res = await fetch(`${API_URL}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, payId: payDescription, amount: parseFloat(payAmount), category: payCategory })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setBalance(data.newBalance);
      setTransactions([data.transaction, ...transactions]);
      setPaymentStatus('success');
      setPayAmount('');
      setPayDescription('');
      setTimeout(() => setPaymentStatus('idle'), 2000);
    } catch (error) {
      console.error("Expense error:", error);
      setPaymentStatus('idle');
      alert(`Failed to add expense: ${error.message}`);
    }
  };

  const handleDeposit = async () => {
    setDepositLoading(true);
    try {
      const res = await fetch(`${API_URL}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, amount: 5000 })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.newBalance);
        setTransactions([data.transaction, ...transactions]);
      }
    } catch (err) { alert("Deposit failed"); }
    finally { setDepositLoading(false); }
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600"><Menu size={24} /></button>
          <div className="hidden md:block text-lg font-semibold text-gray-700 capitalize">{activeTab.replace('-', ' ')}</div>
          <div className="flex items-center gap-4"><Bell size={20} className="text-gray-400" /><div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200 text-sm">{user.name.charAt(0)}</div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {activeTab === 'dashboard' && <DashboardView user={user} balance={balance} transactions={transactions} handlePayment={handlePayment} payDescription={payDescription} setPayDescription={setPayDescription} payAmount={payAmount} setPayAmount={setPayAmount} payCategory={payCategory} setPayCategory={setPayCategory} paymentStatus={paymentStatus} handleDeposit={handleDeposit} depositLoading={depositLoading} />}
          {activeTab === 'history' && <HistoryView transactions={transactions} />}
          {activeTab === 'analytics' && <AnalyticsView transactions={transactions} balance={balance} />}
          {activeTab === 'advisory' && <AdvisoryView user={user} />}
          {activeTab === 'profile' && <ProfileView user={user} balance={balance} onLogout={handleLogout} />}
        </main>
      </div>
      <ChatWidget user={user} />
    </div>
  );
}