import { useCoupons } from "@/contexts/CouponContext";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import { IssuedCoupon } from "@/data/couponMockData";

const ExpiredCouponsContent = () => {
  const { issuedCoupons } = useCoupons();
  const expired = issuedCoupons.filter(c => c.status === 'expired');

  const columns = [
    { key: "id", header: "Coupon ID", render: (c: IssuedCoupon) => <span className="font-mono text-xs">{c.id}</span> },
    { key: "employeeName", header: "Employee", sortable: true },
    { key: "couponType", header: "Type", render: (c: IssuedCoupon) => <CouponCategoryBadge category={c.couponType} /> },
    { key: "unusedAmount", header: "Unused Amount", render: (c: IssuedCoupon) => `₹${c.remainingValue.toLocaleString()}` },
    { key: "expiryDate", header: "Expiry Date", sortable: true },
    { key: "issueDate", header: "Issued Date", sortable: true },
  ];

  return (
    <DataTable data={expired} columns={columns} searchPlaceholder="Search expired coupons..." searchKeys={["employeeName"] as any} pageSize={10} />
  );
};

export default ExpiredCouponsContent;
