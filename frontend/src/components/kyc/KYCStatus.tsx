import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertCircle, Shield, ArrowRight, Loader2, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

type KYCStatusType = 'submitted' | 'verified' | 'manual_review' | 'rejected';

interface KYCStatusProps {
  initialStatus?: KYCStatusType;
}

const KYCStatus = ({ initialStatus = 'submitted' }: KYCStatusProps) => {
  const [status, setStatus] = useState<KYCStatusType>(initialStatus);
  const navigate = useNavigate();

  // Simulate status update for demo
  useEffect(() => {
    if (status === 'submitted') {
      const timer = setTimeout(() => {
        // 70% instant approval, 30% manual review
        setStatus(Math.random() > 0.3 ? 'verified' : 'manual_review');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const statusConfig = {
    submitted: {
      icon: Loader2,
      iconClass: "animate-spin text-primary",
      bgClass: "bg-primary/10",
      title: "KYC Submitted",
      subtitle: "Your documents are being verified",
      description: "This usually takes a few minutes. Please wait...",
    },
    verified: {
      icon: Check,
      iconClass: "text-mint",
      bgClass: "bg-mint/10",
      title: "KYC Verified",
      subtitle: "Congratulations! Your identity has been verified",
      description: "You now have full access to all SurePay features.",
    },
    manual_review: {
      icon: Clock,
      iconClass: "text-secondary",
      bgClass: "bg-secondary/10",
      title: "Under Manual Review",
      subtitle: "Your KYC needs additional verification",
      description: "This typically takes 24-48 hours. We'll notify you once completed.",
    },
    rejected: {
      icon: AlertCircle,
      iconClass: "text-destructive",
      bgClass: "bg-destructive/10",
      title: "KYC Rejected",
      subtitle: "We couldn't verify your identity",
      description: "Please check your documents and try again.",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const limitsUnlocked = [
    { label: "UPI Transactions", value: "₹1,00,000/day" },
    { label: "Wallet Balance", value: "₹2,00,000" },
    { label: "P2P Transfers", value: "Unlimited" },
  ];

  const timeline = [
    { label: "KYC Submitted", completed: true },
    { label: "Document Verification", completed: status === 'verified' || status === 'manual_review' },
    { label: "Final Review", completed: status === 'verified' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-8"
    >
      {/* Status Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <div className={`w-24 h-24 rounded-full ${config.bgClass} flex items-center justify-center`}>
          <StatusIcon className={`w-12 h-12 ${config.iconClass}`} />
        </div>
      </motion.div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">{config.title}</h1>
        <p className="text-base text-muted-foreground mb-2">{config.subtitle}</p>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Verified - Show unlocked limits */}
        {status === 'verified' && (
          <motion.div
            key="verified"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Verified Badge */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint/10 border border-mint/30"
              >
                <Shield className="w-4 h-4 text-mint" />
                <span className="text-sm font-semibold text-mint">KYC Verified</span>
              </motion.div>
            </div>

            {/* Limits Unlocked */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-mint" />
                Limits Unlocked
              </h3>
              <div className="space-y-3">
                {limitsUnlocked.map((limit, index) => (
                  <motion.div
                    key={limit.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-muted-foreground">{limit.label}</span>
                    <span className="text-sm font-semibold text-foreground">{limit.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 gradient-primary hover:opacity-90"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Manual Review - Show timeline */}
        {status === 'manual_review' && (
          <motion.div
            key="manual_review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Timeline */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4">Verification Progress</h3>
              <div className="relative">
                {timeline.map((step, index) => (
                  <div key={step.label} className="flex items-start gap-4 mb-4 last:mb-0">
                    <div className="relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.completed ? 'bg-mint' : 'bg-muted'
                        }`}>
                        {step.completed ? (
                          <Check className="w-3 h-3 text-mint-foreground" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`absolute left-1/2 top-6 w-0.5 h-8 -translate-x-1/2 ${step.completed ? 'bg-mint' : 'bg-muted'
                          }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`text-sm font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Note */}
            <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">We'll notify you</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive a push notification, email, and SMS once verification is complete.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full h-12"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        )}

        {/* Submitted - Loading state */}
        {status === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8"
          >
            <div className="flex gap-1 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Verifying your documents...</p>
          </motion.div>
        )}

        {/* Rejected */}
        {status === 'rejected' && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <h3 className="font-semibold text-destructive mb-2">Reason for Rejection</h3>
              <p className="text-sm text-muted-foreground">
                Document quality was too low or information didn't match. Please ensure all details are clearly visible and accurate.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex-1 h-12"
              >
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                Retry KYC
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KYCStatus;
