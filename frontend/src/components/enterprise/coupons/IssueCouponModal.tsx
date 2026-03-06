import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCoupons } from "@/contexts/CouponContext";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import { CouponTemplate, IssuedCoupon } from "@/data/couponMockData";
import { departments } from "@/data/enterpriseMockData";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: CouponTemplate | null;
}

type DistributionMode = 'single' | 'multiple' | 'department' | 'all';

const IssueCouponModal = ({ open, onOpenChange, template }: Props) => {
  const { issueCoupons } = useCoupons();
  const { employees } = useEnterprise();
  const [mode, setMode] = useState<DistributionMode>('single');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [overrideExpiry, setOverrideExpiry] = useState('');
  const [notes, setNotes] = useState('');

  if (!template) return null;

  const activeEmployees = employees.filter(e => e.status === 'active');

  const getTargetEmployees = () => {
    switch (mode) {
      case 'single':
      case 'multiple':
        return activeEmployees.filter(e => selectedEmployees.includes(e.id));
      case 'department':
        return activeEmployees.filter(e => e.department === selectedDept);
      case 'all':
        return activeEmployees;
      default:
        return [];
    }
  };

  const handleIssue = () => {
    const targets = getTargetEmployees();
    if (targets.length === 0) {
      toast({ title: "No employees selected", variant: "destructive" });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const expiry = overrideExpiry || (template.expiryType === 'fixed_date'
      ? template.expiryDate!
      : new Date(Date.now() + (template.validForDays || 30) * 86400000).toISOString().split('T')[0]);

    const value = template.valueType === 'fixed' ? template.fixedAmount! : template.totalBudget!;

    const coupons: Omit<IssuedCoupon, 'id'>[] = targets.map(emp => ({
      templateId: template.id,
      templateName: template.name,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      couponType: template.couponType,
      originalValue: value,
      remainingValue: value,
      maxPerTransaction: template.maxPerTransaction,
      merchantRestrictionType: template.merchantRestrictionType,
      merchantIds: template.merchantIds,
      merchantCategory: template.merchantCategory,
      issueDate: today,
      expiryDate: expiry,
      status: 'active',
      notes: notes || undefined,
    }));

    issueCoupons(coupons);
    toast({ title: `${coupons.length} coupon(s) issued successfully` });
    onOpenChange(false);
    setSelectedEmployees([]);
    setNotes('');
    setOverrideExpiry('');
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue Coupon: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Distribution Method</Label>
            <Select value={mode} onValueChange={(v) => { setMode(v as DistributionMode); setSelectedEmployees([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Employee</SelectItem>
                <SelectItem value="multiple">Multiple Employees</SelectItem>
                <SelectItem value="department">By Department</SelectItem>
                <SelectItem value="all">Entire Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(mode === 'single') && (
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select value={selectedEmployees[0] || ''} onValueChange={(v) => setSelectedEmployees([v])}>
                <SelectTrigger><SelectValue placeholder="Choose employee" /></SelectTrigger>
                <SelectContent>
                  {activeEmployees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'multiple' && (
            <div className="space-y-2">
              <Label>Select Employees ({selectedEmployees.length} selected)</Label>
              <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                {activeEmployees.map(e => (
                  <label key={e.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm">
                    <Checkbox checked={selectedEmployees.includes(e.id)} onCheckedChange={() => toggleEmployee(e.id)} />
                    {e.firstName} {e.lastName} ({e.employeeId})
                  </label>
                ))}
              </div>
            </div>
          )}

          {mode === 'department' && (
            <div className="space-y-2">
              <Label>Select Department</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger><SelectValue placeholder="Choose department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedDept && (
                <p className="text-xs text-muted-foreground">
                  {activeEmployees.filter(e => e.department === selectedDept).length} employees will receive coupons
                </p>
              )}
            </div>
          )}

          {mode === 'all' && (
            <p className="text-sm text-muted-foreground">
              All {activeEmployees.length} active employees will receive this coupon.
            </p>
          )}

          <div className="space-y-2">
            <Label>Override Expiry Date (optional)</Label>
            <Input type="date" value={overrideExpiry} onChange={e => setOverrideExpiry(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a note..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleIssue}>Issue Coupon{getTargetEmployees().length > 1 ? 's' : ''}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueCouponModal;
