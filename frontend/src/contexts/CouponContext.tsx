/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from "@/services/config";
import {
  CouponTemplate,
  IssuedCoupon,
  CouponRedemption,
  Merchant,
  MerchantStatus,
  CouponTemplateStatus,
  IssuedCouponStatus,
} from '@/data/couponMockData';

const API = `${API_BASE_URL}/api/enterprise/coupons`;

const getCompanyId = () =>
  typeof window !== 'undefined' ? localStorage.getItem('company_id') : null;

interface CouponContextType {
  templates: CouponTemplate[];
  issuedCoupons: IssuedCoupon[];
  redemptions: CouponRedemption[];
  merchants: Merchant[];
  loading: boolean;

  // Template ops
  addTemplate: (t: Omit<CouponTemplate, 'id' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, data: Partial<CouponTemplate>) => void;
  deleteTemplate: (id: string) => Promise<void>;
  toggleTemplateStatus: (id: string) => Promise<void>;

  // Issuance ops
  issueCoupon: (coupon: Omit<IssuedCoupon, 'id'>) => Promise<void>;
  issueCoupons: (coupons: Omit<IssuedCoupon, 'id'>[]) => Promise<void>;
  cancelCoupon: (id: string) => Promise<void>;
  extendCouponExpiry: (id: string, newDate: string) => Promise<void>;

  // Merchant ops
  addMerchant: (m: Omit<Merchant, 'id' | 'createdAt'>) => Promise<void>;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  toggleMerchantStatus: (id: string) => Promise<void>;

  // Refresh
  refreshAll: () => Promise<void>;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<CouponTemplate[]>([]);
  const [issuedCoupons, setIssuedCoupons] = useState<IssuedCoupon[]>([]);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  const companyId = getCompanyId();

  // ─── Fetch helpers ───────────────────────────────────────

  const fetchMerchants = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/merchants/${companyId}`);
      const data = await res.json();
      if (data.success) setMerchants(data.merchants);
    } catch (err) { console.error('fetchMerchants:', err); }
  }, [companyId]);

  const fetchTemplates = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/templates/${companyId}`);
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch (err) { console.error('fetchTemplates:', err); }
  }, [companyId]);

  const fetchIssued = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/issued/${companyId}`);
      const data = await res.json();
      if (data.success) setIssuedCoupons(data.issued_coupons);
    } catch (err) { console.error('fetchIssued:', err); }
  }, [companyId]);

  const fetchRedemptions = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/redemptions/${companyId}`);
      const data = await res.json();
      if (data.success) setRedemptions(data.redemptions);
    } catch (err) { console.error('fetchRedemptions:', err); }
  }, [companyId]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMerchants(), fetchTemplates(), fetchIssued(), fetchRedemptions()]);
    setLoading(false);
  }, [fetchMerchants, fetchTemplates, fetchIssued, fetchRedemptions]);

  useEffect(() => {
    if (companyId) {
      refreshAll();
    } else {
      setLoading(false);
    }
  }, [companyId, refreshAll]);

  // ─── Template ops ────────────────────────────────────────

  const addTemplate = useCallback(async (t: Omit<CouponTemplate, 'id' | 'createdAt'>) => {
    if (!companyId) return;
    const body = {
      name: t.name,
      couponType: t.couponType,
      description: t.description,
      valueType: t.valueType,
      fixedAmount: t.fixedAmount,
      totalBudget: t.totalBudget,
      maxPerTransaction: t.maxPerTransaction,
      expiryType: t.expiryType,
      expiryDate: t.expiryDate,
      validForDays: t.validForDays,
      merchantRestrictionType: t.merchantRestrictionType,
      merchantIds: t.merchantIds,
      merchantCategory: t.merchantCategory,
      status: t.status,
    };
    try {
      const res = await fetch(`${API}/templates/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.template) {
        setTemplates(prev => [...prev, data.template]);
      }
    } catch (err) { console.error('addTemplate:', err); }
  }, [companyId]);

  const updateTemplate = useCallback((_id: string, _data: Partial<CouponTemplate>) => {
    // Optimistic local update only (full edit UI not yet implemented)
    setTemplates(prev => prev.map(t => t.id === _id ? { ...t, ..._data } : t));
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API}/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) { console.error('deleteTemplate:', err); }
  }, []);

  const toggleTemplateStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API}/templates/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.map(t =>
          t.id === id ? { ...t, status: data.new_status as CouponTemplateStatus } : t
        ));
      }
    } catch (err) { console.error('toggleTemplateStatus:', err); }
  }, []);

  // ─── Issuance ops ────────────────────────────────────────

  const issueCoupon = useCallback(async (coupon: Omit<IssuedCoupon, 'id'>) => {
    await issueCoupons([coupon]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const issueCoupons = useCallback(async (coupons: Omit<IssuedCoupon, 'id'>[]) => {
    if (!companyId) return;
    try {
      const res = await fetch(`${API}/issued/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupons }),
      });
      const data = await res.json();
      if (data.success && data.issued_coupons) {
        setIssuedCoupons(prev => [...prev, ...data.issued_coupons]);
      }
    } catch (err) { console.error('issueCoupons:', err); }
  }, [companyId]);

  const cancelCoupon = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API}/issued/${id}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setIssuedCoupons(prev => prev.map(c =>
          c.id === id ? { ...c, status: 'cancelled' as IssuedCouponStatus } : c
        ));
      }
    } catch (err) { console.error('cancelCoupon:', err); }
  }, []);

  const extendCouponExpiry = useCallback(async (id: string, newDate: string) => {
    try {
      const res = await fetch(`${API}/issued/${id}/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newExpiryDate: newDate }),
      });
      const data = await res.json();
      if (data.success) {
        setIssuedCoupons(prev => prev.map(c =>
          c.id === id ? { ...c, expiryDate: newDate } : c
        ));
      }
    } catch (err) { console.error('extendCouponExpiry:', err); }
  }, []);

  // ─── Merchant ops ─────────────────────────────────────────

  const addMerchant = useCallback(async (m: Omit<Merchant, 'id' | 'createdAt'>) => {
    if (!companyId) return;
    const body = {
      name: m.name,
      category: m.category,
      merchantId: m.merchantId,
      location: m.location,
      contactInfo: m.contactInfo,
      status: m.status,
    };
    try {
      const res = await fetch(`${API}/merchants/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.merchant) {
        setMerchants(prev => [...prev, data.merchant]);
      }
    } catch (err) { console.error('addMerchant:', err); }
  }, [companyId]);

  const updateMerchant = useCallback((_id: string, _data: Partial<Merchant>) => {
    setMerchants(prev => prev.map(m => m.id === _id ? { ...m, ..._data } : m));
  }, []);

  const toggleMerchantStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API}/merchants/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setMerchants(prev => prev.map(m =>
          m.id === id ? { ...m, status: data.new_status as MerchantStatus } : m
        ));
      }
    } catch (err) { console.error('toggleMerchantStatus:', err); }
  }, []);

  return (
    <CouponContext.Provider value={{
      templates, issuedCoupons, redemptions, merchants, loading,
      addTemplate, updateTemplate, deleteTemplate, toggleTemplateStatus,
      issueCoupon, issueCoupons, cancelCoupon, extendCouponExpiry,
      addMerchant, updateMerchant, toggleMerchantStatus,
      refreshAll,
    }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupons = () => {
  const context = useContext(CouponContext);
  if (!context) throw new Error('useCoupons must be used within CouponProvider');
  return context;
};
