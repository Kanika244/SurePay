// Coupon System Mock Data

export type CouponCategory = 'fuel' | 'food' | 'accommodation';
export type CouponValueType = 'fixed' | 'budget';
export type CouponExpiryType = 'fixed_date' | 'duration';
export type MerchantRestrictionType = 'specific' | 'list' | 'category';
export type CouponTemplateStatus = 'active' | 'inactive';
export type IssuedCouponStatus = 'active' | 'partially_used' | 'fully_redeemed' | 'expired' | 'cancelled';
export type MerchantCategory = 'fuel_station' | 'restaurant' | 'hotel';
export type MerchantStatus = 'active' | 'disabled';

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  merchantId: string;
  location: string;
  contactInfo?: string;
  status: MerchantStatus;
  createdAt: string;
}

export interface CouponTemplate {
  id: string;
  name: string;
  couponType: CouponCategory;
  description?: string;
  valueType: CouponValueType;
  fixedAmount?: number;
  totalBudget?: number;
  maxPerTransaction?: number;
  expiryType: CouponExpiryType;
  expiryDate?: string;
  validForDays?: number;
  merchantRestrictionType: MerchantRestrictionType;
  merchantIds: string[];
  merchantCategory?: MerchantCategory;
  status: CouponTemplateStatus;
  createdAt: string;
}

export interface IssuedCoupon {
  id: string;
  companyId?: string;            // set by backend — needed for redemption recording
  templateId: string;
  templateName: string;
  employeeId: string;
  employeeName: string;
  couponType: CouponCategory;
  originalValue: number;
  remainingValue: number;
  maxPerTransaction?: number;
  merchantRestrictionType: MerchantRestrictionType;
  merchantIds: string[];
  merchantCategory?: MerchantCategory;
  issueDate: string;
  expiryDate: string;
  status: IssuedCouponStatus;
  notes?: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  employeeId: string;
  employeeName: string;
  couponType: CouponCategory;
  amount: number;
  merchantId: string;
  merchantName: string;
  redeemedAt: string;
}

export const merchants: Merchant[] = [
  { id: 'merch-001', name: 'Indian Oil - Whitefield', category: 'fuel_station', merchantId: 'IOCL-BLR-001', location: 'Whitefield, Bangalore', contactInfo: '+91 80 4567 1234', status: 'active', createdAt: '2024-01-10' },
  { id: 'merch-002', name: 'HP Petrol Pump - MG Road', category: 'fuel_station', merchantId: 'HPCL-BLR-002', location: 'MG Road, Bangalore', status: 'active', createdAt: '2024-01-10' },
  { id: 'merch-003', name: 'BPCL Station - Electronic City', category: 'fuel_station', merchantId: 'BPCL-BLR-003', location: 'Electronic City, Bangalore', status: 'active', createdAt: '2024-01-15' },
  { id: 'merch-004', name: 'Swiggy Corporate', category: 'restaurant', merchantId: 'SWIG-CORP-001', location: 'Pan India', contactInfo: 'corporate@swiggy.in', status: 'active', createdAt: '2024-01-12' },
  { id: 'merch-005', name: 'Zomato Business', category: 'restaurant', merchantId: 'ZOM-BIZ-001', location: 'Pan India', status: 'active', createdAt: '2024-01-12' },
  { id: 'merch-006', name: 'Dominos Pizza', category: 'restaurant', merchantId: 'DOM-IND-001', location: 'Pan India', status: 'active', createdAt: '2024-02-01' },
  { id: 'merch-007', name: 'Taj Hotels', category: 'hotel', merchantId: 'TAJ-IND-001', location: 'Pan India', contactInfo: 'corp@tajhotels.com', status: 'active', createdAt: '2024-01-20' },
  { id: 'merch-008', name: 'OYO Rooms Corporate', category: 'hotel', merchantId: 'OYO-CORP-001', location: 'Pan India', status: 'active', createdAt: '2024-01-20' },
  { id: 'merch-009', name: 'ITC Hotels', category: 'hotel', merchantId: 'ITC-IND-001', location: 'Pan India', status: 'disabled', createdAt: '2024-02-05' },
];

