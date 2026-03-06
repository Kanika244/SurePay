import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  couponTemplates as mockTemplates,
  issuedCoupons as mockIssued,
  couponRedemptions as mockRedemptions,
  merchants as mockMerchants,
  CouponTemplate,
  IssuedCoupon,
  CouponRedemption,
  Merchant,
  MerchantStatus,
  CouponTemplateStatus,
  IssuedCouponStatus,
} from '@/data/couponMockData';

interface CouponContextType {
  templates: CouponTemplate[];
  issuedCoupons: IssuedCoupon[];
  redemptions: CouponRedemption[];
  merchants: Merchant[];

  // Template ops
  addTemplate: (t: Omit<CouponTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, data: Partial<CouponTemplate>) => void;
  deleteTemplate: (id: string) => void;
  toggleTemplateStatus: (id: string) => void;

  // Issuance ops
  issueCoupon: (coupon: Omit<IssuedCoupon, 'id'>) => void;
  issueCoupons: (coupons: Omit<IssuedCoupon, 'id'>[]) => void;
  cancelCoupon: (id: string) => void;
  extendCouponExpiry: (id: string, newDate: string) => void;

  // Merchant ops
  addMerchant: (m: Omit<Merchant, 'id' | 'createdAt'>) => void;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  toggleMerchantStatus: (id: string) => void;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<CouponTemplate[]>(mockTemplates);
  const [issuedCoupons, setIssuedCoupons] = useState<IssuedCoupon[]>(mockIssued);
  const [redemptions] = useState<CouponRedemption[]>(mockRedemptions);
  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants);

  const addTemplate = useCallback((t: Omit<CouponTemplate, 'id' | 'createdAt'>) => {
    setTemplates(prev => [...prev, { ...t, id: `ctpl-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }]);
  }, []);

  const updateTemplate = useCallback((id: string, data: Partial<CouponTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTemplateStatus = useCallback((id: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, status: (t.status === 'active' ? 'inactive' : 'active') as CouponTemplateStatus } : t
    ));
  }, []);

  const issueCoupon = useCallback((coupon: Omit<IssuedCoupon, 'id'>) => {
    setIssuedCoupons(prev => [...prev, { ...coupon, id: `cpn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }]);
  }, []);

  const issueCoupons = useCallback((coupons: Omit<IssuedCoupon, 'id'>[]) => {
    const newCoupons = coupons.map((c, i) => ({ ...c, id: `cpn-${Date.now()}-${i}` }));
    setIssuedCoupons(prev => [...prev, ...newCoupons]);
  }, []);

  const cancelCoupon = useCallback((id: string) => {
    setIssuedCoupons(prev => prev.map(c => c.id === id ? { ...c, status: 'cancelled' as IssuedCouponStatus } : c));
  }, []);

  const extendCouponExpiry = useCallback((id: string, newDate: string) => {
    setIssuedCoupons(prev => prev.map(c => c.id === id ? { ...c, expiryDate: newDate } : c));
  }, []);

  const addMerchant = useCallback((m: Omit<Merchant, 'id' | 'createdAt'>) => {
    setMerchants(prev => [...prev, { ...m, id: `merch-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }]);
  }, []);

  const updateMerchant = useCallback((id: string, data: Partial<Merchant>) => {
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, []);

  const toggleMerchantStatus = useCallback((id: string) => {
    setMerchants(prev => prev.map(m =>
      m.id === id ? { ...m, status: (m.status === 'active' ? 'disabled' : 'active') as MerchantStatus } : m
    ));
  }, []);

  return (
    <CouponContext.Provider value={{
      templates, issuedCoupons, redemptions, merchants,
      addTemplate, updateTemplate, deleteTemplate, toggleTemplateStatus,
      issueCoupon, issueCoupons, cancelCoupon, extendCouponExpiry,
      addMerchant, updateMerchant, toggleMerchantStatus,
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
