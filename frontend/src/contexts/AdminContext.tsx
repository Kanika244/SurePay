import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    mockEnterprises,
    mockEmployees,
    mockIndividuals,
    mockTransactions,
    mockAuditLogs,
    Enterprise,
    Employee,
    Individual,
    Transaction,
    AuditLog,
} from '@/data/adminMockData';

interface AdminContextType {
    // Data
    enterprises: Enterprise[];
    employees: Employee[];
    individuals: Individual[];
    transactions: Transaction[];
    auditLogs: AuditLog[];

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

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [enterprises, setEnterprises] = useState<Enterprise[]>(mockEnterprises);
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [individuals, setIndividuals] = useState<Individual[]>(mockIndividuals);
    const [transactions] = useState<Transaction[]>(mockTransactions);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

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
        addAuditLog('ENTERPRISE_UPDATED', 'enterprise', id, `Updated enterprise details`);
    }, [addAuditLog]);

    const deleteEnterprise = useCallback((id: string) => {
        const enterprise = enterprises.find(e => e.id === id);
        setEnterprises(prev => prev.filter(e => e.id !== id));
        addAuditLog('ENTERPRISE_DELETED', 'enterprise', id, `Deleted enterprise "${enterprise?.name}"`);
    }, [enterprises, addAuditLog]);

    const toggleEnterpriseStatus = useCallback((id: string) => {
        setEnterprises(prev => prev.map(e => {
            if (e.id === id) {
                const newStatus = e.status === 'active' ? 'suspended' : 'active';
                addAuditLog(
                    newStatus === 'active' ? 'ENTERPRISE_ACTIVATED' : 'ENTERPRISE_SUSPENDED',
                    'enterprise',
                    id,
                    `${newStatus === 'active' ? 'Activated' : 'Suspended'} enterprise "${e.name}"`
                );
                return { ...e, status: newStatus };
            }
            return e;
        }));
    }, [addAuditLog]);

    // Employee operations
    const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        addAuditLog('EMPLOYEE_UPDATED', 'employee', id, `Updated employee details`);
    }, [addAuditLog]);

    const deleteEmployee = useCallback((id: string) => {
        const employee = employees.find(e => e.id === id);
        setEmployees(prev => prev.filter(e => e.id !== id));
        addAuditLog('EMPLOYEE_DELETED', 'employee', id, `Deleted employee "${employee?.name}"`);
    }, [employees, addAuditLog]);

    const toggleEmployeeStatus = useCallback((id: string) => {
        setEmployees(prev => prev.map(e => {
            if (e.id === id) {
                const newStatus = e.status === 'active' ? 'inactive' : 'active';
                addAuditLog(
                    newStatus === 'active' ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_DEACTIVATED',
                    'employee',
                    id,
                    `${newStatus === 'active' ? 'Activated' : 'Deactivated'} employee "${e.name}"`
                );
                return { ...e, status: newStatus };
            }
            return e;
        }));
    }, [addAuditLog]);

    // Individual operations
    const updateIndividual = useCallback((id: string, data: Partial<Individual>) => {
        setIndividuals(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
        addAuditLog('INDIVIDUAL_UPDATED', 'individual', id, `Updated individual details`);
    }, [addAuditLog]);

    const deleteIndividual = useCallback((id: string) => {
        const individual = individuals.find(i => i.id === id);
        setIndividuals(prev => prev.filter(i => i.id !== id));
        addAuditLog('INDIVIDUAL_DELETED', 'individual', id, `Deleted individual "${individual?.name}"`);
    }, [individuals, addAuditLog]);

    const toggleIndividualStatus = useCallback((id: string) => {
        setIndividuals(prev => prev.map(i => {
            if (i.id === id) {
                const newStatus = i.status === 'active' ? 'suspended' : 'active';
                addAuditLog(
                    newStatus === 'active' ? 'INDIVIDUAL_ACTIVATED' : 'INDIVIDUAL_SUSPENDED',
                    'individual',
                    id,
                    `${newStatus === 'active' ? 'Activated' : 'Suspended'} individual "${i.name}"`
                );
                return { ...i, status: newStatus };
            }
            return i;
        }));
    }, [addAuditLog]);

    // Wallet operations
    const creditWallet = useCallback((type: 'enterprise' | 'employee' | 'individual', id: string, amount: number) => {
        if (type === 'enterprise') {
            setEnterprises(prev => prev.map(e => e.id === id ? { ...e, walletBalance: e.walletBalance + amount } : e));
        } else if (type === 'employee') {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, walletBalance: e.walletBalance + amount } : e));
        } else {
            setIndividuals(prev => prev.map(i => i.id === id ? { ...i, walletBalance: i.walletBalance + amount } : i));
        }
        addAuditLog('WALLET_CREDITED', 'wallet', id, `Credited ₹${amount.toLocaleString()} to ${type} wallet`);
    }, [addAuditLog]);

    const debitWallet = useCallback((type: 'enterprise' | 'employee' | 'individual', id: string, amount: number) => {
        if (type === 'enterprise') {
            setEnterprises(prev => prev.map(e => e.id === id ? { ...e, walletBalance: Math.max(0, e.walletBalance - amount) } : e));
        } else if (type === 'employee') {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, walletBalance: Math.max(0, e.walletBalance - amount) } : e));
        } else {
            setIndividuals(prev => prev.map(i => i.id === id ? { ...i, walletBalance: Math.max(0, i.walletBalance - amount) } : i));
        }
        addAuditLog('WALLET_DEBITED', 'wallet', id, `Debited ₹${amount.toLocaleString()} from ${type} wallet`);
    }, [addAuditLog]);

    const freezeWallet = useCallback((type: 'enterprise' | 'employee' | 'individual', id: string) => {
        if (type === 'enterprise') {
            setEnterprises(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
        } else if (type === 'employee') {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
        } else {
            setIndividuals(prev => prev.map(i => i.id === id ? { ...i, status: 'suspended' } : i));
        }
        addAuditLog('WALLET_FROZEN', 'wallet', id, `Frozen ${type} wallet`);
    }, [addAuditLog]);

    const unfreezeWallet = useCallback((type: 'enterprise' | 'employee' | 'individual', id: string) => {
        if (type === 'enterprise') {
            setEnterprises(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
        } else if (type === 'employee') {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
        } else {
            setIndividuals(prev => prev.map(i => i.id === id ? { ...i, status: 'active' } : i));
        }
        addAuditLog('WALLET_UNFROZEN', 'wallet', id, `Unfrozen ${type} wallet`);
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
                i.email.toLowerCase().includes(lowerQuery)
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