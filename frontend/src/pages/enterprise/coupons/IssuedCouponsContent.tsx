import { useState } from "react";
import { useCoupons } from "@/contexts/CouponContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import CouponStatusBadge from "@/components/enterprise/coupons/CouponStatusBadge";
import CouponUsageProgress from "@/components/enterprise/coupons/CouponUsageProgress";
import { IssuedCoupon, merchantCategoryLabels } from "@/data/couponMockData";
import { toast } from "@/hooks/use-toast";

const IssuedCouponsContent = () => {
  const { issuedCoupons, merchants, cancelCoupon, extendCouponExpiry } = useCoupons();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = issuedCoupons.filter(c => {
    if (typeFilter !== "all" && c.couponType !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const getMerchantScope = (c: IssuedCoupon) => {
    if (c.merchantRestrictionType === 'category' && c.merchantCategory) return merchantCategoryLabels[c.merchantCategory];
    const names = c.merchantIds.map(id => merchants.find(m => m.id === id)?.name).filter(Boolean);
    return names.length <= 2 ? names.join(', ') : `${names[0]} +${names.length - 1} more`;
  };

  const columns = [
    { key: "id", header: "Coupon ID", render: (c: IssuedCoupon) => <span className="font-mono text-xs">{c.id}</span> },
    { key: "templateName", header: "Template", sortable: true },
    { key: "employeeName", header: "Employee", sortable: true },
    { key: "couponType", header: "Type", render: (c: IssuedCoupon) => <CouponCategoryBadge category={c.couponType} /> },
    { key: "value", header: "Value", render: (c: IssuedCoupon) => <CouponUsageProgress originalValue={c.originalValue} remainingValue={c.remainingValue} /> },
    { key: "merchants", header: "Merchants", render: getMerchantScope },
    { key: "expiryDate", header: "Expiry", sortable: true },
    { key: "status", header: "Status", render: (c: IssuedCoupon) => <CouponStatusBadge status={c.status} /> },
    {
      key: "actions", header: "Actions", render: (c: IssuedCoupon) => (
        <div className="flex gap-1">
          {c.status === 'active' || c.status === 'partially_used' ? (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); const d = prompt("New expiry date (YYYY-MM-DD):"); if (d) { extendCouponExpiry(c.id, d); toast({ title: "Expiry extended" }); } }}>Extend</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); cancelCoupon(c.id); toast({ title: "Coupon cancelled" }); }}>Cancel</Button>
            </>
          ) : null}
        </div>
      ),
    },
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="partially_used">Partially Used</SelectItem>
            <SelectItem value="fully_redeemed">Fully Redeemed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable data={filtered} columns={columns} searchPlaceholder="Search coupons..." searchKeys={["employeeName", "templateName"] as any} pageSize={10} />
    </>
  );
};

export default IssuedCouponsContent;
