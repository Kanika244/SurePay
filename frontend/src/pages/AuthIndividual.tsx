import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import logo from "@/assets/logo.jpg";

type Step = "phone" | "otp";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AuthIndividual = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();



  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/send_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Mock OTP:", data.otp); // For testing purposes
        setStep("otp");
      } else {
        alert(data.detail);

      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Failed to send OTP. Please try again.");

    }
  };



  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

   const res = await fetch(`${API_BASE}/auth/verify-otp`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone, otp }),
});
    const data = await res.json();
    if (res.ok) {

      localStorage.setItem("individual_phone", phone);
      if (data.user_id) localStorage.setItem("individual_user_id", data.user_id);

      if (data.is_new_user) {
        navigate("/kyc");
      } else {
        navigate("/app");  // ← also fix: was "/dashboard", should be "/app"
      }
    } else {
      alert(data.detail || "OTP verification failed.");
    }
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
                setStep("phone");
                setOtp("");
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            {step === "otp" ? "Change number" : "Back to home"}
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <img src={logo} alt="SurePay Logo" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-2xl font-bold text-foreground">SurePay</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Create your wallet
                </h1>
                <p className="text-muted-foreground mb-8">
                  Enter your mobile number to get started. You can add email later.
                </p>

                {/* Phone Icon Indicator */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Mobile Verification</p>
                    <p className="text-xs text-muted-foreground">We'll send you a one-time password</p>
                  </div>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSendOTP}>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="h-12"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <Button variant="hero" size="lg" className="w-full gap-2" type="submit">
                    Send OTP
                    <ArrowRight size={18} />
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
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
                  Verify your number
                </h1>
                <p className="text-muted-foreground mb-8">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
                </p>

                {/* OTP Form */}
                <form className="space-y-6" onSubmit={handleVerifyOTP}>
                  <div className="space-y-3">
                    <Label>One-Time Password</Label>
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
                    variant="hero"
                    size="lg"
                    className="w-full"
                    type="submit"
                    disabled={otp.length !== 6}
                  >
                    Verify & Create Wallet
                  </Button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => console.log("Resend OTP")}
                  >
                    Resend OTP
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 animated-grid" />
        <div className="glow-orb w-[400px] h-[400px] bg-primary/20" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-primary-foreground font-bold text-4xl">₹</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Digital money, made simple
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Send, receive, and manage your digital payments with ease.
            Your wallet is ready in seconds.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthIndividual;