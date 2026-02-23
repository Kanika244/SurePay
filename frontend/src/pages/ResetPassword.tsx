import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.jpg";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters.");
            return;
        }
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing reset token.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "Password reset successfully!");
                setTimeout(() => navigate("/auth/signin"), 2500);
            } else {
                setStatus("error");
                setMessage(data.detail || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <img src={logo} alt="SurePay" className="w-10 h-10 rounded-xl object-cover" />
                    <span className="text-2xl font-bold">SurePay</span>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">

                    {/* Success State */}
                    {status === "success" ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold">Password Reset!</h2>
                            <p className="text-muted-foreground text-sm">{message}</p>
                            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mb-1">Set New Password</h1>
                            <p className="text-muted-foreground text-sm mb-6">
                                Enter your new password below.
                            </p>

                            {/* Error Message */}
                            {status === "error" && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            className="h-12 pl-10"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Re-enter your password"
                                            className="h-12 pl-10"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full gap-2"
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                    {!loading && <ArrowRight size={18} />}
                                </Button>
                            </form>

                            <p className="text-sm text-center text-muted-foreground mt-4">
                                Remember your password?{" "}
                                <Link to="/auth/signin" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;