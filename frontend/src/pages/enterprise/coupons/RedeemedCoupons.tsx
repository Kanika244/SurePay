import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import { CouponRedemption } from "@/data/couponMockData";

const RedeemedCoupons = () => {
  const { redemptions, merchants } = useCoupons();
  const [typeFilter, setTypeFilter] = useState("all");
  const [merchantFilter, setMerchantFilter] = useState("all");

  const filtered = redemptions.filter(r => {
    if (typeFilter !== "all" && r.couponType !== typeFilter) return false;
    if (merchantFilter !== "all" && r.merchantId !== merchantFilter) return false;
    return true;
  });

  // Aggregate by coupon for display
  const columns = [
    { key: "couponId", header: "Coupon ID" },
    { key: "employeeName", header: "Employee", sortable: true, render: (r: CouponRedemption) => <span className="font-medium">{r.employeeName}</span> },
    { key: "couponType", header: "Type", render: (r: CouponRedemption) => <CouponCategoryBadge category={r.couponType} /> },
    { key: "amount", header: "Redeemed Amount", sortable: true, render: (r: CouponRedemption) => `₹${r.amount.toLocaleString()}` },
    { key: "merchantName", header: "Merchant", sortable: true },
    { key: "redeemedAt", header: "Redeemed Date", sortable: true },
  ];

  const usedMerchants = [...new Set(redemptions.map(r => r.merchantId))];

  return (
    <EnterpriseLayout title="Redeemed Coupons" subtitle="All completed coupon redemptions">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="accommodation">Accommodation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={merchantFilter} onValueChange={setMerchantFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Merchant" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchants</SelectItem>
            {usedMerchants.map(id => {
              const m = merchants.find(x => x.id === id);
              return m ? <SelectItem key={id} value={id}>{m.name}</SelectItem> : null;
            })}
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} searchPlaceholder="Search redemptions..." searchKeys={["employeeName", "merchantName", "couponId"] as any} pageSize={10} />
    </EnterpriseLayout>
  );
};

export default RedeemedCoupons;
