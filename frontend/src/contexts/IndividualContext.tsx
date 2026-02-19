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
    markNotificationRead: (id: string) => void;
    markAllRead: () => void;
    pendingOfflineTx: OfflineTransaction[];
    refreshOfflineTx: () => Promise<void>;
    retryOfflineTx: (txId: string) => Promise<void>;
    logout: () => Promise<void>;
}

const mockUser: IndividualUser = {
    id: "IND-001",
    firstName: "Arjun",
    lastName: "Mehta",
    email: "arjun.mehta@gmail.com",
    phone: "+91 98765 43210",
    dob: "1995-06-15",
    gender: "Male",
    surePayId: "arjun.mehta@surepay",
    kycStatus: "verified",
    isEmployee: true,
    employer: {
        name: "ACME Technologies",
        logo: "A",
        employeeId: "EMP-2045",
        department: "Engineering",
    },
};

const mockWallets: WalletData[] = [
    { id: "W-P-001", type: "personal", balance: 24580, currency: "INR", frozen: false },
    { id: "W-E-001", type: "employer", balance: 8500, currency: "INR", monthlyLimit: 15000, spentThisMonth: 6500, maxPerTransaction: 5000, frozen: false, employerName: "ACME Technologies" },
];

const mockTransactions: Transaction[] = [
    { id: "TXN-001", type: "received", amount: 5000, counterparty: "Rahul Sharma", counterpartyId: "rahul@surepay", walletUsed: "personal", status: "completed", note: "Dinner split", timestamp: "2026-02-18T14:30:00Z" },
    { id: "TXN-002", type: "sent", amount: 1299, counterparty: "Amazon Pay", counterpartyId: "amazon@surepay", walletUsed: "personal", status: "completed", note: "Order #8823", timestamp: "2026-02-18T11:00:00Z" },
    { id: "TXN-003", type: "sent", amount: 649, counterparty: "Netflix", counterpartyId: "netflix@surepay", walletUsed: "personal", status: "completed", note: "Subscription", timestamp: "2026-02-17T18:00:00Z" },
    { id: "TXN-004", type: "received", amount: 85000, counterparty: "ACME Technologies", counterpartyId: "acme@surepay", walletUsed: "employer", status: "completed", note: "Salary Feb 2026", timestamp: "2026-02-01T09:00:00Z" },
    { id: "TXN-005", type: "sent", amount: 350, counterparty: "Starbucks", counterpartyId: "starbucks@surepay", walletUsed: "employer", status: "completed", note: "Coffee meeting", timestamp: "2026-02-16T10:15:00Z", category: "food" },
    { id: "TXN-006", type: "sent", amount: 2000, counterparty: "Priya Verma", counterpartyId: "priya@surepay", walletUsed: "personal", status: "completed", note: "Gift", timestamp: "2026-02-15T16:00:00Z" },
    { id: "TXN-007", type: "received", amount: 1500, counterparty: "Vikram Joshi", counterpartyId: "vikram@surepay", walletUsed: "personal", status: "pending", note: "Loan repayment", timestamp: "2026-02-14T12:00:00Z" },
    { id: "TXN-008", type: "sent", amount: 4500, counterparty: "Uber", counterpartyId: "uber@surepay", walletUsed: "employer", status: "completed", note: "Business travel", timestamp: "2026-02-13T08:00:00Z", category: "transport" },
];

const mockNotifications: Notification[] = [
    { id: "N-001", type: "transaction", title: "Money Received", message: "₹5,000 received from Rahul Sharma", timestamp: "2026-02-18T14:30:00Z", read: false },
    { id: "N-002", type: "employer", title: "Employer Credit", message: "₹8,500 credited to your employer wallet by ACME Technologies", timestamp: "2026-02-01T09:00:00Z", read: false },
    { id: "N-003", type: "kyc", title: "KYC Verified", message: "Your KYC has been successfully verified", timestamp: "2026-01-28T10:00:00Z", read: true },
    { id: "N-004", type: "system", title: "Security Alert", message: "New login detected from Chrome on Windows", timestamp: "2026-02-17T22:00:00Z", read: true },
];

const IndividualContext = createContext<IndividualContextType | null>(null);

export const useIndividual = () => {
    const ctx = useContext(IndividualContext);
    if (!ctx) throw new Error("useIndividual must be used within IndividualProvider");
    return ctx;
};

export const IndividualProvider = ({ children }: { children: ReactNode }) => {
    const [user] = useState(mockUser);
    const [wallets, setWallets] = useState(mockWallets);
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [selectedWallet, setSelectedWallet] = useState(mockWallets[0].id);
    const [pendingOfflineTx, setPendingOfflineTx] = useState<OfflineTransaction[]>([]);

    // Cache wallet state whenever it changes
    useEffect(() => {
        cacheWalletState(wallets, user.id).catch(console.error);
    }, [wallets, user.id]);

    // Cache transactions whenever they change
    useEffect(() => {
        cacheTransactions(transactions).catch(console.error);
    }, [transactions]);

    // Load pending offline transactions on mount
    const refreshOfflineTx = useCallback(async () => {
        try {
            const all = await offlineTransactions.getAll();
            setPendingOfflineTx(all.filter(tx => tx.status !== "synced"));
        } catch (e) {
            console.error("Failed to load offline transactions:", e);
        }
    }, []);

    useEffect(() => {
        refreshOfflineTx();
    }, [refreshOfflineTx]);

    const sendMoney = (to: string, amount: number, walletId: string, note: string): { success: boolean; offline?: boolean; reason?: string } => {
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) return { success: false, reason: "Wallet not found" };

        const validation = validateOfflineTransaction(amount, wallet, wallet.type);
        if (!validation.valid) return { success: false, reason: validation.reason };

        const isOnline = navigator.onLine;

        // Optimistically deduct from wallet
        setWallets(prev => prev.map(w =>
            w.id === walletId
                ? { ...w, balance: w.balance - amount, spentThisMonth: (w.spentThisMonth || 0) + amount }
                : w
        ));

        const txId = isOnline ? `TXN-${Date.now()}` : generateOfflineTxId();
        const newTx: Transaction = {
            id: txId,
            type: "sent",
            amount,
            counterparty: to,
            counterpartyId: to,
            walletUsed: wallet.type,
            status: isOnline ? "completed" : "pending",
            note,
            timestamp: new Date().toISOString(),
            offlineStatus: isOnline ? undefined : "pending",
        };
        setTransactions(prev => [newTx, ...prev]);

        if (!isOnline) {
            // Queue in IndexedDB
            const offlineTx: OfflineTransaction = {
                id: txId,
                sender_id: user.id,
                receiver_id: to,
                amount,
                wallet_type: wallet.type,
                wallet_id: walletId,
                note,
                created_at: new Date().toISOString(),
                status: "pending",
                retry_count: 0,
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
            id: `TXN-${Date.now()}`,
            type: "received",
            amount,
            counterparty: "Bank Transfer",
            counterpartyId: "bank",
            walletUsed: "personal",
            status: "completed",
            note: "Added via bank",
            timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const logout = async () => {
        await clearAllCaches();
        setPendingOfflineTx([]);
    };

    return (
        <IndividualContext.Provider value={{
            user, wallets, transactions, notifications,
            selectedWallet, setSelectedWallet,
            sendMoney, addMoney,
            markNotificationRead, markAllRead,
            pendingOfflineTx, refreshOfflineTx, retryOfflineTx,
            logout,
        }}>
            {children}
        </IndividualContext.Provider>
    );
};