export const couponTemplates: CouponTemplate[] = [
  {
    id: 'ctpl-001', name: 'Monthly Fuel Allowance', couponType: 'fuel', description: 'Monthly fuel allowance for field employees',
    valueType: 'budget', totalBudget: 5000, maxPerTransaction: 2000,
    expiryType: 'duration', validForDays: 30,
    merchantRestrictionType: 'category', merchantIds: [], merchantCategory: 'fuel_station',
    status: 'active', createdAt: '2024-01-15',
  },
  {
    id: 'ctpl-002', name: 'Meal Voucher ₹500', couponType: 'food', description: 'Single-use meal voucher',
    valueType: 'fixed', fixedAmount: 500,
    expiryType: 'duration', validForDays: 7,
    merchantRestrictionType: 'list', merchantIds: ['merch-004', 'merch-005', 'merch-006'], merchantCategory: undefined,
    status: 'active', createdAt: '2024-02-01',
  },
  {
    id: 'ctpl-003', name: 'Travel Stay Coupon', couponType: 'accommodation', description: 'Hotel stay allowance for business travel',
    valueType: 'fixed', fixedAmount: 8000,
    expiryType: 'fixed_date', expiryDate: '2024-12-31',
    merchantRestrictionType: 'list', merchantIds: ['merch-007', 'merch-008'], merchantCategory: undefined,
    status: 'active', createdAt: '2024-02-10',
  },
  {
    id: 'ctpl-004', name: 'Food Budget Q2', couponType: 'food', description: 'Quarterly food budget',
    valueType: 'budget', totalBudget: 15000, maxPerTransaction: 1000,
    expiryType: 'fixed_date', expiryDate: '2024-06-30',
    merchantRestrictionType: 'category', merchantIds: [], merchantCategory: 'restaurant',
    status: 'inactive', createdAt: '2024-03-01',
  },
];

export const issuedCoupons: IssuedCoupon[] = [
  { id: 'cpn-001', templateId: 'ctpl-001', templateName: 'Monthly Fuel Allowance', employeeId: 'eemp-001', employeeName: 'Rahul Verma', couponType: 'fuel', originalValue: 5000, remainingValue: 3200, maxPerTransaction: 2000, merchantRestrictionType: 'category', merchantIds: [], merchantCategory: 'fuel_station', issueDate: '2024-04-01', expiryDate: '2024-05-01', status: 'partially_used' },
  { id: 'cpn-002', templateId: 'ctpl-002', templateName: 'Meal Voucher ₹500', employeeId: 'eemp-002', employeeName: 'Sneha Gupta', couponType: 'food', originalValue: 500, remainingValue: 500, merchantRestrictionType: 'list', merchantIds: ['merch-004', 'merch-005', 'merch-006'], issueDate: '2024-04-01', expiryDate: '2024-04-08', status: 'active' },
  { id: 'cpn-003', templateId: 'ctpl-003', templateName: 'Travel Stay Coupon', employeeId: 'eemp-004', employeeName: 'Vikram Patel', couponType: 'accommodation', originalValue: 8000, remainingValue: 0, merchantRestrictionType: 'list', merchantIds: ['merch-007', 'merch-008'], issueDate: '2024-03-15', expiryDate: '2024-12-31', status: 'fully_redeemed' },
  { id: 'cpn-004', templateId: 'ctpl-001', templateName: 'Monthly Fuel Allowance', employeeId: 'eemp-006', employeeName: 'Deepak Nair', couponType: 'fuel', originalValue: 5000, remainingValue: 5000, maxPerTransaction: 2000, merchantRestrictionType: 'category', merchantIds: [], merchantCategory: 'fuel_station', issueDate: '2024-03-01', expiryDate: '2024-03-31', status: 'expired' },
  { id: 'cpn-005', templateId: 'ctpl-002', templateName: 'Meal Voucher ₹500', employeeId: 'eemp-005', employeeName: 'Priya Sharma', couponType: 'food', originalValue: 500, remainingValue: 0, merchantRestrictionType: 'list', merchantIds: ['merch-004', 'merch-005', 'merch-006'], issueDate: '2024-03-20', expiryDate: '2024-03-27', status: 'fully_redeemed' },
  { id: 'cpn-006', templateId: 'ctpl-001', templateName: 'Monthly Fuel Allowance', employeeId: 'eemp-004', employeeName: 'Vikram Patel', couponType: 'fuel', originalValue: 5000, remainingValue: 1500, maxPerTransaction: 2000, merchantRestrictionType: 'category', merchantIds: [], merchantCategory: 'fuel_station', issueDate: '2024-04-01', expiryDate: '2024-05-01', status: 'partially_used' },
  { id: 'cpn-007', templateId: 'ctpl-003', templateName: 'Travel Stay Coupon', employeeId: 'eemp-002', employeeName: 'Sneha Gupta', couponType: 'accommodation', originalValue: 8000, remainingValue: 8000, merchantRestrictionType: 'list', merchantIds: ['merch-007', 'merch-008'], issueDate: '2024-04-01', expiryDate: '2024-12-31', status: 'active' },
  { id: 'cpn-008', templateId: 'ctpl-002', templateName: 'Meal Voucher ₹500', employeeId: 'eemp-001', employeeName: 'Rahul Verma', couponType: 'food', originalValue: 500, remainingValue: 200, merchantRestrictionType: 'list', merchantIds: ['merch-004', 'merch-005', 'merch-006'], issueDate: '2024-04-02', expiryDate: '2024-04-09', status: 'partially_used' },
];

