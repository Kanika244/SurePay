import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreditCard, Upload, X, Image, AlertCircle, Check } from "lucide-react";

interface KYCPanVerificationProps {
  panImage: File | null;
  onUpdate: (file: File | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

const KYCPanVerification = ({ panImage, onUpdate, onContinue, onBack }: KYCPanVerificationProps) => {
  const [error, setError] = useState('');

  const handleFileUpload = (file: File | null) => {
    onUpdate(file);
    setError('');
  };

  const handleContinue = () => {
    if (!panImage) {
      setError('Please upload your PAN card image');
      return;
    }
    onContinue();
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
        <p className="text-sm text-muted-foreground">Upload a clear image of your PAN card</p>
      </div>

      <div className="space-y-6">
        {/* PAN Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            PAN Card Image
          </Label>

          {panImage ? (
            <div className="relative p-4 rounded-xl border border-mint/30 bg-mint/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-mint/20 flex items-center justify-center">
                  <Image className="w-6 h-6 text-mint" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{panImage.name}</p>
                  <p className="text-xs text-muted-foreground">{(panImage.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center">
                  <Check className="w-4 h-4 text-mint-foreground" />
                </div>
                <button
                  onClick={() => handleFileUpload(null)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-destructive/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload PAN card</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Info note */}
        <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Ensure the PAN card image is clear, well-lit, and all details are visible. Your PAN details will be extracted automatically.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!panImage}
          className="flex-1 h-12 gradient-primary hover:opacity-90"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default KYCPanVerification;
