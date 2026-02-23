import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg";
// ADD this import at the top
import { Link, useNavigate } from "react-router-dom";
import {
    Building2, Wallet, Users, ArrowUpRight, ArrowDownLeft,
    Plus, Settings, LogOut, ChevronDown,
    CreditCard, FileText, BarChart3, UserCheck, UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationDropdown from "@/components/enterprise/NotificationDropdown"; // ← imported

// ADD this inside the component (top of EnterpriseDashboard function)


const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const EnterpriseDashboard = () => {
    const [companyName, setCompanyName] = useState("Loading...");
    const [walletBalance, setWalletBalance] = useState("₹0");
    const [totalTransactions, setTotalTransactions] = useState("0");
    const [teamMembers, setTeamMembers] = useState("0");
    const [kycVerified, setKycVerified] = useState("0");
    const [kycPending, setKycPending] = useState("0");
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("company_id");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!token || !companyId) {
            setError("Session expired. Please login again.");
            setLoading(false);
            return;
        }
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.allSettled([
            fetchProfile(),
            fetchWallet(),
            fetchEmployees(),
            fetchTransactions(),
        ]);
        setLoading(false);
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/enterprise-panel/profile/${companyId}`, { headers });
            if (!res.ok) return;
            const data = await res.json();
            setCompanyName(data.profile?.companyName || "Your Company");
        } catch (e) { console.error("Profile error:", e); }
    };

    const fetchWallet = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/enterprise-panel/wallet/${companyId}`, { headers });
            if (!res.ok) return;
            const data = await res.json();
            setWalletBalance(`₹${Number(data.balance ?? 0).toLocaleString("en-IN")}`);
        } catch (e) { console.error("Wallet error:", e); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/enterprise-panel/employees/${companyId}`, { headers });
            if (!res.ok) return;
            const data = await res.json();
            const list = data.employees ?? [];
            setTeamMembers(list.length.toString());
            const verified = list.filter((e: any) => e.kycVerified === true).length;
            setKycVerified(verified.toString());
            setKycPending((list.length - verified).toString());
        } catch (e) { console.error("Employees error:", e); }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/enterprise-panel/transactions/${companyId}`, { headers });
            if (!res.ok) return;
            const data = await res.json();
            const list = data.transactions ?? [];
            setTotalTransactions(list.length.toString());
            const formatted = list.slice(0, 4).map((tx: any, i: number) => ({
                id: tx.id || i,
                type: tx.type === "credit" ? "credit" : "debit",
                description: tx.description || "Transaction",
                amount: `₹${Number(Math.abs(tx.amount)).toLocaleString("en-IN")}`,
                date: tx.timestamp
                    ? new Date(tx.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : "Recently",
            }));
            setRecentTransactions(formatted);
        } catch (e) { console.error("Transactions error:", e); }
    };

    const stats = [
        { title: "Wallet Balance", value: walletBalance, icon: Wallet, color: "bg-primary/10", iconColor: "text-primary" },
        { title: "Total Transactions", value: totalTransactions, icon: CreditCard, color: "bg-primary/10", iconColor: "text-primary" },
        { title: "Team Members", value: teamMembers, icon: Users, color: "bg-primary/10", iconColor: "text-primary" },
        { title: "KYC Verified", value: kycVerified, icon: UserCheck, color: "bg-green-500/10", iconColor: "text-green-500" },
        { title: "KYC Pending", value: kycPending, icon: UserX, color: "bg-destructive/10", iconColor: "text-destructive" },
    ];

    const quickActions = [
        { label: "Add Money", icon: Plus, variant: "default" as const },
        { label: "Send Payment", icon: ArrowUpRight, variant: "outline" as const },
        { label: "Request Money", icon: ArrowDownLeft, variant: "outline" as const },
        { label: "View Reports", icon: BarChart3, variant: "outline" as const },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-destructive font-medium">{error}</p>
                <Button onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
                    Login Again
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">

            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="SurePay Logo" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-semibold text-lg">SurePay</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Enterprise</span>
                    </Link>

                    <div className="flex items-center gap-4">

                        {/* ── NotificationDropdown replaces old bell button ── */}
                        <NotificationDropdown />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium">
                                        {companyName.split(" ")[0]}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onSelect={() => {
                                    console.log("Settings clicked");
                                    navigate("/enterprise/settings");

                                }}>
                                    <Settings className="w-4 h-4 mr-2" />Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem><Users className="w-4 h-4 mr-2" />Team Management</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="container px-4 py-8">

                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Welcome back, {companyName}
                    </h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your enterprise account today.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <Card>
                                    <CardContent className="p-5">
                                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                                            <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Button key={action.label} variant={action.variant} className="gap-2">
                                    <Icon className="w-4 h-4" />{action.label}
                                </Button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Transactions</CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {recentTransactions.map((tx: any) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-green-500/10" : "bg-destructive/10"}`}>
                                                    {tx.type === "credit"
                                                        ? <ArrowDownLeft className="w-5 h-5 text-green-500" />
                                                        : <ArrowUpRight className="w-5 h-5 text-destructive" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-medium">{tx.description}</p>
                                                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                                                </div>
                                            </div>
                                            <p className={`font-semibold ${tx.type === "credit" ? "text-green-500" : "text-foreground"}`}>
                                                {tx.type === "credit" ? "+" : "-"}{tx.amount}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default EnterpriseDashboard;