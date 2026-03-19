import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    User,
    Settings,
    LogOut,
    Plus,
    Send,
    QrCode,
    CreditCard,
    TrendingUp,
    Loader2,
    CheckCircle,
    Clock,
    AlertCircle,
    Sparkles,
    Building2,
    Link as LinkIcon
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { API_BASE_URL } from "@/services/config";

interface UserData {
    user_id: string;
    phone: string;
    full_name: string | null;
    dob: string | null;
    gender: string | null;
    address: string | null;
    kyc_status: string;
    wallet_balance: number;
    created_at: string;
    employer_name?: string;
    company_id?: string;
}

interface Transaction {
    id: string;
    type: string;
    description: string;
    amount: number;
    created_at: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // User state
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Wallet state
    const [walletData, setWalletData] = useState<{
        wallet_id: string;
        balance: number;
        currency: string;
        status: string;
    } | null>(null);
    const [walletActivating, setWalletActivating] = useState(false);

    // Employer state
    const [showJoinEmployer, setShowJoinEmployer] = useState(false);
    const [companyCode, setCompanyCode] = useState("");
    const [verifiedCompany, setVerifiedCompany] = useState<{
        name: string;
        industry: string;
    } | null>(null);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [joiningEmployer, setJoiningEmployer] = useState(false);
    const [joinError, setJoinError] = useState("");

    // Get user_id from URL or localStorage
    const userId = searchParams.get("user_id") || localStorage.getItem("individual_user_id") || "";
    const phone = localStorage.getItem("individual_phone") || "";

