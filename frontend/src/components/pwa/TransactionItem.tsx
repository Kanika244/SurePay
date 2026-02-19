import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/contexts/IndividualContext";
import { format } from "date-fns";
import PendingTransactionBadge from "./PendingTransactionBadge";

interface TransactionItemProps {
    transaction: Transaction;
    onClick?: () => void;
    offlineStatus?: "pending" | "syncing" | "failed" | "synced";
    onRetry?: () => void;
}

const TransactionItem = ({ transaction, onClick, offlineStatus, onRetry }: TransactionItemProps) => {
    const isSent = transaction.type === "sent";
    const statusIcon = transaction.status === "pending" && !offlineStatus
        ? <Clock size={14} className="text-muted-foreground" />
        : null;

    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors w-full text-left"
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isSent ? "bg-destructive/10" : "bg-accent/10"
                )}>
                    {isSent
                        ? <ArrowUpRight size={18} className="text-destructive" />
                        : <ArrowDownLeft size={18} className="text-accent" />
                    }
                </div>
                <div>
                    <p className="font-medium text-sm text-foreground">{transaction.counterparty}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.timestamp), "MMM d, h:mm a")}
                        </p>
                        {statusIcon}
                        {transaction.walletUsed === "employer" && (
                            <span className="text-[10px] bg-accent/10 text-accent rounded px-1 py-0.5 font-medium">Work</span>
                        )}
                    </div>
                    {offlineStatus && (
                        <PendingTransactionBadge status={offlineStatus} onRetry={onRetry} className="mt-1" />
                    )}
                </div>
            </div>
            <span className={cn(
                "font-semibold text-sm",
                isSent ? "text-foreground" : "text-accent"
            )}>
                {isSent ? "-" : "+"}₹{transaction.amount.toLocaleString()}
            </span>
        </button>
    );
};

export default TransactionItem;
