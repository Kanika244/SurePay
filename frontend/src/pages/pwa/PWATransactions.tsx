import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import TransactionItem from "@/components/pwa/TransactionItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PWATransactions = () => {
    const { transactions, pendingOfflineTx, retryOfflineTx } = useIndividual();
    const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
    const [walletFilter, setWalletFilter] = useState<"all" | "personal" | "employer">("all");
    const [showFilters, setShowFilters] = useState(false);

    // Build a map of offline statuses by tx id
    const offlineStatusMap = new Map(pendingOfflineTx.map(otx => [otx.id, otx.status]));

    const filtered = transactions.filter(tx => {
        if (filter !== "all" && tx.type !== filter) return false;
        if (walletFilter !== "all" && tx.walletUsed !== walletFilter) return false;
        return true;
    });

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <Link to="/app"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                    <h1 className="text-lg font-bold text-foreground">Transactions</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} />
                </Button>
            </div>

            {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 flex gap-3">
                    <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={walletFilter} onValueChange={(v) => setWalletFilter(v as typeof walletFilter)}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Wallet" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Wallets</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="employer">Employer</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>
            )}

            {pendingOfflineTx.length > 0 && (
                <div className="mb-3 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2">
                    <p className="text-xs font-medium text-secondary">{pendingOfflineTx.length} transaction(s) pending sync</p>
                </div>
            )}

            <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
                {filtered.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-12">No transactions found</p>
                ) : (
                    filtered.map(tx => (
                        <TransactionItem
                            key={tx.id}
                            transaction={tx}
                            offlineStatus={offlineStatusMap.get(tx.id) as any}
                            onRetry={() => retryOfflineTx(tx.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PWATransactions;
