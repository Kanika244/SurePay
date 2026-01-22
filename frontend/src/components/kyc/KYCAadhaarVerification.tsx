import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Fingerprint, Upload, X, Image, AlertCircle, Check } from "lucide-react";

interface AadhaarData {
  frontImage: File | null;
  backImage: File | null;
}

interface KYCAadhaarVerificationProps {
  data: AadhaarData;
  onUpdate: (data: AadhaarData) => void;
  onContinue: () => void;
  onBack: () => void;
}

const KYCAadhaarVerification = ({ data, onUpdate, onContinue, onBack }: KYCAadhaarVerificationProps) => {
  const [error, setError] = useState('');

  const handleFileUpload = (type: 'front' | 'back', file: File | null) => {
    if (type === 'front') {
      onUpdate({ ...data, frontImage: file });
    } else {
      onUpdate({ ...data, backImage: file });
    }
    setError('');
  };

  const handleContinue = () => {
    if (!data.frontImage || !data.backImage) {
      setError('Please upload both front and back images of your Aadhaar card');
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
            <div className="w-5 h-5 rounded-full bg-mint flex items-center justify-center">
              <Check className="w-3 h-3 text-mint-foreground" />
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
        <div className="flex items-center gap-2 mb-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Aadhaar Verification</h2>
        </div>
        <p className="text-sm text-muted-foreground">Upload clear images of your Aadhaar card (front and back)</p>
      </div>

      <div className="space-y-6">
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

        {/* Info note */}
        <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Ensure images are clear, well-lit, and all corners are visible. Your Aadhaar details will be extracted automatically using OCR.
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
          disabled={!data.frontImage || !data.backImage}
          className="flex-1 h-12 gradient-primary hover:opacity-90"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default KYCAadhaarVerification;
