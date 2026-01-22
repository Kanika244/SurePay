import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Briefcase, Upload, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface POCDetailsData {
    fullName: string;
    email: string;
    mobile: string;
    designation: string;
    isAuthorized: boolean;
    governmentId: File | null;
    authorizationProof: File | null;
    extractedIdNumber: string;
    extractedName: string;
}

interface EnterprisePOCDetailsProps {
    data: POCDetailsData;
    onUpdate: (field: keyof POCDetailsData, value: string | boolean | File | null) => void;
    onContinue: () => void;
    onBack: () => void;
}

const EnterprisePOCDetails = ({
    data,
    onUpdate,
    onContinue,
    onBack,
}: EnterprisePOCDetailsProps) => {
    const [errors, setErrors] = useState<Partial<Record<keyof POCDetailsData, string>>>({});
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrComplete, setOcrComplete] = useState(false);
    const govIdRef = useRef<HTMLInputElement>(null);
    const authProofRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateMobile = (mobile: string) => {
        return /^[0-9]{10}$/.test(mobile);
    };

    const handleGovIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate("governmentId", file);

            // Simulate OCR extraction
            setOcrLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Mock OCR data
            onUpdate("extractedName", "RAJESH KUMAR");
            onUpdate("extractedIdNumber", "ABCDE1234F");
            if (!data.fullName) {
                onUpdate("fullName", "Rajesh Kumar");
            }

            setOcrLoading(false);
            setOcrComplete(true);
        }
    };

    const handleAuthProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate("authorizationProof", file);
        }
    };

    const validateAndContinue = () => {
        const newErrors: Partial<Record<keyof POCDetailsData, string>> = {};

        if (!data.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }
        if (!data.email || !validateEmail(data.email)) {
            newErrors.email = "Valid email is required";
        }
        if (!data.mobile || !validateMobile(data.mobile)) {
            newErrors.mobile = "Valid 10-digit mobile number is required";
        }
        if (!data.designation.trim()) {
            newErrors.designation = "Designation is required";
        }
        if (!data.isAuthorized) {
            newErrors.isAuthorized = "You must confirm authorization";
        }
        if (!data.governmentId) {
            newErrors.governmentId = "Government ID is required";
        }
        if (!data.authorizationProof) {
            newErrors.authorizationProof = "Authorization proof is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onContinue();
    };

    const handleChange = (field: keyof POCDetailsData, value: string | boolean) => {
        onUpdate(field, value);
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Authorized representative
                </h1>
                <p className="text-muted-foreground">
                    Provide details of the person authorized to represent your company
                </p>
            </div>

            <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="fullName"
                            placeholder="Enter full name"
                            value={data.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {data.extractedName && (
                        <p className="text-xs text-muted-foreground">
                            Auto-extracted: {data.extractedName} (editable)
                        </p>
                    )}
                    {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                </div>

                {/* Email and Mobile - side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Official Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@company.com"
                                value={data.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="9876543210"
                                value={data.mobile}
                                onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                className="pl-10"
                            />
                        </div>
                        {errors.mobile && (
                            <p className="text-sm text-destructive">{errors.mobile}</p>
                        )}
                    </div>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="designation"
                            placeholder="e.g., CEO, Director, Manager"
                            value={data.designation}
                            onChange={(e) => handleChange("designation", e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {errors.designation && (
                        <p className="text-sm text-destructive">{errors.designation}</p>
                    )}
                </div>

                {/* Document Uploads */}
                <div className="space-y-4">
                    <Label>Document Upload</Label>

                    {/* Government ID */}
                    <div className="space-y-2">
                        <input
                            type="file"
                            ref={govIdRef}
                            onChange={handleGovIdUpload}
                            accept="image/*,.pdf"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => govIdRef.current?.click()}
                            className={cn(
                                "w-full p-4 border-2 border-dashed rounded-lg transition-colors",
                                "hover:border-primary hover:bg-primary/5",
                                data.governmentId ? "border-mint bg-mint/5" : "border-muted-foreground/30"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {ocrLoading ? (
                                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                    ) : data.governmentId ? (
                                        <Check className="w-5 h-5 text-mint" />
                                    ) : (
                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <div className="text-left">
                                        <p className="text-sm font-medium">
                                            Government ID (PAN / Aadhaar / Passport)
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {data.governmentId
                                                ? data.governmentId.name
                                                : "Click to upload or drag and drop"}
                                        </p>
                                    </div>
                                </div>
                                {ocrComplete && data.extractedIdNumber && (
                                    <span className="text-xs bg-mint/10 text-mint px-2 py-1 rounded">
                                        ID: {data.extractedIdNumber}
                                    </span>
                                )}
                            </div>
                        </button>
                        {errors.governmentId && (
                            <p className="text-sm text-destructive">{errors.governmentId}</p>
                        )}
                    </div>

                    {/* Authorization Proof */}
                    <div className="space-y-2">
                        <input
                            type="file"
                            ref={authProofRef}
                            onChange={handleAuthProofUpload}
                            accept=".pdf"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => authProofRef.current?.click()}
                            className={cn(
                                "w-full p-4 border-2 border-dashed rounded-lg transition-colors",
                                "hover:border-primary hover:bg-primary/5",
                                data.authorizationProof ? "border-mint bg-mint/5" : "border-muted-foreground/30"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {data.authorizationProof ? (
                                    <Check className="w-5 h-5 text-mint" />
                                ) : (
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-medium">
                                        Authorization Proof (Board Resolution / PoA)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.authorizationProof
                                            ? data.authorizationProof.name
                                            : "PDF format only"}
                                    </p>
                                </div>
                            </div>
                        </button>
                        {errors.authorizationProof && (
                            <p className="text-sm text-destructive">{errors.authorizationProof}</p>
                        )}
                    </div>
                </div>

                {/* Authorization Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                        id="authorization"
                        checked={data.isAuthorized}
                        onCheckedChange={(checked) => handleChange("isAuthorized", !!checked)}
                    />
                    <div className="space-y-1">
                        <label htmlFor="authorization" className="text-sm font-medium cursor-pointer">
                            I am authorized to represent this company
                        </label>
                        <p className="text-xs text-muted-foreground">
                            By checking this box, I confirm that I have the legal authority to act on behalf of the company.
                        </p>
                    </div>
                </div>
                {errors.isAuthorized && (
                    <p className="text-sm text-destructive">{errors.isAuthorized}</p>
                )}

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onBack} className="flex-1">
                        Back
                    </Button>
                    <Button onClick={validateAndContinue} className="flex-1">
                        Continue
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default EnterprisePOCDetails;
