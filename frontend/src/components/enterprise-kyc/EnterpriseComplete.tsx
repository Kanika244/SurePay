import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface EnterpriseCompleteProps {
    companyName: string;
}

const EnterpriseComplete = ({ companyName }: EnterpriseCompleteProps) => {
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Trigger confetti
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#6366f1", "#8b5cf6", "#10b981"],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#6366f1", "#8b5cf6", "#10b981"],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();

        // Show content after animation
        const timer = setTimeout(() => setShowContent(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleGoToDashboard = () => {
        navigate("/enterprise/dashboard");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto text-center"
        >
            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative w-24 h-24 mx-auto mb-8"
            >
                <div className="absolute inset-0 bg-mint/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-mint/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-mint" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-2 -right-2"
                >
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
            </motion.div>

            {showContent && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        You're all set!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Your enterprise account for <span className="font-semibold text-foreground">{companyName}</span> has been created successfully.
                    </p>

                    {/* What's Next */}
                    <div className="bg-gradient-to-br from-primary/5 to-mint/5 border border-primary/20 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-semibold mb-4">What's next?</h3>
                        <ul className="space-y-3">
                            {[
                                "Access your enterprise dashboard",
                                "Add team members to your account",
                                "Set up payment methods",
                                "Configure wallet preferences",
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                                    </div>
                                    <span className="text-muted-foreground">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <Button onClick={handleGoToDashboard} size="lg" className="w-full group">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default EnterpriseComplete;
