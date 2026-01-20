import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalDetailsData {
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  sameAsAadhaar: boolean;
}

interface KYCPersonalDetailsProps {
  data: PersonalDetailsData;
  onUpdate: (data: PersonalDetailsData) => void;
  onContinue: () => void;
  onBack: () => void;
}

const KYCPersonalDetails = ({ data, onUpdate, onContinue, onBack }: KYCPersonalDetailsProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAge = (dob: string): boolean => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const handleChange = (field: keyof PersonalDetailsData, value: string | boolean) => {
    // Auto-capitalize name
    if (field === 'fullName' && typeof value === 'string') {
      value = value.toUpperCase();
    }
    onUpdate({ ...data, [field]: value });
    
    // Clear error on change
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!data.dob) {
      newErrors.dob = 'Date of birth is required';
    } else if (!validateAge(data.dob)) {
      newErrors.dob = 'You must be at least 18 years old';
    }

    if (!data.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onContinue();
  };

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 py-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Personal Details</h2>
        <p className="text-sm text-muted-foreground">Enter your details as per your PAN card</p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Full Name (as per PAN)
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="JOHN DOE"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={cn(
              "h-12 bg-card border-border",
              errors.fullName && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Date of Birth
          </Label>
          <Input
            id="dob"
            type="date"
            value={data.dob}
            onChange={(e) => handleChange('dob', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={cn(
              "h-12 bg-card border-border",
              errors.dob && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.dob && (
            <p className="text-xs text-destructive">{errors.dob}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gender (Optional)</Label>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange('gender', option)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm border transition-all",
                  data.gender === option
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Current Residential Address
          </Label>
          <textarea
            id="address"
            placeholder="Enter your complete address"
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className={cn(
              "w-full px-3 py-3 rounded-md border bg-card text-sm resize-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              errors.address ? "border-destructive" : "border-border"
            )}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address}</p>
          )}
        </div>

        {/* Same as Aadhaar checkbox */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <Checkbox
            id="sameAsAadhaar"
            checked={data.sameAsAadhaar}
            onCheckedChange={(checked) => handleChange('sameAsAadhaar', !!checked)}
          />
          <Label
            htmlFor="sameAsAadhaar"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Same as Aadhaar address
          </Label>
        </div>
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
          onClick={handleSubmit}
          className="flex-1 h-12 gradient-primary hover:opacity-90"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default KYCPersonalDetails;
