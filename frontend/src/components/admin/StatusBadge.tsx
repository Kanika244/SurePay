import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    variant?: "default" | "outline";
}

const statusStyles: Record<string, string> = {
    active: "bg-mint/10 text-mint border-mint/20",
    verified: "bg-mint/10 text-mint border-mint/20",
    completed: "bg-mint/10 text-mint border-mint/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    inactive: "bg-muted text-muted-foreground border-muted-foreground/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const StatusBadge = ({ status, variant = "default" }: StatusBadgeProps) => {
    const styles = statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground";

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                styles,
                variant === "outline" && "border"
            )}
        >
            {status}
        </span>
    );
};

export default StatusBadge;