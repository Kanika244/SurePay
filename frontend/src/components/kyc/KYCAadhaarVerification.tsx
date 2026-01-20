import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Upload, Smartphone, Check, Loader2, AlertCircle, X, Image } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface AadhaarData {
  method: 'otp' | 'upload' | null;
  aadhaarNumber: string;
  frontImage: File | null;
  backImage: File | null;
  otp: string;
}

interface KYCAadhaarVerificationProps {
  data: AadhaarData;
  onUpdate: (data: AadhaarData) => void;
  onContinue: () => void;
  onBack: () => void;
}

type VerificationStep = 'method' | 'otp-input' | 'otp-verify' | 'upload';
type VerificationStatus = 'idle' | 'loading' | 'verified' | 'failed';

const KYCAadhaarVerification = ({ data, onUpdate, onContinue, onBack }: KYCAadhaarVerificationProps) => {
  const [step, setStep] = useState<VerificationStep>('method');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState('');

  const maskAadhaar = (aadhaar: string): string => {
    if (aadhaar.length < 12) return aadhaar;
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const validateAadhaar = (aadhaar: string): boolean => {
    return /^\d{12}$/.test(aadhaar);
  };

  const handleMethodSelect = (method: 'otp' | 'upload') => {
    onUpdate({ ...data, method });
    setStep(method === 'otp' ? 'otp-input' : 'upload');
  };

  const handleAadhaarSubmit = async () => {
    if (!validateAadhaar(data.aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setStatus('loading');
    setError('');

    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('idle');
    setStep('otp-verify');
  };

  const handleVerifyOTP = async () => {
    if (data.otp.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setStatus('loading');
    setError('');

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (data.otp === '123456' || Math.random() > 0.2) {
      setStatus('verified');
      setTimeout(onContinue, 1500);
    } else {
      setStatus('failed');
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleFileUpload = (type: 'front' | 'back', file: File | null) => {
    if (type === 'front') {
      onUpdate({ ...data, frontImage: file });
    } else {
      onUpdate({ ...data, backImage: file });
    }
  };

  const handleUploadSubmit = () => {
    if (!data.frontImage || !data.backImage) {
      setError('Please upload both front and back images');
      return;
    }
    onContinue();
  };

  const FileUploadBox = ({ 
    label, 
    file, 
    onUpload, 
    onRemove 
  }: { 
    label: string; 
    file: File | null; 
    onUpload: (file: File) => void;
    onRemove: () => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {file ? (
        <div className="relative p-4 rounded-xl border border-mint/30 bg-mint/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mint/20 flex items-center justify-center">
              <Image className="w-5 h-5 text-mint" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full bg-muted hover:bg-destructive/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 transition-colors">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 py-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Aadhaar Verification</h2>
        <p className="text-sm text-muted-foreground">Verify your identity with Aadhaar</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Method Selection */}
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <button
              onClick={() => handleMethodSelect('otp')}
              className="w-full p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">OTP Verification</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-mint/10 text-mint font-medium">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Verify instantly with Aadhaar-linked mobile</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('upload')}
              className="w-full p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Upload Documents</p>
                  <p className="text-sm text-muted-foreground">Upload front and back of Aadhaar card</p>
                </div>
              </div>
            </button>

            <div className="pt-4">
              <Button variant="outline" onClick={onBack} className="w-full h-12">
                Back
              </Button>
            </div>
          </motion.div>
        )}

        {/* OTP Input - Aadhaar Number */}
        {step === 'otp-input' && (
          <motion.div
            key="otp-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="aadhaar" className="text-sm font-medium flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-muted-foreground" />
                Aadhaar Number
              </Label>
              <Input
                id="aadhaar"
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                value={data.aadhaarNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  onUpdate({ ...data, aadhaarNumber: value });
                  setError('');
                }}
                maxLength={12}
                className={cn(
                  "h-12 bg-card border-border tracking-widest font-mono text-lg",
                  error && "border-destructive"
                )}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                An OTP will be sent to your Aadhaar-linked mobile number for verification.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('method')}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                onClick={handleAadhaarSubmit}
                disabled={status === 'loading' || data.aadhaarNumber.length !== 12}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* OTP Verification */}
        {step === 'otp-verify' && (
          <motion.div
            key="otp-verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Enter OTP sent to Aadhaar-linked mobile</p>
              <p className="text-lg font-semibold text-foreground">{maskAadhaar(data.aadhaarNumber)}</p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={data.otp}
                onChange={(value) => {
                  onUpdate({ ...data, otp: value });
                  setError('');
                }}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} className="w-12 h-14 text-xl" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            {status === 'verified' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center">
                  <Check className="w-8 h-8 text-mint-foreground" />
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('otp-input')}
                className="flex-1 h-12"
                disabled={status === 'loading' || status === 'verified'}
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={status === 'loading' || status === 'verified' || data.otp.length !== 6}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : status === 'verified' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Verified
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Upload Documents */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <FileUploadBox
              label="Aadhaar Front"
              file={data.frontImage}
              onUpload={(file) => handleFileUpload('front', file)}
              onRemove={() => handleFileUpload('front', null)}
            />

            <FileUploadBox
              label="Aadhaar Back"
              file={data.backImage}
              onUpload={(file) => handleFileUpload('back', file)}
              onRemove={() => handleFileUpload('back', null)}
            />

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Ensure images are clear, well-lit, and all corners are visible. Aadhaar number will be masked for security.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('method')}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={!data.frontImage || !data.backImage}
                className="flex-1 h-12 gradient-primary hover:opacity-90"
              >
                Submit Documents
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KYCAadhaarVerification;
