import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnterpriseKYCProgressProps {
    currentStep: number;
    steps: string[];
}

const EnterpriseKYCProgress = ({ currentStep, steps }: EnterpriseKYCProgressProps) => {
    return (
        <div className="w-full py-6 px-4">
            {/* Step indicators */}
            <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted mx-8" />

                {/* Progress line filled */}
                <motion.div
                    className="absolute left-0 top-4 h-0.5 bg-primary mx-8"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ maxWidth: "calc(100% - 4rem)" }}
                />

                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center z-10">
                        <motion.div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all bg-background",
                                index < currentStep
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : index === currentStep
                                        ? "border-primary text-primary"
                                        : "border-muted text-muted-foreground"
                            )}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: index === currentStep ? 1.1 : 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            {index < currentStep ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                index + 1
                            )}
                        </motion.div>
                        <span className={cn(
                            "text-[10px] mt-2 text-center max-w-[70px] leading-tight hidden md:block",
                            index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EnterpriseKYCProgress;
