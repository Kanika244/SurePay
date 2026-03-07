/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Interfaces matching the API response shapes
export interface Enterprise {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'suspended' | 'pending';
    walletBalance: number;
    createdAt: string;
    industry: string;
    companyType: string;
    employeeCount: number;
    companyCode: string;
    // Keep these for backward compat with profile pages
    address: string;
    country: string;
    documents: { name: string; type: string; uploadedAt: string }[];
    poc: {
        name: string;
        email: string;
        phone: string;
        designation: string;
        status: 'verified' | 'pending';
    };
}

export interface Employee {
    id: string;
    enterpriseId: string;
    enterpriseName: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    status: 'active' | 'inactive' | 'suspended';
    walletBalance: number;
    createdAt: string;
    joinedVia: string;
    documents: { name: string; type: string; uploadedAt: string }[];
}

export interface Individual {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended' | 'pending';
    walletBalance: number;
    walletId: string;
    kycStatus: string;
    employerName: string;
    createdAt: string;
    documents: { name: string; type: string; uploadedAt: string }[];
}

export interface Transaction {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'enterprise' | 'employee' | 'individual';
    receiverId: string;
    receiverName: string;
    receiverType: 'enterprise' | 'employee' | 'individual';
    amount: number;
    type: 'credit' | 'debit' | 'transfer';
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
    description: string;
}

export interface AuditLog {
    id: string;
    adminId: string;
    adminEmail: string;
    action: string;
    targetType: 'enterprise' | 'employee' | 'individual' | 'wallet' | 'system';
    targetId: string;
    details: string;
    timestamp: string;
}

interface AdminContextType {
    // Data
    enterprises: Enterprise[];
    employees: Employee[];
    individuals: Individual[];
    transactions: Transaction[];
    auditLogs: AuditLog[];
    loading: boolean;

    // Refresh
    refreshAll: () => Promise<void>;

    // Enterprise operations
    updateEnterprise: (id: string, data: Partial<Enterprise>) => void;
    deleteEnterprise: (id: string) => void;
    toggleEnterpriseStatus: (id: string) => void;

