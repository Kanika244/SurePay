/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
    offlineTransactions,
    generateOfflineTxId,
    clearAllCaches,
    type OfflineTransaction,
} from "@/lib/offlineDb";
import {
    validateOfflineTransaction,
    cacheWalletState,
    cacheTransactions,
} from "@/lib/offlineSyncManager";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export interface IndividualUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    surePayId: string;
    kycStatus: "pending" | "verified" | "rejected";
    isEmployee: boolean;
    employer?: {
        name: string;
        logo: string;
        employeeId: string;
        department: string;
    };
}

export interface WalletData {
    id: string;
    type: "personal" | "employer";
    balance: number;
    currency: string;
    monthlyLimit?: number;
    spentThisMonth?: number;
    maxPerTransaction?: number;
    frozen: boolean;
    employerName?: string;
}

export interface Transaction {
    id: string;
    type: "sent" | "received";
    amount: number;
    counterparty: string;
    counterpartyId: string;
    walletUsed: "personal" | "employer";
    status: "completed" | "pending" | "failed";
    note: string;
    timestamp: string;
    category?: string;
    offlineStatus?: "pending" | "syncing" | "failed" | "synced";
}

export interface Notification {
    id: string;
    type: "transaction" | "kyc" | "employer" | "system";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

interface IndividualContextType {
    user: IndividualUser;
    wallets: WalletData[];
    transactions: Transaction[];
    notifications: Notification[];
    selectedWallet: string;
    setSelectedWallet: (id: string) => void;
    sendMoney: (to: string, amount: number, walletId: string, note: string) => { success: boolean; offline?: boolean; reason?: string };
    addMoney: (amount: number, method: string) => void;
    updateEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
    markNotificationRead: (id: string) => void;
    markAllRead: () => void;
    pendingOfflineTx: OfflineTransaction[];
    refreshOfflineTx: () => Promise<void>;
    refreshWallet: () => Promise<void>;
    refreshTransactions: () => Promise<void>;
    retryOfflineTx: (txId: string) => Promise<void>;
    login: (userId: string, phone: string) => void;
    logout: () => Promise<void>;
    loading: boolean;
    employer2FARequired: boolean;
}

const emptyUser: IndividualUser = {
    id: "", firstName: "", lastName: "", email: "",
    phone: "", dob: "", gender: "", surePayId: "",
    kycStatus: "pending", isEmployee: false,
};

const IndividualContext = createContext<IndividualContextType | null>(null);

export const useIndividual = () => {
    const ctx = useContext(IndividualContext);
    if (!ctx) throw new Error("useIndividual must be used within IndividualProvider");
    return ctx;
};

export const IndividualProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IndividualUser>(emptyUser);
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedWallet, setSelectedWallet] = useState("");
    const [pendingOfflineTx, setPendingOfflineTx] = useState<OfflineTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [employer2FARequired, setEmployer2FARequired] = useState(false);

    // ── FIXED: reactive state instead of plain constants ──
    const [userId, setUserId] = useState(() => localStorage.getItem("individual_user_id") || "");
    const [userPhone, setUserPhone] = useState(() => localStorage.getItem("individual_phone") || "");

    const fetchUserProfile = useCallback(async () => {
        if (!userId && !userPhone) return;
        try {
            if (userId) {
                const res = await fetch(`${API_BASE}/api/kyc/details-by-id/${userId}`);
                if (res.ok) {
                    const d = await res.json();
                    setUser(prev => ({
                        ...prev,
                        id: userId,
                        firstName: d.full_name?.split(" ")[0] || "User",
                        lastName: d.full_name?.split(" ").slice(1).join(" ") || "",
                        email: d.email || "",
                        phone: d.phone || userPhone,
                        dob: d.dob || "",
                        gender: d.gender || "",
                        surePayId: `${(d.full_name || "user").replace(/\s+/g, ".").toLowerCase()}@surepay`,
                        kycStatus: d.kyc_status === "SUBMITTED" ? "verified" :
                            d.kyc_status === "REJECTED" ? "rejected" : "pending",
                    }));
                    return;
                }
            }
            if (userPhone) {
                const res = await fetch(`${API_BASE}/api/kyc/personal-details/${encodeURIComponent(userPhone)}`);
                if (res.ok) {
                    const d = await res.json();
                    // Also fetch email from user record
                    let email = "";
                    try {
                        const uRes = await fetch(`${API_BASE}/api/kyc/user/${encodeURIComponent(userPhone)}`);
                        if (uRes.ok) { const uData = await uRes.json(); email = uData.user?.email || ""; }
                    } catch { /* non-fatal */ }
                    setUser(prev => ({
                        ...prev,
                        id: d.user_id || userId,
                        firstName: d.full_name?.split(" ")[0] || "User",
                        lastName: d.full_name?.split(" ").slice(1).join(" ") || "",
                        email,
                        phone: userPhone,
                        dob: d.dob || "",
                        gender: d.gender || "",
                        surePayId: `${(d.full_name || "user").replace(/\s+/g, ".").toLowerCase()}@surepay`,
                        kycStatus: d.kyc_status === "SUBMITTED" ? "verified" :
                            d.kyc_status === "REJECTED" ? "rejected" : "pending",
                    }));
                    if (d.user_id) {
                        localStorage.setItem("individual_user_id", d.user_id);
                        setUserId(d.user_id);
                    }
                    return;
                }
            }
            setUser(prev => ({ ...prev, id: userId, phone: userPhone, firstName: "User" }));
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setUser(prev => ({ ...prev, id: userId, phone: userPhone, firstName: "User" }));
        }
    }, [userId, userPhone]);

    const fetchWallet = useCallback(async () => {
        if (!userId) return;
        try {
            // Fetch personal wallet and company wallet in parallel
            const [personalRes, companyRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/wallet/individual/${userId}`),
                fetch(`${API_BASE}/api/v1/wallet/individual/${userId}/company-wallet`),
            ]);

            const collected: WalletData[] = [];
            let defaultWalletId = "";

            // ── Personal wallet ──
            if (personalRes.ok) {
                const data = await personalRes.json();
                if (data.status === "success" && data.wallet) {
                    const w = data.wallet;
                    collected.push({
                        id: w.wallet_id,
                        type: "personal",
                        balance: w.balance || 0,
                        currency: w.currency || "INR",
                        frozen: w.status !== "active",
                    });
                    defaultWalletId = w.wallet_id;
                }
            }

            // If no personal wallet yet, auto-activate
            if (collected.length === 0) {
                const activateRes = await fetch(`${API_BASE}/api/v1/wallet/individual/activate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId }),
                });
                if (activateRes.ok) {
                    const activateData = await activateRes.json();
                    if (activateData.status === "success" && activateData.wallet) {
                        const w = activateData.wallet;
                        collected.push({
                            id: w.wallet_id,
                            type: "personal",
                            balance: w.balance || 0,
                            currency: w.currency || "INR",
                            frozen: w.status !== "active",
                        });
                        defaultWalletId = w.wallet_id;
                    }
                }
            }

            if (collected.length === 0) {
                collected.push({ id: "no-wallet", type: "personal", balance: 0, currency: "INR", frozen: false });
                defaultWalletId = "no-wallet";
            }

            // ── Company wallet ──
            if (companyRes.ok) {
                const companyData = await companyRes.json();
                if (companyData.status === "success" && companyData.company_wallet) {
                    const cw = companyData.company_wallet;
                    collected.push({
                        id: `EMP-${cw.employee_record_id}`,
                        type: "employer",
                        balance: cw.balance || 0,
                        currency: cw.currency || "INR",
                        frozen: cw.status === "suspended",
                        employerName: cw.company_name,
                        monthlyLimit: cw.spending_limit || 0,
                        spentThisMonth: 0,
                        maxPerTransaction: cw.spending_limit || 0,
                    });
                    // Update user with employer info
                    setUser(prev => ({
                        ...prev,
                        isEmployee: true,
                        employer: {
                            name: cw.company_name,
                            logo: cw.company_logo || "",
                            employeeId: cw.employee_id,
                            department: cw.department,
                        },
                    }));
                    setEmployer2FARequired(cw.two_fa_required === true);
                } else {
                    // Not an employee — clear employer info
                    setUser(prev => ({ ...prev, isEmployee: false, employer: undefined }));
                    setEmployer2FARequired(false);
                }
            }

            setWallets(collected);
            if (defaultWalletId) setSelectedWallet(defaultWalletId);
        } catch (err) {
            console.error("Failed to fetch wallet:", err);
        }
    }, [userId]);

    const fetchTransactions = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/wallet/individual/${userId}/transactions`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success" && data.transactions) {
                    const mapped: Transaction[] = data.transactions.map((tx: any) => ({
                        id: tx.id,
                        type: tx.type === "credit" ? "received" : "sent",
                        amount: tx.amount,
                        counterparty: tx.sender_name || tx.description || "Unknown",
                        counterpartyId: tx.sender_wallet_id || "",
                        walletUsed: "personal" as const,
                        status: (tx.status || "completed") as "completed" | "pending" | "failed",
                        note: tx.description || "",
                        timestamp: tx.created_at || new Date().toISOString(),
                    }));
                    setTransactions(mapped);
                    return;
                }
            }
            setTransactions([]);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        }
    }, [userId]);

    // ── Re-fetch whenever userId changes (login/logout) ──
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchUserProfile(), fetchWallet(), fetchTransactions()]);
            setLoading(false);
        };
        loadData();
    }, [fetchUserProfile, fetchWallet, fetchTransactions]);

    useEffect(() => {
        if (user.id && wallets.length > 0) {
            cacheWalletState(wallets, user.id).catch(console.error);
        }
    }, [wallets, user.id]);

    useEffect(() => {
        if (transactions.length > 0) {
            cacheTransactions(transactions).catch(console.error);
        }
    }, [transactions]);

    const refreshOfflineTx = useCallback(async () => {
        try {
            const all = await offlineTransactions.getAll();
            setPendingOfflineTx(all.filter(tx => tx.status !== "synced"));
        } catch (e) {
            console.error("Failed to load offline transactions:", e);
        }
    }, []);

    useEffect(() => { refreshOfflineTx(); }, [refreshOfflineTx]);

    // ── NEW: call this from SignIn instead of writing localStorage directly ──
    const login = useCallback((newUserId: string, newPhone: string) => {
        localStorage.setItem("individual_user_id", newUserId);
        localStorage.setItem("individual_phone", newPhone);
        setUserId(newUserId);
        setUserPhone(newPhone);
    }, []);

    const logout = async () => {
        await clearAllCaches();
        localStorage.removeItem("individual_user_id");
        localStorage.removeItem("individual_phone");
        setPendingOfflineTx([]);
        setUser(emptyUser);
        setWallets([]);
        setTransactions([]);
        setNotifications([]);
        setUserId("");       // ← clears reactive state
        setUserPhone("");    // ← clears reactive state
    };

    const sendMoney = (to: string, amount: number, walletId: string, note: string): { success: boolean; offline?: boolean; reason?: string } => {
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) return { success: false, reason: "Wallet not found" };

        const validation = validateOfflineTransaction(amount, wallet, wallet.type);
        if (!validation.valid) return { success: false, reason: validation.reason };

        const isOnline = navigator.onLine;

        setWallets(prev => prev.map(w =>
            w.id === walletId
                ? { ...w, balance: w.balance - amount, spentThisMonth: (w.spentThisMonth || 0) + amount }
                : w
        ));

        const txId = isOnline ? `TXN-${Date.now()}` : generateOfflineTxId();
        const newTx: Transaction = {
            id: txId, type: "sent", amount,
            counterparty: to, counterpartyId: to,
            walletUsed: wallet.type,
            status: isOnline ? "completed" : "pending",
            note, timestamp: new Date().toISOString(),
            offlineStatus: isOnline ? undefined : "pending",
        };
        setTransactions(prev => [newTx, ...prev]);

        if (!isOnline) {
            const offlineTx: OfflineTransaction = {
                id: txId, sender_id: user.id, receiver_id: to,
                amount, wallet_type: wallet.type, wallet_id: walletId,
                note, created_at: new Date().toISOString(),
                status: "pending", retry_count: 0,
            };
            offlineTransactions.add(offlineTx).then(() => refreshOfflineTx()).catch(console.error);
        }

        setNotifications(prev => [{
            id: `N-${Date.now()}`,
            type: "transaction",
            title: isOnline ? "Money Sent" : "Transaction Queued",
            message: isOnline
                ? `₹${amount.toLocaleString()} sent to ${to}`
                : `₹${amount.toLocaleString()} to ${to} – will sync when online`,
            timestamp: new Date().toISOString(),
            read: false,
        }, ...prev]);

        return { success: true, offline: !isOnline };
    };

    const retryOfflineTx = async (txId: string) => {
        const tx = await offlineTransactions.get(txId);
        if (!tx || tx.status === "synced") return;
        await offlineTransactions.update({ ...tx, status: "pending", retry_count: 0 });
        await refreshOfflineTx();
    };

    const addMoney = (amount: number, _method: string) => {
        setWallets(prev => prev.map(w => w.type === "personal" ? { ...w, balance: w.balance + amount } : w));
        const newTx: Transaction = {
            id: `TXN-${Date.now()}`, type: "received", amount,
            counterparty: "Bank Transfer", counterpartyId: "bank",
            walletUsed: "personal", status: "completed",
            note: "Added via bank", timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    const updateEmail = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
        if (!userPhone) return { success: false, error: "Not logged in." };
        try {
            const fd = new FormData();
            fd.append("phone", userPhone);
            fd.append("email", email);
            const res = await fetch(`${API_BASE}/api/kyc/update-email`, { method: "PATCH", body: fd });
            const data = await res.json();
            if (res.ok && data.success) {
                setUser(prev => ({ ...prev, email: data.email }));
                return { success: true };
            }
            return { success: false, error: data.detail || "Failed to update email." };
        } catch {
            return { success: false, error: "Network error." };
        }
    }, [userPhone]);

    const markNotificationRead = (id: string) =>
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    return (
        <IndividualContext.Provider value={{
            user, wallets, transactions, notifications,
            selectedWallet, setSelectedWallet,
            sendMoney, addMoney, updateEmail,
            markNotificationRead, markAllRead,
            pendingOfflineTx, refreshOfflineTx,
            refreshWallet: fetchWallet,
            refreshTransactions: fetchTransactions,
            retryOfflineTx,
            login, logout, loading,
            employer2FARequired,
        }}>
            {children}
        </IndividualContext.Provider>
    );
};