import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import MerchantCategoryBadge from "@/components/enterprise/coupons/MerchantCategoryBadge";
import { Merchant, MerchantCategory } from "@/data/couponMockData";
import { toast } from "@/hooks/use-toast";

const MerchantManagement = () => {
  const { merchants, addMerchant, updateMerchant, toggleMerchantStatus } = useCoupons();
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editMerchant, setEditMerchant] = useState<Merchant | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<MerchantCategory>("fuel_station");
  const [formMerchantId, setFormMerchantId] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formContact, setFormContact] = useState("");

  const filtered = merchants.filter(m => catFilter === "all" || m.category === catFilter);

  const resetForm = () => {
    setFormName(""); setFormCategory("fuel_station"); setFormMerchantId(""); setFormLocation(""); setFormContact("");
  };

  const openAdd = () => { resetForm(); setShowAdd(true); };
  const openEdit = (m: Merchant) => {
    setFormName(m.name); setFormCategory(m.category); setFormMerchantId(m.merchantId); setFormLocation(m.location); setFormContact(m.contactInfo || "");
    setEditMerchant(m);
  };

  const handleSave = () => {
    if (!formName.trim() || !formMerchantId.trim()) {
      toast({ title: "Name and Merchant ID required", variant: "destructive" }); return;
    }
    if (editMerchant) {
      updateMerchant(editMerchant.id, { name: formName, category: formCategory, merchantId: formMerchantId, location: formLocation, contactInfo: formContact || undefined });
      toast({ title: "Merchant updated" });
      setEditMerchant(null);
    } else {
      addMerchant({ name: formName, category: formCategory, merchantId: formMerchantId, location: formLocation, contactInfo: formContact || undefined, status: 'active' });
      toast({ title: "Merchant added" });
      setShowAdd(false);
    }
    resetForm();
  };

  const columns = [
    { key: "name", header: "Merchant Name", sortable: true, render: (m: Merchant) => <span className="font-medium">{m.name}</span> },
    { key: "category", header: "Category", render: (m: Merchant) => <MerchantCategoryBadge category={m.category} /> },
    { key: "merchantId", header: "Merchant ID" },
    { key: "location", header: "Location" },
    { key: "status", header: "Status", render: (m: Merchant) => <StatusBadge status={m.status} /> },
    {
      key: "actions", header: "Actions", render: (m: Merchant) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(m); }}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleMerchantStatus(m.id); toast({ title: `Merchant ${m.status === 'active' ? 'disabled' : 'enabled'}` }); }}>
            {m.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  const formDialog = (
    <Dialog open={showAdd || !!editMerchant} onOpenChange={() => { setShowAdd(false); setEditMerchant(null); resetForm(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editMerchant ? 'Edit Merchant' : 'Add Merchant'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Merchant Name *</Label>
            <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Merchant name" />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={formCategory} onValueChange={v => setFormCategory(v as MerchantCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel_station">Fuel Station</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Merchant ID *</Label>
            <Input value={formMerchantId} onChange={e => setFormMerchantId(e.target.value)} placeholder="Unique ID" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="City, Area" />
          </div>
          <div className="space-y-2">
            <Label>Contact Info (optional)</Label>
            <Input value={formContact} onChange={e => setFormContact(e.target.value)} placeholder="Phone or email" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowAdd(false); setEditMerchant(null); resetForm(); }}>Cancel</Button>
          <Button onClick={handleSave}>{editMerchant ? 'Save Changes' : 'Add Merchant'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <EnterpriseLayout title="Merchant Management" subtitle="Manage merchants for coupon restrictions">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button className="gap-2" onClick={openAdd}><Plus size={16} /> Add Merchant</Button>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="fuel_station">Fuel Station</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} searchPlaceholder="Search merchants..." searchKeys={["name", "merchantId", "location"] as any} pageSize={10} />

      {formDialog}
    </EnterpriseLayout>
  );
};

export default MerchantManagement;
