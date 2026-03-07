import { useState } from "react";
import { Ticket, X, Check, Fuel, Utensils, Hotel, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssuedCoupon, couponCategoryLabels, merchantCategoryLabels } from "@/data/couponMockData";
import { cn } from "@/lib/utils";

const categoryIcons = {
  fuel: Fuel,
  food: Utensils,
  accommodation: Hotel,
};

const categoryColors = {
  fuel: "bg-primary/10 text-primary",
  food: "bg-accent/10 text-accent",
  accommodation: "bg-secondary/10 text-secondary",
};

export interface CouponSelectorProps {
  coupons: IssuedCoupon[];
  selectedCoupon: IssuedCoupon | null;
  onSelect: (coupon: IssuedCoupon | null) => void;
  amount: number;
  /** The merchant/payment category for this transaction (food | fuel | accommodation) */
  paymentCategory?: string;
}

const CouponSelector = ({ coupons, selectedCoupon, onSelect, amount, paymentCategory }: CouponSelectorProps) => {
  const [expanded, setExpanded] = useState(false);

  // Filter: only valid (active/partially-used, not expired, has balance)
  const validCoupons = coupons.filter(c =>
    (c.status === "active" || c.status === "partially_used") &&
    c.remainingValue > 0 &&
    new Date(c.expiryDate) > new Date()
  );

  // Filter by payment category if one is selected
  const applicableCoupons = validCoupons.filter(c => {
    if (!paymentCategory) return false; // no category chosen — hide coupons
    return c.couponType === paymentCategory;
  });

  const getMerchantScope = (c: IssuedCoupon) => {
    if (c.merchantRestrictionType === "category" && c.merchantCategory)
      return merchantCategoryLabels[c.merchantCategory] || c.merchantCategory;
    return `${c.merchantIds.length} specific merchant(s)`;
  };

  // If no payment category selected but there ARE valid coupons, hint the user
  if (!paymentCategory && validCoupons.length > 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5">
        <Ticket size={14} className="shrink-0" />
        <span>Select a payment category above to apply a coupon</span>
      </div>
    );
  }

  if (applicableCoupons.length === 0) {
    // Has category but no matching coupons
    if (paymentCategory && validCoupons.length > 0) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0 text-amber-500" />
          <span>No <strong>{couponCategoryLabels[paymentCategory]}</strong> coupons available for this transaction</span>
        </div>
      );
    }
    return null;
  }

  // A coupon is already selected — show the applied state
  if (selectedCoupon) {
    const Icon = categoryIcons[selectedCoupon.couponType];
    const deduction = Math.min(amount, selectedCoupon.remainingValue, selectedCoupon.maxPerTransaction || Infinity);
    const remaining = selectedCoupon.remainingValue - deduction;

    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-green-500" />
            <span className="text-sm font-medium text-foreground">Coupon Applied</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive" onClick={() => onSelect(null)}>
            <X size={12} className="mr-1" /> Remove
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", categoryColors[selectedCoupon.couponType])}>
            {Icon && <Icon size={16} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{selectedCoupon.templateName}</p>
            <p className="text-xs text-muted-foreground">
              Saves ₹{deduction.toLocaleString()} · ₹{remaining.toLocaleString()} left after use
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-primary"
      >
        <Ticket size={16} />
        Apply {couponCategoryLabels[paymentCategory!]} Coupon ({applicableCoupons.length} available)
      </button>

      {expanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {applicableCoupons.map(coupon => {
            const Icon = categoryIcons[coupon.couponType];
            const applicableAmount = Math.min(amount, coupon.remainingValue, coupon.maxPerTransaction || Infinity);

            return (
              <button
                key={coupon.id}
                onClick={() => { onSelect(coupon); setExpanded(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", categoryColors[coupon.couponType])}>
                  {Icon && <Icon size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{coupon.templateName}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{coupon.remainingValue.toLocaleString()} balance · {getMerchantScope(coupon)}
                    {coupon.maxPerTransaction && ` · max ₹${coupon.maxPerTransaction.toLocaleString()}/txn`}
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-600 shrink-0">-₹{applicableAmount.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CouponSelector;
