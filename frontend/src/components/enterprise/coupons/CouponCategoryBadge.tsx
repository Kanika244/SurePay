import { Badge } from "@/components/ui/badge";
import { Fuel, UtensilsCrossed, Building } from "lucide-react";
import { CouponCategory, couponCategoryLabels } from "@/data/couponMockData";

const iconMap: Record<CouponCategory, React.ElementType> = {
  fuel: Fuel,
  food: UtensilsCrossed,
  accommodation: Building,
};

const variantMap: Record<CouponCategory, string> = {
  fuel: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  food: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  accommodation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

interface Props {
  category: CouponCategory;
  className?: string;
}

const CouponCategoryBadge = ({ category, className }: Props) => {
  const Icon = iconMap[category];
  return (
    <Badge variant="outline" className={`${variantMap[category]} border-0 gap-1 ${className || ''}`}>
      <Icon size={12} />
      {couponCategoryLabels[category]}
    </Badge>
  );
};

export default CouponCategoryBadge;
