import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EnterpriseKYCProgress from "@/components/enterprise-kyc/EnterpriseKYCProgress";
import KYCIntro from "@/components/kyc/KYCIntro";
import KYCPersonalDetails from "@/components/kyc/KYCPersonalDetails";
import KYCPanVerification from "@/components/kyc/KYCPanVerification";
import KYCAadhaarVerification from "@/components/kyc/KYCAadhaarVerification";
import KYCSelfieCapture from "@/components/kyc/KYCSelfieCapture";
import KYCPasswordStep from "@/components/kyc/KYCPasswordStep";
import KYCReviewConsent from "@/components/kyc/KYCReviewConsent";
import KYCStatus from "@/components/kyc/KYCStatus";
import logo from "@/assets/logo.jpg";

type KYCStep = 'intro' | 'personal' | 'pan' | 'aadhaar' | 'selfie' | 'password' | 'review' | 'status';

interface KYCData {
  // Personal Details
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  sameAsAadhaar: boolean;

  // PAN
  panImage: File | null;
  panNumber: string;
  panName: string;

  // Aadhaar
  aadhaar: {
    frontImage: File | null;
    backImage: File | null;
  };
  aadhaarNumber: string;
  aadhaarName: string;

  // Selfie
  selfie: {
    selfieImage: string | null;
    livenessCompleted: boolean;
  };

  // Password
  password: string;
  confirmPassword: string;
}

const initialData: KYCData = {
  fullName: '',
  dob: '',
  gender: '',
  address: '',
  sameAsAadhaar: false,
  panImage: null,
  panNumber: '',
  panName: '',
  aadhaar: {
    frontImage: null,
    backImage: null,
  },
  aadhaarNumber: '',
  aadhaarName: '',
  selfie: {
    selfieImage: null,
    livenessCompleted: false,
  },
  password: '',
  confirmPassword: '',
};

const STEPS: KYCStep[] = ['intro', 'personal', 'pan', 'aadhaar', 'selfie', 'password', 'review', 'status'];
const STEP_LABELS = ['Start', 'Details', 'PAN', 'Aadhaar', 'Selfie', 'Password', 'Review', 'Done'];

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

  // Simulate OCR extraction when moving from aadhaar step
  const handleAadhaarContinue = () => {
    // Mock OCR extraction
    setData(prev => ({
      ...prev,
      aadhaarNumber: '123456789012',
      aadhaarName: prev.fullName || 'JOHN DOE',
    }));
    goNext();
  };

  // Simulate OCR extraction when moving from pan step
  const handlePanContinue = () => {
    // Mock OCR extraction
    setData(prev => ({
      ...prev,
      panNumber: 'ABCDE1234F',
      panName: prev.fullName || 'JOHN DOE',
    }));
    goNext();
  };

  const handleSubmit = () => {
    // Here you would submit all data to backend
    console.log('Submitting KYC data:', data);
    goToStep('status');
  };

  const showProgress = currentStep !== 'intro' && currentStep !== 'status';
  const showBackToHome = currentStep === 'intro';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {showBackToHome && (
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            )}
            {!showBackToHome && currentStep !== 'status' && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </button>
            )}
          </div>

          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SurePay Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg">SurePay</span>
          </Link>

          <div className="w-20" />
        </div>
      </header>

      {/* Progress */}
      {showProgress && (
        <div className="border-b bg-background">
          <div className="container max-w-4xl mx-auto">
            <EnterpriseKYCProgress
              currentStep={currentStepIndex}
              steps={STEP_LABELS}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="container mx-auto max-w-lg pb-8">
        <AnimatePresence mode="wait">
          {currentStep === 'intro' && (
            <motion.div key="intro">
              <KYCIntro onStart={goNext} />
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
                panImage={data.panImage}
                onUpdate={(file) => setData({ ...data, panImage: file })}
                onContinue={handlePanContinue}
                onBack={goBack}
              />
            </motion.div>
          )}

          {currentStep === 'aadhaar' && (
            <motion.div key="aadhaar">
              <KYCAadhaarVerification
                data={data.aadhaar}
                onUpdate={(aadhaarData) => setData({ ...data, aadhaar: aadhaarData })}
                onContinue={handleAadhaarContinue}
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

          {currentStep === 'password' && (
            <motion.div key="password">
              <KYCPasswordStep
                password={data.password}
                confirmPassword={data.confirmPassword}
                onUpdatePassword={(password) => setData({ ...data, password })}
                onUpdateConfirmPassword={(confirmPassword) => setData({ ...data, confirmPassword })}
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
                  panName: data.panName,
                  aadhaarNumber: data.aadhaarNumber,
                  aadhaarName: data.aadhaarName,
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