    // Employee operations
    updateEmployee: (id: string, data: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
    toggleEmployeeStatus: (id: string) => void;

    // Individual operations
    updateIndividual: (id: string, data: Partial<Individual>) => void;
    deleteIndividual: (id: string) => void;
    toggleIndividualStatus: (id: string) => void;

    // Wallet operations
    creditWallet: (type: 'enterprise' | 'employee' | 'individual', id: string, amount: number) => void;
    debitWallet: (type: 'enterprise' | 'employee' | 'individual', id: string, amount: number) => void;
    freezeWallet: (type: 'enterprise' | 'employee' | 'individual', id: string) => void;
    unfreezeWallet: (type: 'enterprise' | 'employee' | 'individual', id: string) => void;

    // Audit logging
    addAuditLog: (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => void;

    // Search
    globalSearch: (query: string) => {
        enterprises: Enterprise[];
        employees: Employee[];
        individuals: Individual[];
    };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const API_BASE = "http://localhost:8000/api/admin";

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [individuals, setIndividuals] = useState<Individual[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all data from API
    const refreshAll = useCallback(async () => {
        setLoading(true);
        try {
            const [entRes, indRes, empRes, txnRes] = await Promise.all([
                fetch(`${API_BASE}/enterprises`),
                fetch(`${API_BASE}/individuals`),
                fetch(`${API_BASE}/employees`),
                fetch(`${API_BASE}/transactions/recent?limit=50`),
            ]);

            if (entRes.ok) {
                const data = await entRes.json();
                if (data.success) {
                    setEnterprises(data.enterprises.map((e: any) => ({
                        ...e,
                        address: '',
                        country: 'India',
                        documents: [],
                        poc: { name: '', email: '', phone: '', designation: '', status: 'pending' },
                    })));
                }
            }

            if (indRes.ok) {
                const data = await indRes.json();
                if (data.success) {
                    setIndividuals(data.individuals.map((i: any) => ({
                        ...i,
                        email: '',
                        documents: [],
                    })));
                }
            }

            if (empRes.ok) {
                const data = await empRes.json();
                if (data.success) {
                    setEmployees(data.employees.map((e: any) => ({
                        ...e,
                        enterpriseId: e.companyId || '',
                        documents: [],
                    })));
                }
            }

            if (txnRes.ok) {
                const data = await txnRes.json();
                if (data.success) {
                    setTransactions(data.transactions.map((t: any) => ({
                        ...t,
                        senderId: '',
                        receiverId: '',
                        receiverType: t.senderType === 'enterprise' ? 'individual' : 'enterprise',
                        timestamp: t.timestamp,
                    })));
                }
            }
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    const addAuditLog = useCallback((action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            adminId: 'admin-001',
            adminEmail: 'admin@surepay.com',
            action,
            targetType,
            targetId,
            details,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    // Enterprise operations
    const updateEnterprise = useCallback((id: string, data: Partial<Enterprise>) => {
        setEnterprises(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        addAuditLog('ENTERPRISE_UPDATED', 'enterprise', id, 'Updated enterprise details');
    }, [addAuditLog]);

    const deleteEnterprise = useCallback((id: string) => {
        const enterprise = enterprises.find(e => e.id === id);
        setEnterprises(prev => prev.filter(e => e.id !== id));
        addAuditLog('ENTERPRISE_DELETED', 'enterprise', id, `Deleted enterprise "${enterprise?.name}"`);
    }, [enterprises, addAuditLog]);

    const toggleEnterpriseStatus = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/enterprises/${id}/toggle-status`, { method: 'PATCH' });
            if (res.ok) {
                const data = await res.json();
                setEnterprises(prev => prev.map(e => e.id === id ? { ...e, status: data.new_status } : e));
                addAuditLog(data.new_status === 'active' ? 'ENTERPRISE_ACTIVATED' : 'ENTERPRISE_SUSPENDED', 'enterprise', id,
                    `${data.new_status === 'active' ? 'Activated' : 'Suspended'} enterprise`);
            }
        } catch (err) { console.error('toggleEnterpriseStatus failed', err); }
    }, [addAuditLog]);

    // Employee operations
    const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        addAuditLog('EMPLOYEE_UPDATED', 'employee', id, 'Updated employee details');
    }, [addAuditLog]);

    const deleteEmployee = useCallback((id: string) => {
        const employee = employees.find(e => e.id === id);
        setEmployees(prev => prev.filter(e => e.id !== id));
        addAuditLog('EMPLOYEE_DELETED', 'employee', id, `Deleted employee "${employee?.name}"`);
    }, [employees, addAuditLog]);

    const toggleEmployeeStatus = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/employees/${id}/toggle-status`, { method: 'PATCH' });
            if (res.ok) {
                const data = await res.json();
                setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: data.new_status } : e));
                addAuditLog(data.new_status === 'active' ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_SUSPENDED', 'employee', id,
                    `${data.new_status === 'active' ? 'Activated' : 'Suspended'} employee`);
            }
        } catch (err) { console.error('toggleEmployeeStatus failed', err); }
    }, [addAuditLog]);

    // Individual operations
    const updateIndividual = useCallback((id: string, data: Partial<Individual>) => {
        setIndividuals(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
        addAuditLog('INDIVIDUAL_UPDATED', 'individual', id, 'Updated individual details');
    }, [addAuditLog]);

    const deleteIndividual = useCallback((id: string) => {
        const individual = individuals.find(i => i.id === id);
        setIndividuals(prev => prev.filter(i => i.id !== id));
        addAuditLog('INDIVIDUAL_DELETED', 'individual', id, `Deleted individual "${individual?.name}"`);
    }, [individuals, addAuditLog]);

    const toggleIndividualStatus = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/individuals/${id}/toggle-status`, { method: 'PATCH' });
            if (res.ok) {
                const data = await res.json();
                setIndividuals(prev => prev.map(i => i.id === id ? { ...i, status: data.new_status } : i));
                addAuditLog(data.new_status === 'active' ? 'INDIVIDUAL_ACTIVATED' : 'INDIVIDUAL_SUSPENDED', 'individual', id,
                    `${data.new_status === 'active' ? 'Activated' : 'Suspended'} individual`);
            }
        } catch (err) { console.error('toggleIndividualStatus failed', err); }
    }, [addAuditLog]);

    // Wallet operations — now backed by real API
    const creditWallet = useCallback(async (type: 'enterprise' | 'employee' | 'individual', id: string, amount: number) => {
        try {
            const res = await fetch(`${API_BASE}/${type}s/${id}/wallet/credit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            if (res.ok) {
                const data = await res.json();
                if (type === 'enterprise') setEnterprises(prev => prev.map(e => e.id === id ? { ...e, walletBalance: data.new_balance } : e));
                else if (type === 'employee') setEmployees(prev => prev.map(e => e.id === id ? { ...e, walletBalance: data.new_balance } : e));
                else setIndividuals(prev => prev.map(i => i.id === id ? { ...i, walletBalance: data.new_balance } : i));
                addAuditLog('WALLET_CREDITED', 'wallet', id, `Credited ₹${amount.toLocaleString()} to ${type} wallet`);
            }
        } catch (err) { console.error('creditWallet failed', err); }
    }, [addAuditLog]);

