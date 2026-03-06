import { useState } from "react";
import { useCoupons } from "@/contexts/CouponContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import { CouponRedemption } from "@/data/couponMockData";

const RedeemedCouponsContent = () => {
  const { redemptions } = useCoupons();
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = redemptions.filter(r => typeFilter === "all" || r.couponType === typeFilter);

  const columns = [
    { key: "id", header: "Redemption ID", render: (r: CouponRedemption) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "employeeName", header: "Employee", sortable: true },
    { key: "couponType", header: "Type", render: (r: CouponRedemption) => <CouponCategoryBadge category={r.couponType} /> },
    { key: "amount", header: "Amount", render: (r: CouponRedemption) => `₹${r.amount.toLocaleString()}` },
    { key: "merchantName", header: "Merchant", sortable: true },
    { key: "redeemedAt", header: "Date", sortable: true },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="accommodation">Accommodation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable data={filtered} columns={columns} searchPlaceholder="Search redemptions..." searchKeys={["employeeName", "merchantName"] as any} pageSize={10} />
    </>
  );
};

export default RedeemedCouponsContent;