export const couponRedemptions: CouponRedemption[] = [
  { id: 'rdm-001', couponId: 'cpn-001', employeeId: 'eemp-001', employeeName: 'Rahul Verma', couponType: 'fuel', amount: 1800, merchantId: 'merch-001', merchantName: 'Indian Oil - Whitefield', redeemedAt: '2024-04-05 09:30:00' },
  { id: 'rdm-002', couponId: 'cpn-003', employeeId: 'eemp-004', employeeName: 'Vikram Patel', couponType: 'accommodation', amount: 8000, merchantId: 'merch-007', merchantName: 'Taj Hotels', redeemedAt: '2024-03-20 14:00:00' },
  { id: 'rdm-003', couponId: 'cpn-005', employeeId: 'eemp-005', employeeName: 'Priya Sharma', couponType: 'food', amount: 500, merchantId: 'merch-004', merchantName: 'Swiggy Corporate', redeemedAt: '2024-03-22 13:15:00' },
  { id: 'rdm-004', couponId: 'cpn-006', employeeId: 'eemp-004', employeeName: 'Vikram Patel', couponType: 'fuel', amount: 1500, merchantId: 'merch-002', merchantName: 'HP Petrol Pump - MG Road', redeemedAt: '2024-04-08 18:00:00' },
  { id: 'rdm-005', couponId: 'cpn-006', employeeId: 'eemp-004', employeeName: 'Vikram Patel', couponType: 'fuel', amount: 2000, merchantId: 'merch-003', merchantName: 'BPCL Station - Electronic City', redeemedAt: '2024-04-12 10:30:00' },
  { id: 'rdm-006', couponId: 'cpn-008', employeeId: 'eemp-001', employeeName: 'Rahul Verma', couponType: 'food', amount: 300, merchantId: 'merch-005', merchantName: 'Zomato Business', redeemedAt: '2024-04-03 12:45:00' },
];

export const merchantCategoryLabels: Record<MerchantCategory, string> = {
  fuel_station: 'Fuel Station',
  restaurant: 'Restaurant',
  hotel: 'Hotel / Accommodation',
};

export const couponCategoryLabels: Record<CouponCategory, string> = {
  fuel: 'Fuel',
  food: 'Food',
  accommodation: 'Accommodation',
};

export const couponStatusLabels: Record<IssuedCouponStatus, string> = {
  active: 'Active',
  partially_used: 'Partially Used',
  fully_redeemed: 'Fully Redeemed',
  expired: 'Expired',
  cancelled: 'Cancelled',
};
