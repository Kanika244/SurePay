import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/services/config";

interface EnterpriseEmailStepProps {
    email: string;
    onUpdate: (email: string) => void;
    onContinue: () => void;
}

const EnterpriseEmailStep = ({ email, onUpdate, onContinue }: EnterpriseEmailStepProps) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (!email) {
            setError("Please enter your company email");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/send_email_otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                onContinue();
            } else {
                setError(data.detail || "Failed to send OTP. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Create your enterprise account
                </h1>
                <p className="text-muted-foreground">
                    Enter your work email to get started
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => {
                                onUpdate(e.target.value);
                                setError("");
                            }}
                            className="pl-10"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </motion.div>
    );
};

export default EnterpriseEmailStep;
