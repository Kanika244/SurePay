import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Delete } from "lucide-react";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PinDot = ({ filled }: { filled: boolean }) => (
    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${filled ? "bg-primary border-primary scale-110" : "border-muted-foreground/40"
        }`} />
);

const PWATransactionPIN = () => {
    const { user } = useIndividual();
    const [pinSet, setPinSet] = useState<boolean | null>(null);
    const [step, setStep] = useState<"check" | "set" | "confirm">("check");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Check if PIN already set
    useEffect(() => {
        const checkPin = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/kyc/pin-status/${user.phone}`);
                const data = await res.json();
                setPinSet(data.pin_set);
                setStep(data.pin_set ? "confirm" : "set");
            } catch {
                setStep("set");
            }
        };
        if (user.phone) checkPin();
    }, [user.phone]);

    const currentPin = step === "set" ? pin : confirmPin;
    const setCurrentPin = step === "set" ? setPin : setConfirmPin;

    const handleKeyPress = (val: string) => {
        if (currentPin.length >= 4) return;
        setCurrentPin(prev => prev + val);
    };

    const handleDelete = () => setCurrentPin(prev => prev.slice(0, -1));

    // Auto-submit when 4 digits entered
    useEffect(() => {
        if (step === "set" && pin.length === 4) {
            setTimeout(() => setStep("confirm"), 200);
        }
        if (step === "confirm" && confirmPin.length === 4) {
            handleSubmit();
        }
    }, [pin, confirmPin]);

    const handleSubmit = async () => {
        if (pin !== confirmPin) {
            setStatus("error");
            setMessage("PINs don't match. Try again.");
            setPin(""); setConfirmPin("");
            setStep("set");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("phone", user.phone);
            formData.append("pin", pin);

            const res = await fetch(`${BASE_URL}/api/kyc/set-pin`, { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus("success");
                setMessage("Transaction PIN set successfully!");
                setPinSet(true);
            } else {
                setStatus("error");
                setMessage(data.detail || "Failed to set PIN.");
                setPin(""); setConfirmPin(""); setStep("set");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app/profile"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">Transaction PIN</h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {status === "success" ? (
                    <div className="text-center space-y-4 py-12">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="font-semibold text-foreground">{message}</p>
                        <Link to="/app/profile">
                            <Button variant="outline" className="mt-2">Back to Profile</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-1">
                            <p className="text-base font-semibold text-foreground">
                                {step === "set" ? (pinSet ? "Change your PIN" : "Set a new PIN") : "Confirm your PIN"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {step === "set" ? "Enter a 4-digit PIN" : "Re-enter to confirm"}
                            </p>
                        </div>

                        {/* Status message */}
                        {status === "error" && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                                <XCircle size={16} />{message}
                            </div>
                        )}

                        {/* PIN dots */}
                        <div className="flex justify-center gap-4">
                            {[0, 1, 2, 3].map(i => (
                                <PinDot key={i} filled={currentPin.length > i} />
                            ))}
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                            {keys.map((key, idx) => (
                                key === "" ? <div key={idx} /> :
                                    key === "del" ? (
                                        <button key={idx}
                                            onClick={handleDelete}
                                            className="h-14 rounded-2xl bg-muted flex items-center justify-center active:scale-95 transition-transform">
                                            <Delete size={20} className="text-muted-foreground" />
                                        </button>
                                    ) : (
                                        <button key={idx}
                                            onClick={() => handleKeyPress(key)}
                                            className="h-14 rounded-2xl bg-card border border-border text-lg font-semibold text-foreground hover:bg-muted active:scale-95 transition-transform">
                                            {key}
                                        </button>
                                    )
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PWATransactionPIN;