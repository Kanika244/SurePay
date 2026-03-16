import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    Wallet,
    RefreshCw
} from "lucide-react";
import { API_BASE_URL } from "@/services/config";

interface Transaction {
    id: string;
    type: "credit" | "debit";
    amount: number;
    description: string;
    status: string;
    created_at: string;
    sender_wallet_id: string | null;
    sender_type: string | null;
    sender_name: string | null;
}

export default function IndividualTransactions() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [walletId, setWalletId] = useState<string | null>(null);

    const userId = localStorage.getItem("individual_user_id");

    useEffect(() => {
        if (!userId) {
            navigate("/auth/signin");
            return;
        }
        fetchTransactions();
    }, [userId]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/wallet/individual/${userId}/transactions`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success") {
                    setTransactions(data.transactions);
                    setWalletId(data.wallet_id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case "failed":
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 pb-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/dashboard/individual")}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Transactions</h1>
                        <p className="text-sm text-muted-foreground">
                            {walletId && `Wallet: ${walletId}`}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchTransactions}
                        className="ml-auto rounded-full"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="px-6 -mt-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : transactions.length === 0 ? (
                    <Card className="bg-muted/30">
                        <CardContent className="p-8 text-center">
                            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">No Transactions Yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Your transaction history will appear here once you receive or send money.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit"
                                                    ? "bg-green-100 dark:bg-green-900/30"
                                                    : "bg-red-100 dark:bg-red-900/30"
                                                }`}>
                                                {tx.type === "credit" ? (
                                                    <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {tx.sender_name && (
                                                        <div className="flex items-center gap-1 text-sm font-medium">
                                                            <Building2 className="w-4 h-4 text-primary" />
                                                            {tx.sender_name}
                                                        </div>
                                                    )}
                                                    {getStatusIcon(tx.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {tx.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(tx.created_at)}
                                                </p>
                                            </div>

                                            {/* Amount */}
                                            <div className={`text-right font-semibold ${tx.type === "credit"
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                                }`}>
                                                {tx.type === "credit" ? "+" : "-"}
                                                {formatAmount(tx.amount)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom spacing */}
            <div className="h-20" />
        </div>
    );
}
