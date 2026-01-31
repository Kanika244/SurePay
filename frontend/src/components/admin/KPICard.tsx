import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    delay?: number;
}

const KPICard = ({ title, value, change, trend = "neutral", icon: Icon, delay = 0 }: KPICardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        {change && (
                            <span
                                className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    trend === "up" && "bg-mint/10 text-mint",
                                    trend === "down" && "bg-destructive/10 text-destructive",
                                    trend === "neutral" && "bg-muted text-muted-foreground"
                                )}
                            >
                                {change}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default KPICard;