import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface EnterpriseOTPStepProps {
    email: string;
    otp: string;
    onUpdate: (otp: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

const EnterpriseOTPStep = ({ email, otp, onUpdate, onContinue, onBack }: EnterpriseOTPStepProps) => {
    const [error, setError] = useState("");

    const handleVerify = () => {
        if (otp.length !== 6) {
            setError("Please enter the complete OTP");
            return;
        }
        // Mock verification - always succeeds
        setError("");
        onContinue();
    };

    const handleResend = () => {
        // Mock resend
        console.log("Resending OTP to", email);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Change email
            </button>

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Verify your email
                </h1>
                <p className="text-muted-foreground">
                    We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex justify-center">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => {
                            onUpdate(value);
                            setError("");
                        }}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <Button
                    onClick={handleVerify}
                    className="w-full"
                    size="lg"
                    disabled={otp.length !== 6}
                >
                    Verify & Continue
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                        onClick={handleResend}
                        className="text-primary hover:underline font-medium"
                    >
                        Resend OTP
                    </button>
                </p>
            </div>
        </motion.div>
    );
};

export default EnterpriseOTPStep;
