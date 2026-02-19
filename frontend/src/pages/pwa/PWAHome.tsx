import { motion } from "framer-motion";
import { Bell, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import WalletCard from "@/components/pwa/WalletCard";
import TransactionItem from "@/components/pwa/TransactionItem";
import { Send, ArrowDownLeft, QrCode, CreditCard } from "lucide-react";
import logo from "@/assets/logo.jpg";

const quickActions = [
    { to: "/app/send", icon: Send, label: "Send", color: "bg-primary/10 text-primary" },
    { to: "/app/receive", icon: ArrowDownLeft, label: "Receive", color: "bg-accent/10 text-accent" },
    { to: "/app/scan", icon: QrCode, label: "Scan QR", color: "bg-mint/10 text-mint" },
    { to: "/app/add-money", icon: CreditCard, label: "Add Money", color: "bg-secondary/10 text-secondary" },
];

const PWAHome = () => {
    const { user, wallets, transactions, notifications } = useIndividual();
    const unreadCount = notifications.filter(n => !n.read).length;
    const recentTx = transactions.slice(0, 5);

    return (
        <div className="px-4 pt-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="SurePay" className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                        <p className="text-xs text-muted-foreground">Good afternoon</p>
                        <p className="text-base font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                    </div>
                </div>
                <Link to="/app/notifications" className="relative">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell size={20} />
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Link>
            </motion.div>

            {/* Wallets */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3 mb-6">
                {wallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} />
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-3 mb-6">
                {quickActions.map((action) => (
                    <Link key={action.to} to={action.to} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
                        <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center`}>
                            <action.icon size={20} />
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
                    </Link>
                ))}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
                    <Link to="/app/transactions" className="text-xs text-primary font-medium flex items-center gap-0.5">
                        View All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {recentTx.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">No transactions yet</p>
                    ) : (
                        recentTx.map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))
                    )}
                </div>
            </motion.div>

            {/* Add Money FAB */}
            <Link to="/app/add-money" className="fixed bottom-20 right-4 z-40">
                <Button variant="hero" size="icon" className="w-12 h-12 rounded-full shadow-lg">
                    <Plus size={22} />
                </Button>
            </Link>
        </div>
    );
};

export default PWAHome;
