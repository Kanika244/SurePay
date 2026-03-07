import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import CouponCard from "@/components/pwa/CouponCard";
import PWACouponDetail from "./PWACouponDetail";
import { IssuedCoupon, Merchant, CouponRedemption } from "@/data/couponMockData";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/enterprise/coupons`;

const filterTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "partially_used", label: "In Use" },
  { key: "expired", label: "Expired" },
];

const PWACoupons = () => {
  const { user } = useIndividual();
  const location = useLocation(); // changes every time the page is navigated to
  const [filter, setFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState<IssuedCoupon | null>(null);

  const [coupons, setCoupons] = useState<IssuedCoupon[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch every time the page is visited (location.key changes on each navigation)
  useEffect(() => {
    const fetchMyCoupons = async () => {
      if (!user?.id) { setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch(`${API}/employee/${user.id}/my-coupons`);
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
          setMerchants(data.merchants || []);
          setRedemptions(data.redemptions || []);
        }
      } catch (err) {
        console.error("Failed to fetch my coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCoupons();
  }, [user?.id, location.key]); // ← location.key re-triggers on every navigation

  const filtered = coupons.filter(c => {
    if (filter === "all") return true;
    if (filter === "active") return c.status === "active" || c.status === "partially_used";
    return c.status === filter;
  });

  if (selectedCoupon) {
    return (
      <PWACouponDetail
        coupon={selectedCoupon}
        merchants={merchants}
        redemptions={redemptions.filter(r => r.couponId === selectedCoupon.id)}
        onBack={() => setSelectedCoupon(null)}
        userId={user?.id}
      />
    );
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === tab.key
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Loading coupons...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Ticket size={40} className="mx-auto text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No coupons found</p>
              <p className="text-xs text-muted-foreground">
                {coupons.length === 0
                  ? "Your employer hasn't issued any coupons yet"
                  : "No coupons match this filter"}
              </p>
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
