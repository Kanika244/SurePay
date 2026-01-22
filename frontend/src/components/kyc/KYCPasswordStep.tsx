import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface KYCPasswordStepProps {
    password: string;
    confirmPassword: string;
    onUpdatePassword: (password: string) => void;
    onUpdateConfirmPassword: (confirmPassword: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

const KYCPasswordStep = ({
    password,
    confirmPassword,
    onUpdatePassword,
    onUpdateConfirmPassword,
    onContinue,
    onBack,
}: KYCPasswordStepProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const requirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
        { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
        { label: "Contains number", met: /[0-9]/.test(password) },
        { label: "Contains special character", met: /[!@#$%^&*]/.test(password) },
    ];

    const allRequirementsMet = requirements.every((r) => r.met);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = () => {
        if (!allRequirementsMet) {
            setError("Please meet all password requirements");
            return;
        }
        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        onContinue();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-4"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Secure your account
                </h1>
                <p className="text-muted-foreground">
                    Create a strong password for your account
                </p>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => {
                                onUpdatePassword(e.target.value);
                                setError("");
                            }}
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Password requirements */}
                <div className="grid grid-cols-1 gap-2">
                    {requirements.map((req, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-2 text-xs transition-colors",
                                req.met ? "text-mint" : "text-muted-foreground"
                            )}
                        >
                            {req.met ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <X className="w-3 h-3" />
                            )}
                            {req.label}
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => {
                                onUpdateConfirmPassword(e.target.value);
                                setError("");
                            }}
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {confirmPassword && (
                        <p className={cn(
                            "text-xs",
                            passwordsMatch ? "text-mint" : "text-destructive"
                        )}>
                            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                        </p>
                    )}
                </div>

                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onBack} className="flex-1 h-12">
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 h-12 gradient-primary hover:opacity-90"
                        disabled={!allRequirementsMet || !passwordsMatch}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default KYCPasswordStep;
    