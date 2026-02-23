import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIndividual } from "@/contexts/IndividualContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PWAChangePassword = () => {
    const { user } = useIndividual();
    const [current, setCurrent] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const rules = [
        { label: "At least 8 characters", pass: newPass.length >= 8 },
        { label: "One uppercase letter", pass: /[A-Z]/.test(newPass) },
        { label: "One lowercase letter", pass: /[a-z]/.test(newPass) },
        { label: "One number", pass: /[0-9]/.test(newPass) },
        { label: "One special character", pass: /[!@#$%^&*]/.test(newPass) },
    ];
    const allRulesPassed = rules.every(r => r.pass);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allRulesPassed) return;
        if (newPass !== confirm) { setStatus("error"); setMessage("Passwords don't match."); return; }

        setLoading(true);
        setStatus("idle");
        try {
            const formData = new FormData();
            formData.append("phone", user.phone);
            formData.append("password", newPass);

            const res = await fetch(`${BASE_URL}/api/kyc/password`, { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus("success");
                setMessage("Password updated successfully!");
                setCurrent(""); setNewPass(""); setConfirm("");
            } else {
                setStatus("error");
                setMessage(data.detail || "Failed to update password.");
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
                <h1 className="text-lg font-bold text-foreground">Change Password</h1>
            </div>

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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input type={showNew ? "text" : "password"} placeholder="New password"
                                className="pl-9 pr-10 h-11" value={newPass} onChange={e => setNewPass(e.target.value)} />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                onClick={() => setShowNew(o => !o)}>
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input type={showCurrent ? "text" : "password"} placeholder="Confirm new password"
                                className="pl-9 pr-10 h-11" value={confirm} onChange={e => setConfirm(e.target.value)} />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                onClick={() => setShowCurrent(o => !o)}>
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Password rules */}
                    {newPass && (
                        <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
                            {rules.map(rule => (
                                <div key={rule.label} className="flex items-center gap-2">
                                    <CheckCircle size={13} className={rule.pass ? "text-emerald-500" : "text-muted-foreground/40"} />
                                    <span className={`text-xs ${rule.pass ? "text-foreground" : "text-muted-foreground"}`}>
                                        {rule.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11" disabled={loading || !allRulesPassed}>
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default PWAChangePassword;