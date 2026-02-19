import { Clock, Loader2, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SyncStatus = "pending" | "syncing" | "failed" | "synced";

interface PendingTransactionBadgeProps {
    status: SyncStatus;
    onRetry?: () => void;
    className?: string;
}

const statusConfig: Record<SyncStatus, { icon: typeof Clock; label: string; className: string }> = {
    pending: { icon: Clock, label: "Pending Sync", className: "bg-secondary/15 text-secondary" },
    syncing: { icon: Loader2, label: "Syncing", className: "bg-secondary/15 text-secondary" },
    failed: { icon: AlertCircle, label: "Failed", className: "bg-destructive/15 text-destructive" },
    synced: { icon: CheckCircle, label: "Synced", className: "bg-mint/15 text-mint" },
};

const PendingTransactionBadge = ({ status, onRetry, className }: PendingTransactionBadgeProps) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", config.className)}>
                <Icon size={10} className={status === "syncing" ? "animate-spin" : ""} />
                {config.label}
            </span>
            {status === "failed" && onRetry && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRetry(); }}
                    className="inline-flex items-center gap-0.5 text-[10px] text-destructive hover:text-destructive/80 font-medium"
                >
                    <RefreshCw size={10} /> Retry
                </button>
            )}
        </div>
    );
};

export default PendingTransactionBadge;
