import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Building, User, FileText, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CompanyDetailsData } from "./EnterpriseCompanyDetails";
import { POCDetailsData } from "./EnterprisePOCDetails";

interface EnterpriseReviewProps {
    email: string;
    companyDetails: CompanyDetailsData;
    pocDetails: POCDetailsData;
    walletId: string;
    onEdit: (section: "company" | "poc") => void;
    onSubmit: () => void;
    onBack: () => void;
}

const EnterpriseReview = ({
    email,
    companyDetails,
    pocDetails,
    walletId,
    onEdit,
    onSubmit,
    onBack,
}: EnterpriseReviewProps) => {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!isConfirmed) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        onSubmit();
    };

    const maskWalletId = (id: string) => {
        if (!id) return "N/A";
        return `${id.substring(0, 6)}****${id.substring(id.length - 2)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ClipboardCheck className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Review your details
                </h1>
                <p className="text-muted-foreground">
                    Please verify all information before submitting
                </p>
            </div>

            <div className="space-y-6">
                {/* Company Details Section */}
                <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b">
                        <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Company Details</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit("company")}
                            className="text-primary hover:text-primary"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Legal Name</p>
                            <p className="font-medium">{companyDetails.legalName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Company Type</p>
                            <p className="font-medium">{companyDetails.companyType || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Country</p>
                            <p className="font-medium">{companyDetails.country || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Industry</p>
                            <p className="font-medium">{companyDetails.industryCategory || "—"}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Registered Address</p>
                            <p className="font-medium">{companyDetails.registeredAddress || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* POC Details Section */}
                <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Authorized Representative</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit("poc")}
                            className="text-primary hover:text-primary"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                            <p className="font-medium">{pocDetails.fullName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Designation</p>
                            <p className="font-medium">{pocDetails.designation || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="font-medium">{pocDetails.email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Mobile</p>
                            <p className="font-medium">{pocDetails.mobile || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 bg-muted/50 border-b">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Uploaded Documents</h3>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-mint/10 rounded flex items-center justify-center">
                                    <Check className="w-4 h-4 text-mint" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Government ID</p>
                                    <p className="text-xs text-muted-foreground">
                                        {pocDetails.governmentId?.name || "Not uploaded"}
                                    </p>
                                </div>
                            </div>
                            {pocDetails.extractedIdNumber && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    {pocDetails.extractedIdNumber}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-mint/10 rounded flex items-center justify-center">
                                    <Check className="w-4 h-4 text-mint" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Authorization Proof</p>
                                    <p className="text-xs text-muted-foreground">
                                        {pocDetails.authorizationProof?.name || "Not uploaded"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallet Info */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-mint/5 border border-primary/20 rounded-xl">
                    <div>
                        <p className="text-sm text-muted-foreground">Enterprise Wallet ID</p>
                        <p className="font-mono font-semibold">{maskWalletId(walletId)}</p>
                    </div>
                    <span className="text-xs bg-mint/10 text-mint px-3 py-1 rounded-full">
                        Enterprise
                    </span>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                        id="confirm"
                        checked={isConfirmed}
                        onCheckedChange={(checked) => setIsConfirmed(!!checked)}
                    />
                    <div>
                        <label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                            I confirm that all the information provided is accurate
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                            By submitting, you agree to our Terms of Service and authorize us to verify the provided information.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onBack} className="flex-1">
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1"
                        disabled={!isConfirmed || isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit & Finish Setup"}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default EnterpriseReview;
