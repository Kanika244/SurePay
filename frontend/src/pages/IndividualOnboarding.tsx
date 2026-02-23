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

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type KYCStep = 'intro' | 'personal' | 'pan' | 'aadhaar' | 'selfie' | 'password' | 'review' | 'status';

interface KYCData {
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  sameAsAadhaar: boolean;
  panImage: File | null;
  panNumber: string;
  panName: string;
  aadhaar: { frontImage: File | null; backImage: File | null };
  aadhaarNumber: string;
  aadhaarName: string;
  selfie: { selfieImage: string | null; livenessCompleted: boolean };
  password: string;
  confirmPassword: string;
}

const initialData: KYCData = {
  fullName: '', dob: '', gender: '', address: '', sameAsAadhaar: false,
  panImage: null, panNumber: '', panName: '',
  aadhaar: { frontImage: null, backImage: null },
  aadhaarNumber: '', aadhaarName: '',
  selfie: { selfieImage: null, livenessCompleted: false },
  password: '', confirmPassword: '',
};

const STEPS: KYCStep[] = ['intro', 'personal', 'pan', 'aadhaar', 'selfie', 'password', 'review', 'status'];
const STEP_LABELS: string[] = ['Start', 'Details', 'PAN', 'Aadhaar', 'Selfie', 'Password', 'Review', 'Done'];

const KYCFlow = () => {
  const [currentStep, setCurrentStep] = useState<KYCStep>('intro');
  const [data, setData] = useState<KYCData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Phone comes from localStorage — set during OTP verification
  const phone = localStorage.getItem("individual_phone") || "";

  const currentStepIndex = STEPS.indexOf(currentStep);
  const goToStep = (step: KYCStep) => { setError(""); setCurrentStep(step); };
  const goNext = () => { setError(""); setCurrentStep(STEPS[currentStepIndex + 1]); };
  const goBack = () => { setError(""); setCurrentStep(STEPS[currentStepIndex - 1]); };

  // ── STEP 1: Save personal details ──
  const handlePersonalContinue = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/kyc/personal-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          full_name: data.fullName,
          dob: data.dob,
          gender: data.gender,
          address: data.address,
          same_as_aadhaar: data.sameAsAadhaar,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Failed to save personal details.");
      // Save user_id to localStorage if returned
      if (result.user_id) localStorage.setItem("individual_user_id", result.user_id);
      goNext();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Upload PAN + Aadhaar documents together ──
  const handleDocumentsContinue = async () => {
    if (!data.panImage || !data.aadhaar.frontImage || !data.aadhaar.backImage) {
      setError("Please upload all required documents."); return;
    }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("pan_image", data.panImage);
      formData.append("aadhaar_front", data.aadhaar.frontImage);
      formData.append("aadhaar_back", data.aadhaar.backImage);

      const res = await fetch(`${BASE_URL}/api/kyc/documents`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Failed to upload documents.");

      // Store OCR extracted data
      setData(prev => ({
        ...prev,
        panNumber: result.extracted_data?.pan_number || prev.panNumber,
        panName: result.extracted_data?.pan_name || prev.panName,
        aadhaarNumber: result.extracted_data?.aadhaar_number || prev.aadhaarNumber,
        aadhaarName: result.extracted_data?.aadhaar_name || prev.aadhaarName,
      }));
      goNext();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Upload selfie ──
  const handleSelfieContinue = async () => {
    if (!data.selfie.selfieImage) { setError("Please capture a selfie."); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("selfie_data", data.selfie.selfieImage); // base64

      const res = await fetch(`${BASE_URL}/api/kyc/selfie`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Failed to upload selfie.");
      goNext();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 4: Set password ──
  const handlePasswordContinue = async () => {
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("password", data.password);

      const res = await fetch(`${BASE_URL}/api/kyc/password`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Failed to set password.");
      goNext();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 5: Final submit ──
  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("phone", phone);

      const res = await fetch(`${BASE_URL}/api/kyc/submit`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Failed to submit KYC.");
      goToStep('status');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
              <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />Back to home
              </Link>
            )}
            {!showBackToHome && currentStep !== 'status' && (
              <button onClick={goBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
            <EnterpriseKYCProgress currentStep={currentStepIndex} steps={STEP_LABELS} />
          </div>
        </div>
      )}

      {/* Global error */}
      {error && (
        <div className="container max-w-lg mx-auto pt-4">
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>
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
                data={{ fullName: data.fullName, dob: data.dob, gender: data.gender, address: data.address, sameAsAadhaar: data.sameAsAadhaar }}
                onUpdate={(d) => setData({ ...data, ...d })}
                onContinue={handlePersonalContinue}   // ← real API
                onBack={() => goToStep('intro')}
              //loading={loading}
              />
            </motion.div>
          )}

          {currentStep === 'pan' && (
            <motion.div key="pan">
              <KYCPanVerification
                panImage={data.panImage}
                onUpdate={(file) => setData({ ...data, panImage: file })}
                onContinue={goNext}   // PAN uploaded together with Aadhaar in next step
                onBack={goBack}
              />
            </motion.div>
          )}

          {currentStep === 'aadhaar' && (
            <motion.div key="aadhaar">
              <KYCAadhaarVerification
                data={data.aadhaar}
                onUpdate={(d) => setData({ ...data, aadhaar: d })}
                onContinue={handleDocumentsContinue}  // ← real API (uploads PAN + Aadhaar)
                onBack={goBack}
              //loading={loading}
              />
            </motion.div>
          )}

          {currentStep === 'selfie' && (
            <motion.div key="selfie">
              <KYCSelfieCapture
                data={data.selfie}
                onUpdate={(d) => setData({ ...data, selfie: d })}
                onContinue={handleSelfieContinue}     // ← real API
                onBack={goBack}
              //loading={loading}
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
                onContinue={handlePasswordContinue}   // ← real API
                onBack={goBack}
              //loading={loading}
              />
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div key="review">
              <KYCReviewConsent
                data={{
                  fullName: data.fullName, dob: data.dob,
                  address: data.address,
                  panNumber: data.panNumber, panName: data.panName,
                  aadhaarNumber: data.aadhaarNumber, aadhaarName: data.aadhaarName,
                  selfieImage: data.selfie.selfieImage,
                }}
                onSubmit={handleSubmit}               // ← real API
                onBack={goBack}
              //loading={loading}
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