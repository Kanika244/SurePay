import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import CouponStatusBadge from "@/components/enterprise/coupons/CouponStatusBadge";
import CouponUsageProgress from "@/components/enterprise/coupons/CouponUsageProgress";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { IssuedCoupon } from "@/data/couponMockData";
import { toast } from "@/hooks/use-toast";

const IssuedCoupons = () => {
  const { issuedCoupons, merchants, cancelCoupon, extendCouponExpiry } = useCoupons();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [extendCoupon, setExtendCoupon] = useState<IssuedCoupon | null>(null);
  const [newExpiry, setNewExpiry] = useState("");

  const activeCoupons = issuedCoupons.filter(c => c.status !== 'fully_redeemed' && c.status !== 'expired');
  const filtered = activeCoupons.filter(c => {
    if (typeFilter !== "all" && c.couponType !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const getMerchantInfo = (c: IssuedCoupon) => {
    if (c.merchantRestrictionType === 'category' && c.merchantCategory) {
      const labels: Record<string, string> = { fuel_station: 'Fuel Stations', restaurant: 'Restaurants', hotel: 'Hotels' };
      return labels[c.merchantCategory] || c.merchantCategory;
    }
    if (c.merchantIds.length > 0) {
      const names = c.merchantIds.map(id => merchants.find(m => m.id === id)?.name).filter(Boolean);
      return names.length <= 2 ? names.join(', ') : `${names[0]} +${names.length - 1} more`;
    }
    return 'Any';
  };

  const columns = [
    { key: "id", header: "Coupon ID" },
    { key: "templateName", header: "Template", sortable: true },
    { key: "employeeName", header: "Employee", sortable: true, render: (c: IssuedCoupon) => <span className="font-medium">{c.employeeName}</span> },
    { key: "couponType", header: "Type", render: (c: IssuedCoupon) => <CouponCategoryBadge category={c.couponType} /> },
    { key: "originalValue", header: "Value", render: (c: IssuedCoupon) => `₹${c.originalValue.toLocaleString()}` },
    { key: "remaining", header: "Remaining", render: (c: IssuedCoupon) => <CouponUsageProgress originalValue={c.originalValue} remainingValue={c.remainingValue} /> },
    { key: "merchants", header: "Merchants", render: getMerchantInfo },
    { key: "expiryDate", header: "Expiry", sortable: true },
    { key: "status", header: "Status", render: (c: IssuedCoupon) => <CouponStatusBadge status={c.status} /> },
    {
      key: "actions", header: "Actions", render: (c: IssuedCoupon) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExtendCoupon(c); setNewExpiry(c.expiryDate); }}>Extend</Button>
          {c.status !== 'cancelled' && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); setCancelId(c.id); }}>Cancel</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <EnterpriseLayout title="Issued Coupons" subtitle="Track active and partially used coupons">
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="partially_used">Partially Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} searchPlaceholder="Search coupons..." searchKeys={["employeeName", "templateName", "id"] as any} pageSize={10} />

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        title="Cancel Coupon"
        description="This coupon will be cancelled. Remaining balance will be released."
        confirmLabel="Cancel Coupon"
        variant="destructive"
        onConfirm={() => { if (cancelId) { cancelCoupon(cancelId); toast({ title: "Coupon cancelled" }); setCancelId(null); } }}
      />

      <Dialog open={!!extendCoupon} onOpenChange={() => setExtendCoupon(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Extend Expiry</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>New Expiry Date</Label>
            <Input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendCoupon(null)}>Cancel</Button>
            <Button onClick={() => {
              if (extendCoupon && newExpiry) {
                extendCouponExpiry(extendCoupon.id, newExpiry);
                toast({ title: "Expiry extended" });
                setExtendCoupon(null);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EnterpriseLayout>
  );
};

export default IssuedCoupons;
