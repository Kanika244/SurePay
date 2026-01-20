import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, X, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCPanVerificationProps {
  panNumber: string;
  onUpdate: (pan: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

type VerificationStatus = 'idle' | 'loading' | 'verified' | 'failed';

const KYCPanVerification = ({ panNumber, onUpdate, onContinue, onBack }: KYCPanVerificationProps) => {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [verifiedName, setVerifiedName] = useState('');
  const [error, setError] = useState('');

  const validatePAN = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handleChange = (value: string) => {
    const upperValue = value.toUpperCase().slice(0, 10);
    onUpdate(upperValue);
    setError('');
    setStatus('idle');
    setVerifiedName('');
  };

  const handleVerify = async () => {
    if (!panNumber) {
      setError('Please enter your PAN number');
      return;
    }

    if (!validatePAN(panNumber)) {
      setError('Invalid PAN format. Expected: AAAAA9999A');
      return;
    }

    setStatus('loading');
    setError('');

    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (90% success rate for demo)
    if (Math.random() > 0.1) {
      setStatus('verified');
      setVerifiedName('JOHN DOE'); // This would come from API
    } else {
      setStatus('failed');
      setError('PAN verification failed. Please check and try again.');
    }
  };

  const handleContinue = () => {
    if (status === 'verified') {
      onContinue();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 py-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">PAN Verification</h2>
        <p className="text-sm text-muted-foreground">Your PAN is used for identity verification</p>
      </div>

      <div className="space-y-6">
        {/* PAN Input */}
        <div className="space-y-2">
          <Label htmlFor="pan" className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            PAN Number
          </Label>
          <div className="relative">
            <Input
              id="pan"
              type="text"
              placeholder="AAAAA9999A"
              value={panNumber}
              onChange={(e) => handleChange(e.target.value)}
              maxLength={10}
              disabled={status === 'loading' || status === 'verified'}
              className={cn(
                "h-12 bg-card border-border uppercase tracking-widest font-mono text-lg",
                error && "border-destructive focus-visible:ring-destructive",
                status === 'verified' && "border-mint bg-mint/5"
              )}
            />
            <AnimatePresence>
              {status === 'verified' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center">
                    <Check className="w-4 h-4 text-mint-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Helper text */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Used to verify identity and comply with regulations</span>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        {/* Verification Result Card */}
        <AnimatePresence>
          {status === 'verified' && verifiedName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl border border-mint/30 bg-mint/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verified Name</p>
                  <p className="font-semibold text-foreground">{verifiedName}</p>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl border border-destructive/30 bg-destructive/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Verification Failed</p>
                  <p className="text-xs text-muted-foreground">Please check your PAN and try again</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatus('idle');
                    setError('');
                  }}
                >
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
          disabled={status === 'loading'}
        >
          Back
        </Button>
        
        {status === 'verified' ? (
          <Button
            onClick={handleContinue}
            className="flex-1 h-12 gradient-primary hover:opacity-90"
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleVerify}
            disabled={status === 'loading' || !panNumber}
            className="flex-1 h-12 gradient-primary hover:opacity-90"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify PAN'
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default KYCPanVerification;
