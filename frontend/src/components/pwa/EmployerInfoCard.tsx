import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, CreditCard, ShieldCheck } from "lucide-react";

interface EmployerInfoProps {
    name: string;
    employeeId: string;
    department: string;
    allocatedAmount: number;
    balance: number;
    monthlyLimit: number;
    spentThisMonth: number;
    maxPerTransaction: number;
}

const EmployerInfoCard = ({ name, employeeId, department, allocatedAmount, balance, monthlyLimit, spentThisMonth, maxPerTransaction }: EmployerInfoProps) => {
    return (
        <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Building2 size={22} className="text-accent" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{employeeId} · {department}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-1.5 mb-1">
                            <CreditCard size={12} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Allocated</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">₹{allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Briefcase size={12} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Available</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">₹{balance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Monthly spend</span>
                        <span className="text-foreground font-medium">₹{spentThisMonth.toLocaleString()} / ₹{monthlyLimit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(spentThisMonth / monthlyLimit) * 100}%` }} />
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <ShieldCheck size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Max ₹{maxPerTransaction.toLocaleString()} per transaction</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default EmployerInfoCard;
