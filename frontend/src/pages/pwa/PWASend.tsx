import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, User as UserIcon, QrCode, Phone, WifiOff, Delete, Utensils, Fuel, Hotel, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import WalletCard from "@/components/pwa/WalletCard";
import CouponSelector from "@/components/pwa/CouponSelector";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { IssuedCoupon } from "@/data/couponMockData";

import { API_BASE_URL as BASE_URL } from "@/services/config";
const COUPON_API = `${BASE_URL}/api/enterprise/coupons`;

type SendMethod = "id" | "phone" | "qr";
type PaymentCategory = "food" | "fuel" | "accommodation" | "general";

const paymentCategories: { key: PaymentCategory; label: string; icon: typeof Utensils }[] = [
    { key: "food", label: "Food", icon: Utensils },
    { key: "fuel", label: "Fuel", icon: Fuel },
    { key: "accommodation", label: "Stay", icon: Hotel },
    { key: "general", label: "General", icon: ShoppingBag },
];

const PinDot = ({ filled }: { filled: boolean }) => (
    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${filled ? "bg-primary border-primary scale-110" : "border-muted-foreground/40"}`} />
);

const PWASend = () => {
    const {
        wallets, selectedWallet, setSelectedWallet,
        user, sendMoney, refreshWallet, refreshTransactions
    } = useIndividual();

    const [issuedCoupons, setIssuedCoupons] = useState<IssuedCoupon[]>([]);
    const refreshCoupons = () => {
        if (!user?.id) return;
        fetch(`${COUPON_API}/employee/${user.id}/my-coupons`)
            .then(r => r.json())
            .then(d => { if (d.success) setIssuedCoupons(d.coupons || []); })
            .catch(() => { });
    };
    useEffect(() => { refreshCoupons(); }, [user?.id]);

    const [method, setMethod] = useState<SendMethod>("id");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [paymentCategory, setPaymentCategory] = useState<PaymentCategory | "">("");
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

    // ── Derived payment amounts ──
    const totalAmount = Number(amount) || 0;

    // How much the coupon covers (capped at coupon balance, per-txn limit, and total amount)
    const couponDeduction = selectedCoupon
        ? Math.min(totalAmount, selectedCoupon.remainingValue, selectedCoupon.maxPerTransaction ?? Infinity)
        : 0;

    // ── FIX: this is what actually gets deducted from the wallet ──
    const walletDeduction = totalAmount - couponDeduction;

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

    const handleCategoryChange = (cat: PaymentCategory) => {
        setPaymentCategory(cat);
        if (selectedCoupon && cat !== "general" && selectedCoupon.couponType !== cat) {
            setSelectedCoupon(null);
        }
    };

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

    // ── Record coupon redemption via /employee/redeem ──
    // Returns true on success, false on failure (caller decides whether to abort the transaction)
    const recordCouponRedemption = async (coupon: IssuedCoupon, deductAmount: number): Promise<boolean> => {
        const payload = {
            couponId: coupon.id,
            employeeId: user.id,
            employeeName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            couponType: coupon.couponType,
            amount: deductAmount,
            merchantId: recipient,
            merchantName: recipient,
        };
        console.log("🎫 Redeeming coupon →", payload);

        try {
            const res = await fetch(`${COUPON_API}/employee/redeem`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("🎫 Redemption response →", res.status, data);

            if (res.ok && data.success) {
                // Update local state with server-confirmed values
                setIssuedCoupons(prev => prev.map(c =>
                    c.id === coupon.id
                        ? { ...c, remainingValue: data.remaining_value, status: data.new_status }
                        : c
                ));
                setSelectedCoupon(null);
                refreshCoupons();
                return true; // ← success
            } else {
                toast({
                    title: "Coupon Error ⚠️",
                    description: data.detail || "Could not process coupon. Transaction blocked.",
                    variant: "destructive",
                });
                return false; // ← failure — caller will abort transaction
            }
        } catch (err) {
            toast({
                title: "Coupon Sync Error",
                description: "Could not reach coupon service. Transaction blocked.",
                variant: "destructive",
            });
            console.error("Coupon redemption error:", err);
            return false;
        }
    };

    const handleContinue = () => {
        if (selectedCoupon && paymentCategory && paymentCategory !== "general" && selectedCoupon.couponType !== paymentCategory) {
            toast({
                title: "Coupon Mismatch ❌",
                description: `This ${selectedCoupon.couponType} coupon cannot be used for a ${paymentCategory} payment.`,
                variant: "destructive",
            });
            return;
        }
        if (selectedCoupon && !paymentCategory) {
            toast({
                title: "Select Payment Category",
                description: "Please select a payment category to use a coupon.",
                variant: "destructive",
            });
            return;
        }
        setStep("pin");
    };

    const handleConfirm = async () => {
        // Snapshot coupon state before any async ops
        const couponSnapshot = selectedCoupon;
        const deductionSnapshot = couponDeduction;
        const walletDeductionSnapshot = walletDeduction;

        // Offline — queue full amount (coupons need online connection)
        if (!isOnline) {
            const result = sendMoney(recipient, totalAmount, wallet.id, note);
            if (!result.success) {
                toast({ title: "Failed", description: result.reason, variant: "destructive" });
                return;
            }
            toast({ title: "Queued", description: `₹${totalAmount.toLocaleString()} will be sent when online` });
            navigate("/app");
            return;
        }

        setSending(true);
        try {
            // ── STEP 1: Redeem coupon FIRST (before wallet transfer) ──
            // This way the coupon is always recorded even if the wallet transfer path has issues.
            if (couponSnapshot && deductionSnapshot > 0) {
                const redeemOk = await recordCouponRedemption(couponSnapshot, deductionSnapshot);
                if (!redeemOk) {
                    // recordCouponRedemption already showed an error toast
                    setSending(false);
                    return;
                }
            }

            // ── STEP 2: Transfer wallet portion (if coupon doesn't cover everything) ──
            if (walletDeductionSnapshot > 0) {
                const isEmployerWallet = wallet?.type === "employer";
                const transferEndpoint = isEmployerWallet
                    ? `${BASE_URL}/api/v1/wallet/individual/employer-transfer`
                    : `${BASE_URL}/api/v1/wallet/individual/transfer`;

                const res = await fetch(transferEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sender_user_id: user.id,
                        receiver_id: recipient,
                        amount: walletDeductionSnapshot,
                        note: note,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    toast({ title: "Transfer Failed", description: data.detail || JSON.stringify(data), variant: "destructive" });
                    return;
                }
            }

            await refreshWallet();
            await refreshTransactions();

            if (couponSnapshot && deductionSnapshot > 0) {
                toast({
                    title: "Money Sent! 🎉",
                    description: `₹${totalAmount.toLocaleString()} sent · ₹${deductionSnapshot.toLocaleString()} from coupon · ₹${walletDeductionSnapshot.toLocaleString()} from wallet`,
                });
            } else {
                toast({ title: "Money Sent! 🎉", description: `₹${totalAmount.toLocaleString()} sent to ${recipient}` });
            }

            navigate("/app");
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
                            Sending ₹{totalAmount.toLocaleString()} to {recipient}
                            {selectedCoupon && ` · Coupon covers ₹${couponDeduction.toLocaleString()}`}
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
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
                        </div>
                        {paymentCategory && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium capitalize">{paymentCategory}</span>
                            </div>
                        )}
                        {selectedCoupon ? (
                            <>
                                <div className="border-t border-border my-2" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Coupon Applied</span>
                                    <span className="font-medium text-primary">{selectedCoupon.templateName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid by Coupon</span>
                                    <span className="font-medium text-green-600">-₹{couponDeduction.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid from Wallet</span>
                                    <span className="font-medium">₹{walletDeduction.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Coupon Balance After</span>
                                    <span className="text-muted-foreground">₹{(selectedCoupon.remainingValue - couponDeduction).toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Wallet</span>
                                <span className="font-medium">{wallet?.type === "employer" ? wallet.employerName : "Personal"}</span>
                            </div>
                        )}
                        {note && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Note</span>
                                <span>{note}</span>
                            </div>
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
                            className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-sm font-medium transition-all ${method === m.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
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

                {wallet?.type === "employer" && Number(amount) > 0 && (
                    <div className="space-y-2">
                        <Label>Payment Category <span className="text-xs text-muted-foreground font-normal">(determines coupon eligibility)</span></Label>
                        <div className="grid grid-cols-4 gap-2">
                            {paymentCategories.map(cat => (
                                <button key={cat.key} onClick={() => handleCategoryChange(cat.key)}
                                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${paymentCategory === cat.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                                    <cat.icon size={18} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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

                {Number(amount) > 0 && wallet?.type === "employer" && (
                    <CouponSelector
                        coupons={issuedCoupons}
                        selectedCoupon={selectedCoupon}
                        onSelect={setSelectedCoupon}
                        amount={Number(amount)}
                        paymentCategory={paymentCategory || undefined}
                    />
                )}

                {/* Live breakdown — shows before user hits Continue */}
                {selectedCoupon && couponDeduction > 0 && (
                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Coupon covers</span>
                            <span className="text-green-600 font-medium">-₹{couponDeduction.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Deducted from wallet</span>
                            <span className="font-medium">₹{walletDeduction.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                <Button variant="hero" size="lg" className="w-full"
                    disabled={!recipient || !amount || Number(amount) <= 0}
                    onClick={handleContinue}>
                    Continue
                </Button>
            </motion.div>
        </div>
    );
};

export default PWASend;