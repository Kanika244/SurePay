import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Users, Wallet, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "otp";

const AuthEnterprise = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@") && email.includes(".")) {
      setStep("otp");
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle OTP verification
    console.log("Verifying OTP:", otp);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="max-w-md mx-auto w-full">
          {/* Back Link */}
          <Link
            to={step === "otp" ? "#" : "/"}
            onClick={(e) => {
              if (step === "otp") {
                e.preventDefault();
                setStep("email");
                setOtp("");
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            {step === "otp" ? "Change email" : "Back to home"}
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-foreground">SurePay</span>
            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
              Enterprise
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Enterprise Login
                </h1>
                <p className="text-muted-foreground mb-8">
                  Sign in with your company email to access your enterprise account.
                </p>

                {/* Email Icon Indicator */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mail className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Company Email Verification</p>
                    <p className="text-xs text-muted-foreground">Use your official work email address</p>
                  </div>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSendOTP}>
                  <div className="space-y-2">
                    <Label htmlFor="workEmail">Work Email</Label>
                    <Input
                      id="workEmail"
                      type="email"
                      placeholder="you@company.com"
                      className="h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Please use your official company email address
                    </p>
                  </div>

                  <Button variant="enterprise" size="lg" className="w-full gap-2" type="submit">
                    Send Verification Code
                    <ArrowRight size={18} />
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  By continuing, you agree to our Enterprise Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Verify your email
                </h1>
                <p className="text-muted-foreground mb-8">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
                </p>

                {/* OTP Form */}
                <form className="space-y-6" onSubmit={handleVerifyOTP}>
                  <div className="space-y-3">
                    <Label>Verification Code</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                          <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                          <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                          <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                          <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                          <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    variant="enterprise"
                    size="lg"
                    className="w-full"
                    type="submit"
                    disabled={otp.length !== 6}
                  >
                    Verify & Continue
                  </Button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="text-accent hover:underline font-medium"
                    onClick={() => console.log("Resend OTP")}
                  >
                    Resend Code
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent via-accent/90 to-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-30" />
        <div className="glow-orb w-[500px] h-[500px] bg-primary-foreground/10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 px-12 max-w-lg"
        >
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Power your enterprise payments
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Streamline payroll, manage employee wallets, and automate expense reimbursements at scale.
          </p>

          <div className="space-y-4">
            {[
              { icon: Building2, title: "Corporate Onboarding", desc: "Quick setup for your entire organization" },
              { icon: Users, title: "Bulk Wallet Creation", desc: "Provision wallets for all employees" },
              { icon: Wallet, title: "Programmable Payouts", desc: "Automate allowances and reimbursements" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
                  <feature.icon className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-primary-foreground/60">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthEnterprise;