    useEffect(() => {
        if (userId || phone) {
            fetchUserData();
            fetchWalletData();
            fetchTransactions();
        } else {
            // No user info, redirect to login
            navigate("/auth/signin");
        }
    }, [userId, phone]);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            // Fetch user details by phone
            const phoneToUse = phone || "";
            const res = await fetch(`${API_BASE_URL}/api/kyc/user/${phoneToUse}`);

            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
            } else {
                // Try to get from localStorage
                const storedUser = localStorage.getItem("individual_user");
                if (storedUser) {
                    setUserData(JSON.parse(storedUser));
                }
            }
        } catch (err) {
            console.error("Failed to fetch user data", err);
            // Try localStorage fallback
            const storedUser = localStorage.getItem("individual_user");
            if (storedUser) {
                setUserData(JSON.parse(storedUser));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWalletData = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/wallet/individual/${userId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success" && data.wallet) {
                    setWalletData(data.wallet);
                }
            }
        } catch (err) {
            console.error("Failed to fetch wallet", err);
        }
    };

    const fetchTransactions = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/wallet/individual/${userId}/transactions`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "success" && data.transactions) {
                    setTransactions(data.transactions);
                }
            }
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        }
    };

    const handleActivateWallet = async () => {
        if (!userId) return;
        setWalletActivating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/wallet/individual/activate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === "success") {
                    setWalletData(data.wallet);
                }
            }
        } catch (err) {
            console.error("Failed to activate wallet", err);
        } finally {
            setWalletActivating(false);
        }
    };

    const verifyAndJoinEmployer = async () => {
        if (!userId || !companyCode || companyCode.length < 6) {
            setJoinError("Please enter a valid company code");
            return;
        }

        setVerifyingCode(true);
        setJoinError("");

        try {
            // First verify the code
            const verifyRes = await fetch(`${API_BASE_URL}/company/verify/${companyCode}`);
            if (verifyRes.ok) {
                const verifyData = await verifyRes.json();
                if (!verifyData.valid) {
                    setJoinError("Invalid company code. Please check and try again.");
                    setVerifyingCode(false);
                    return;
                }
                setVerifiedCompany({ name: verifyData.company_name, industry: verifyData.industry });
            } else {
                setJoinError("Failed to verify code");
                setVerifyingCode(false);
                return;
            }

            // Now join the company
            setVerifyingCode(false);
            setJoiningEmployer(true);

            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("company_code", companyCode);

            const res = await fetch(`${API_BASE_URL}/company/join`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Failed to join employer");
            }

            if (data.status === "success") {
                fetchUserData();
                setShowJoinEmployer(false);
                setCompanyCode("");
                setVerifiedCompany(null);
            } else if (data.status === "already_linked") {
                setJoinError(data.message);
            }
        } catch (err: unknown) {
            setJoinError(err instanceof Error ? err.message : "Failed to join employer");
        } finally {
            setVerifyingCode(false);
            setJoiningEmployer(false);
        }
    };

    const handleJoinEmployer = async () => {
        if (!userId || !companyCode) return;
        setJoiningEmployer(true);
        setJoinError("");
        try {
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("company_code", companyCode);

            const res = await fetch(`${API_BASE_URL}/company/join`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Failed to join employer");
            }

            if (data.status === "success") {
                // Refresh user data
                fetchUserData();
                setShowJoinEmployer(false);
                setCompanyCode("");
                setVerifiedCompany(null);
            } else if (data.status === "already_linked") {
                setJoinError(data.message);
            }
        } catch (err: unknown) {
            setJoinError(err instanceof Error ? err.message : "Failed to join employer");
        } finally {
            setJoiningEmployer(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("individual_user");
        localStorage.removeItem("individual_phone");
        localStorage.removeItem("individual_user_id");
        navigate("/auth/signin");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const getKycStatusIcon = () => {
        if (!userData) return null;
        switch (userData.kyc_status) {
            case "SUBMITTED":
            case "APPROVED":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "IN_PROGRESS":
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-orange-500" />;
        }
    };

    const quickActions = [
        { icon: Send, label: "Send Money", color: "bg-primary/10 text-primary" },
        { icon: ArrowDownLeft, label: "Request", color: "bg-accent/10 text-accent" },
        { icon: QrCode, label: "Scan & Pay", color: "bg-green-500/10 text-green-600" },
        { icon: CreditCard, label: "Add Money", color: "bg-orange-500/10 text-orange-600" },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const displayName = userData?.full_name || "User";
    const walletBalance = userData?.wallet_balance || 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="SurePay" className="w-9 h-9 rounded-xl object-cover" />
                        <span className="text-xl font-bold text-foreground">SurePay</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                            <Settings size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut size={20} />
                        </Button>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">{getInitials(userData?.full_name)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        {getGreeting()}, {displayName.split(" ")[0]}! 👋
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Here's your financial overview</span>
                        {userData && (
                            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                {getKycStatusIcon()}
                                KYC: {userData.kyc_status}
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* User Info Card */}
                {userData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-4"
                    >
                        <Card className="bg-muted/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-bold text-lg">{getInitials(userData.full_name)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{userData.full_name || "Complete your profile"}</p>
                                        <p className="text-sm text-muted-foreground">{userData.phone}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            {userData.gender && <span className="capitalize">{userData.gender}</span>}
                                            {userData.dob && <span>DOB: {userData.dob}</span>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Employer Section */}

                {userData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        // FIX: 'relative z-10' forces this section to sit ON TOP of the wallet card below it
                        className="mb-4 relative z-10"
                    >
                        {userData.employer_name ? (
                            <Card className="bg-accent/5 border-accent/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Employer</p>
                                            <p className="font-medium">{userData.employer_name}</p>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full h-auto p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20 hover:border-primary/40 hover:bg-primary/5 justify-start"
                                onClick={() => {
                                    console.log("Join Employer Clicked");
                                    setShowJoinEmployer(true);
                                }}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">Join Employer</p>
                                        <p className="text-xs text-muted-foreground font-normal">Enter company code to link your account</p>
                                    </div>
                                    <LinkIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    {walletData ? (
                        <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Wallet size={20} />
                                        <span className="text-sm opacity-90">Wallet Balance</span>
                                    </div>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                        {walletData.wallet_id}
                                    </span>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold mb-4">
                                    {formatCurrency(walletData.balance)}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-sm">
                                        <TrendingUp size={16} />
                                        <span>Available for transactions</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Wallet className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Activate Your Wallet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    Activate your SurePay wallet to send money, receive payments, and manage your finances.
                                </p>
                                <Button
                                    variant="hero"
                                    size="lg"
                                    className="gap-2"
                                    onClick={handleActivateWallet}
                                    disabled={walletActivating}
                                >
                                    {walletActivating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Activating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Activate Wallet
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                                    <action.icon size={22} />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                            <Link to="/transactions" className="text-sm text-primary hover:underline">View all</Link>
                        </div>
                        <Card>
                            <CardContent className="p-0 divide-y divide-border">
                                {transactions.slice(0, 5).map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                                tx.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
                                            }`}>
                                                {tx.type === "credit"
                                                    ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                                                    : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{tx.description || "Transaction"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${
                                            tx.type === "credit" ? "text-green-600" : "text-red-500"
                                        }`}>
                                            {tx.type === "credit" ? "+" : "-"}₹{tx.amount?.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Account Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
                    </div>
                    <Card>
                        <CardContent className="p-0 divide-y divide-border">
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">Phone Number</span>
                                <span className="font-medium">{userData?.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">Full Name</span>
                                <span className="font-medium">{userData?.full_name || "Not set"}</span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">Date of Birth</span>
                                <span className="font-medium">{userData?.dob || "Not set"}</span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">Gender</span>
                                <span className="font-medium capitalize">{userData?.gender || "Not set"}</span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">Address</span>
                                <span className="font-medium text-right max-w-[60%]">{userData?.address || "Not set"}</span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">KYC Status</span>
                                <span className={`font-medium flex items-center gap-1 ${userData?.kyc_status === "APPROVED" ? "text-green-500" :
                                    userData?.kyc_status === "SUBMITTED" ? "text-blue-500" :
                                        userData?.kyc_status === "IN_PROGRESS" ? "text-yellow-500" :
                                            "text-orange-500"
                                    }`}>
                                    {getKycStatusIcon()}
                                    {userData?.kyc_status || "PENDING"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4">
                                <span className="text-muted-foreground">Member Since</span>
                                <span className="font-medium">
                                    {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            {/* Join Employer Dialog */}
            <Dialog open={showJoinEmployer} onOpenChange={setShowJoinEmployer}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            Join Employer
                        </DialogTitle>
                        <DialogDescription>
                            Enter the company code provided by your employer to link your account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-code">Company Code</Label>
                            <Input
                                id="company-code"
                                placeholder="SP-XXX-123"
                                value={companyCode}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setCompanyCode(val);
                                    setVerifiedCompany(null);
                                    setJoinError("");
                                }}
                                className="text-center text-lg tracking-wider font-mono"
                            />
                        </div>

                        {verifyingCode && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying...
                            </div>
                        )}

                        {verifiedCompany && (
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Company Found!</span>
                                </div>
                                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                    <strong>{verifiedCompany.name}</strong>
                                    {verifiedCompany.industry && (
                                        <span className="text-muted-foreground"> • {verifiedCompany.industry}</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {joinError && (
                            <p className="text-sm text-destructive text-center">{joinError}</p>
                        )}

                        <Button
                            className="w-full gap-2"
                            onClick={verifyAndJoinEmployer}
                            disabled={verifyingCode || joiningEmployer || !companyCode}
                        >
                            {verifyingCode ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : joiningEmployer ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-4 h-4" />
                                    Verify & Join
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Dashboard;
