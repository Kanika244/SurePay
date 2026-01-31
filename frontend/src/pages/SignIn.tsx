import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, Building2, ArrowRight, Lock, Mail, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/logo.jpg";

const SignIn = () => {
    const navigate = useNavigate();

    // Individual login state
    const [phone, setPhone] = useState("");

    // Enterprise login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Admin login state
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    const [activeTab, setActiveTab] = useState<string>("individual");

    const handleVerifyNumber = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length >= 10) {
            // Simulate backend check - if number exists, go to dashboard
            // For now, always redirect to dashboard
            navigate("/dashboard");
        }
    };

    const handleEnterpriseLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            // Simulate enterprise login - go to enterprise dashboard
            navigate("/enterprise/dashboard");
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminEmail && adminPassword) {
            // Simulate admin login - go to admin dashboard
            navigate("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Back Link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft size={16} />
                        Back to home
                    </Link>

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <img src={logo} alt="SurePay Logo" className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-2xl font-bold text-foreground">SurePay</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Sign in to access your account
                    </p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="individual" className="flex items-center gap-2">
                                <Smartphone size={16} />
                                Individual
                            </TabsTrigger>
                            <TabsTrigger value="enterprise" className="flex items-center gap-2">
                                <Building2 size={16} />
                                Enterprise
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="flex items-center gap-2">
                                <Shield size={16} />
                                Admin
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="individual">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Phone Icon Indicator */}
                                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Smartphone className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Mobile Verification</p>
                                        <p className="text-xs text-muted-foreground">Enter your registered mobile number</p>
                                    </div>
                                </div>

                                {/* Form */}
                                <form className="space-y-4" onSubmit={handleVerifyNumber}>
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
                                        Verify Number
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
                                    <Link to="/enterprise/onboarding" className="text-accent hover:underline font-medium">
                                        Get started
                                    </Link>
                                </p>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="admin">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Admin Icon Indicator */}
                                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Shield className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Admin Login</p>
                                        <p className="text-xs text-muted-foreground">Access the admin dashboard</p>
                                    </div>
                                </div>

                                {/* Admin Login Form */}
                                <form className="space-y-4" onSubmit={handleAdminLogin}>
                                    <div className="space-y-2">
                                        <Label htmlFor="adminEmail">Admin Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                id="adminEmail"
                                                type="email"
                                                placeholder="admin@surepay.com"
                                                className="h-12 pl-10"
                                                value={adminEmail}
                                                onChange={(e) => setAdminEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="adminPassword">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                id="adminPassword"
                                                type="password"
                                                placeholder="Enter admin password"
                                                className="h-12 pl-10"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button size="lg" className="w-full gap-2" type="submit">
                                        Access Admin Panel
                                        <ArrowRight size={18} />
                                    </Button>
                                </form>

                                <p className="text-xs text-muted-foreground text-center mt-6">
                                    Admin access is restricted to authorized personnel only.
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