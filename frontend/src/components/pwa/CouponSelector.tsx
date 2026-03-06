import { useState } from "react";
import { Ticket, X, Check, Fuel, Utensils, Hotel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssuedCoupon, couponCategoryLabels, merchants as allMerchants, merchantCategoryLabels } from "@/data/couponMockData";
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

interface CouponSelectorProps {
  coupons: IssuedCoupon[];
  selectedCoupon: IssuedCoupon | null;
  onSelect: (coupon: IssuedCoupon | null) => void;
  amount: number;
  recipientId?: string;
}

const CouponSelector = ({ coupons, selectedCoupon, onSelect, amount }: CouponSelectorProps) => {
  const [expanded, setExpanded] = useState(false);

  // Filter valid coupons
  const validCoupons = coupons.filter(c =>
    (c.status === "active" || c.status === "partially_used") &&
    c.remainingValue > 0 &&
    new Date(c.expiryDate) > new Date()
  );

  if (validCoupons.length === 0) return null;

  const getMerchantScope = (c: IssuedCoupon) => {
    if (c.merchantRestrictionType === "category" && c.merchantCategory)
      return merchantCategoryLabels[c.merchantCategory];
    const names = c.merchantIds.map(id => allMerchants.find(m => m.id === id)?.name).filter(Boolean);
    return names.join(", ");
  };

  if (selectedCoupon) {
    const Icon = categoryIcons[selectedCoupon.couponType];
    const deduction = Math.min(amount, selectedCoupon.remainingValue, selectedCoupon.maxPerTransaction || Infinity);
    const remaining = selectedCoupon.remainingValue - deduction;

    return (
      <div className="bg-mint/5 border border-mint/20 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-mint" />
            <span className="text-sm font-medium text-foreground">Coupon Applied</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onSelect(null)}>
            <X size={12} className="mr-1" /> Remove
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", categoryColors[selectedCoupon.couponType])}>
            <Icon size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{couponCategoryLabels[selectedCoupon.couponType]} Coupon</p>
            <p className="text-xs text-muted-foreground">Deduction: ₹{deduction.toLocaleString()} · Remaining: ₹{remaining.toLocaleString()}</p>
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
        Apply Coupon ({validCoupons.length} available)
      </button>

      {expanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {validCoupons.map(coupon => {
            const Icon = categoryIcons[coupon.couponType];
            const applicableAmount = Math.min(amount, coupon.remainingValue, coupon.maxPerTransaction || Infinity);

            return (
              <button
                key={coupon.id}
                onClick={() => { onSelect(coupon); setExpanded(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", categoryColors[coupon.couponType])}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{couponCategoryLabels[coupon.couponType]} Coupon</p>
                  <p className="text-xs text-muted-foreground">₹{coupon.remainingValue.toLocaleString()} remaining · {getMerchantScope(coupon)}</p>
                </div>
                <span className="text-xs font-medium text-primary shrink-0">-₹{applicableAmount.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CouponSelector;
