import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import WalletCard from "@/components/pwa/WalletCard";
import EmployerInfoCard from "@/components/pwa/EmployerInfoCard";
import TransactionItem from "@/components/pwa/TransactionItem";
import { Button } from "@/components/ui/button";

const PWAWallet = () => {
    const { user, wallets, transactions } = useIndividual();
    const employerWallet = wallets.find(w => w.type === "employer");
    const personalWallet = wallets.find(w => w.type === "personal");

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">My Wallets</h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Personal wallet */}
                {personalWallet && (
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Personal Wallet</h2>
                        <WalletCard wallet={personalWallet} />
                        <div className="flex gap-3 mt-3">
                            <Button variant="hero" size="sm" className="flex-1" asChild><Link to="/app/add-money">Add Money</Link></Button>
                            <Button variant="outline" size="sm" className="flex-1" asChild><Link to="/app/send">Send</Link></Button>
                        </div>
                    </div>
                )}

                {/* Employer wallet */}
                {employerWallet && (
                    <div>
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Company Wallet</h2>
                        <WalletCard wallet={employerWallet} />
                        <div className="mt-3">
                            <EmployerInfoCard
                                name={user.employer?.name || employerWallet.employerName || "Company"}
                                employeeId={user.employer?.employeeId || ""}
                                department={user.employer?.department || ""}
                                allocatedAmount={employerWallet.monthlyLimit || 0}
                                balance={employerWallet.balance}
                                monthlyLimit={employerWallet.monthlyLimit || 0}
                                spentThisMonth={employerWallet.spentThisMonth || 0}
                                maxPerTransaction={employerWallet.maxPerTransaction || 0}
                            />
                        </div>
                    </div>
                )}

                {/* Recent wallet transactions */}
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground mb-2">Recent Activity</h2>
                    <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
                        {transactions.slice(0, 5).map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PWAWallet;
