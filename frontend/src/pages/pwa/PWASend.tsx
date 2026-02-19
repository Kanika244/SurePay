import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, User as UserIcon, QrCode, Phone, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import WalletCard from "@/components/pwa/WalletCard";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

type SendMethod = "id" | "phone" | "qr";

const PWASend = () => {
    const { wallets, selectedWallet, setSelectedWallet, sendMoney } = useIndividual();
    const [method, setMethod] = useState<SendMethod>("id");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [pin, setPin] = useState("");
    const [step, setStep] = useState<"form" | "confirm">("form");
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isOnline } = useNetworkStatus();

    const wallet = wallets.find(w => w.id === selectedWallet) || wallets[0];

    const handleConfirm = () => {
        if (pin.length < 4) {
            toast({ title: "Invalid PIN", description: "Enter your 4-digit transaction PIN", variant: "destructive" });
            return;
        }
        const result = sendMoney(recipient, Number(amount), wallet.id, note);
        if (!result.success) {
            toast({ title: "Transaction Failed", description: result.reason, variant: "destructive" });
            return;
        }
        if (result.offline) {
            toast({ title: "Transaction Queued", description: `₹${Number(amount).toLocaleString()} will be sent to ${recipient} when you're back online` });
        } else {
            toast({ title: "Money Sent!", description: `₹${Number(amount).toLocaleString()} sent to ${recipient}` });
        }
        navigate("/app");
    };

    const methods: { key: SendMethod; icon: typeof UserIcon; label: string }[] = [
        { key: "id", icon: UserIcon, label: "SurePay ID" },
        { key: "phone", icon: Phone, label: "Phone" },
        { key: "qr", icon: QrCode, label: "QR Code" },
    ];

    if (step === "confirm") {
        return (
            <div className="px-4 pt-4">
                <button onClick={() => setStep("form")} className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <ArrowLeft size={16} /> Back
                </button>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h1 className="text-xl font-bold text-foreground">Confirm Transfer</h1>

                    {!isOnline && (
                        <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2">
                            <WifiOff size={14} className="text-secondary" />
                            <span className="text-xs font-medium text-secondary">Offline — transaction will be queued</span>
                        </div>
                    )}

                    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">To</span><span className="font-medium text-foreground">{recipient}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-bold text-xl text-foreground">₹{Number(amount).toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Wallet</span><span className="font-medium text-foreground">{wallet.type === "employer" ? wallet.employerName : "Personal"}</span></div>
                        {note && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Note</span><span className="text-foreground">{note}</span></div>}
                    </div>
                    <div className="space-y-2">
                        <Label>Transaction PIN</Label>
                        <Input type="password" maxLength={4} placeholder="••••" className="h-12 text-center text-xl tracking-widest" value={pin} onChange={e => setPin(e.target.value)} />
                    </div>
                    <Button variant="hero" size="lg" className="w-full" onClick={handleConfirm}>
                        {isOnline ? "Confirm & Send" : "Queue & Send Later"}
                    </Button>
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
                <h1 className="text-xl font-bold text-foreground">Send Money</h1>

                {/* Method selector */}
                <div className="flex gap-2">
                    {methods.map(m => (
                        <button key={m.key} onClick={() => { setMethod(m.key); if (m.key === "qr") navigate("/app/scan"); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm font-medium transition-all ${method === m.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                            <m.icon size={16} /> {m.label}
                        </button>
                    ))}
                </div>

                {/* Recipient */}
                <div className="space-y-2">
                    <Label>{method === "phone" ? "Phone Number" : "SurePay ID"}</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input placeholder={method === "phone" ? "+91 98765 43210" : "name@surepay"} className="h-12 pl-10" value={recipient} onChange={e => setRecipient(e.target.value)} />
                    </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
                        <Input type="number" placeholder="0" className="h-14 pl-8 text-2xl font-bold" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                </div>

                {/* Wallet selector */}
                <div className="space-y-2">
                    <Label>Pay from</Label>
                    <div className="space-y-2">
                        {wallets.map(w => (
                            <WalletCard key={w.id} wallet={w} compact selected={selectedWallet === w.id} onClick={() => setSelectedWallet(w.id)} />
                        ))}
                    </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Textarea placeholder="What's this for?" rows={2} value={note} onChange={e => setNote(e.target.value)} />
                </div>

                <Button variant="hero" size="lg" className="w-full" disabled={!recipient || !amount || Number(amount) <= 0} onClick={() => setStep("confirm")}>
                    Continue
                </Button>
            </motion.div>
        </div>
    );
};

export default PWASend;
