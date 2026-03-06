import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Fuel, Utensils, Hotel } from "lucide-react";
import { Link } from "react-router-dom";
import { useCoupons } from "@/contexts/CouponContext";
import { useIndividual } from "@/contexts/IndividualContext";
import CouponCard from "@/components/pwa/CouponCard";
import PWACouponDetail from "./PWACouponDetail";
import { IssuedCoupon } from "@/data/couponMockData";

const filterTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "partially_used", label: "In Use" },
  { key: "expired", label: "Expired" },
];

const PWACoupons = () => {
  const { issuedCoupons } = useCoupons();
  const { user } = useIndividual();
  const [filter, setFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState<IssuedCoupon | null>(null);

  // Filter coupons for this employee (mock: show all since employee IDs don't match exactly)
  const myCoupons = issuedCoupons;

  const filtered = myCoupons.filter(c => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "active" || c.status === "partially_used";
    return c.status === filter;
  });

  if (selectedCoupon) {
    return <PWACouponDetail coupon={selectedCoupon} onBack={() => setSelectedCoupon(null)} />;
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/app"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
        <h1 className="text-lg font-bold text-foreground">My Coupons</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Coupon list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No coupons found</p>
            </div>
          ) : (
            filtered.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} onClick={() => setSelectedCoupon(coupon)} />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PWACoupons;
