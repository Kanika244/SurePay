import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark, CreditCard, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const methods = [
    { key: "bank", icon: Landmark, label: "Bank Transfer" },
    { key: "upi", icon: Smartphone, label: "UPI" },
    { key: "card", icon: CreditCard, label: "Debit Card" },
] as const;

type Method = typeof methods[number]["key"];

const PWAAddMoney = () => {
    const { user, refreshWallet, refreshTransactions } = useIndividual();
    const [method, setMethod] = useState<Method>("upi");
    const [amount, setAmount] = useState("");
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const quickAmounts = [500, 1000, 2000, 5000];

    const handleAdd = async () => {
        if (!amount || Number(amount) <= 0) return;
        setProcessing(true);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/wallet/individual/top-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    amount: Number(amount),
                    method,
                    description: `Top-up via ${method}`,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                await refreshWallet();
                await refreshTransactions();
                setDone(true);
                toast({ title: "Money Added!", description: `₹${Number(amount).toLocaleString()} added to your wallet` });
                setTimeout(() => navigate("/app"), 1500);
            } else {
                toast({ title: "Failed", description: data.detail || "Something went wrong.", variant: "destructive" });
            }
        } catch {
            toast({ title: "Network Error", description: "Please check your connection and try again.", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    if (done) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                    <CheckCircle size={64} className="text-mint mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-1">Money Added!</h2>
                    <p className="text-muted-foreground">₹{Number(amount).toLocaleString()} added to your personal wallet</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="px-4 pt-4">
            <Link to="/app" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <ArrowLeft size={16} /> Back
            </Link>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-foreground">Add Money</h1>

                {/* Amount */}
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
                        <Input type="number" placeholder="0" className="h-14 pl-8 text-2xl font-bold" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        {quickAmounts.map(qa => (
                            <button key={qa} onClick={() => setAmount(String(qa))} className="flex-1 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                                ₹{qa.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="space-y-2">
                        {methods.map(m => (
                            <button key={m.key} onClick={() => setMethod(m.key)}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${method === m.key ? "border-primary bg-primary/5" : "border-border"}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === m.key ? "bg-primary/10" : "bg-muted"}`}>
                                    <m.icon size={18} className={method === m.key ? "text-primary" : "text-muted-foreground"} />
                                </div>
                                <span className={`text-sm font-medium ${method === m.key ? "text-primary" : "text-foreground"}`}>{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" disabled={!amount || Number(amount) <= 0 || processing} onClick={handleAdd}>
                    {processing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : `Add ₹${amount ? Number(amount).toLocaleString() : "0"}`}
                </Button>
            </motion.div>
        </div>
    );
};

export default PWAAddMoney;
