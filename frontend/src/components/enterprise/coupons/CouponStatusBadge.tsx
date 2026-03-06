import { Badge } from "@/components/ui/badge";
import { IssuedCouponStatus, CouponTemplateStatus, couponStatusLabels } from "@/data/couponMockData";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  partially_used: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  fully_redeemed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface Props {
  status: IssuedCouponStatus | CouponTemplateStatus;
}

const CouponStatusBadge = ({ status }: Props) => {
  const label = couponStatusLabels[status as IssuedCouponStatus] || (status === 'inactive' ? 'Inactive' : status);
  return (
    <Badge variant="outline" className={`${statusStyles[status] || ''} border-0`}>
      {label}
    </Badge>
  );
};

export default CouponStatusBadge;
