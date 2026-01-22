import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import EnterpriseKYCProgress from "@/components/enterprise-kyc/EnterpriseKYCProgress";
import EnterpriseEmailStep from "@/components/enterprise-kyc/EnterpriseEmailStep";
import EnterpriseOTPStep from "@/components/enterprise-kyc/EnterpriseOTPStep";
import EnterprisePasswordStep from "@/components/enterprise-kyc/EnterprisePasswordStep";
import EnterpriseCompanyDetails, { CompanyDetailsData } from "@/components/enterprise-kyc/EnterpriseCompanyDetails";
import EnterprisePOCDetails, { POCDetailsData } from "@/components/enterprise-kyc/EnterprisePOCDetails";
import EnterpriseWalletCreation from "@/components/enterprise-kyc/EnterpriseWalletCreation";
import EnterpriseReview from "@/components/enterprise-kyc/EnterpriseReview";
import EnterpriseComplete from "@/components/enterprise-kyc/EnterpriseComplete";
import logo from "@/assets/logo.jpg";

type OnboardingStep =
    | "email"
    | "otp"
    | "password"
    | "company-details"
    | "poc-details"
    | "wallet-creation"
    | "review"
    | "complete";

const STEPS: OnboardingStep[] = [
    "email",
    "otp",
    "password",
    "company-details",
    "poc-details",
    "wallet-creation",
    "review",
    "complete",
];

const STEP_LABELS = [
    "Email",
    "Verify",
    "Password",
    "Company",
    "Representative",
    "Wallet",
    "Review",
    "Complete",
];

interface OnboardingData {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
    companyDetails: CompanyDetailsData;
    pocDetails: POCDetailsData;
    walletId: string;
}

const initialData: OnboardingData = {
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    companyDetails: {
        legalName: "",
        companyType: "",
        country: "",
        registeredAddress: "",
        industryCategory: "",
    },
    pocDetails: {
        fullName: "",
        email: "",
        mobile: "",
        designation: "",
        isAuthorized: false,
        governmentId: null,
        authorizationProof: null,
        extractedIdNumber: "",
        extractedName: "",
    },
    walletId: "",
};

const EnterpriseOnboarding = () => {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("email");
    const [data, setData] = useState<OnboardingData>(initialData);

    const currentStepIndex = STEPS.indexOf(currentStep);

    const goToStep = (step: OnboardingStep) => {
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

    const updateData = <K extends keyof OnboardingData>(
        field: K,
        value: OnboardingData[K]
    ) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const updateCompanyDetails = (field: keyof CompanyDetailsData, value: string) => {
        setData((prev) => ({
            ...prev,
            companyDetails: { ...prev.companyDetails, [field]: value },
        }));
    };

    const updatePOCDetails = (field: keyof POCDetailsData, value: string | boolean | File | null) => {
        setData((prev) => ({
            ...prev,
            pocDetails: { ...prev.pocDetails, [field]: value },
        }));
    };

    const handleEditSection = (section: "company" | "poc") => {
        if (section === "company") {
            goToStep("company-details");
        } else {
            goToStep("poc-details");
        }
    };

    const showProgress = currentStep !== "complete";
    const showBackToHome = currentStep === "email";

    const renderStep = () => {
        switch (currentStep) {
            case "email":
                return (
                    <EnterpriseEmailStep
                        email={data.email}
                        onUpdate={(email) => updateData("email", email)}
                        onContinue={goNext}
                    />
                );
            case "otp":
                return (
                    <EnterpriseOTPStep
                        email={data.email}
                        otp={data.otp}
                        onUpdate={(otp) => updateData("otp", otp)}
                        onContinue={goNext}
                        onBack={goBack}
                    />
                );
            case "password":
                return (
                    <EnterprisePasswordStep
                        password={data.password}
                        confirmPassword={data.confirmPassword}
                        onUpdatePassword={(password) => updateData("password", password)}
                        onUpdateConfirmPassword={(confirmPassword) => updateData("confirmPassword", confirmPassword)}
                        onContinue={goNext}
                        onBack={goBack}
                    />
                );
            case "company-details":
                return (
                    <EnterpriseCompanyDetails
                        data={data.companyDetails}
                        onUpdate={updateCompanyDetails}
                        onContinue={goNext}
                        onBack={goBack}
                    />
                );
            case "poc-details":
                return (
                    <EnterprisePOCDetails
                        data={data.pocDetails}
                        onUpdate={updatePOCDetails}
                        onContinue={goNext}
                        onBack={goBack}
                    />
                );
            case "wallet-creation":
                return (
                    <EnterpriseWalletCreation
                        companyName={data.companyDetails.legalName || "Your Company"}
                        onContinue={goNext}
                        onWalletCreated={(walletId) => updateData("walletId", walletId)}
                    />
                );
            case "review":
                return (
                    <EnterpriseReview
                        email={data.email}
                        companyDetails={data.companyDetails}
                        pocDetails={data.pocDetails}
                        walletId={data.walletId}
                        onEdit={handleEditSection}
                        onSubmit={goNext}
                        onBack={goBack}
                    />
                );
            case "complete":
                return (
                    <EnterpriseComplete
                        companyName={data.companyDetails.legalName || "Your Company"}
                    />
                );
            default:
                return null;
        }
    };

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
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="SurePay Logo" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-semibold text-lg">SurePay</span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                Enterprise
                            </span>
                        </Link>
                    </div>
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
            <main className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default EnterpriseOnboarding;