    const debitWallet = useCallback(async (type: 'enterprise' | 'employee' | 'individual', id: string, amount: number) => {
        try {
            const res = await fetch(`${API_BASE}/${type}s/${id}/wallet/debit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            if (res.ok) {
                const data = await res.json();
                if (type === 'enterprise') setEnterprises(prev => prev.map(e => e.id === id ? { ...e, walletBalance: data.new_balance } : e));
                else if (type === 'employee') setEmployees(prev => prev.map(e => e.id === id ? { ...e, walletBalance: data.new_balance } : e));
                else setIndividuals(prev => prev.map(i => i.id === id ? { ...i, walletBalance: data.new_balance } : i));
                addAuditLog('WALLET_DEBITED', 'wallet', id, `Debited ₹${amount.toLocaleString()} from ${type} wallet`);
            }
        } catch (err) { console.error('debitWallet failed', err); }
    }, [addAuditLog]);

    const freezeWallet = useCallback(async (type: 'enterprise' | 'employee' | 'individual', id: string) => {
        try {
            const res = await fetch(`${API_BASE}/${type}s/${id}/wallet/freeze`, { method: 'POST' });
            if (res.ok) {
                if (type === 'enterprise') setEnterprises(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
                else if (type === 'employee') setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
                else setIndividuals(prev => prev.map(i => i.id === id ? { ...i, status: 'suspended' } : i));
                addAuditLog('WALLET_FROZEN', 'wallet', id, `Frozen ${type} wallet`);
            }
        } catch (err) { console.error('freezeWallet failed', err); }
    }, [addAuditLog]);

    const unfreezeWallet = useCallback(async (type: 'enterprise' | 'employee' | 'individual', id: string) => {
        try {
            const res = await fetch(`${API_BASE}/${type}s/${id}/wallet/unfreeze`, { method: 'POST' });
            if (res.ok) {
                if (type === 'enterprise') setEnterprises(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
                else if (type === 'employee') setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
                else setIndividuals(prev => prev.map(i => i.id === id ? { ...i, status: 'active' } : i));
                addAuditLog('WALLET_UNFROZEN', 'wallet', id, `Unfrozen ${type} wallet`);
            }
        } catch (err) { console.error('unfreezeWallet failed', err); }
    }, [addAuditLog]);

    // Global search
    const globalSearch = useCallback((query: string) => {
        const lowerQuery = query.toLowerCase();
        return {
            enterprises: enterprises.filter(e =>
                e.name.toLowerCase().includes(lowerQuery) ||
                e.email.toLowerCase().includes(lowerQuery)
            ),
            employees: employees.filter(e =>
                e.name.toLowerCase().includes(lowerQuery) ||
                e.email.toLowerCase().includes(lowerQuery) ||
                e.enterpriseName.toLowerCase().includes(lowerQuery)
            ),
            individuals: individuals.filter(i =>
                i.name.toLowerCase().includes(lowerQuery) ||
                i.phone.toLowerCase().includes(lowerQuery)
            ),
        };
    }, [enterprises, employees, individuals]);

    return (
        <AdminContext.Provider value={{
            enterprises,
            employees,
            individuals,
            transactions,
            auditLogs,
            loading,
            refreshAll,
            updateEnterprise,
            deleteEnterprise,
            toggleEnterpriseStatus,
            updateEmployee,
            deleteEmployee,
            toggleEmployeeStatus,
            updateIndividual,
            deleteIndividual,
            toggleIndividualStatus,
            creditWallet,
            debitWallet,
            freezeWallet,
            unfreezeWallet,
            addAuditLog,
            globalSearch,
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};