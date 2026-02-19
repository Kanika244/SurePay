import { NavLink, useLocation } from "react-router-dom";
import { Home, ScanLine, ArrowLeftRight, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIndividual } from "@/contexts/IndividualContext";

const navItems = [
    { to: "/app", icon: Home, label: "Home" },
    { to: "/app/transactions", icon: ArrowLeftRight, label: "History" },
    { to: "/app/scan", icon: ScanLine, label: "Scan", isCenter: true },
    { to: "/app/notifications", icon: Bell, label: "Alerts" },
    { to: "/app/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
    const location = useLocation();
    const { notifications } = useIndividual();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = item.to === "/app"
                        ? location.pathname === "/app"
                        : location.pathname.startsWith(item.to);

                    if (item.isCenter) {
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                                    "bg-gradient-to-br from-primary to-accent"
                                )}>
                                    <item.icon size={24} className="text-primary-foreground" />
                                </div>
                                <span className="text-[10px] font-medium mt-1 text-muted-foreground">{item.label}</span>
                            </NavLink>
                        );
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center justify-center gap-0.5 relative"
                        >
                            <div className="relative">
                                <item.icon
                                    size={22}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                />
                                {item.label === "Alerts" && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
