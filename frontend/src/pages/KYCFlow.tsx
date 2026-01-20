import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import KYCProgress from "@/components/kyc/KYCProgress";
import KYCIntro from "@/components/kyc/KYCIntro";
import KYCPersonalDetails from "@/components/kyc/KYCPersonalDetails";
import KYCPanVerification from "@/components/kyc/KYCPanVerification";
import KYCAadhaarVerification from "@/components/kyc/KYCAadhaarVerification";
import KYCSelfieCapture from "@/components/kyc/KYCSelfieCapture";
import KYCReviewConsent from "@/components/kyc/KYCReviewConsent";
import KYCStatus from "@/components/kyc/KYCStatus";

type KYCStep = 'intro' | 'personal' | 'pan' | 'aadhaar' | 'selfie' | 'review' | 'status';

interface KYCData {
  // Personal Details
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  sameAsAadhaar: boolean;
  
  // PAN
  panNumber: string;
  
  // Aadhaar
  aadhaar: {
    method: 'otp' | 'upload' | null;
    aadhaarNumber: string;
    frontImage: File | null;
    backImage: File | null;
    otp: string;
  };
  
  // Selfie
  selfie: {
    selfieImage: string | null;
    livenessCompleted: boolean;
  };
}

const initialData: KYCData = {
  fullName: '',
  dob: '',
  gender: '',
  address: '',
  sameAsAadhaar: false,
  panNumber: '',
  aadhaar: {
    method: null,
    aadhaarNumber: '',
    frontImage: null,
    backImage: null,
    otp: '',
  },
  selfie: {
    selfieImage: null,
    livenessCompleted: false,
  },
};

const STEPS: KYCStep[] = ['intro', 'personal', 'pan', 'aadhaar', 'selfie', 'review', 'status'];
const STEP_LABELS = ['Start', 'Details', 'PAN', 'Aadhaar', 'Selfie', 'Review', 'Done'];

const KYCFlow = () => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('intro');
  const [data, setData] = useState<KYCData>(initialData);
  const navigate = useNavigate();

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goToStep = (step: KYCStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  const handleSubmit = () => {
    // Here you would submit all data to backend
    console.log('Submitting KYC data:', data);
    goToStep('status');
  };

  const maskAadhaar = (aadhaar: string): string => {
    if (aadhaar.length < 12) return aadhaar;
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const showProgress = currentStep !== 'intro' && currentStep !== 'status';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {currentStep !== 'intro' && currentStep !== 'status' ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          ) : (
            <div className="w-20" />
          )}
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">SurePay</span>
          </div>
          
          <div className="w-20" />
        </div>
      </header>

      {/* Progress */}
      {showProgress && (
        <div className="container mx-auto max-w-lg">
          <KYCProgress
            currentStep={currentStepIndex - 1}
            totalSteps={STEPS.length - 2}
            steps={STEP_LABELS.slice(1, -1)}
          />
        </div>
      )}

      {/* Content */}
      <main className="container mx-auto max-w-lg pb-8">
        <AnimatePresence mode="wait">
          {currentStep === 'intro' && (
            <motion.div key="intro">
              <KYCIntro onStart={goNext} onSkip={handleSkip} />
            </motion.div>
          )}

          {currentStep === 'personal' && (
            <motion.div key="personal">
              <KYCPersonalDetails
                data={{
                  fullName: data.fullName,
                  dob: data.dob,
                  gender: data.gender,
                  address: data.address,
                  sameAsAadhaar: data.sameAsAadhaar,
                }}
                onUpdate={(personalData) => setData({ ...data, ...personalData })}
                onContinue={goNext}
                onBack={() => goToStep('intro')}
              />
            </motion.div>
          )}

          {currentStep === 'pan' && (
            <motion.div key="pan">
              <KYCPanVerification
                panNumber={data.panNumber}
                onUpdate={(pan) => setData({ ...data, panNumber: pan })}
                onContinue={goNext}
                onBack={goBack}
              />
            </motion.div>
          )}

          {currentStep === 'aadhaar' && (
            <motion.div key="aadhaar">
              <KYCAadhaarVerification
                data={data.aadhaar}
                onUpdate={(aadhaarData) => setData({ ...data, aadhaar: aadhaarData })}
                onContinue={goNext}
                onBack={goBack}
              />
            </motion.div>
          )}

          {currentStep === 'selfie' && (
            <motion.div key="selfie">
              <KYCSelfieCapture
                data={data.selfie}
                onUpdate={(selfieData) => setData({ ...data, selfie: selfieData })}
                onContinue={goNext}
                onBack={goBack}
              />
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div key="review">
              <KYCReviewConsent
                data={{
                  fullName: data.fullName,
                  dob: data.dob,
                  address: data.address,
                  panNumber: data.panNumber,
                  aadhaarMasked: maskAadhaar(data.aadhaar.aadhaarNumber),
                  selfieImage: data.selfie.selfieImage,
                }}
                onSubmit={handleSubmit}
                onBack={goBack}
              />
            </motion.div>
          )}

          {currentStep === 'status' && (
            <motion.div key="status">
              <KYCStatus />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default KYCFlow;
