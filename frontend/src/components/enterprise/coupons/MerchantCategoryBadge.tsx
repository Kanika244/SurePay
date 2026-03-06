import { Badge } from "@/components/ui/badge";
import { MerchantCategory, merchantCategoryLabels } from "@/data/couponMockData";

const styles: Record<MerchantCategory, string> = {
  fuel_station: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  restaurant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  hotel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

interface Props {
  category: MerchantCategory;
}

const MerchantCategoryBadge = ({ category }: Props) => (
  <Badge variant="outline" className={`${styles[category]} border-0`}>
    {merchantCategoryLabels[category]}
  </Badge>
);

export default MerchantCategoryBadge;
