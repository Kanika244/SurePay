import { useState } from "react";
import { motion } from "framer-motion";
import { Building, MapPin, Globe, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface CompanyDetailsData {
    legalName: string;
    companyType: string;
    country: string;
    registeredAddress: string;
    industryCategory: string;
}

interface EnterpriseCompanyDetailsProps {
    data: CompanyDetailsData;
    onUpdate: (field: keyof CompanyDetailsData, value: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

const companyTypes = [
    "Private Limited",
    "Limited Liability Partnership (LLP)",
    "Partnership",
    "Sole Proprietor",
    "Public Limited",
];

const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Singapore",
    "UAE",
    "Other",
];

const industries = [
    "Technology",
    "Finance & Banking",
    "Healthcare",
    "E-commerce",
    "Manufacturing",
    "Education",
    "Real Estate",
    "Other",
];

const EnterpriseCompanyDetails = ({
    data,
    onUpdate,
    onContinue,
    onBack,
}: EnterpriseCompanyDetailsProps) => {
    const [errors, setErrors] = useState<Partial<Record<keyof CompanyDetailsData, string>>>({});

    const validateAndContinue = () => {
        const newErrors: Partial<Record<keyof CompanyDetailsData, string>> = {};

        if (!data.legalName.trim()) {
            newErrors.legalName = "Company name is required";
        }
        if (!data.companyType) {
            newErrors.companyType = "Please select company type";
        }
        if (!data.country) {
            newErrors.country = "Please select country";
        }
        if (!data.registeredAddress.trim()) {
            newErrors.registeredAddress = "Registered address is required";
        }
        if (!data.industryCategory) {
            newErrors.industryCategory = "Please select industry";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onContinue();
    };

    const handleChange = (field: keyof CompanyDetailsData, value: string) => {
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
                    <Building className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Tell us about your company
                </h1>
                <p className="text-muted-foreground">
                    Provide your company's legal information
                </p>
            </div>

            <div className="space-y-5">
                {/* Legal Company Name */}
                <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Company Name</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="legalName"
                            placeholder="Acme Technologies Pvt Ltd"
                            value={data.legalName}
                            onChange={(e) => handleChange("legalName", e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {errors.legalName && (
                        <p className="text-sm text-destructive">{errors.legalName}</p>
                    )}
                </div>

                {/* Company Type and Country - side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Company Type</Label>
                        <Select
                            value={data.companyType}
                            onValueChange={(value) => handleChange("companyType", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {companyTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.companyType && (
                            <p className="text-sm text-destructive">{errors.companyType}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Country of Incorporation</Label>
                        <Select
                            value={data.country}
                            onValueChange={(value) => handleChange("country", value)}
                        >
                            <SelectTrigger>
                                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.country && (
                            <p className="text-sm text-destructive">{errors.country}</p>
                        )}
                    </div>
                </div>

                {/* Registered Address */}
                <div className="space-y-2">
                    <Label htmlFor="registeredAddress">Registered Address</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                            id="registeredAddress"
                            placeholder="Enter complete registered address"
                            value={data.registeredAddress}
                            onChange={(e) => handleChange("registeredAddress", e.target.value)}
                            className="pl-10 min-h-[80px]"
                        />
                    </div>
                    {errors.registeredAddress && (
                        <p className="text-sm text-destructive">{errors.registeredAddress}</p>
                    )}
                </div>

                {/* Industry Category */}
                <div className="space-y-2">
                    <Label>Industry Category</Label>
                    <Select
                        value={data.industryCategory}
                        onValueChange={(value) => handleChange("industryCategory", value)}
                    >
                        <SelectTrigger>
                            <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                            {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                    {industry}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.industryCategory && (
                        <p className="text-sm text-destructive">{errors.industryCategory}</p>
                    )}
                </div>

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

export default EnterpriseCompanyDetails;
