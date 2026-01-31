import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    User,
    Settings,
    LogOut,
    Plus,
    Send,
    QrCode,
    CreditCard,
    TrendingUp
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Simulate logout
        navigate("/auth/signin");
    };

    const quickActions = [
        { icon: Send, label: "Send Money", color: "bg-primary/10 text-primary" },
        { icon: ArrowDownLeft, label: "Request", color: "bg-accent/10 text-accent" },
        { icon: QrCode, label: "Scan & Pay", color: "bg-green-500/10 text-green-600" },
        { icon: CreditCard, label: "Add Money", color: "bg-orange-500/10 text-orange-600" },
    ];

    const recentTransactions = [
        { id: 1, name: "Amazon Pay", type: "debit", amount: -1299, date: "Today, 2:30 PM" },
        { id: 2, name: "Rahul Sharma", type: "credit", amount: 5000, date: "Today, 11:00 AM" },
        { id: 3, name: "Netflix", type: "debit", amount: -649, date: "Yesterday" },
        { id: 4, name: "Salary - ACME Inc", type: "credit", amount: 85000, date: "Jan 1, 2026" },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">SurePay</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                            <Settings size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut size={20} />
                        </Button>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={18} className="text-primary" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        Good afternoon, User! 👋
                    </h1>
                    <p className="text-muted-foreground">Here's your financial overview</p>
                </motion.div>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet size={20} />
                                <span className="text-sm opacity-90">Wallet Balance</span>
                            </div>
                            <div className="text-4xl md:text-5xl font-bold mb-4">
                                ₹24,580.<span className="text-2xl">00</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm">
                                    <TrendingUp size={16} />
                                    <span>+12.5% this month</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                                    <action.icon size={22} />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                        <Button variant="ghost" size="sm" className="text-primary gap-1">
                            <History size={16} />
                            View All
                        </Button>
                    </div>
                    <Card>
                        <CardContent className="p-0 divide-y divide-border">
                            {recentTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-accent/10" : "bg-destructive/10"
                                            }`}>
                                            {tx.type === "credit" ? (
                                                <ArrowDownLeft className="text-accent" size={18} />
                                            ) : (
                                                <ArrowUpRight className="text-destructive" size={18} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{tx.name}</p>
                                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${tx.type === "credit" ? "text-accent" : "text-foreground"
                                        }`}>
                                        {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                                    </span>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;
