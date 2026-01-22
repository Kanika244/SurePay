import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Check, Loader2, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnterpriseWalletCreationProps {
    companyName: string;
    onContinue: () => void;
    onWalletCreated: (walletId: string) => void;
}

const EnterpriseWalletCreation = ({
    companyName,
    onContinue,
    onWalletCreated,
}: EnterpriseWalletCreationProps) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [walletId, setWalletId] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    const steps = [
        { label: "Verifying company details", icon: Building2 },
        { label: "Setting up security protocols", icon: Shield },
        { label: "Creating wallet infrastructure", icon: Wallet },
    ];

    useEffect(() => {
        const stepDuration = 1500;
        const totalSteps = steps.length;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev + 100 / (totalSteps * 10);

                // Update current step based on progress
                const newStep = Math.floor((newProgress / 100) * totalSteps);
                if (newStep !== currentStep && newStep < totalSteps) {
                    setCurrentStep(newStep);
                }

                if (newProgress >= 100) {
                    clearInterval(timer);
                    // Generate wallet ID
                    const generatedWalletId = `ENT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    setWalletId(generatedWalletId);
                    onWalletCreated(generatedWalletId);
                    setIsComplete(true);
                    return 100;
                }
                return newProgress;
            });
        }, stepDuration / 10);

        return () => clearInterval(timer);
    }, []);

    const maskWalletId = (id: string) => {
        if (!id) return "";
        return `${id.substring(0, 6)}****${id.substring(id.length - 2)}`;
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
                <motion.div
                    className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    animate={isComplete ? {} : { rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: isComplete ? 0 : Infinity }}
                >
                    {isComplete ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <Check className="w-10 h-10 text-mint" />
                        </motion.div>
                    ) : (
                        <Wallet className="w-10 h-10 text-primary" />
                    )}
                </motion.div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {isComplete ? "Wallet created successfully" : "Setting up your company wallet"}
                </h1>
                <p className="text-muted-foreground">
                    {isComplete
                        ? `Your enterprise wallet for ${companyName} is ready`
                        : "Please wait while we configure your enterprise wallet"}
                </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 mb-8">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = isComplete || index < currentStep;
                    const isCurrent = !isComplete && index === currentStep;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-lg transition-all",
                                isCompleted ? "bg-mint/10" : isCurrent ? "bg-primary/10" : "bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isCompleted ? "bg-mint text-mint-foreground" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : isCurrent ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <StepIcon className="w-5 h-5" />
                                )}
                            </div>
                            <span className={cn(
                                "font-medium",
                                isCompleted ? "text-mint" : isCurrent ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            {!isComplete && (
                <div className="mb-8">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        {Math.round(progress)}% complete
                    </p>
                </div>
            )}

            {/* Wallet Details Card */}
            {isComplete && walletId && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-gradient-to-br from-primary/5 to-mint/5 border border-primary/20 rounded-xl mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Wallet ID</span>
                        <span className="text-xs bg-mint/10 text-mint px-2 py-1 rounded">Enterprise</span>
                    </div>
                    <p className="text-2xl font-mono font-semibold text-foreground">
                        {maskWalletId(walletId)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Full wallet ID will be visible in your dashboard
                    </p>
                </motion.div>
            )}

            {isComplete && (
                <Button onClick={onContinue} className="w-full" size="lg">
                    Continue
                </Button>
            )}
        </motion.div>
    );
};

export default EnterpriseWalletCreation;
