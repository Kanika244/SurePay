import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    EnterpriseEmployee,
    EnterpriseTransaction,
    EnterpriseProfile,
} from '@/data/enterpriseMockData';

const API = 'http://localhost:8000/api/enterprise-panel';

// Empty default profile — real data comes from the backend
const emptyProfile: EnterpriseProfile = {
    companyName: typeof window !== 'undefined' ? (localStorage.getItem('company_name') || '') : '',
    registrationNumber: '',
    gstNumber: '',
    businessType: '',
    industry: '',
    website: '',
    registeredAddress: '',
    documents: [],
    poc: { name: '', email: '', phone: '', designation: '', kycDocuments: [], status: 'pending' },
};

interface EnterpriseContextType {
    profile: EnterpriseProfile;
    employees: EnterpriseEmployee[];
    transactions: EnterpriseTransaction[];
    walletBalance: number;
    loading: boolean;
    companyId: string | null;

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

    // Refresh
    refreshData: () => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

// Helper: convert frontend camelCase employee to backend snake_case
function empToBackend(emp: any) {
    return {
        employee_id: emp.employeeId || '',
        first_name: emp.firstName || '',
        last_name: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        date_of_birth: emp.dateOfBirth || '',
        gender: emp.gender || 'Other',
        department: emp.department || '',
        designation: emp.designation || '',
        role: emp.role || 'Employee',
        date_of_joining: emp.dateOfJoining || '',
        employment_type: emp.employmentType || 'Full-time',
        gov_id_type: emp.govIdType || '',
        gov_id_number: emp.govIdNumber || '',
        wallet_balance: emp.walletBalance || 0,
        spending_limit: emp.spendingLimit || 50000,
        salary_band: emp.salaryBand || '',
        two_factor_enabled: emp.twoFactorEnabled || false,
    };
}

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<EnterpriseProfile>(emptyProfile);
    const [employees, setEmployees] = useState<EnterpriseEmployee[]>([]);
    const [transactions, setTransactions] = useState<EnterpriseTransaction[]>([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Get company ID from localStorage (set during enterprise login)
    const companyId = typeof window !== 'undefined'
        ? localStorage.getItem('company_id') || new URLSearchParams(window.location.search).get('companyId')
        : null;

    // ==================== FETCH DATA ====================

    const fetchEmployees = useCallback(async () => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/employees/${companyId}`);
            const data = await res.json();
            if (data.success) setEmployees(data.employees);
        } catch (err) { console.error('Failed to fetch employees:', err); }
    }, [companyId]);

    const fetchTransactions = useCallback(async () => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/transactions/${companyId}`);
            const data = await res.json();
            if (data.success) setTransactions(data.transactions);
        } catch (err) { console.error('Failed to fetch transactions:', err); }
    }, [companyId]);

    const fetchWallet = useCallback(async () => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/wallet/${companyId}`);
            const data = await res.json();
            if (data.success) setWalletBalance(data.balance);
        } catch (err) { console.error('Failed to fetch wallet:', err); }
    }, [companyId]);

    const fetchProfile = useCallback(async () => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/profile/${companyId}`);
            const data = await res.json();
            if (data.success && data.profile) {
                setProfile(prev => ({ ...prev, ...data.profile }));
            }
        } catch (err) { console.error('Failed to fetch profile:', err); }
    }, [companyId]);

    const refreshData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchEmployees(), fetchTransactions(), fetchWallet(), fetchProfile()]);
        setLoading(false);
    }, [fetchEmployees, fetchTransactions, fetchWallet, fetchProfile]);

    useEffect(() => {
        if (companyId) {
            refreshData();
        } else {
            setLoading(false);
        }
    }, [companyId, refreshData]);

    // ==================== EMPLOYEE OPS ====================

    const addEmployee = useCallback(async (emp: Omit<EnterpriseEmployee, 'id' | 'createdAt' | 'lastLogin'>) => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/employees/${companyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empToBackend(emp)),
            });
            const data = await res.json();
            if (data.success && data.employee) {
                setEmployees(prev => [...prev, data.employee]);
            }
        } catch (err) { console.error('Failed to add employee:', err); }
    }, [companyId]);

    const addEmployees = useCallback(async (emps: Omit<EnterpriseEmployee, 'id' | 'createdAt' | 'lastLogin'>[]) => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/employees/${companyId}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees: emps.map(empToBackend) }),
            });
            const data = await res.json();
            if (data.success && data.employees) {
                setEmployees(prev => [...prev, ...data.employees]);
            }
        } catch (err) { console.error('Failed to bulk add employees:', err); }
    }, [companyId]);

    const updateEmployee = useCallback(async (id: string, updates: Partial<EnterpriseEmployee>) => {
        try {
            const backendUpdates: Record<string, any> = {};
            const mapping: Record<string, string> = {
                firstName: 'first_name', lastName: 'last_name', email: 'email',
                phone: 'phone', dateOfBirth: 'date_of_birth', gender: 'gender',
                department: 'department', designation: 'designation', role: 'role',
                employmentType: 'employment_type', govIdType: 'gov_id_type',
                govIdNumber: 'gov_id_number', spendingLimit: 'spending_limit',
                salaryBand: 'salary_band', twoFactorEnabled: 'two_factor_enabled',
            };
            for (const [feKey, beKey] of Object.entries(mapping)) {
                if ((updates as any)[feKey] !== undefined) {
                    backendUpdates[beKey] = (updates as any)[feKey];
                }
            }
            const res = await fetch(`${API}/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendUpdates),
            });
            const data = await res.json();
            if (data.success && data.employee) {
                setEmployees(prev => prev.map(e => e.id === id ? data.employee : e));
            }
        } catch (err) { console.error('Failed to update employee:', err); }
    }, []);

    const deleteEmployee = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API}/employees/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => prev.filter(e => e.id !== id));
            }
        } catch (err) { console.error('Failed to delete employee:', err); }
    }, []);

    const toggleEmployeeStatus = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API}/employees/${id}/toggle-status`, { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => prev.map(e =>
                    e.id === id ? { ...e, status: data.new_status } : e
                ));
            }
        } catch (err) { console.error('Failed to toggle status:', err); }
    }, []);

    // ==================== EMPLOYEE WALLET OPS ====================

    const creditEmployeeWallet = useCallback(async (id: string, amount: number) => {
        try {
            const res = await fetch(`${API}/employees/${id}/wallet/credit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description: 'Wallet credit by enterprise' }),
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => prev.map(e =>
                    e.id === id ? { ...e, walletBalance: data.new_balance } : e
                ));
                fetchTransactions();
            }
        } catch (err) { console.error('Failed to credit wallet:', err); }
    }, [fetchTransactions]);

    const debitEmployeeWallet = useCallback(async (id: string, amount: number) => {
        try {
            const res = await fetch(`${API}/employees/${id}/wallet/debit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => prev.map(e =>
                    e.id === id ? { ...e, walletBalance: data.new_balance } : e
                ));
            }
        } catch (err) { console.error('Failed to debit wallet:', err); }
    }, []);

    const freezeEmployeeWallet = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API}/employees/${id}/wallet/freeze`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => prev.map(e =>
                    e.id === id ? { ...e, status: 'suspended' } : e
                ));
            }
        } catch (err) { console.error('Failed to freeze wallet:', err); }
    }, []);

    const unfreezeEmployeeWallet = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API}/employees/${id}/wallet/unfreeze`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => prev.map(e =>
                    e.id === id ? { ...e, status: 'active' } : e
                ));
            }
        } catch (err) { console.error('Failed to unfreeze wallet:', err); }
    }, []);

    // ==================== ENTERPRISE WALLET OPS ====================

    const addFunds = useCallback(async (amount: number) => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/wallet/${companyId}/add-funds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description: 'Funds added to enterprise wallet' }),
            });
            const data = await res.json();
            if (data.success) {
                setWalletBalance(data.new_balance);
                fetchTransactions();
            }
        } catch (err) { console.error('Failed to add funds:', err); }
    }, [companyId, fetchTransactions]);

    const withdrawFunds = useCallback(async (amount: number) => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/wallet/${companyId}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description: 'Funds withdrawn from enterprise wallet' }),
            });
            const data = await res.json();
            if (data.success) {
                setWalletBalance(data.new_balance);
                fetchTransactions();
            }
        } catch (err) { console.error('Failed to withdraw funds:', err); }
    }, [companyId, fetchTransactions]);

    const allocateFunds = useCallback(async (employeeId: string, amount: number) => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/wallet/${companyId}/allocate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, amount }),
            });
            const data = await res.json();
            if (data.success) {
                setWalletBalance(data.enterprise_balance);
                setEmployees(prev => prev.map(e =>
                    e.id === employeeId ? { ...e, walletBalance: data.employee_balance } : e
                ));
                fetchTransactions();
            }
        } catch (err) { console.error('Failed to allocate funds:', err); }
    }, [companyId, fetchTransactions]);

    // ==================== PROFILE OPS ====================

    const updateProfileFn = useCallback(async (data: Partial<EnterpriseProfile>) => {
        if (!companyId) return;
        setProfile(prev => ({ ...prev, ...data }));
        try {
            const backendData: Record<string, any> = {};
            const mapping: Record<string, string> = {
                companyName: 'company_name', registrationNumber: 'registration_number',
                gstNumber: 'gst_number', businessType: 'business_type',
                industry: 'industry', website: 'website', registeredAddress: 'registered_address',
            };
            for (const [feKey, beKey] of Object.entries(mapping)) {
                if ((data as any)[feKey] !== undefined) {
                    backendData[beKey] = (data as any)[feKey];
                }
            }
            if (Object.keys(backendData).length > 0) {
                await fetch(`${API}/profile/${companyId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backendData),
                });
            }
        } catch (err) { console.error('Failed to update profile:', err); }
    }, [companyId]);

    const updatePOC = useCallback(async (data: Partial<EnterpriseProfile['poc']>) => {
        if (!companyId) return;
        setProfile(prev => ({ ...prev, poc: { ...prev.poc, ...data } }));
        try {
            await fetch(`${API}/profile/${companyId}/poc`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (err) { console.error('Failed to update POC:', err); }
    }, [companyId]);

    return (
        <EnterpriseContext.Provider value={{
            profile, employees, transactions, walletBalance, loading, companyId,
            addEmployee, addEmployees, updateEmployee, deleteEmployee, toggleEmployeeStatus,
            creditEmployeeWallet, debitEmployeeWallet, freezeEmployeeWallet, unfreezeEmployeeWallet,
            addFunds, withdrawFunds, allocateFunds,
            updateProfile: updateProfileFn, updatePOC,
            refreshData,
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