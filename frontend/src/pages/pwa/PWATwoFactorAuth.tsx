import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle, XCircle, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PWATwoFactorAuth = () => {
    const { user } = useIndividual();
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [step, setStep] = useState<"status" | "otp">("status");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Check 2FA status on mount
    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/kyc/2fa/status/${user.phone}`);
                const data = await res.json();
                setEnabled(data.two_fa_enabled);
            } catch {
                setEnabled(false);
            }
        };
        if (user.phone) check();
    }, [user.phone]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    const sendOtp = async () => {
        setLoading(true);
        setStatus("idle");
        try {
            const formData = new FormData();
            formData.append("phone", user.phone);
            const res = await fetch(`${BASE_URL}/api/kyc/2fa/send-otp`, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setStep("otp");
                setOtp(["", "", "", "", "", ""]);
                setResendTimer(30);
                setMessage(data.message);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } else {
                setStatus("error");
                setMessage(data.detail || "Failed to send OTP.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (idx: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const verifyOtp = async () => {
        const code = otp.join("");
        if (code.length < 6) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("phone", user.phone);
            formData.append("otp", code);
            const res = await fetch(`${BASE_URL}/api/kyc/2fa/verify-otp`, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setStatus("success");
                setMessage("Two-factor authentication enabled!");
                setEnabled(true);
                setStep("status");
            } else {
                setStatus("error");
                setMessage(data.detail || "Invalid OTP. Try again.");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("phone", user.phone);
            const res = await fetch(`${BASE_URL}/api/kyc/2fa/disable`, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok && data.success) {
                setEnabled(false);
                setStatus("success");
                setMessage("Two-factor authentication disabled.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app/profile"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">Two-Factor Auth</h1>
            </div>

            {/* ── Email gate: shown when no email is set ── */}
            {!user.email && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Mail size={26} className="text-secondary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Email Required for 2FA</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Two-factor authentication sends a one-time code to your email.
                                Please add your email address first.
                            </p>
                        </div>
                        <Link
                            to="/app/profile/personal-info"
                            className="flex items-center justify-between w-full bg-card border border-border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-primary" />
                                <span className="text-sm font-medium text-foreground">Add Email Address</span>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* ── Main 2FA UI: shown only when email is set ── */}
            {user.email && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                    {status === "success" && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm">
                            <CheckCircle size={16} />{message}
                        </div>
                    )}
                    {status === "error" && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                            <XCircle size={16} />{message}
                        </div>
                    )}

                    {step === "status" && (
                        <>
                            <div className={`rounded-xl border p-4 flex items-center gap-4 ${enabled ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted border-border"}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${enabled ? "bg-emerald-500/10" : "bg-muted"}`}>
                                    <Shield size={22} className={enabled ? "text-emerald-500" : "text-muted-foreground"} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        2FA is {enabled === null ? "checking..." : enabled ? "Enabled" : "Disabled"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {enabled ? "Your account has extra security" : "Add an extra layer of protection"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                                <h2 className="text-sm font-semibold text-foreground">How it works</h2>
                                {[
                                    { icon: Mail, text: `A one-time code is sent to ${user.email}` },
                                    { icon: Shield, text: "Enter the code to verify your identity" },
                                    { icon: CheckCircle, text: "Your account is protected from unauthorized access" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <item.icon size={14} className="text-primary" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.text}</p>
                                    </div>
                                ))}
                            </div>

                            {enabled ? (
                                <Button variant="outline"
                                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={disable2FA} disabled={loading}>
                                    {loading ? "Disabling..." : "Disable 2FA"}
                                </Button>
                            ) : (
                                <Button className="w-full" onClick={sendOtp} disabled={loading || enabled === null}>
                                    {loading ? "Sending OTP..." : "Enable 2FA"}
                                </Button>
                            )}
                        </>
                    )}

                    {step === "otp" && (
                        <div className="space-y-6">
                            <div className="text-center space-y-1">
                                <p className="text-base font-semibold">Check your email</p>
                                <p className="text-sm text-muted-foreground">{message}</p>
                            </div>

                            <div className="flex justify-center gap-2">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => inputRefs.current[idx] = el}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                                        className="w-11 h-13 text-center text-lg font-bold border-2 rounded-xl bg-card focus:border-primary outline-none transition-colors"
                                    />
                                ))}
                            </div>

                            <Button className="w-full" onClick={verifyOtp}
                                disabled={otp.join("").length < 6 || loading}>
                                {loading ? "Verifying..." : "Verify & Enable 2FA"}
                            </Button>

                            <div className="flex items-center justify-between">
                                <button className="text-sm text-muted-foreground" onClick={() => setStep("status")}>
                                    ← Back
                                </button>
                                <button
                                    className={`text-sm ${resendTimer > 0 ? "text-muted-foreground" : "text-primary"}`}
                                    onClick={sendOtp}
                                    disabled={resendTimer > 0 || loading}>
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default PWATwoFactorAuth;