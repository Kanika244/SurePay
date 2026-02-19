import { motion } from "framer-motion";
import { ArrowLeft, Bell, CreditCard, Shield, Building2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const typeConfig = {
    transaction: { icon: CreditCard, color: "bg-primary/10 text-primary" },
    kyc: { icon: Shield, color: "bg-mint/10 text-mint" },
    employer: { icon: Building2, color: "bg-accent/10 text-accent" },
    system: { icon: Bell, color: "bg-secondary/10 text-secondary" },
};

const PWANotifications = () => {
    const { notifications, markNotificationRead, markAllRead } = useIndividual();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <Link to="/app"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                    <h1 className="text-lg font-bold text-foreground">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-2 py-0.5">{unreadCount}</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={markAllRead}>
                        <CheckCheck size={14} /> Mark all read
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-12">No notifications yet</p>
                ) : (
                    notifications.map(n => {
                        const config = typeConfig[n.type];
                        return (
                            <motion.button
                                key={n.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => markNotificationRead(n.id)}
                                className={cn(
                                    "w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all",
                                    n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
                                )}
                            >
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
                                    <config.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.timestamp), "MMM d, h:mm a")}</p>
                                </div>
                            </motion.button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PWANotifications;
