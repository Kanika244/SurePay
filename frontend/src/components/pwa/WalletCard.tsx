import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Building2, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WalletData } from "@/contexts/IndividualContext";

interface WalletCardProps {
    wallet: WalletData;
    selected?: boolean;
    onClick?: () => void;
    compact?: boolean;
}

const WalletCard = ({ wallet, selected, onClick, compact }: WalletCardProps) => {
    const isEmployer = wallet.type === "employer";

    if (compact) {
        return (
            <button
                onClick={onClick}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left",
                    selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                )}
            >
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isEmployer ? "bg-accent/10" : "bg-primary/10"
                )}>
                    {isEmployer ? <Building2 size={18} className="text-accent" /> : <Wallet size={18} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {isEmployer ? wallet.employerName : "Personal Wallet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        ₹{wallet.balance.toLocaleString()}
                    </p>
                </div>
                {wallet.frozen && <Snowflake size={14} className="text-secondary" />}
            </button>
        );
    }

    return (
        <Card className={cn(
            "overflow-hidden transition-all cursor-pointer",
            isEmployer
                ? "bg-gradient-to-br from-accent/90 to-primary/90 text-primary-foreground"
                : "bg-gradient-to-br from-primary to-accent text-primary-foreground",
            selected && "ring-2 ring-ring ring-offset-2"
        )} onClick={onClick}>
            <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                {wallet.frozen && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary-foreground/20 rounded-full px-2 py-0.5">
                        <Snowflake size={12} />
                        <span className="text-[10px] font-medium">Frozen</span>
                    </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                    {isEmployer ? <Building2 size={16} /> : <Wallet size={16} />}
                    <span className="text-xs opacity-80">{isEmployer ? wallet.employerName : "Personal Wallet"}</span>
                </div>
                <div className="text-3xl font-bold mb-3">
                    ₹{wallet.balance.toLocaleString()}
                </div>
                {isEmployer && wallet.monthlyLimit && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs opacity-80">
                            <span>Monthly spend</span>
                            <span>₹{(wallet.spentThisMonth || 0).toLocaleString()} / ₹{wallet.monthlyLimit.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-foreground/60 rounded-full transition-all"
                                style={{ width: `${((wallet.spentThisMonth || 0) / wallet.monthlyLimit) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WalletCard;
