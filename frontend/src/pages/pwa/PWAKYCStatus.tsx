import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, XCircle, FileText, Camera, CreditCard, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";

const steps = [
    { icon: User, label: "Personal Details", key: "personal" },
    { icon: FileText, label: "KYC Documents", key: "documents" },
    { icon: Camera, label: "Selfie Verification", key: "selfie" },
    { icon: CreditCard, label: "Review & Submit", key: "completed" },
];

const statusConfig = {
    verified: { label: "Verified", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle },
    pending: { label: "In Review", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
    rejected: { label: "Rejected", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

const PWAKYCStatus = () => {
    const { user } = useIndividual();
    const cfg = statusConfig[user.kycStatus];
    const Icon = cfg.icon;

    // Determine completed steps based on kyc status
    const completedSteps = user.kycStatus === "verified" ? 4 : user.kycStatus === "rejected" ? 4 : 3;

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app/profile"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">KYC Status</h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Status Badge */}
                <div className={`rounded-xl border p-4 flex items-center gap-4 ${cfg.bg} border-current/20`}>
                    <div className={`w-12 h-12 rounded-full ${cfg.bg} flex items-center justify-center`}>
                        <Icon size={24} className={cfg.color} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">KYC Status</p>
                        <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
                    </div>
                </div>

                {/* Steps */}
                <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                    <h2 className="text-sm font-semibold text-foreground">Verification Steps</h2>
                    {steps.map((step, idx) => {
                        const done = idx < completedSteps;
                        const StepIcon = step.icon;
                        return (
                            <div key={step.key} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-500/10" : "bg-muted"}`}>
                                    {done
                                        ? <CheckCircle size={16} className="text-emerald-500" />
                                        : <StepIcon size={16} className="text-muted-foreground" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                                        {step.label}
                                    </p>
                                </div>
                                {done && <CheckCircle size={14} className="text-emerald-500" />}
                            </div>
                        );
                    })}
                </div>

                {user.kycStatus === "rejected" && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                        <p className="text-sm font-medium text-destructive mb-1">KYC Rejected</p>
                        <p className="text-xs text-muted-foreground">
                            Your KYC was rejected. Please contact support or re-submit your documents.
                        </p>
                    </div>
                )}

                {user.kycStatus === "pending" && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-sm font-medium text-amber-600 mb-1">Under Review</p>
                        <p className="text-xs text-muted-foreground">
                            Your documents are being reviewed. This usually takes 1–2 business days.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PWAKYCStatus;