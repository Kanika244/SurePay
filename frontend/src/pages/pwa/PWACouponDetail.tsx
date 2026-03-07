import { motion } from "framer-motion";
import { ArrowLeft, Fuel, Utensils, Hotel, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IssuedCoupon, Merchant, CouponRedemption, couponCategoryLabels, merchantCategoryLabels } from "@/data/couponMockData";
import { cn } from "@/lib/utils";

const categoryConfig = {
  fuel: { icon: Fuel, color: "bg-primary/10 text-primary", gradient: "from-primary/90 to-accent/90" },
  food: { icon: Utensils, color: "bg-accent/10 text-accent", gradient: "from-accent/90 to-primary/90" },
  accommodation: { icon: Hotel, color: "bg-secondary/10 text-secondary", gradient: "from-secondary/90 to-accent/90" },
};

interface Props {
  coupon: IssuedCoupon;
  merchants: Merchant[];          // real merchants from backend
  redemptions: CouponRedemption[]; // real redemptions for this coupon
  onBack: () => void;
}

const PWACouponDetail = ({ coupon, merchants, redemptions, onBack }: Props) => {
  const config = categoryConfig[coupon.couponType];
  const Icon = config.icon;
  const usedPct = coupon.originalValue > 0 ? ((coupon.originalValue - coupon.remainingValue) / coupon.originalValue) * 100 : 0;
  const amountUsed = coupon.originalValue - coupon.remainingValue;

  // Build merchant scope display
  const merchantNames: string[] =
    coupon.merchantRestrictionType === "category" && coupon.merchantCategory
      ? [merchantCategoryLabels[coupon.merchantCategory]]
      : coupon.merchantIds
        .map(id => merchants.find(m => m.id === id)?.name)
        .filter(Boolean) as string[];

  return (
    <div className="px-4 pt-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
        <ArrowLeft size={16} /> Back to Coupons
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Header card */}
        <div className={cn("rounded-xl p-5 text-primary-foreground bg-gradient-to-br", config.gradient)}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-lg font-bold">{couponCategoryLabels[coupon.couponType]} Coupon</p>
              <p className="text-xs opacity-80">{coupon.templateName}</p>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">₹{coupon.remainingValue.toLocaleString()}</div>
          <p className="text-xs opacity-80">remaining of ₹{coupon.originalValue.toLocaleString()}</p>
          <div className="mt-3">
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary-foreground/60 rounded-full transition-all" style={{ width: `${usedPct}%` }} />
            </div>
          </div>
        </div>

        {/* Coupon Info */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Coupon Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Coupon ID</span><span className="font-mono text-xs text-foreground">{coupon.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{couponCategoryLabels[coupon.couponType]}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Issued</span><span className="text-foreground">{coupon.issueDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span className="text-foreground">{coupon.expiryDate}</span></div>
            {coupon.maxPerTransaction && (
              <div className="flex justify-between"><span className="text-muted-foreground">Max per transaction</span><span className="text-foreground">₹{coupon.maxPerTransaction.toLocaleString()}</span></div>
            )}
            {coupon.notes && (
              <div className="flex justify-between"><span className="text-muted-foreground">Note</span><span className="text-foreground text-right max-w-[60%]">{coupon.notes}</span></div>
            )}
          </div>
        </div>

        {/* Value Section */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Value Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Original Value</span><span className="text-foreground">₹{coupon.originalValue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount Used</span><span className="text-foreground">₹{amountUsed.toLocaleString()}</span></div>
            <div className="flex justify-between font-medium"><span className="text-muted-foreground">Remaining</span><span className="text-foreground">₹{coupon.remainingValue.toLocaleString()}</span></div>
          </div>
          <Progress value={usedPct} className="h-2" />
        </div>

        {/* Merchant Scope */}
        {merchantNames.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><MapPin size={14} /> Merchant Scope</h3>
            <div className="flex flex-wrap gap-2">
              {merchantNames.map((name, i) => (
                <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
              ))}
            </div>
            {coupon.merchantRestrictionType === "category" && (
              <p className="text-xs text-muted-foreground">Valid at all {merchantNames[0]} merchants</p>
            )}
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-semibold text-foreground">Coupon Usage History</h3>
          </div>
          {redemptions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No transactions yet</p>
          ) : (
            <div className="divide-y divide-border">
              {redemptions.map(tx => (
                <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.merchantName}</p>
                    <p className="text-xs text-muted-foreground">{tx.redeemedAt}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₹{tx.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PWACouponDetail;
