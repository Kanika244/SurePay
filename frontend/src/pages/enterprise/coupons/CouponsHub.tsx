import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Ticket, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import CouponTemplatesContent from "./CouponTemplatesContent";
import IssuedCouponsContent from "./IssuedCouponsContent";
import RedeemedCouponsContent from "./RedeemedCouponsContent";
import ExpiredCouponsContent from "./ExpiredCouponsContent";
import MerchantManagementContent from "./MerchantManagementContent";
import CouponAnalyticsContent from "./CouponAnalyticsContent";

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

  return (
    <EnterpriseLayout title="Coupons" subtitle="Manage merchant-restricted spending coupons for employees">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button className="gap-2" onClick={() => navigate("/enterprise/coupons/templates/create")}>
          <Plus size={16} /> Create Template
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setActiveTab("issued")}>
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
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
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
      {activeTab === "templates" && <CouponTemplatesContent />}
      {activeTab === "issued" && <IssuedCouponsContent />}
      {activeTab === "redeemed" && <RedeemedCouponsContent />}
      {activeTab === "expired" && <ExpiredCouponsContent />}
      {activeTab === "merchants" && <MerchantManagementContent />}
      {activeTab === "analytics" && <CouponAnalyticsContent />}
    </EnterpriseLayout>
  );
};

export default CouponsHub;
