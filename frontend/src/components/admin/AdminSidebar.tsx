import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Building2,
    Users,
    User,
    Wallet,
    BarChart3,
    FileText,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpg";

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

const navItems: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Enterprises", icon: Building2, path: "/admin/enterprises" },
    { label: "Employees", icon: Users, path: "/admin/employees" },
    { label: "Individuals", icon: User, path: "/admin/individuals" },
    { label: "Wallets", icon: Wallet, path: "/admin/wallets" },
    { label: "Transactions", icon: BarChart3, path: "/admin/transactions" },
    { label: "Audit Logs", icon: FileText, path: "/admin/audit-logs" },
];

const AdminSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ duration: 0.2 }}
            className="h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-40"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Link to="/admin" className="flex items-center gap-2">
                    <img src={logo} alt="SurePay" className="w-9 h-9 rounded-xl object-cover" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex items-center gap-2"
                            >
                                <span className="font-bold text-lg text-foreground">SurePay</span>
                                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded font-medium flex items-center gap-1">
                                    <Shield size={10} />
                                    Admin
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                active
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon size={20} className={collapsed ? "mx-auto" : ""} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border">
                <Link
                    to="/auth/signin"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    )}
                >
                    <LogOut size={20} className={collapsed ? "mx-auto" : ""} />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-sm font-medium"
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full mt-2 justify-center"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
            </div>
        </motion.aside>
    );
};

export default AdminSidebar;