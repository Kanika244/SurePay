import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons } from "@/contexts/CouponContext";
import DataTable from "@/components/admin/DataTable";
import CouponCategoryBadge from "@/components/enterprise/coupons/CouponCategoryBadge";
import CouponStatusBadge from "@/components/enterprise/coupons/CouponStatusBadge";
import IssueCouponModal from "@/components/enterprise/coupons/IssueCouponModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { CouponTemplate, merchantCategoryLabels } from "@/data/couponMockData";
import { toast } from "@/hooks/use-toast";

const CouponTemplatesContent = () => {
  const navigate = useNavigate();
  const { templates, merchants, deleteTemplate, toggleTemplateStatus } = useCoupons();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [issueTemplate, setIssueTemplate] = useState<CouponTemplate | null>(null);

  const filtered = templates.filter(t => {
    if (typeFilter !== "all" && t.couponType !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const getMerchantInfo = (t: CouponTemplate) => {
    if (t.merchantRestrictionType === 'category' && t.merchantCategory) return merchantCategoryLabels[t.merchantCategory];
    if (t.merchantIds.length > 0) {
      const names = t.merchantIds.map(id => merchants.find(m => m.id === id)?.name).filter(Boolean);
      return names.length <= 2 ? names.join(', ') : `${names[0]} +${names.length - 1} more`;
    }
    return 'None';
  };

  const columns = [
    { key: "name", header: "Template Name", sortable: true, render: (t: CouponTemplate) => <span className="font-medium">{t.name}</span> },
    { key: "couponType", header: "Type", render: (t: CouponTemplate) => <CouponCategoryBadge category={t.couponType} /> },
    { key: "valueType", header: "Value Type", render: (t: CouponTemplate) => <span className="capitalize">{t.valueType}</span> },
    { key: "value", header: "Value", render: (t: CouponTemplate) => `₹${(t.valueType === 'fixed' ? t.fixedAmount : t.totalBudget)?.toLocaleString()}` },
    { key: "expiry", header: "Expiry Rule", render: (t: CouponTemplate) => t.expiryType === 'fixed_date' ? t.expiryDate : `${t.validForDays} days` },
    { key: "merchants", header: "Merchants", render: getMerchantInfo },
    { key: "createdAt", header: "Created", sortable: true },
    { key: "status", header: "Status", render: (t: CouponTemplate) => <CouponStatusBadge status={t.status} /> },
    {
      key: "actions", header: "Actions", render: (t: CouponTemplate) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/enterprise/coupons/templates/${t.id}`); }}>View</Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIssueTemplate(t); }}>Issue</Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleTemplateStatus(t.id); toast({ title: `Template ${t.status === 'active' ? 'deactivated' : 'activated'}` }); }}>
            {t.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
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
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} searchPlaceholder="Search templates..." searchKeys={["name", "couponType"] as any} pageSize={10} />

      <IssueCouponModal open={!!issueTemplate} onOpenChange={() => setIssueTemplate(null)} template={issueTemplate} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Template"
        description="This template will be permanently deleted. Existing issued coupons will not be affected."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => { if (deleteId) { deleteTemplate(deleteId); toast({ title: "Template deleted" }); setDeleteId(null); } }}
      />
    </>
  );
};

export default CouponTemplatesContent;
