import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg";
import {
    Building2,
    Wallet,
    Users,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    Settings,
    Bell,
    LogOut,
    ChevronDown,
    TrendingUp,
    CreditCard,
    FileText,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EnterpriseDashboard = () => {
    const [companyName] = useState("Acme Technologies Pvt Ltd");

    const stats = [
        {
            title: "Wallet Balance",
            value: "₹12,45,678",
            change: "+12.5%",
            trend: "up",
            icon: Wallet,
        },
        {
            title: "Total Transactions",
            value: "1,234",
            change: "+8.2%",
            trend: "up",
            icon: CreditCard,
        },
        {
            title: "Team Members",
            value: "24",
            change: "+2",
            trend: "up",
            icon: Users,
        },
        {
            title: "Pending Approvals",
            value: "7",
            change: "-3",
            trend: "down",
            icon: FileText,
        },
    ];

    const recentTransactions = [
        {
            id: 1,
            type: "credit",
            description: "Payment from Client XYZ",
            amount: "₹2,50,000",
            date: "Today, 2:30 PM",
        },
        {
            id: 2,
            type: "debit",
            description: "Vendor Payment - ABC Corp",
            amount: "₹1,25,000",
            date: "Today, 11:00 AM",
        },
        {
            id: 3,
            type: "credit",
            description: "Invoice #INV-2024-001",
            amount: "₹75,000",
            date: "Yesterday, 4:15 PM",
        },
        {
            id: 4,
            type: "debit",
            description: "Salary Disbursement",
            amount: "₹8,50,000",
            date: "Jan 15, 2024",
        },
    ];

    const quickActions = [
        { label: "Add Money", icon: Plus, variant: "default" as const },
        { label: "Send Payment", icon: ArrowUpRight, variant: "outline" as const },
        { label: "Request Money", icon: ArrowDownLeft, variant: "outline" as const },
        { label: "View Reports", icon: BarChart3, variant: "outline" as const },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src={logo}
                                alt="SurePay Logo"
                                className="w-8 h-8 rounded-lg object-cover"
                            />
                            <span className="font-semibold text-lg">SurePay</span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                Enterprise
                            </span>
                        </Link>

                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium">
                                        Acme Tech
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Users className="w-4 h-4 mr-2" />
                                    Team Management
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-4 py-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Welcome back, {companyName}
                    </h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your enterprise account today.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded ${stat.trend === "up"
                                                    ? "bg-mint/10 text-mint"
                                                    : "bg-destructive/10 text-destructive"
                                                    }`}
                                            >
                                                {stat.change}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Button key={action.label} variant={action.variant} className="gap-2">
                                    <Icon className="w-4 h-4" />
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Transactions</CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary">
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "credit"
                                                    ? "bg-mint/10"
                                                    : "bg-destructive/10"
                                                    }`}
                                            >
                                                {transaction.type === "credit" ? (
                                                    <ArrowDownLeft className="w-5 h-5 text-mint" />
                                                ) : (
                                                    <ArrowUpRight className="w-5 h-5 text-destructive" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.date}
                                                </p>
                                            </div>
                                        </div>
                                        <p
                                            className={`font-semibold ${transaction.type === "credit"
                                                ? "text-mint"
                                                : "text-foreground"
                                                }`}
                                        >
                                            {transaction.type === "credit" ? "+" : "-"}
                                            {transaction.amount}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default EnterpriseDashboard;
