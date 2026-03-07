import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Ticket, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import CouponTemplatesContent from "./CouponTemplatesContent";
import IssuedCouponsContent from "./IssuedCouponsContent";
import RedeemedCouponsContent from "./RedeemedCouponsContent";
import ExpiredCouponsContent from "./ExpiredCouponsContent";
import MerchantManagementContent from "./MerchantManagementContent";
import CouponAnalyticsContent from "./CouponAnalyticsContent";
import IssueCouponModal from "@/components/enterprise/coupons/IssueCouponModal";
import { useCoupons } from "@/contexts/CouponContext";
import { CouponTemplate } from "@/data/couponMockData";

const tabs = [
  { key: "templates", label: "Templates" },
  { key: "issued", label: "Issued Coupons" },
  { key: "redeemed", label: "Redeemed" },
  { key: "expired", label: "Expired" },
  { key: "merchants", label: "Merchants" },
  { key: "analytics", label: "Analytics" },
] as const;

type TabKey = typeof tabs[number]["key"];

const CouponsHub = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("templates");
  const navigate = useNavigate();
  const { templates } = useCoupons();

  // "Issue Coupon" quick-action state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedTemplateId, setPickedTemplateId] = useState("");
  const [issueTemplate, setIssueTemplate] = useState<CouponTemplate | null>(null);

  const activeTemplates = templates.filter(t => t.status === "active");

  const handleOpenPicker = () => {
    setPickedTemplateId("");
    setPickerOpen(true);
  };

  const handlePickerNext = () => {
    const tpl = templates.find(t => t.id === pickedTemplateId);
    if (!tpl) return;
    setPickerOpen(false);
    setIssueTemplate(tpl);
  };

  return (
    <EnterpriseLayout title="Coupons" subtitle="Manage merchant-restricted spending coupons for employees">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button className="gap-2" onClick={() => navigate("/enterprise/coupons/templates/create")}>
          <Plus size={16} /> Create Template
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleOpenPicker}>
          <Ticket size={16} /> Issue Coupon
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setActiveTab("merchants")}>
          <Store size={16} /> Add Merchant
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "templates" && <CouponTemplatesContent onIssue={setIssueTemplate} />}
      {activeTab === "issued" && <IssuedCouponsContent />}
      {activeTab === "redeemed" && <RedeemedCouponsContent />}
      {activeTab === "expired" && <ExpiredCouponsContent />}
      {activeTab === "merchants" && <MerchantManagementContent />}
      {activeTab === "analytics" && <CouponAnalyticsContent />}

      {/* Template Picker Dialog (opened by "Issue Coupon" quick action) */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Issue Coupon — Pick a Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {activeTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active templates yet.{" "}
                <button
                  className="text-primary underline"
                  onClick={() => { setPickerOpen(false); navigate("/enterprise/coupons/templates/create"); }}
                >
                  Create one first.
                </button>
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Choose which coupon template to issue to employees:</p>
                <Select value={pickedTemplateId} onValueChange={setPickedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} — ₹{(t.fixedAmount ?? t.totalBudget ?? 0).toLocaleString()} ({t.couponType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setPickerOpen(false)}>Cancel</Button>
                  <Button onClick={handlePickerNext} disabled={!pickedTemplateId}>
                    Next: Choose Employees
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Modal (used by both quick-action and per-template "Issue" button) */}
      <IssueCouponModal
        open={!!issueTemplate}
        onOpenChange={() => setIssueTemplate(null)}
        template={issueTemplate}
      />
    </EnterpriseLayout>
  );
};

export default CouponsHub;
