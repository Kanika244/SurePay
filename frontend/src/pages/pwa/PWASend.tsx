import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, User as UserIcon, QrCode, Phone, WifiOff, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { useCoupons } from "@/contexts/CouponContext";
import WalletCard from "@/components/pwa/WalletCard";
import CouponSelector from "@/components/pwa/CouponSelector";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { IssuedCoupon } from "@/data/couponMockData";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type SendMethod = "id" | "phone" | "qr";

const PinDot = ({ filled }: { filled: boolean }) => (
    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${filled ? "bg-primary border-primary scale-110" : "border-muted-foreground/40"
        }`} />
);

const PWASend = () => {
    const {
        wallets, selectedWallet, setSelectedWallet,
        user, sendMoney, refreshWallet, refreshTransactions
    } = useIndividual();
    const { issuedCoupons } = useCoupons();

    const [method, setMethod] = useState<SendMethod>("id");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [pin, setPin] = useState("");
    const [step, setStep] = useState<"form" | "pin" | "confirm">("form");
    const [selectedCoupon, setSelectedCoupon] = useState<IssuedCoupon | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [sending, setSending] = useState(false);
    const [pinError, setPinError] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isOnline } = useNetworkStatus();

    const wallet = wallets.find(w => w.id === selectedWallet) || wallets[0];
    const couponDeduction = selectedCoupon
        ? Math.min(Number(amount) || 0, selectedCoupon.remainingValue, selectedCoupon.maxPerTransaction ?? Infinity)
        : 0;
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

    const handleKey = (key: string) => {
        if (key === "del") { setPin(p => p.slice(0, -1)); setPinError(""); return; }
        if (pin.length >= 4) return;
        const next = pin + key;
        setPin(next);
        setPinError("");
        if (next.length === 4) verifyPin(next);
    };

    const verifyPin = async (enteredPin: string) => {
        setVerifying(true);
        try {
            const formData = new FormData();
            formData.append("phone", user.phone);
            formData.append("pin", enteredPin);
            const res = await fetch(`${BASE_URL}/api/kyc/verify-pin`, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setStep("confirm");
            } else {
                setPinError(data.detail || "Incorrect PIN. Try again.");
                setPin("");
            }
        } catch {
            setPinError("Network error. Please try again.");
            setPin("");
        } finally {
            setVerifying(false);
        }
    };

    const handleConfirm = async () => {
        // Offline — use queue
        if (!isOnline) {
            const result = sendMoney(recipient, Number(amount), wallet.id, note);
            if (!result.success) {
                toast({ title: "Failed", description: result.reason, variant: "destructive" });
                return;
            }
            toast({ title: "Queued", description: `₹${Number(amount).toLocaleString()} will be sent when online` });
            navigate("/app");
            return;
        }

        // Online — call real API
        setSending(true);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/wallet/individual/transfer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_user_id: user.id,
                    receiver_id: recipient,
                    amount: Number(amount),
                    note: note,
                }),
            });
            const data = await res.json();

            if (res.ok && data.status === "success") {
                // ── Refresh sender balance and transactions immediately ──
                await refreshWallet();
                await refreshTransactions();
                toast({ title: "Money Sent! 🎉", description: `₹${Number(amount).toLocaleString()} sent to ${recipient}` });
                navigate("/app");
            } else {
                toast({ title: "Transfer Failed", description: data.detail || "Something went wrong.", variant: "destructive" });
            }
        } catch {
            toast({ title: "Network Error", description: "Please check your connection.", variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const methods: { key: SendMethod; icon: typeof UserIcon; label: string }[] = [
        { key: "id", icon: UserIcon, label: "SurePay ID" },
        { key: "phone", icon: Phone, label: "Phone" },
        { key: "qr", icon: QrCode, label: "QR Code" },
    ];

    // ── PIN Step ──
    if (step === "pin") {
        return (
            <div className="px-4 pt-4">
                <button onClick={() => { setStep("form"); setPin(""); setPinError(""); }}
                    className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <ArrowLeft size={16} /> Back
                </button>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="text-center space-y-1">
                        <h1 className="text-xl font-bold text-foreground">Enter Transaction PIN</h1>
                        <p className="text-sm text-muted-foreground">
                            Sending ₹{Number(amount).toLocaleString()} to {recipient}
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        {[0, 1, 2, 3].map(i => <PinDot key={i} filled={pin.length > i} />)}
                    </div>
                    {pinError && <p className="text-center text-sm text-destructive">{pinError}</p>}
                    {verifying && <p className="text-center text-sm text-muted-foreground">Verifying...</p>}
                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                        {keys.map((key, idx) => (
                            key === "" ? <div key={idx} /> :
                                key === "del" ? (
                                    <button key={idx} onClick={() => handleKey("del")} disabled={verifying}
                                        className="h-14 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform">
                                        <Delete size={20} className="text-muted-foreground" />
                                    </button>
                                ) : (
                                    <button key={idx} onClick={() => handleKey(key)} disabled={verifying || pin.length >= 4}
                                        className="h-14 rounded-2xl bg-card border border-border text-lg font-semibold hover:bg-muted active:scale-95 transition-transform disabled:opacity-50">
                                        {key}
                                    </button>
                                )
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Confirm Step ──
    if (step === "confirm") {
        return (
            <div className="px-4 pt-4">
                <button onClick={() => { setStep("form"); setPin(""); }}
                    className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
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
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">To</span>
                            <span className="font-medium">{recipient}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-xl">₹{Number(amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wallet</span>
                            <span className="font-medium">{wallet?.type === "employer" ? wallet.employerName : "Personal"}</span>
                        </div>
                        {note && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Note</span>
                                <span>{note}</span>
                            </div>
                        )}
                        {selectedCoupon && (
                            <>
                                <div className="border-t border-border my-2" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Coupon Applied</span>
                                    <span className="font-medium text-primary">{selectedCoupon.templateName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Coupon Deduction</span>
                                    <span className="font-medium text-mint">-₹{couponDeduction.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Remaining Balance</span>
                                    <span className="text-foreground">₹{(selectedCoupon.remainingValue - couponDeduction).toLocaleString()}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">PIN</span>
                            <span className="text-emerald-500 font-medium">✓ Verified</span>
                        </div>
                    </div>
                    <Button variant="hero" size="lg" className="w-full" onClick={handleConfirm} disabled={sending}>
                        {sending ? "Sending..." : isOnline ? "Confirm & Send" : "Queue & Send Later"}
                    </Button>
                </motion.div>
            </div>
        );
    }

    // ── Form Step ──
    return (
        <div className="px-4 pt-4">
            <Link to="/app" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <ArrowLeft size={16} /> Back
            </Link>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-foreground">Send Money</h1>
                <div className="flex gap-2">
                    {methods.map(m => (
                        <button key={m.key}
                            onClick={() => { setMethod(m.key); if (m.key === "qr") navigate("/app/scan"); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm font-medium transition-all ${method === m.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                                }`}>
                            <m.icon size={16} />{m.label}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    <Label>{method === "phone" ? "Phone Number" : "SurePay ID"}</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input placeholder={method === "phone" ? "+91 98765 43210" : "name@surepay"}
                            className="h-12 pl-10" value={recipient} onChange={e => setRecipient(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">₹</span>
                        <Input type="number" placeholder="0" className="h-14 pl-8 text-2xl font-bold"
                            value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Pay from</Label>
                    <div className="space-y-2">
                        {wallets.map(w => (
                            <WalletCard key={w.id} wallet={w} compact selected={selectedWallet === w.id} onClick={() => setSelectedWallet(w.id)} />
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Textarea placeholder="What's this for?" rows={2} value={note} onChange={e => setNote(e.target.value)} />
                </div>

                {/* Coupon selector */}
                {Number(amount) > 0 && wallet?.type === "employer" && (
                    <CouponSelector
                        coupons={issuedCoupons}
                        selectedCoupon={selectedCoupon}
                        onSelect={setSelectedCoupon}
                        amount={Number(amount)}
                    />
                )}
                <Button variant="hero" size="lg" className="w-full"
                    disabled={!recipient || !amount || Number(amount) <= 0}
                    onClick={() => setStep("pin")}>
                    Continue
                </Button>
            </motion.div>
        </div>
    );
};

export default PWASend;