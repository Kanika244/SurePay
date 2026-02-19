import { motion } from "framer-motion";
import { ArrowLeft, User, Shield, FileText, Building2, LogOut, ChevronRight, CheckCircle, Clock, XCircle, Key, Lock, Smartphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { Separator } from "@/components/ui/separator";

interface LayoutContext {
    isOnline: boolean;
    pendingSyncCount: number;
    handleSync: () => void;
    isSyncing: boolean;
}

const kycStatusConfig = {
    verified: { icon: CheckCircle, color: "text-mint", bg: "bg-mint/10", label: "Verified" },
    pending: { icon: Clock, color: "text-secondary", bg: "bg-secondary/10", label: "Pending" },
    rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected" },
};

const PWAProfile = () => {
    const { user, logout, pendingOfflineTx } = useIndividual();
    const navigate = useNavigate();
    const kycConfig = kycStatusConfig[user.kycStatus];

    let layoutCtx: LayoutContext | undefined;
    try {
        layoutCtx = useOutletContext<LayoutContext>();
    } catch {
        // Not within layout context
    }

    const handleLogout = async () => {
        if (pendingOfflineTx.length > 0) {
            const confirmed = window.confirm(
                `You have ${pendingOfflineTx.length} pending offline transaction(s). Logging out will clear them. Continue?`
            );
            if (!confirmed) return;
        }
        await logout();
        navigate("/auth/signin");
    };

    const sections = [
        {
            title: "Account",
            items: [
                { icon: User, label: "Personal Information", sub: `${user.firstName} ${user.lastName}`, to: "#" },
                { icon: FileText, label: "KYC Documents", sub: kycConfig.label, to: "#", badge: kycConfig },
                { icon: Key, label: "SurePay ID", sub: user.surePayId, to: "#" },
            ],
        },
        {
            title: "Security",
            items: [
                { icon: Lock, label: "Change Password", sub: "Last changed 30 days ago", to: "#" },
                { icon: Shield, label: "Two-Factor Auth", sub: "Enabled", to: "#" },
                { icon: Smartphone, label: "Transaction PIN", sub: "Set up", to: "#" },
            ],
        },
    ];

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">Profile</h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* User card */}
                <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full ${kycConfig.bg}`}>
                        <kycConfig.icon size={14} className={kycConfig.color} />
                    </div>
                </div>

                {/* Employer section */}
                {user.isEmployee && user.employer && (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Building2 size={18} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{user.employer.name}</p>
                                <p className="text-xs text-muted-foreground">{user.employer.employeeId} · {user.employer.department}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sync section */}
                {layoutCtx && layoutCtx.pendingSyncCount > 0 && (
                    <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Pending Sync</p>
                                <p className="text-xs text-muted-foreground">{layoutCtx.pendingSyncCount} transaction(s) waiting</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={layoutCtx.handleSync}
                                disabled={!layoutCtx.isOnline || layoutCtx.isSyncing}
                            >
                                <RefreshCw size={14} className={layoutCtx.isSyncing ? "animate-spin" : ""} />
                                {layoutCtx.isSyncing ? "Syncing..." : "Sync Now"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Sections */}
                {sections.map(section => (
                    <div key={section.title}>
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{section.title}</h2>
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                            {section.items.map((item, idx) => (
                                <div key={item.label}>
                                    {idx > 0 && <Separator />}
                                    <Link to={item.to} className="flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                            <item.icon size={16} className="text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-muted-foreground" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout */}
                <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2" onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                </Button>
            </motion.div>
        </div>
    );
};

export default PWAProfile;
