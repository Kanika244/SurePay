import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import CouponStatusBadge from "@/components/enterprise/coupons/CouponStatusBadge";
import CouponUsageProgress from "@/components/enterprise/coupons/CouponUsageProgress";
import DataTable from "@/components/admin/DataTable";
import { CouponRedemption } from "@/data/couponMockData";

const CouponDetail = () => {
  const { id } = useParams();
  const { issuedCoupons, redemptions, merchants } = useCoupons();

  const coupon = issuedCoupons.find(c => c.id === id);
  if (!coupon) {
    return (
      <EnterpriseLayout title="Coupon Not Found">
        <Link to="/enterprise/coupons/issued"><Button variant="outline" className="gap-2"><ArrowLeft size={16} /> Back</Button></Link>
      </EnterpriseLayout>
    );
  }

  const couponRedemptions = redemptions.filter(r => r.couponId === coupon.id);
  const allowedMerchants = coupon.merchantIds.map(mid => merchants.find(m => m.id === mid)).filter(Boolean);

  const redemptionColumns = [
    { key: "id", header: "ID" },
    { key: "amount", header: "Amount", render: (r: CouponRedemption) => `₹${r.amount.toLocaleString()}` },
    { key: "merchantName", header: "Merchant" },
    { key: "redeemedAt", header: "Date", sortable: true },
  ];

  const isNearExpiry = () => {
    const days = Math.ceil((new Date(coupon.expiryDate).getTime() - Date.now()) / 86400000);
    return days > 0 && days <= 7;
  };

  return (
    <EnterpriseLayout title="Coupon Details" subtitle={coupon.id}>
      <Link to="/enterprise/coupons/issued" className="inline-block mb-4">
        <Button variant="outline" size="sm" className="gap-2"><ArrowLeft size={16} /> Back to Issued</Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Coupon Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Coupon ID</span><span className="font-medium text-sm">{coupon.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Template</span><span className="font-medium text-sm">{coupon.templateName}</span></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Type</span><CouponCategoryBadge category={coupon.couponType} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Issued To</span><span className="font-medium text-sm">{coupon.employeeName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Issued Date</span><span className="text-sm">{coupon.issueDate}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Expiry Date</span>
              <span className={`text-sm ${isNearExpiry() ? 'text-destructive font-medium' : ''}`}>
                {coupon.expiryDate} {isNearExpiry() && '⚠️ Expiring soon'}
              </span>
            </div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Status</span><CouponStatusBadge status={coupon.status} /></div>
            {coupon.notes && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Notes</span><span className="text-sm">{coupon.notes}</span></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Value & Usage</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Original Value</span><span className="font-bold">₹{coupon.originalValue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Amount Used</span><span className="text-sm">₹{(coupon.originalValue - coupon.remainingValue).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Remaining</span><span className="font-medium text-sm">₹{coupon.remainingValue.toLocaleString()}</span></div>
            <CouponUsageProgress originalValue={coupon.originalValue} remainingValue={coupon.remainingValue} />
            {coupon.maxPerTransaction && (
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Max Per Transaction</span><span className="text-sm">₹{coupon.maxPerTransaction.toLocaleString()}</span></div>
            )}
          </CardContent>
        </Card>
      </div>

      {allowedMerchants.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Merchant Restrictions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allowedMerchants.map(m => m && (
                <div key={m.id} className="px-3 py-1.5 bg-muted rounded-lg text-sm">
                  {m.name} <span className="text-muted-foreground">({m.location})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {coupon.merchantCategory && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Merchant Restrictions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Restricted to category: <span className="font-medium text-foreground capitalize">{coupon.merchantCategory.replace('_', ' ')}</span>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Redemption History</CardTitle></CardHeader>
        <CardContent>
          {couponRedemptions.length > 0 ? (
            <DataTable data={couponRedemptions} columns={redemptionColumns} pageSize={5} searchPlaceholder="Search..." searchKeys={["merchantName"] as any} />
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No redemptions yet</p>
          )}
        </CardContent>
      </Card>
    </EnterpriseLayout>
  );
};

export default CouponDetail;
