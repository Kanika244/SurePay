import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import { IssuedCoupon } from "@/data/couponMockData";

const ExpiredCoupons = () => {
  const { issuedCoupons } = useCoupons();
  const expired = issuedCoupons.filter(c => c.status === 'expired');

  const columns = [
    { key: "id", header: "Coupon ID" },
    { key: "employeeName", header: "Employee", sortable: true, render: (c: IssuedCoupon) => <span className="font-medium">{c.employeeName}</span> },
    { key: "couponType", header: "Type", render: (c: IssuedCoupon) => <CouponCategoryBadge category={c.couponType} /> },
    { key: "unused", header: "Unused Amount", sortable: true, render: (c: IssuedCoupon) => `₹${c.remainingValue.toLocaleString()}` },
    { key: "expiryDate", header: "Expiry Date", sortable: true },
    { key: "issueDate", header: "Issued Date", sortable: true },
  ];

  return (
    <EnterpriseLayout title="Expired Coupons" subtitle={`${expired.length} coupons have expired`}>
      <DataTable data={expired} columns={columns} searchPlaceholder="Search expired coupons..." searchKeys={["employeeName", "id"] as any} pageSize={10} />
    </EnterpriseLayout>
  );
};

export default ExpiredCoupons;
