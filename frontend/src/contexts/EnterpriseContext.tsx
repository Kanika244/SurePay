import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    enterpriseEmployees,
    enterpriseTransactions,
    enterpriseProfile,
    EnterpriseEmployee,
    EnterpriseTransaction,
    EnterpriseProfile,
} from '@/data/enterpriseMockData';

interface EnterpriseContextType {
    profile: EnterpriseProfile;
    employees: EnterpriseEmployee[];
    transactions: EnterpriseTransaction[];
    walletBalance: number;

    // Employee ops
    addEmployee: (emp: Omit<EnterpriseEmployee, 'id' | 'createdAt' | 'lastLogin'>) => void;
    addEmployees: (emps: Omit<EnterpriseEmployee, 'id' | 'createdAt' | 'lastLogin'>[]) => void;
    updateEmployee: (id: string, data: Partial<EnterpriseEmployee>) => void;
    deleteEmployee: (id: string) => void;
    toggleEmployeeStatus: (id: string) => void;

    // Wallet ops
    creditEmployeeWallet: (id: string, amount: number) => void;
    debitEmployeeWallet: (id: string, amount: number) => void;
    freezeEmployeeWallet: (id: string) => void;
    unfreezeEmployeeWallet: (id: string) => void;
    addFunds: (amount: number) => void;
    withdrawFunds: (amount: number) => void;
    allocateFunds: (employeeId: string, amount: number) => void;

    // Profile ops
    updateProfile: (data: Partial<EnterpriseProfile>) => void;
    updatePOC: (data: Partial<EnterpriseProfile['poc']>) => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<EnterpriseProfile>(enterpriseProfile);
    const [employees, setEmployees] = useState<EnterpriseEmployee[]>(enterpriseEmployees);
    const [transactions, setTransactions] = useState<EnterpriseTransaction[]>(enterpriseTransactions);
    const [walletBalance, setWalletBalance] = useState(1245678);

    const addTransaction = (txn: Omit<EnterpriseTransaction, 'id'>) => {
        setTransactions(prev => [{ ...txn, id: `etxn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }, ...prev]);
    };

    const addEmployee = useCallback((emp: Omit<EnterpriseEmployee, 'id' | 'createdAt' | 'lastLogin'>) => {
        const now = new Date().toISOString().split('T')[0];
        const newEmp: EnterpriseEmployee = {
            ...emp,
            id: `eemp-${Date.now()}`,
            createdAt: now,
            lastLogin: 'Never',
        };
        setEmployees(prev => [...prev, newEmp]);
    }, []);

    const addEmployees = useCallback((emps: Omit<EnterpriseEmployee, 'id' | 'createdAt' | 'lastLogin'>[]) => {
        const now = new Date().toISOString().split('T')[0];
        const newEmps = emps.map((emp, i) => ({
            ...emp,
            id: `eemp-${Date.now()}-${i}`,
            createdAt: now,
            lastLogin: 'Never',
        }));
        setEmployees(prev => [...prev, ...newEmps]);
    }, []);

    const updateEmployee = useCallback((id: string, data: Partial<EnterpriseEmployee>) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    }, []);

    const deleteEmployee = useCallback((id: string) => {
        setEmployees(prev => prev.filter(e => e.id !== id));
    }, []);

    const toggleEmployeeStatus = useCallback((id: string) => {
        setEmployees(prev => prev.map(e =>
            e.id === id ? { ...e, status: e.status === 'active' ? 'suspended' : 'active' } : e
        ));
    }, []);

    const creditEmployeeWallet = useCallback((id: string, amount: number) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, walletBalance: e.walletBalance + amount } : e));
        const emp = employees.find(e => e.id === id);
        if (emp) addTransaction({ senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: id, receiverName: `${emp.firstName} ${emp.lastName}`, amount, type: 'credit', status: 'completed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), description: 'Wallet credit by enterprise' });
    }, [employees]);

    const debitEmployeeWallet = useCallback((id: string, amount: number) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, walletBalance: Math.max(0, e.walletBalance - amount) } : e));
    }, []);

    const freezeEmployeeWallet = useCallback((id: string) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
    }, []);

    const unfreezeEmployeeWallet = useCallback((id: string) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
    }, []);

    const addFunds = useCallback((amount: number) => {
        setWalletBalance(prev => prev + amount);
        addTransaction({ senderId: 'external', senderName: 'Bank Transfer', receiverId: 'enterprise', receiverName: 'Acme Technologies', amount, type: 'credit', status: 'completed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), description: 'Funds added to enterprise wallet' });
    }, []);

    const withdrawFunds = useCallback((amount: number) => {
        setWalletBalance(prev => Math.max(0, prev - amount));
        addTransaction({ senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'external', receiverName: 'Bank Transfer', amount, type: 'debit', status: 'completed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), description: 'Funds withdrawn from enterprise wallet' });
    }, []);

    const allocateFunds = useCallback((employeeId: string, amount: number) => {
        setWalletBalance(prev => Math.max(0, prev - amount));
        setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, walletBalance: e.walletBalance + amount } : e));
        const emp = employees.find(e => e.id === employeeId);
        if (emp) addTransaction({ senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: employeeId, receiverName: `${emp.firstName} ${emp.lastName}`, amount, type: 'transfer', status: 'completed', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), description: 'Fund allocation to employee wallet' });
    }, [employees]);

    const updateProfile = useCallback((data: Partial<EnterpriseProfile>) => {
        setProfile(prev => ({ ...prev, ...data }));
    }, []);

    const updatePOC = useCallback((data: Partial<EnterpriseProfile['poc']>) => {
        setProfile(prev => ({ ...prev, poc: { ...prev.poc, ...data } }));
    }, []);

    return (
        <EnterpriseContext.Provider value={{
            profile, employees, transactions, walletBalance,
            addEmployee, addEmployees, updateEmployee, deleteEmployee, toggleEmployeeStatus,
            creditEmployeeWallet, debitEmployeeWallet, freezeEmployeeWallet, unfreezeEmployeeWallet,
            addFunds, withdrawFunds, allocateFunds,
            updateProfile, updatePOC,
        }}>
            {children}
        </EnterpriseContext.Provider>
    );
};

export const useEnterprise = () => {
    const context = useContext(EnterpriseContext);
    if (!context) throw new Error('useEnterprise must be used within an EnterpriseProvider');
    return context;
};