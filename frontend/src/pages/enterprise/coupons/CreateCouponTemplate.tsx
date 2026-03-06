import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCoupons } from "@/contexts/CouponContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import MerchantCategoryBadge from "@/components/enterprise/coupons/MerchantCategoryBadge";
import { CouponCategory, CouponValueType, CouponExpiryType, MerchantRestrictionType, MerchantCategory } from "@/data/couponMockData";
import { toast } from "@/hooks/use-toast";

const CreateCouponTemplate = () => {
  const navigate = useNavigate();
  const { addTemplate, merchants } = useCoupons();

  const [name, setName] = useState("");
  const [couponType, setCouponType] = useState<CouponCategory>("fuel");
  const [description, setDescription] = useState("");
  const [valueType, setValueType] = useState<CouponValueType>("fixed");
  const [fixedAmount, setFixedAmount] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [maxPerTxn, setMaxPerTxn] = useState("");
  const [expiryType, setExpiryType] = useState<CouponExpiryType>("duration");
  const [expiryDate, setExpiryDate] = useState("");
  const [validForDays, setValidForDays] = useState("30");
  const [merchantRestriction, setMerchantRestriction] = useState<MerchantRestrictionType>("category");
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [merchantCategory, setMerchantCategory] = useState<MerchantCategory>("fuel_station");

  const activeMerchants = merchants.filter(m => m.status === 'active');

  const toggleMerchant = (id: string) => {
    setSelectedMerchants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast({ title: "Template name required", variant: "destructive" }); return; }

    addTemplate({
      name: name.trim(),
      couponType,
      description: description.trim() || undefined,
      valueType,
      fixedAmount: valueType === 'fixed' ? Number(fixedAmount) : undefined,
      totalBudget: valueType === 'budget' ? Number(totalBudget) : undefined,
      maxPerTransaction: valueType === 'budget' && maxPerTxn ? Number(maxPerTxn) : undefined,
      expiryType,
      expiryDate: expiryType === 'fixed_date' ? expiryDate : undefined,
      validForDays: expiryType === 'duration' ? Number(validForDays) : undefined,
      merchantRestrictionType: merchantRestriction,
      merchantIds: merchantRestriction !== 'category' ? selectedMerchants : [],
      merchantCategory: merchantRestriction === 'category' ? merchantCategory : undefined,
      status: 'active',
    });

    toast({ title: "Coupon template created" });
    navigate("/enterprise/coupons/templates");
  };

  return (
    <EnterpriseLayout title="Create Coupon Template" subtitle="Define a reusable coupon configuration">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Monthly Fuel Allowance" />
            </div>
            <div className="space-y-2">
              <Label>Coupon Type *</Label>
              <Select value={couponType} onValueChange={(v) => setCouponType(v as CouponCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this coupon..." rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Value Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={valueType} onValueChange={(v) => setValueType(v as CouponValueType)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed Amount</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="budget" id="budget" />
                <Label htmlFor="budget">Multi-Use Budget</Label>
              </div>
            </RadioGroup>

            {valueType === 'fixed' ? (
              <div className="space-y-2">
                <Label>Fixed Amount (₹) *</Label>
                <Input type="number" value={fixedAmount} onChange={e => setFixedAmount(e.target.value)} placeholder="500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Budget (₹) *</Label>
                  <Input type="number" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Max Per Transaction (₹)</Label>
                  <Input type="number" value={maxPerTxn} onChange={e => setMaxPerTxn(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Expiry Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={expiryType} onValueChange={(v) => setExpiryType(v as CouponExpiryType)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed_date" id="fixed_date" />
                <Label htmlFor="fixed_date">Fixed Date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="duration" id="duration" />
                <Label htmlFor="duration">Duration-Based</Label>
              </div>
            </RadioGroup>

            {expiryType === 'fixed_date' ? (
              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Valid For (days) *</Label>
                <Input type="number" value={validForDays} onChange={e => setValidForDays(e.target.value)} placeholder="30" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Merchant Restrictions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={merchantRestriction} onValueChange={(v) => { setMerchantRestriction(v as MerchantRestrictionType); setSelectedMerchants([]); }} className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific">Specific Merchant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="list" id="list" />
                <Label htmlFor="list">Merchant List</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category" id="cat" />
                <Label htmlFor="cat">By Category</Label>
              </div>
            </RadioGroup>

            {merchantRestriction === 'specific' && (
              <div className="space-y-2">
                <Label>Select Merchant</Label>
                <Select value={selectedMerchants[0] || ''} onValueChange={(v) => setSelectedMerchants([v])}>
                  <SelectTrigger><SelectValue placeholder="Choose merchant" /></SelectTrigger>
                  <SelectContent>
                    {activeMerchants.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {merchantRestriction === 'list' && (
              <div className="space-y-2">
                <Label>Select Merchants ({selectedMerchants.length} selected)</Label>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                  {activeMerchants.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm">
                      <Checkbox checked={selectedMerchants.includes(m.id)} onCheckedChange={() => toggleMerchant(m.id)} />
                      <span className="flex-1">{m.name}</span>
                      <MerchantCategoryBadge category={m.category} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {merchantRestriction === 'category' && (
              <div className="space-y-2">
                <Label>Merchant Category</Label>
                <Select value={merchantCategory} onValueChange={(v) => setMerchantCategory(v as MerchantCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuel_station">Fuel Stations</SelectItem>
                    <SelectItem value="restaurant">Restaurants</SelectItem>
                    <SelectItem value="hotel">Hotels / Accommodation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">Create Template</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/enterprise/coupons/templates")}>Cancel</Button>
        </div>
      </form>
    </EnterpriseLayout>
  );
};

export default CreateCouponTemplate;
