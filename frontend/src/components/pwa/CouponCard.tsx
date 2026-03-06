import { Fuel, Utensils, Hotel, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IssuedCoupon, couponCategoryLabels, merchants as allMerchants, merchantCategoryLabels } from "@/data/couponMockData";
import { cn } from "@/lib/utils";

const categoryConfig = {
  fuel: { icon: Fuel, color: "bg-primary/10 text-primary" },
  food: { icon: Utensils, color: "bg-accent/10 text-accent" },
  accommodation: { icon: Hotel, color: "bg-secondary/10 text-secondary" },
};

interface CouponCardProps {
  coupon: IssuedCoupon;
  compact?: boolean;
  onClick?: () => void;
}

const getStatusStyle = (status: IssuedCoupon["status"]) => {
  switch (status) {
    case "active": return "bg-mint/10 text-mint border-mint/20";
    case "partially_used": return "bg-secondary/10 text-secondary border-secondary/20";
    case "fully_redeemed": return "bg-muted text-muted-foreground border-border";
    case "expired": return "bg-destructive/10 text-destructive border-destructive/20";
    case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const statusLabels: Record<string, string> = {
  active: "Active",
  partially_used: "Partially Used",
  fully_redeemed: "Fully Redeemed",
  expired: "Expired",
  cancelled: "Cancelled",
};

const CouponCard = ({ coupon, compact, onClick }: CouponCardProps) => {
  const config = categoryConfig[coupon.couponType];
  const Icon = config.icon;
  const usedPct = coupon.originalValue > 0 ? ((coupon.originalValue - coupon.remainingValue) / coupon.originalValue) * 100 : 0;

  const merchantScope = (() => {
    if (coupon.merchantRestrictionType === "category" && coupon.merchantCategory) {
      return merchantCategoryLabels[coupon.merchantCategory];
    }
    const names = coupon.merchantIds.map(id => allMerchants.find(m => m.id === id)?.name).filter(Boolean);
    return names.length <= 2 ? names.join(", ") : `${names[0]} +${names.length - 1} more`;
  })();

  // Check expiring soon (within 7 days)
  const daysToExpiry = Math.ceil((new Date(coupon.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = coupon.status === "active" && daysToExpiry <= 7 && daysToExpiry > 0;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all w-full text-left min-w-[200px]"
      >
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", config.color)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{couponCategoryLabels[coupon.couponType]} Coupon</p>
          <p className="text-xs text-muted-foreground">₹{coupon.remainingValue.toLocaleString()} left</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", config.color)}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{couponCategoryLabels[coupon.couponType]} Coupon</p>
            <p className="text-xs text-muted-foreground">{coupon.templateName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] px-2", getStatusStyle(coupon.status))}>
            {isExpiringSoon ? "Expiring Soon" : statusLabels[coupon.status]}
          </Badge>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>₹{coupon.remainingValue.toLocaleString()} remaining</span>
          <span>of ₹{coupon.originalValue.toLocaleString()}</span>
        </div>
        <Progress value={usedPct} className="h-2" />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>Valid until: {coupon.expiryDate}</span>
        <span className="truncate ml-2">{merchantScope}</span>
      </div>
    </button>
  );
};

export default CouponCard;
