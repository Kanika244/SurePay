import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, Building2, ArrowRight, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type IndividualStep = "phone" | "otp";

const SignIn = () => {
    const navigate = useNavigate();

    // Individual login state
    const [individualStep, setIndividualStep] = useState<IndividualStep>("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    // Enterprise login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [activeTab, setActiveTab] = useState<string>("individual");

    const handleSendOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length >= 10) {
            setIndividualStep("otp");
        }
    };

    const handleVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length === 6) {
            // For login, go directly to dashboard (no KYC)
            navigate("/dashboard");
        }
    };

    const handleEnterpriseLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            // Simulate enterprise login - go to dashboard
            navigate("/dashboard");
        }
    };

    const resetIndividualForm = () => {
        setIndividualStep("phone");
        setOtp("");
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Back Link */}
                    <Link
                        to={individualStep === "otp" && activeTab === "individual" ? "#" : "/"}
                        onClick={(e) => {
                            if (individualStep === "otp" && activeTab === "individual") {
                                e.preventDefault();
                                resetIndividualForm();
                            }
                        }}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft size={16} />
                        {individualStep === "otp" && activeTab === "individual" ? "Change number" : "Back to home"}
                    </Link>

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-xl">S</span>
                        </div>
                        <span className="text-2xl font-bold text-foreground">SurePay</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Sign in to access your account
                    </p>

                    <Tabs value={activeTab} onValueChange={(val) => {
                        setActiveTab(val);
                        resetIndividualForm();
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="individual" className="flex items-center gap-2">
                                <Smartphone size={16} />
                                Individual
                            </TabsTrigger>
                            <TabsTrigger value="enterprise" className="flex items-center gap-2">
                                <Building2 size={16} />
                                Enterprise
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="individual">
                            <AnimatePresence mode="wait">
                                {individualStep === "phone" ? (
                                    <motion.div
                                        key="phone-step"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
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

                                        <p className="text-sm text-muted-foreground text-center mt-6">
                                            Don't have an account?{" "}
                                            <Link to="/auth/individual" className="text-primary hover:underline font-medium">
                                                Sign up
                                            </Link>
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
                                        <p className="text-muted-foreground mb-6">
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
                                                Sign In
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
                        </TabsContent>

                        <TabsContent value="enterprise">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Enterprise Icon Indicator */}
                                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-accent/5 border border-accent/20">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <Building2 className="text-accent" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Enterprise Login</p>
                                        <p className="text-xs text-muted-foreground">Use your work email and password</p>
                                    </div>
                                </div>

                                {/* Enterprise Login Form */}
                                <form className="space-y-4" onSubmit={handleEnterpriseLogin}>
                                    <div className="space-y-2">
                                        <Label htmlFor="workEmail">Work Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                id="workEmail"
                                                type="email"
                                                placeholder="you@company.com"
                                                className="h-12 pl-10"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <button
                                                type="button"
                                                className="text-xs text-primary hover:underline"
                                                onClick={() => console.log("Forgot password")}
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                className="h-12 pl-10"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button variant="enterprise" size="lg" className="w-full gap-2" type="submit">
                                        Sign In
                                        <ArrowRight size={18} />
                                    </Button>
                                </form>

                                <p className="text-sm text-muted-foreground text-center mt-6">
                                    Need an enterprise account?{" "}
                                    <Link to="/auth/enterprise" className="text-accent hover:underline font-medium">
                                        Contact sales
                                    </Link>
                                </p>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
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
                        Welcome back to SurePay
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                        Access your wallet, manage payments, and stay in control of your finances.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignIn;
