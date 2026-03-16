import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg";
import {
    Building2,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowLeft,
    Wallet,
    CreditCard,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { API_BASE_URL } from "@/services/config";

const EnterpriseReports = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const companyId = searchParams.get("company_id") || "";

    const [isLoading, setIsLoading] = useState(true);
    const [companyName, setCompanyName] = useState("Enterprise");

    // Report data
    const [reportStats, setReportStats] = useState({
        totalCredits: 0,
        totalDebits: 0,
        transactionCount: 0,
        avgTransactionSize: 0,
        currentBalance: 0,
        teamCount: 0,
        netFlow: 0
    });

    const [transactions, setTransactions] = useState<Array<{
        id: string;
        type: string;
        amount: number;
        created_at: string;
    }>>([]);

    // Monthly data for charts
    const [monthlyData, setMonthlyData] = useState<Array<{
        month: string;
        credits: number;
        debits: number;
    }>>([]);

    useEffect(() => {
        if (companyId) {
            fetchReportData();
        }
    }, [companyId]);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            // Fetch company info
            const companyRes = await fetch(`${API_BASE_URL}/company/${companyId}`);
            if (companyRes.ok) {
                const companyData = await companyRes.json();
                setCompanyName(companyData.legal_name || "Enterprise");
            }

            // Fetch reports
            const reportsRes = await fetch(`${API_BASE_URL}/api/enterprise/reports/${companyId}`);
            if (reportsRes.ok) {
                const reportsData = await reportsRes.json();
                setReportStats({
                    totalCredits: reportsData.reports.total_credits || 0,
                    totalDebits: reportsData.reports.total_debits || 0,
                    transactionCount: reportsData.reports.transaction_count || 0,
                    avgTransactionSize: reportsData.reports.avg_transaction_size || 0,
                    currentBalance: reportsData.reports.current_balance || 0,
                    teamCount: reportsData.reports.team_count || 0,
                    netFlow: reportsData.reports.net_flow || 0
                });
            }

            // Fetch transactions for chart data
            const txRes = await fetch(`${API_BASE_URL}/api/enterprise/transactions/${companyId}?limit=50`);
            if (txRes.ok) {
                const txData = await txRes.json();
                setTransactions(txData.transactions || []);
                processMonthlyData(txData.transactions || []);
            }
        } catch (err) {
            console.error("Failed to fetch report data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const processMonthlyData = (txList: Array<{ type: string; amount: number; created_at: string }>) => {
        const monthMap: Record<string, { credits: number; debits: number }> = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            monthMap[key] = { credits: 0, debits: 0 };
        }

        // Aggregate transactions
        txList.forEach(tx => {
            if (tx.created_at) {
                const date = new Date(tx.created_at);
                const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
                if (monthMap[key]) {
                    if (tx.type === "credit") {
                        monthMap[key].credits += tx.amount;
                    } else if (tx.type === "debit") {
                        monthMap[key].debits += tx.amount;
                    }
                }
            }
        });

        const data = Object.entries(monthMap).map(([month, vals]) => ({
            month: month.split(" ")[0],
            credits: vals.credits,
            debits: vals.debits
        }));

        setMonthlyData(data);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Chart colors
    const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

    // Pie chart data
    const pieData = [
        { name: "Credits", value: reportStats.totalCredits, color: "#22c55e" },
        { name: "Debits", value: reportStats.totalDebits, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Transaction type distribution
    const typeDistribution = [
        { name: "Incoming", value: reportStats.totalCredits },
        { name: "Outgoing", value: reportStats.totalDebits },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src={logo}
                                alt="SurePay Logo"
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-xl font-bold text-primary hidden sm:inline">
                                SurePay
                            </span>
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium">{companyName}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            Reports
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/enterprise/dashboard?company_id=${companyId}`)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-4 py-8">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Financial Reports
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive overview of your transaction statistics and trends
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Credits</p>
                                    <p className="text-2xl font-bold text-green-500">
                                        {formatCurrency(reportStats.totalCredits)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-full">
                                    <ArrowDownLeft className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Debits</p>
                                    <p className="text-2xl font-bold text-red-500">
                                        {formatCurrency(reportStats.totalDebits)}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <ArrowUpRight className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    <p className="text-2xl font-bold text-blue-500">
                                        {formatCurrency(reportStats.currentBalance)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-full">
                                    <Wallet className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border-l-4 ${reportStats.netFlow >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                                    <p className={`text-2xl font-bold ${reportStats.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {reportStats.netFlow >= 0 ? '+' : ''}{formatCurrency(reportStats.netFlow)}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${reportStats.netFlow >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    {reportStats.netFlow >= 0 ? (
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <TrendingDown className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Monthly Trend
                                </CardTitle>
                                <CardDescription>Credits vs Debits over the last 6 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" className="text-xs" />
                                        <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="credits" name="Credits" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="debits" name="Debits" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Cash Flow Area Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Cash Flow Trend
                                </CardTitle>
                                <CardDescription>Net flow visualization over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorDebits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" className="text-xs" />
                                        <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Area type="monotone" dataKey="credits" stroke="#22c55e" fillOpacity={1} fill="url(#colorCredits)" />
                                        <Area type="monotone" dataKey="debits" stroke="#ef4444" fillOpacity={1} fill="url(#colorDebits)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-primary" />
                                    Transaction Distribution
                                </CardTitle>
                                <CardDescription>Credits vs Debits breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Summary Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Transaction Summary
                                </CardTitle>
                                <CardDescription>Key metrics and statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <p className="text-3xl font-bold text-primary">
                                            {reportStats.transactionCount}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Total Transactions
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <p className="text-3xl font-bold">
                                            {formatCurrency(reportStats.avgTransactionSize)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Avg Transaction
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <p className="text-3xl font-bold text-blue-500">
                                            {reportStats.teamCount}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Team Members
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <p className="text-3xl font-bold">
                                            {reportStats.transactionCount > 0
                                                ? ((reportStats.totalCredits / (reportStats.totalCredits + reportStats.totalDebits)) * 100).toFixed(1)
                                                : 0}%
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Credit Ratio
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default EnterpriseReports;
