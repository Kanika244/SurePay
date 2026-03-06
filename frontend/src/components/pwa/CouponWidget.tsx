import { ChevronRight, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useCoupons } from "@/contexts/CouponContext";
import CouponCard from "./CouponCard";

const CouponWidget = () => {
  const { issuedCoupons } = useCoupons();

  const activeCoupons = issuedCoupons
    .filter(c => c.status === "active" || c.status === "partially_used")
    .slice(0, 3);

  if (activeCoupons.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Ticket size={14} className="text-primary" /> Active Coupons
        </h2>
        <Link to="/app/coupons" className="text-xs text-primary font-medium flex items-center gap-0.5">
          View All <ChevronRight size={14} />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {activeCoupons.map(coupon => (
          <div key={coupon.id} className="min-w-[200px]">
            <CouponCard coupon={coupon} compact />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponWidget;
