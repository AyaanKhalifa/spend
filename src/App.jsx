import { useState, useEffect, useMemo } from 'react'
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
    Home, PlusCircle, Users, BarChart2, FileText, Settings,
    Eye, EyeOff, Trash2, Download, ArrowRightLeft, TrendingUp,
    TrendingDown, Wallet, Landmark, PiggyBank, UserCheck, HandCoins,
    ShieldCheck, Sun, Moon, Palette, Lock, ChevronRight, CheckCircle
} from 'lucide-react';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMA0frtLZYHffpYFYLTq7uUXaHMQd6Y3k",
    authDomain: "balance-handling.firebaseapp.com",
    projectId: "balance-handling",
    storageBucket: "balance-handling.firebasestorage.app",
    messagingSenderId: "865262354524",
    appId: "1:865262354524:web:391f561e5fe8bf3260a699"
};

let db = null;
let useFirebase = false;

try {
    if (firebaseConfig.apiKey) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        useFirebase = true;
    }
} catch (e) {
    console.error("Firebase init failed:", e);
}

function playCoinSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1318.51, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) { /* silent fail */ }
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState(localStorage.getItem('spendTracker_pin') || '1234');
    const [theme, setTheme] = useState(localStorage.getItem('spendTracker_theme') || 'gold');
    const [showAmounts, setShowAmounts] = useState(false);
    const [currentTab, setCurrentTab] = useState('dashboard');

    // Data state
    const [transactions, setTransactions] = useState([]);
    const [gullakDenoms, setGullakDenoms] = useState({ 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 });
    const [walletDenoms, setWalletDenoms] = useState({ 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 });
    const [denomModalData, setDenomModalData] = useState(null);
    const [coins, setCoins] = useState([]);

    // Apply Theme
    useEffect(() => {
        const applyTheme = () => {
            document.body.classList.remove('light', 'dark', 'gold');
            if (theme === 'system') {
                document.body.classList.add(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
            } else {
                document.body.classList.add(theme);
            }
        };
        applyTheme();
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const listener = () => { if (theme === 'system') applyTheme(); };
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, [theme]);

    // Data loading
    useEffect(() => {
        if (!useFirebase) {
            setTransactions(JSON.parse(localStorage.getItem('spendTracker_txs')) || []);
            const saved_g = JSON.parse(localStorage.getItem('spendTracker_gullakDenoms'));
            const saved_w = JSON.parse(localStorage.getItem('spendTracker_walletDenoms'));
            if (saved_g) setGullakDenoms(saved_g);
            if (saved_w) setWalletDenoms(saved_w);
            return;
        }

        const unsubTxs = db.collection("transactions").orderBy("date", "desc").onSnapshot(snap => {
            setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubGullak = db.collection("settings").doc("gullak").onSnapshot(doc => {
            if (doc.exists) setGullakDenoms(doc.data());
        });
        const unsubWallet = db.collection("settings").doc("wallet").onSnapshot(doc => {
            if (doc.exists) setWalletDenoms(doc.data());
        });

        return () => { unsubTxs(); unsubGullak(); unsubWallet(); };
    }, []);

    const triggerAnimation = () => {
        playCoinSound();
        const newCoins = Array.from({ length: 10 }).map(() => ({
            id: Date.now() + Math.random(),
            left: 30 + Math.random() * 40 + '%',
            top: 40 + Math.random() * 20 + '%',
            delay: Math.random() * 0.3 + 's'
        }));
        setCoins(prev => [...prev, ...newCoins]);
        setTimeout(() => setCoins(prev => prev.filter(c => !newCoins.find(nc => nc.id === c.id))), 1500);
    };

    if (!isAuthenticated) {
        return <PinOverlay currentPin={pin} onAuth={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="app-container">
            {theme === 'gold' && (
                <div className="golden-particles">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="gold-sparkle" style={{
                            left: `${Math.random() * 100}vw`,
                            top: `${Math.random() * 100}vh`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            width: `${2 + Math.random() * 3}px`,
                            height: `${2 + Math.random() * 3}px`
                        }} />
                    ))}
                </div>
            )}

            <header>
                <div className="header-logo">
                    <div className="header-logo-icon">
                        <Wallet size={20} color="#fff" />
                    </div>
                    <h1>Spend<span>Tracker</span></h1>
                </div>
                <div className="header-actions">
                    <button className={`icon-btn ${showAmounts ? 'active' : ''}`} onClick={() => setShowAmounts(!showAmounts)} title="Toggle Amounts">
                        {showAmounts ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
            </header>

            <div className="view-content">
                {currentTab === 'dashboard' && (
                    <Dashboard
                        transactions={transactions}
                        gullakDenoms={gullakDenoms}
                        walletDenoms={walletDenoms}
                        showAmounts={showAmounts}
                        onGullakClick={() => setDenomModalData({ title: "Gullak Breakdown", denoms: gullakDenoms })}
                        onWalletClick={() => setDenomModalData({ title: "Wallet Breakdown", denoms: walletDenoms })}
                    />
                )}

                {currentTab === 'transaction' && (
                    <TransactionForm
                        transactions={transactions}
                        setTransactions={setTransactions}
                        gullakDenoms={gullakDenoms}
                        setGullakDenoms={setGullakDenoms}
                        walletDenoms={walletDenoms}
                        setWalletDenoms={setWalletDenoms}
                        triggerAnimation={triggerAnimation}
                    />
                )}

                {currentTab === 'debt' && (
                    <DebtForm
                        transactions={transactions}
                        setTransactions={setTransactions}
                        gullakDenoms={gullakDenoms}
                        setGullakDenoms={setGullakDenoms}
                        walletDenoms={walletDenoms}
                        setWalletDenoms={setWalletDenoms}
                        triggerAnimation={triggerAnimation}
                    />
                )}

                {currentTab === 'analytics' && (
                    <Analytics transactions={transactions} showAmounts={showAmounts} />
                )}

                {currentTab === 'report' && (
                    <TransactionHistory
                        transactions={transactions}
                        setTransactions={setTransactions}
                        showAmounts={showAmounts}
                        gullakDenoms={gullakDenoms}
                        setGullakDenoms={setGullakDenoms}
                        walletDenoms={walletDenoms}
                        setWalletDenoms={setWalletDenoms}
                        useFirebase={useFirebase}
                        db={db}
                    />
                )}

                {currentTab === 'settings' && (
                    <SettingsPage
                        theme={theme}
                        setTheme={(t) => { setTheme(t); localStorage.setItem('spendTracker_theme', t); }}
                        currentPin={pin}
                        onSavePin={(np) => { setPin(np); localStorage.setItem('spendTracker_pin', np); }}
                    />
                )}
            </div>

            <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

            {denomModalData && (
                <DenomBreakdownModal
                    title={denomModalData.title}
                    denoms={denomModalData.denoms}
                    onClose={() => setDenomModalData(null)}
                />
            )}

            {coins.length > 0 && (
                <div className="anim-container">
                    {coins.map(c => (
                        <div key={c.id} className="anim-coin" style={{ left: c.left, top: c.top, animationDelay: c.delay }}>🪙</div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// PIN OVERLAY — Beautiful Keypad
// ============================================
function PinOverlay({ currentPin, onAuth }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handleKey = (k) => {
        if (k === 'del') { setInput(p => p.slice(0, -1)); setError(false); return; }
        if (input.length >= 4) return;
        const next = input + k;
        setInput(next);
        if (next.length === 4) {
            if (next === currentPin) {
                setTimeout(() => onAuth(), 200);
            } else {
                setError(true);
                setTimeout(() => setInput(''), 600);
            }
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') handleKey(e.key);
            else if (e.key === 'Backspace') handleKey('del');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <div className="auth-overlay">
            <div className="auth-box glass-panel">
                <div className="auth-box-icon">
                    <Lock size={30} color="#fff" />
                </div>
                <h2>Welcome Back</h2>
                <p>Enter your 4-digit PIN or use keyboard</p>

                <div className="pin-dots">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`pin-dot ${input.length > i ? 'filled' : ''}`} />
                    ))}
                </div>

                <div className="pin-keypad">
                    {['1','2','3','4','5','6','7','8','9'].map(k => (
                        <button key={k} className="pin-key" onClick={() => handleKey(k)}>{k}</button>
                    ))}
                    <div /> {/* empty cell for grid alignment */}
                    <button className="pin-key zero" onClick={() => handleKey('0')}>0</button>
                    <button className="pin-key del" onClick={() => handleKey('del')}>⌫</button>
                </div>

                {error && <p className="error-text">Incorrect PIN. Try again.</p>}
            </div>
        </div>
    );
}

// ============================================
// BOTTOM NAV
// ============================================
function BottomNav({ currentTab, setCurrentTab }) {
    const tabs = [
        { id: 'dashboard', icon: <Home size={22} />, label: 'Home' },
        { id: 'transaction', icon: <PlusCircle size={22} />, label: 'Transact' },
        { id: 'debt', icon: <Users size={22} />, label: 'Debts' },
        { id: 'analytics', icon: <BarChart2 size={22} />, label: 'Analytics' },
        { id: 'report', icon: <FileText size={22} />, label: 'Report' },
        { id: 'settings', icon: <Settings size={22} />, label: 'Settings' },
    ];

    return (
        <div className="bottom-nav">
            {tabs.map(tab => (
                <button key={tab.id} className={`nav-item ${currentTab === tab.id ? 'active' : ''}`} onClick={() => setCurrentTab(tab.id)}>
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// ============================================
// DASHBOARD
// ============================================
function Dashboard({ transactions, gullakDenoms, walletDenoms, showAmounts, onGullakClick, onWalletClick }) {
    let bal = { bank: 0, gullak: 0, relative: 0, wallet: 0, lent: 0, borrowed: 0 };

    bal.gullak = Object.entries(gullakDenoms).reduce((s, [v, c]) => s + parseInt(v) * c, 0);
    bal.wallet = Object.entries(walletDenoms).reduce((s, [v, c]) => s + parseInt(v) * c, 0);

    transactions.forEach(tx => {
        const amt = parseFloat(tx.amount);
        if (tx.type === 'deposit' && tx.account !== 'gullak' && tx.account !== 'wallet') bal[tx.account] = (bal[tx.account] || 0) + amt;
        else if (tx.type === 'expense' && tx.account !== 'gullak' && tx.account !== 'wallet') bal[tx.account] = (bal[tx.account] || 0) - amt;
        else if (tx.type === 'transfer') {
            if (tx.fromAccount !== 'gullak' && tx.fromAccount !== 'wallet') bal[tx.fromAccount] = (bal[tx.fromAccount] || 0) - amt;
            if (tx.toAccount !== 'gullak' && tx.toAccount !== 'wallet') bal[tx.toAccount] = (bal[tx.toAccount] || 0) + amt;
        } else if (tx.type === 'lend') { if (tx.account !== 'gullak' && tx.account !== 'wallet') bal[tx.account] = (bal[tx.account] || 0) - amt; bal.lent += amt; }
        else if (tx.type === 'repay_lend') { if (tx.account !== 'gullak' && tx.account !== 'wallet') bal[tx.account] = (bal[tx.account] || 0) + amt; bal.lent -= amt; }
        else if (tx.type === 'borrow') { if (tx.account !== 'gullak' && tx.account !== 'wallet') bal[tx.account] = (bal[tx.account] || 0) + amt; bal.borrowed += amt; }
        else if (tx.type === 'repay_borrow') { if (tx.account !== 'gullak' && tx.account !== 'wallet') bal[tx.account] = (bal[tx.account] || 0) - amt; bal.borrowed -= amt; }
    });

    const total = bal.bank + bal.gullak + bal.relative + bal.wallet + bal.lent - bal.borrowed;
    const fmt = (a) => showAmounts ? `₹${a.toFixed(2)}` : '₹••••';

    return (
        <section className="balances-section">
            <div className="total-balance-card">
                <h3>Total Net Worth</h3>
                <h2 style={{ fontSize: showAmounts && total > 99999 ? '2rem' : '2.8rem' }}>{fmt(total)}</h2>
                <div className="balance-badge">
                    {total >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{total >= 0 ? 'Positive Balance' : 'Negative Balance'}</span>
                </div>
            </div>

            <div className="balance-grid">
                <div className="balance-item">
                    <div className="bi-icon" style={{ background: 'rgba(99,102,241,0.12)' }}><Landmark size={16} color="#6366f1" /></div>
                    <h4>Bank</h4>
                    <p>{fmt(bal.bank)}</p>
                </div>
                <div className="balance-item denom-view-item" onClick={onGullakClick}>
                    <div className="bi-icon" style={{ background: 'rgba(245,158,11,0.12)' }}><PiggyBank size={16} color="#f59e0b" /></div>
                    <h4>Gullak</h4>
                    <p>{fmt(bal.gullak)}</p>
                </div>
                <div className="balance-item">
                    <div className="bi-icon" style={{ background: 'rgba(16,185,129,0.12)' }}><UserCheck size={16} color="#10b981" /></div>
                    <h4>Relative/Friend</h4>
                    <p>{fmt(bal.relative)}</p>
                </div>
                <div className="balance-item denom-view-item" onClick={onWalletClick}>
                    <div className="bi-icon" style={{ background: 'rgba(139,92,246,0.12)' }}><Wallet size={16} color="#8b5cf6" /></div>
                    <h4>Physical Wallet</h4>
                    <p>{fmt(bal.wallet)}</p>
                </div>
                <div className="balance-item lent-item">
                    <div className="bi-icon"><HandCoins size={16} color="#10b981" /></div>
                    <h4>Money Lent</h4>
                    <p>{fmt(bal.lent)}</p>
                </div>
                <div className="balance-item borrowed-item">
                    <div className="bi-icon"><TrendingDown size={16} color="#f43f5e" /></div>
                    <h4>Money Borrowed</h4>
                    <p>{fmt(bal.borrowed)}</p>
                </div>
            </div>
        </section>
    );
}

// ============================================
// TRANSACTION FORM
// ============================================
function TransactionForm({ transactions, setTransactions, gullakDenoms, setGullakDenoms, walletDenoms, setWalletDenoms, triggerAnimation }) {
    const [type, setType] = useState('expense');
    const [account, setAccount] = useState('bank');
    const [fromAccount, setFromAccount] = useState('bank');
    const [toAccount, setToAccount] = useState('wallet');
    const [category, setCategory] = useState('upi');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [denoms, setDenoms] = useState({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });

    const isDenomAccount = (acc) => acc === 'gullak' || acc === 'wallet';
    const isDenomInvolved = () => type === 'transfer' ? isDenomAccount(fromAccount) || isDenomAccount(toAccount) : isDenomAccount(account);
    const calcDenomTotal = () => Object.entries(denoms).reduce((t, [v, c]) => t + parseInt(v) * (parseInt(c) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) { alert("A note is compulsory."); return; }
        if (type === 'transfer' && fromAccount === toAccount) { alert("Source and destination must differ."); return; }

        let finalAmount = 0;
        let txDenoms = {};

        if (isDenomInvolved()) {
            finalAmount = calcDenomTotal();
            if (finalAmount === 0) { alert("Please enter at least one denomination."); return; }

            const isWithdrawGullak = (type === 'expense' && account === 'gullak') || (type === 'transfer' && fromAccount === 'gullak');
            const isDepositGullak = (type === 'deposit' && account === 'gullak') || (type === 'transfer' && toAccount === 'gullak');
            const isWithdrawWallet = (type === 'expense' && account === 'wallet') || (type === 'transfer' && fromAccount === 'wallet');
            const isDepositWallet = (type === 'deposit' && account === 'wallet') || (type === 'transfer' && toAccount === 'wallet');

            if (isWithdrawGullak) for (let [v, c] of Object.entries(denoms)) if ((parseInt(c)||0) > gullakDenoms[v]) { alert(`Not enough ₹${v} in Gullak.`); return; }
            if (isWithdrawWallet) for (let [v, c] of Object.entries(denoms)) if ((parseInt(c)||0) > walletDenoms[v]) { alert(`Not enough ₹${v} in Wallet.`); return; }

            let updG = { ...gullakDenoms }, updW = { ...walletDenoms };
            for (let [v, c] of Object.entries(denoms)) {
                let count = parseInt(c) || 0;
                txDenoms[v] = count;
                if (isDepositGullak) updG[v] += count;
                if (isWithdrawGullak) updG[v] -= count;
                if (isDepositWallet) updW[v] += count;
                if (isWithdrawWallet) updW[v] -= count;
            }

            if (useFirebase) {
                if (isDepositGullak || isWithdrawGullak) await db.collection("settings").doc("gullak").set(updG);
                if (isDepositWallet || isWithdrawWallet) await db.collection("settings").doc("wallet").set(updW);
            } else {
                if (isDepositGullak || isWithdrawGullak) { setGullakDenoms(updG); localStorage.setItem('spendTracker_gullakDenoms', JSON.stringify(updG)); }
                if (isDepositWallet || isWithdrawWallet) { setWalletDenoms(updW); localStorage.setItem('spendTracker_walletDenoms', JSON.stringify(updW)); }
            }
        } else {
            finalAmount = parseFloat(amount);
            if (!finalAmount || finalAmount <= 0) { alert("Please enter a valid amount."); return; }
        }

        const tx = {
            type, amount: finalAmount, note: note.trim(), date: new Date().toISOString(),
            denoms: isDenomInvolved() ? txDenoms : null
        };
        if (type === 'transfer') { tx.fromAccount = fromAccount; tx.toAccount = toAccount; }
        else { tx.account = account; tx.category = type === 'expense' ? category : null; }

        if (useFirebase) { await db.collection("transactions").add(tx); }
        else {
            tx.id = Date.now().toString();
            const upd = [tx, ...transactions];
            setTransactions(upd);
            localStorage.setItem('spendTracker_txs', JSON.stringify(upd));
        }

        triggerAnimation();
        setAmount(''); setNote('');
        setDenoms({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
    };

    const accountOptions = <>
        <option value="bank">Bank</option>
        <option value="gullak">Gullak (Piggybank)</option>
        <option value="wallet">Physical Wallet</option>
        <option value="relative">Relative or Friend</option>
    </>;

    return (
        <section className="form-section glass-panel">
            <div className="section-header">
                <div className="section-icon"><PlusCircle size={18} color="#fff" /></div>
                <h2>Add Transaction</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group toggle-group">
                    <label className={`toggle-btn expense ${type === 'expense' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'expense'} onChange={() => setType('expense')} />
                        <TrendingDown size={14} /> Expense
                    </label>
                    <label className={`toggle-btn deposit ${type === 'deposit' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'deposit'} onChange={() => setType('deposit')} />
                        <TrendingUp size={14} /> Deposit
                    </label>
                    <label className={`toggle-btn transfer ${type === 'transfer' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'transfer'} onChange={() => setType('transfer')} />
                        <ArrowRightLeft size={14} /> Transfer
                    </label>
                </div>

                {type === 'transfer' ? (
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>From</label>
                            <select value={fromAccount} onChange={e => setFromAccount(e.target.value)}>{accountOptions}</select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>To</label>
                            <select value={toAccount} onChange={e => setToAccount(e.target.value)}>{accountOptions}</select>
                        </div>
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Account</label>
                        <select value={account} onChange={e => setAccount(e.target.value)}>{accountOptions}</select>
                    </div>
                )}

                {type === 'expense' && (
                    <div className="form-group">
                        <label>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="upi">UPI</option>
                            <option value="travel">Travel</option>
                            <option value="purchases">Purchases</option>
                            <option value="eat">Food & Eat</option>
                            <option value="study">Study</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                )}

                {!isDenomInvolved() ? (
                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" min="1" step="any" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Denomination Breakdown</label>
                        <div className="denominations-grid">
                            {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(v => (
                                <div className="denom-item" key={v}>
                                    <span>₹{v}</span>
                                    <input type="number" min="0" value={denoms[v]} onChange={e => setDenoms(p => ({ ...p, [v]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                        <div className="denom-total">Total: ₹{calcDenomTotal()}</div>
                    </div>
                )}

                <div className="form-group">
                    <label>Note (Required)</label>
                    <textarea rows="2" placeholder="What was this for?" value={note} onChange={e => setNote(e.target.value)} required />
                </div>

                <button type="submit" className="submit-btn">
                    <CheckCircle size={18} />
                    Save {type === 'transfer' ? 'Transfer' : 'Transaction'}
                </button>
            </form>
        </section>
    );
}

// ============================================
// DEBT FORM
// ============================================
function DebtForm({ transactions, setTransactions, gullakDenoms, setGullakDenoms, walletDenoms, setWalletDenoms, triggerAnimation }) {
    const [type, setType] = useState('lend');
    const [account, setAccount] = useState('bank');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [denoms, setDenoms] = useState({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });

    const isDenomAccount = (acc) => acc === 'gullak' || acc === 'wallet';
    const calcDenomTotal = () => Object.entries(denoms).reduce((t, [v, c]) => t + parseInt(v) * (parseInt(c) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!note.trim()) { alert("A note (person's name) is compulsory."); return; }

        let finalAmount = 0;
        let txDenoms = {};

        if (isDenomAccount(account)) {
            finalAmount = calcDenomTotal();
            if (finalAmount === 0) { alert("Please enter at least one denomination."); return; }

            const isWithdrawing = type === 'lend' || type === 'repay_borrow';
            const isDepositing = type === 'borrow' || type === 'repay_lend';

            if (isWithdrawing) {
                for (let [v, c] of Object.entries(denoms)) {
                    let count = parseInt(c) || 0;
                    if (account === 'gullak' && count > gullakDenoms[v]) { alert(`Not enough ₹${v} in Gullak.`); return; }
                    if (account === 'wallet' && count > walletDenoms[v]) { alert(`Not enough ₹${v} in Wallet.`); return; }
                }
            }

            let updG = { ...gullakDenoms }, updW = { ...walletDenoms };
            for (let [v, c] of Object.entries(denoms)) {
                let count = parseInt(c) || 0; txDenoms[v] = count;
                if (account === 'gullak') { if (isDepositing) updG[v] += count; if (isWithdrawing) updG[v] -= count; }
                if (account === 'wallet') { if (isDepositing) updW[v] += count; if (isWithdrawing) updW[v] -= count; }
            }

            if (useFirebase) {
                if (account === 'gullak') await db.collection("settings").doc("gullak").set(updG);
                if (account === 'wallet') await db.collection("settings").doc("wallet").set(updW);
            } else {
                if (account === 'gullak') { setGullakDenoms(updG); localStorage.setItem('spendTracker_gullakDenoms', JSON.stringify(updG)); }
                if (account === 'wallet') { setWalletDenoms(updW); localStorage.setItem('spendTracker_walletDenoms', JSON.stringify(updW)); }
            }
        } else {
            finalAmount = parseFloat(amount);
            if (!finalAmount || finalAmount <= 0) { alert("Please enter a valid amount."); return; }
        }

        const tx = { type, account, amount: finalAmount, note: note.trim(), date: new Date().toISOString(), denoms: isDenomAccount(account) ? txDenoms : null };

        if (useFirebase) { await db.collection("transactions").add(tx); }
        else { tx.id = Date.now().toString(); const upd = [tx, ...transactions]; setTransactions(upd); localStorage.setItem('spendTracker_txs', JSON.stringify(upd)); }

        triggerAnimation();
        setAmount(''); setNote('');
        setDenoms({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
    };

    const debtColor = type.includes('lend') || type === 'repay_lend' ? '#f59e0b' : '#ec4899';

    return (
        <section className="form-section glass-panel">
            <div className="section-header">
                <div className="section-icon" style={{ background: `linear-gradient(135deg, #f59e0b, #ec4899)` }}><Users size={18} color="#fff" /></div>
                <h2>Debts & Loans</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group toggle-group" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                    <label className={`toggle-btn lend ${type === 'lend' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'lend'} onChange={() => setType('lend')} />
                        📤 I Lent
                    </label>
                    <label className={`toggle-btn borrow ${type === 'borrow' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'borrow'} onChange={() => setType('borrow')} />
                        📥 I Borrowed
                    </label>
                    <label className={`toggle-btn lend ${type === 'repay_lend' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'repay_lend'} onChange={() => setType('repay_lend')} />
                        ✅ They Repaid
                    </label>
                    <label className={`toggle-btn borrow ${type === 'repay_borrow' ? 'active' : ''}`}>
                        <input type="radio" checked={type === 'repay_borrow'} onChange={() => setType('repay_borrow')} />
                        ✅ I Repaid
                    </label>
                </div>

                <div className="form-group">
                    <label>Account</label>
                    <select value={account} onChange={e => setAccount(e.target.value)}>
                        <option value="bank">Bank</option>
                        <option value="gullak">Gullak (Piggybank)</option>
                        <option value="wallet">Physical Wallet</option>
                        <option value="relative">Relative or Friend</option>
                    </select>
                </div>

                {!isDenomAccount(account) ? (
                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" min="1" step="any" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Denomination Breakdown</label>
                        <div className="denominations-grid">
                            {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(v => (
                                <div className="denom-item" key={v}>
                                    <span>₹{v}</span>
                                    <input type="number" min="0" value={denoms[v]} onChange={e => setDenoms(p => ({ ...p, [v]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                        <div className="denom-total">Total: ₹{calcDenomTotal()}</div>
                    </div>
                )}

                <div className="form-group">
                    <label>Person's Name / Note</label>
                    <textarea rows="2" placeholder="e.g. John Doe - Lunch money" value={note} onChange={e => setNote(e.target.value)} required />
                </div>

                <button type="submit" className="submit-btn" style={{ background: `linear-gradient(135deg, ${debtColor}, ${type.includes('lend') ? '#fb923c' : '#a855f7'})` }}>
                    <CheckCircle size={18} /> Save Record
                </button>
            </form>
        </section>
    );
}

// ============================================
// ANALYTICS
// ============================================
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function Analytics({ transactions, showAmounts }) {
    const stats = useMemo(() => {
        const categories = {};
        let totalExpense = 0, totalIncome = 0;
        const dailyData = {};
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear) return;
            const amt = parseFloat(tx.amount);

            if (tx.type === 'expense') {
                const day = txDate.getDate();
                dailyData[day] = (dailyData[day] || 0) + amt;
                totalExpense += amt;
                const cat = tx.category || 'other';
                categories[cat] = (categories[cat] || 0) + amt;
            } else if (tx.type === 'deposit') {
                totalIncome += amt;
            }
        });

        const categoryArray = Object.keys(categories).map(cat => ({
            name: cat.charAt(0).toUpperCase() + cat.slice(1), value: categories[cat]
        })).sort((a, b) => b.value - a.value);

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const lineChartData = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, spent: dailyData[i + 1] || 0 }));
        const barChartData = [
            { name: 'Income', amount: totalIncome },
            { name: 'Expense', amount: totalExpense }
        ];

        return { totalExpense, totalIncome, categoryArray, lineChartData, barChartData };
    }, [transactions]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: 'var(--nav-bg)', padding: '10px 14px', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                <strong>{label || payload[0].name}</strong>
                <p style={{ color: 'var(--accent)' }}>{showAmounts ? `₹${payload[0].value.toFixed(2)}` : '₹••••'}</p>
            </div>
        );
    };

    return (
        <section className="analytics-section">
            <div className="section-header">
                <div className="section-icon"><BarChart2 size={18} color="#fff" /></div>
                <div>
                    <h2>Analytics</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current month overview</p>
                </div>
            </div>

            <div className="chart-card">
                <h3><TrendingUp size={16} color="var(--deposit)" /> Income vs Expense</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                            {stats.barChartData.map((entry, i) => (
                                <Cell key={i} fill={i === 0 ? '#10b981' : '#f43f5e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <h3><TrendingDown size={16} color="var(--accent)" /> Daily Spending</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats.lineChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="spent" stroke="var(--accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'var(--accent)' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <h3><BarChart2 size={16} color="var(--gold)" /> Spending by Category</h3>
                {stats.categoryArray.length === 0 ? (
                    <div className="empty-state"><BarChart2 size={40} color="var(--text-dim)" /><span>No expenses this month</span></div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={stats.categoryArray} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                {stats.categoryArray.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: 'var(--text-main)', fontSize: '0.8rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
}

// ============================================
// REPORT / HISTORY
// ============================================
const TX_ICONS = {
    expense: <TrendingDown size={18} />, deposit: <TrendingUp size={18} />,
    transfer: <ArrowRightLeft size={18} />, lend: <HandCoins size={18} />,
    repay_lend: <HandCoins size={18} />, borrow: <HandCoins size={18} />, repay_borrow: <HandCoins size={18} />
};

function TransactionHistory({ transactions, setTransactions, showAmounts, gullakDenoms, setGullakDenoms, walletDenoms, setWalletDenoms, useFirebase, db }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterAccount, setFilterAccount] = useState('all');

    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date).getTime();
        if (startDate && txDate < new Date(startDate).getTime()) return false;
        if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); if (txDate > end.getTime()) return false; }
        if (filterType !== 'all') {
            if (filterType === 'debt' && !['lend','borrow','repay_lend','repay_borrow'].includes(tx.type)) return false;
            if (filterType !== 'debt' && tx.type !== filterType) return false;
        }
        if (filterAccount !== 'all') {
            if (tx.type === 'transfer') { if (tx.fromAccount !== filterAccount && tx.toAccount !== filterAccount) return false; }
            else if (tx.account !== filterAccount) return false;
        }
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    let periodSpent = 0, periodCollected = 0;
    filteredTransactions.forEach(tx => {
        if (tx.type === 'expense') periodSpent += parseFloat(tx.amount);
        if (tx.type === 'deposit') periodCollected += parseFloat(tx.amount);
    });

    const handleDelete = async (txId) => {
        if (!window.confirm("Delete this transaction?")) return;
        const tx = transactions.find(t => t.id === txId);
        if (!tx) return;

        if (tx.denoms) {
            const isWithdrawG = (tx.type === 'expense' && tx.account === 'gullak') || (tx.type === 'transfer' && tx.fromAccount === 'gullak') || (['lend','repay_borrow'].includes(tx.type) && tx.account === 'gullak');
            const isDepositG = (tx.type === 'deposit' && tx.account === 'gullak') || (tx.type === 'transfer' && tx.toAccount === 'gullak') || (['borrow','repay_lend'].includes(tx.type) && tx.account === 'gullak');
            const isWithdrawW = (tx.type === 'expense' && tx.account === 'wallet') || (tx.type === 'transfer' && tx.fromAccount === 'wallet') || (['lend','repay_borrow'].includes(tx.type) && tx.account === 'wallet');
            const isDepositW = (tx.type === 'deposit' && tx.account === 'wallet') || (tx.type === 'transfer' && tx.toAccount === 'wallet') || (['borrow','repay_lend'].includes(tx.type) && tx.account === 'wallet');

            let updG = { ...gullakDenoms }, updW = { ...walletDenoms }, mG = false, mW = false;
            for (let [v, c] of Object.entries(tx.denoms)) {
                const count = parseInt(c) || 0;
                if (isDepositG) { updG[v] -= count; mG = true; } if (isWithdrawG) { updG[v] += count; mG = true; }
                if (isDepositW) { updW[v] -= count; mW = true; } if (isWithdrawW) { updW[v] += count; mW = true; }
            }
            if (useFirebase) {
                if (mG) await db.collection("settings").doc("gullak").set(updG);
                if (mW) await db.collection("settings").doc("wallet").set(updW);
            } else {
                if (mG) { setGullakDenoms(updG); localStorage.setItem('spendTracker_gullakDenoms', JSON.stringify(updG)); }
                if (mW) { setWalletDenoms(updW); localStorage.setItem('spendTracker_walletDenoms', JSON.stringify(updW)); }
            }
        }

        if (useFirebase) { await db.collection("transactions").doc(txId).delete(); }
        else {
            const upd = transactions.filter(t => t.id !== txId);
            setTransactions(upd);
            localStorage.setItem('spendTracker_txs', JSON.stringify(upd));
        }
    };

    const handleDownload = () => {
        if (!filteredTransactions.length) { alert("No transactions to download."); return; }
        const headers = ["Date","Time","Type","Account","To Account","Category","Amount","Note"];
        const rows = filteredTransactions.map(tx => {
            const d = new Date(tx.date);
            return [
                d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                tx.type,
                tx.type === 'transfer' ? tx.fromAccount : tx.account,
                tx.type === 'transfer' ? tx.toAccount : '',
                tx.category || '',
                parseFloat(tx.amount).toFixed(2),
                `"${(tx.note || '').replace(/"/g, '""')}"`
            ].join(",");
        });
        const now = new Date();
        const dateStr = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`;
        const uri = "data:text/csv;charset=utf-8," + encodeURI([headers.join(","), ...rows].join("\n"));
        const a = document.createElement("a");
        a.href = uri; a.download = `SpendTracker_Report_${dateStr}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const fmt = (a) => showAmounts ? `₹${a.toFixed(2)}` : '₹••••';

    return (
        <section className="history-section">
            <div className="section-header">
                <div className="section-icon"><FileText size={18} color="#fff" /></div>
                <h2>Report</h2>
                <button onClick={handleDownload} className="download-btn" style={{ marginLeft: 'auto' }}>
                    <Download size={14} /> CSV
                </button>
            </div>

            <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="filters-container" style={{ background: 'transparent', padding: 0, border: 'none' }}>
                    <div className="date-filter">
                        <label>From</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="date-filter">
                        <label>To</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div className="date-filter">
                        <label>Type</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">All</option>
                            <option value="expense">Expense</option>
                            <option value="deposit">Deposit</option>
                            <option value="transfer">Transfer</option>
                            <option value="debt">Debts</option>
                        </select>
                    </div>
                    <div className="date-filter">
                        <label>Account</label>
                        <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
                            <option value="all">All</option>
                            <option value="bank">Bank</option>
                            <option value="gullak">Gullak</option>
                            <option value="wallet">Wallet</option>
                            <option value="relative">Relative</option>
                        </select>
                    </div>
                </div>
            </div>

            {(startDate || endDate) && (
                <div className="summary-card">
                    <div className="summary-stat spent">
                        <span>Period Spent</span>
                        <strong>{fmt(periodSpent)}</strong>
                    </div>
                    <div className="summary-stat collected">
                        <span>Period Collected</span>
                        <strong>{fmt(periodCollected)}</strong>
                    </div>
                </div>
            )}

            <div className="history-list">
                {filteredTransactions.length === 0 ? (
                    <div className="empty-state"><FileText size={40} color="var(--text-dim)" /><span>No transactions found</span></div>
                ) : filteredTransactions.map(tx => {
                    const isTransfer = tx.type === 'transfer';
                    const accText = isTransfer ? `${tx.fromAccount} → ${tx.toAccount}` : tx.account;
                    const catText = tx.category ? ` · ${tx.category}` : tx.type.includes('lend') || tx.type.includes('borrow') ? ' · Debt' : '';
                    const sign = ['expense','lend','repay_borrow'].includes(tx.type) ? '-' : ['deposit','borrow','repay_lend'].includes(tx.type) ? '+' : '⇄';

                    return (
                        <div key={tx.id} className={`transaction-item`}>
                            <div className={`tx-type-icon ${tx.type}`}>
                                {TX_ICONS[tx.type] || <ArrowRightLeft size={18} />}
                            </div>
                            <div className="tx-info">
                                <h4>{tx.note}</h4>
                                <p>{accText}{catText} · {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                            </div>
                            <div className={`tx-amount ${tx.type}`}>
                                <span>{sign}{fmt(parseFloat(tx.amount))}</span>
                                <button className="tx-delete-btn" onClick={() => handleDelete(tx.id)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ============================================
// SETTINGS
// ============================================
function SettingsPage({ theme, setTheme, currentPin, onSavePin }) {
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleSave = () => {
        if (oldPin !== currentPin) { setMsg({ text: 'Current PIN is incorrect', type: 'error' }); return; }
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) { setMsg({ text: 'New PIN must be exactly 4 digits', type: 'error' }); return; }
        onSavePin(newPin);
        setMsg({ text: 'PIN changed successfully!', type: 'success' });
        setOldPin(''); setNewPin('');
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    const themes = [
        { id: 'gold', label: 'Gold', icon: '✨' },
        { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
        { id: 'light', label: 'Light', icon: <Sun size={16} /> },
        { id: 'system', label: 'System', icon: <Palette size={16} /> },
    ];

    return (
        <section className="settings-section">
            <div className="section-header">
                <div className="section-icon"><Settings size={18} color="#fff" /></div>
                <h2>Settings</h2>
            </div>

            <div className="settings-card glass-panel">
                <h3><Palette size={16} color="var(--accent)" /> Appearance</h3>
                <div className="theme-grid">
                    {themes.map(t => (
                        <button key={t.id} className={`theme-btn ${theme === t.id ? 'active' : ''}`} onClick={() => setTheme(t.id)}>
                            <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="settings-card glass-panel">
                <h3><Lock size={16} color="var(--accent)" /> Change PIN</h3>
                <div className="form-group">
                    <label>Current PIN</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                            <Lock size={16} />
                        </div>
                        <input type="password" maxLength={4} inputMode="numeric" value={oldPin} onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                </div>
                <div className="form-group">
                    <label>New PIN (4 digits)</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                            <ShieldCheck size={16} />
                        </div>
                        <input type="password" maxLength={4} inputMode="numeric" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                </div>
                <button className="submit-btn" onClick={handleSave}>
                    <ShieldCheck size={18} /> Update PIN
                </button>
                {msg.text && (
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: msg.type === 'error' ? 'var(--expense)' : 'var(--deposit)', fontWeight: 600 }}>
                        {msg.text}
                    </p>
                )}
            </div>
        </section>
    );
}

// ============================================
// DENOMINATION BREAKDOWN MODAL
// ============================================
function DenomBreakdownModal({ title, denoms, onClose }) {
    const sorted = Object.keys(denoms).map(Number).sort((a, b) => b - a);
    let total = 0;

    return (
        <div className="modal show" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                <span className="close-modal" onClick={onClose}>✕</span>
                <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                    <div className="section-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                        <PiggyBank size={18} color="#fff" />
                    </div>
                    <h2>{title}</h2>
                </div>
                {sorted.map(val => {
                    const count = denoms[val];
                    if (!count) return null;
                    const rowTotal = val * count;
                    total += rowTotal;
                    return (
                        <div key={val} className="breakdown-row">
                            <span>₹{val} <span style={{ color: 'var(--text-muted)' }}>× {count}</span></span>
                            <span>₹{rowTotal}</span>
                        </div>
                    );
                })}
                {total === 0 && <div className="empty-state"><PiggyBank size={40} color="var(--text-dim)" /><span>Empty</span></div>}
                {total > 0 && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--accent-glow)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>₹{total}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
