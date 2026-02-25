import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Smartphone, Building2, ArrowRight, Lock, Mail, Shield, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/logo.jpg";
import { useIndividual } from "@/contexts/IndividualContext";

const BASE_URL = import.meta.env.VITE_API_URL;

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useIndividual();

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [activeTab, setActiveTab] = useState<string>("individual");

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotStatus, setForgotStatus] = useState<"idle" | "success" | "error">("idle");
    const [forgotMessage, setForgotMessage] = useState("");

    // Enterprise login error
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const handleVerifyNumber = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("phone", phone);

        const res = await fetch(`${BASE_URL}/api/kyc/login`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (res.ok && data.success) {
            login(data.user.user_id, data.user.phone);
            navigate("/app");
        } else {
            alert(data.detail || "Phone not registered. Please sign up.");
        }
    };

    const handleEnterpriseLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("company_id", data.company_id);
                localStorage.setItem("company_name", data.company_name || "");
                navigate("/enterprise/dashboard");
            } else {
                setLoginError(data.detail || "Invalid email or password.");
            }
        } catch (err) {
            setLoginError("Network error. Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminEmail && adminPassword) {
            navigate("/admin");
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotStatus("idle");
        try {
            const res = await fetch(`${BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const data = await res.json();
            setForgotStatus("success");
            setForgotMessage(data.message || "Reset link sent! Check your email.");
        } catch (err) {
            setForgotStatus("error");
            setForgotMessage("Network error. Please try again.");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
                <div className="max-w-md mx-auto w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
                        <ArrowLeft size={16} />Back to home
                    </Link>

                    <div className="flex items-center gap-2 mb-8">
                        <img src={logo} alt="SurePay Logo" className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-2xl font-bold text-foreground">SurePay</span>
                    </div>

                    {/* ── Forgot Password View ── */}
                    {showForgot ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
                            <p className="text-muted-foreground text-sm mb-6">
                                Enter your enterprise email and we'll send a reset link.
                            </p>

                            {forgotStatus === "success" ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="font-medium">{forgotMessage}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Check your inbox and click the reset link.
                                    </p>
                                    <Button variant="outline" className="w-full" onClick={() => { setShowForgot(false); setForgotStatus("idle"); setForgotEmail(""); }}>
                                        Back to Sign In
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    {forgotStatus === "error" && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                            <XCircle className="w-4 h-4 shrink-0" />{forgotMessage}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Work Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <Input
                                                type="email"
                                                placeholder="you@company.com"
                                                className="h-12 pl-10"
                                                value={forgotEmail}
                                                onChange={e => setForgotEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" size="lg" className="w-full gap-2" disabled={forgotLoading}>
                                        {forgotLoading ? "Sending..." : "Send Reset Link"}
                                        {!forgotLoading && <ArrowRight size={18} />}
                                    </Button>
                                    <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
                                        Back to Sign In
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome back</h1>
                            <p className="text-muted-foreground mb-8">Sign in to access your account</p>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="individual" className="flex items-center gap-2">
                                        <Smartphone size={16} />Individual
                                    </TabsTrigger>
                                    <TabsTrigger value="enterprise" className="flex items-center gap-2">
                                        <Building2 size={16} />Enterprise
                                    </TabsTrigger>
                                    <TabsTrigger value="admin" className="flex items-center gap-2">
                                        <Shield size={16} />Admin
                                    </TabsTrigger>
                                </TabsList>

                                {/* Individual Tab */}
                                <TabsContent value="individual">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Smartphone className="text-primary" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Mobile Verification</p>
                                                <p className="text-xs text-muted-foreground">Enter your registered mobile number</p>
                                            </div>
                                        </div>
                                        <form className="space-y-4" onSubmit={handleVerifyNumber}>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Mobile Number</Label>
                                                <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-12"
                                                    value={phone} onChange={e => setPhone(e.target.value)} />
                                            </div>
                                            <Button variant="hero" size="lg" className="w-full gap-2" type="submit">
                                                Verify Number<ArrowRight size={18} />
                                            </Button>
                                        </form>
                                        <p className="text-sm text-muted-foreground text-center mt-6">
                                            Don't have an account?{" "}
                                            <Link to="/auth/individual" className="text-primary hover:underline font-medium">Sign up</Link>
                                        </p>
                                    </motion.div>
                                </TabsContent>

                                {/* Enterprise Tab */}
                                <TabsContent value="enterprise">
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-accent/5 border border-accent/20">
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                                <Building2 className="text-accent" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Enterprise Login</p>
                                                <p className="text-xs text-muted-foreground">Use your work email and password</p>
                                            </div>
                                        </div>

                                        {loginError && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                                                <XCircle className="w-4 h-4 shrink-0" />{loginError}
                                            </div>
                                        )}

                                        <form className="space-y-4" onSubmit={handleEnterpriseLogin}>
                                            <div className="space-y-2">
                                                <Label htmlFor="workEmail">Work Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                    <Input id="workEmail" type="email" placeholder="you@company.com"
                                                        className="h-12 pl-10" value={email} onChange={e => { setEmail(e.target.value); setLoginError(""); }} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password">Password</Label>
                                                    <button type="button" className="text-xs text-primary hover:underline"
                                                        onClick={() => { setForgotEmail(email); setShowForgot(true); }}>
                                                        Forgot password?
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                    <Input id="password" type="password" placeholder="Enter your password"
                                                        className="h-12 pl-10" value={password} onChange={e => { setPassword(e.target.value); setLoginError(""); }} />
                                                </div>
                                            </div>
                                            <Button variant="enterprise" size="lg" className="w-full gap-2" type="submit" disabled={loginLoading}>
                                                {loginLoading ? "Signing in..." : "Sign In"}
                                                {!loginLoading && <ArrowRight size={18} />}
                                            </Button>
                                        </form>
                                        <p className="text-sm text-muted-foreground text-center mt-6">
                                            Need an enterprise account?{" "}
                                            <Link to="/enterprise/onboarding" className="text-accent hover:underline font-medium">Get started</Link>
                                        </p>
                                    </motion.div>
                                </TabsContent>

                                {/* Admin Tab */}
                                <TabsContent value="admin">
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Shield className="text-primary" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Admin Login</p>
                                                <p className="text-xs text-muted-foreground">Access the admin dashboard</p>
                                            </div>
                                        </div>
                                        <form className="space-y-4" onSubmit={handleAdminLogin}>
                                            <div className="space-y-2">
                                                <Label htmlFor="adminEmail">Admin Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                    <Input id="adminEmail" type="email" placeholder="admin@surepay.com"
                                                        className="h-12 pl-10" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="adminPassword">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                                    <Input id="adminPassword" type="password" placeholder="Enter admin password"
                                                        className="h-12 pl-10" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                                                </div>
                                            </div>
                                            <Button size="lg" className="w-full gap-2" type="submit">
                                                Access Admin Panel<ArrowRight size={18} />
                                            </Button>
                                        </form>
                                        <p className="text-xs text-muted-foreground text-center mt-6">
                                            Admin access is restricted to authorized personnel only.
                                        </p>
                                    </motion.div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 animated-grid" />
                <div className="glow-orb w-[400px] h-[400px] bg-primary/20" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative z-10 text-center px-12">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <span className="text-primary-foreground font-bold text-4xl">₹</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Welcome back to SurePay</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Access your wallet, manage payments, and stay in control of your finances.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignIn;