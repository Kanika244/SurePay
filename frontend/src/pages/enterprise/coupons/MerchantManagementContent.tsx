import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCoupons } from "@/contexts/CouponContext";
import DataTable from "@/components/admin/DataTable";
import MerchantCategoryBadge from "@/components/enterprise/coupons/MerchantCategoryBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import { Merchant, MerchantCategory } from "@/data/couponMockData";
import { toast } from "@/hooks/use-toast";

const MerchantManagementContent = () => {
  const { merchants, addMerchant, toggleMerchantStatus } = useCoupons();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "fuel_station" as MerchantCategory, merchantId: "", location: "", contactInfo: "" });

  const handleAdd = () => {
    if (!form.name || !form.merchantId || !form.location) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    addMerchant({ ...form, status: "active" });
    toast({ title: "Merchant added" });
    setShowAdd(false);
    setForm({ name: "", category: "fuel_station", merchantId: "", location: "", contactInfo: "" });
  };

  const columns = [
    { key: "name", header: "Merchant Name", sortable: true, render: (m: Merchant) => <span className="font-medium">{m.name}</span> },
    { key: "category", header: "Category", render: (m: Merchant) => <MerchantCategoryBadge category={m.category} /> },
    { key: "merchantId", header: "Merchant ID", render: (m: Merchant) => <span className="font-mono text-xs">{m.merchantId}</span> },
    { key: "location", header: "Location" },
    { key: "status", header: "Status", render: (m: Merchant) => <StatusBadge status={m.status} /> },
    {
      key: "actions", header: "Actions", render: (m: Merchant) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleMerchantStatus(m.id); toast({ title: `Merchant ${m.status === 'active' ? 'disabled' : 'enabled'}` }); }}>
          {m.status === 'active' ? 'Disable' : 'Enable'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Merchant</Button>
      </div>
      <DataTable data={merchants} columns={columns} searchPlaceholder="Search merchants..." searchKeys={["name", "location"] as any} pageSize={10} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Merchant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Merchant Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as MerchantCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel_station">Fuel Station</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Merchant ID</Label><Input value={form.merchantId} onChange={e => setForm(p => ({ ...p, merchantId: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            <div><Label>Contact Info (optional)</Label><Input value={form.contactInfo} onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))} /></div>
            <Button className="w-full" onClick={handleAdd}>Add Merchant</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MerchantManagementContent;
