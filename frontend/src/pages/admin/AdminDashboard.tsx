import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Users,
    User,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import KPICard from "@/components/admin/KPICard";
import StatusBadge from "@/components/admin/StatusBadge";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";
import { Link } from "react-router-dom";

const CHART_COLORS = ["hsl(234, 89%, 54%)", "hsl(262, 83%, 58%)", "hsl(168, 76%, 42%)"];

interface Stats {
    totalEnterprises: number;
    totalIndividuals: number;
    totalEmployees: number;
    totalTransactions: number;
    totalWalletBalance: number;
    topEnterprisesByVolume: { name: string; volume: number }[];
    walletDistribution: { name: string; value: number }[];
}

interface Transaction {
    id: string;
    senderName: string;
    senderType: string;
    receiverName: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    timestamp: string;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, txnRes] = await Promise.all([
                fetch("http://localhost:8000/api/admin/stats"),
                fetch("http://localhost:8000/api/admin/transactions/recent?limit=5"),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData);
            }

            if (txnRes.ok) {
                const txnData = await txnRes.json();
                if (txnData.success) setTransactions(txnData.transactions);
            }
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <AdminLayout title="Dashboard" subtitle="Overview of your SurePay admin panel">
            {/* Refresh button */}
            <div className="flex justify-end mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDashboardData}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <KPICard
                    title="Total Enterprises"
                    value={stats?.totalEnterprises ?? 0}
                    change="Live from DB"
                    trend="up"
                    icon={Building2}
                    delay={0}
                />
                <KPICard
                    title="Total Employees"
                    value={stats?.totalEmployees ?? 0}
                    change="Live from DB"
                    trend="up"
                    icon={Users}
                    delay={0.05}
                />
                <KPICard
                    title="Total Individuals"
                    value={stats?.totalIndividuals ?? 0}
                    change="Live from DB"
                    trend="up"
                    icon={User}
                    delay={0.1}
                />
                <KPICard
                    title="System Wallet Balance"
                    value={formatCurrency(stats?.totalWalletBalance ?? 0)}
                    change="All wallets"
                    trend="up"
                    icon={Wallet}
                    delay={0.15}
                />
                <KPICard
                    title="Total Transactions"
                    value={stats?.totalTransactions ?? 0}
                    change="Live from DB"
                    trend="up"
                    icon={TrendingUp}
                    delay={0.2}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Wallet Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Wallet Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats?.walletDistribution && (
                                <>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={stats.walletDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.walletDistribution.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                                formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-4">
                                        {stats.walletDistribution.map((item, index) => (
                                            <div key={item.name} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: CHART_COLORS[index] }}
                                                />
                                                <span className="text-xs text-muted-foreground">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Enterprises */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Top Enterprises by Wallet Balance</CardTitle>
                            <Link to="/admin/enterprises">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(stats?.topEnterprisesByVolume ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No enterprises yet</p>
                                ) : (
                                    stats?.topEnterprisesByVolume.map((enterprise, index) => (
                                        <div key={enterprise.name} className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-muted-foreground w-6">
                                                #{index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium">{enterprise.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatCurrency(enterprise.volume)}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{
                                                            width: `${stats.topEnterprisesByVolume[0]?.volume ? (enterprise.volume / stats.topEnterprisesByVolume[0].volume) * 100 : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Transactions</CardTitle>
                        <Link to="/admin/transactions">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                            ) : (
                                transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit"
                                                    ? "bg-green-100 dark:bg-green-900/30"
                                                    : "bg-primary/10"
                                                    }`}
                                            >
                                                {tx.type === "credit" ? (
                                                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <ArrowUpRight className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {tx.senderName || "Unknown"} → {tx.receiverName || "Unknown"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {tx.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₹{tx.amount.toLocaleString()}</p>
                                            <StatusBadge status={tx.status} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AdminLayout>
    );
};

export default AdminDashboard;