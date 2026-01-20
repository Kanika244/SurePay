import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Fingerprint, Camera, Check, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewData {
  fullName: string;
  dob: string;
  address: string;
  panNumber: string;
  aadhaarMasked: string;
  selfieImage: string | null;
}

interface KYCReviewConsentProps {
  data: ReviewData;
  onSubmit: () => void;
  onBack: () => void;
}

const KYCReviewConsent = ({ data, onSubmit, onBack }: KYCReviewConsentProps) => {
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [consentVerify, setConsentVerify] = useState(false);

  const sections = [
    {
      icon: User,
      title: "Personal Details",
      items: [
        { label: "Full Name", value: data.fullName },
        { label: "Date of Birth", value: data.dob },
        { label: "Address", value: data.address },
      ],
    },
    {
      icon: CreditCard,
      title: "PAN Details",
      items: [
        { label: "PAN Number", value: data.panNumber },
      ],
    },
    {
      icon: Fingerprint,
      title: "Aadhaar Details",
      items: [
        { label: "Aadhaar Number", value: data.aadhaarMasked },
      ],
    },
  ];

  const canSubmit = confirmInfo && consentVerify;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 py-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">Please verify your details before submitting</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Data Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <section.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <div className="ml-auto w-5 h-5 rounded-full bg-mint flex items-center justify-center">
                <Check className="w-3 h-3 text-mint-foreground" />
              </div>
            </div>
            <div className="space-y-2 pl-11">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                    {item.value || '-'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Selfie Preview */}
        {data.selfieImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Selfie</h3>
              <div className="ml-auto w-5 h-5 rounded-full bg-mint flex items-center justify-center">
                <Check className="w-3 h-3 text-mint-foreground" />
              </div>
            </div>
            <div className="pl-11">
              <img
                src={data.selfieImage}
                alt="Selfie preview"
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-muted/50">
          <Checkbox
            id="confirmInfo"
            checked={confirmInfo}
            onCheckedChange={(checked) => setConfirmInfo(!!checked)}
            className="mt-0.5"
          />
          <Label
            htmlFor="confirmInfo"
            className="text-sm text-foreground cursor-pointer leading-relaxed"
          >
            I confirm that all the information provided above is accurate and true to the best of my knowledge.
          </Label>
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-xl bg-muted/50">
          <Checkbox
            id="consentVerify"
            checked={consentVerify}
            onCheckedChange={(checked) => setConsentVerify(!!checked)}
            className="mt-0.5"
          />
          <Label
            htmlFor="consentVerify"
            className="text-sm text-foreground cursor-pointer leading-relaxed"
          >
            I consent to SurePay verifying my identity as per RBI regulations and applicable laws.
          </Label>
        </div>
      </div>

      {/* Legal Links */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Privacy Policy
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Terms of Service
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            "flex-1 h-12 transition-all",
            canSubmit ? "gradient-primary hover:opacity-90" : "bg-muted text-muted-foreground"
          )}
        >
          Submit KYC
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default KYCReviewConsent;
