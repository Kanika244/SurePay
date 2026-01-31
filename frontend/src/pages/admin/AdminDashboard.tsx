import { motion } from "framer-motion";
import {
    Building2,
    Users,
    User,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import KPICard from "@/components/admin/KPICard";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdmin } from "@/contexts/AdminContext";
import { analyticsData } from "@/data/adminMockData";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Link } from "react-router-dom";

const CHART_COLORS = ["hsl(234, 89%, 54%)", "hsl(262, 83%, 58%)", "hsl(168, 76%, 42%)"];

const AdminDashboard = () => {
    const { transactions } = useAdmin();

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    return (
        <AdminLayout title="Dashboard" subtitle="Overview of your SurePay admin panel">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <KPICard
                    title="Total Enterprises"
                    value={analyticsData.totalEnterprises}
                    change="+2 this month"
                    trend="up"
                    icon={Building2}
                    delay={0}
                />
                <KPICard
                    title="Total Employees"
                    value={analyticsData.totalEmployees}
                    change="+12 this month"
                    trend="up"
                    icon={Users}
                    delay={0.05}
                />
                <KPICard
                    title="Total Individuals"
                    value={analyticsData.totalIndividuals}
                    change="+45 this month"
                    trend="up"
                    icon={User}
                    delay={0.1}
                />
                <KPICard
                    title="System Wallet Balance"
                    value={formatCurrency(analyticsData.totalWalletBalance)}
                    change="+8.5%"
                    trend="up"
                    icon={Wallet}
                    delay={0.15}
                />
                <KPICard
                    title="Total Transactions"
                    value={analyticsData.totalTransactions}
                    change="+23 today"
                    trend="up"
                    icon={TrendingUp}
                    delay={0.2}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Money Sent vs Received */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Money Sent vs Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analyticsData.moneySentVsReceived}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sent"
                                        stroke="hsl(234, 89%, 54%)"
                                        strokeWidth={2}
                                        dot={{ fill: "hsl(234, 89%, 54%)" }}
                                        name="Sent"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="received"
                                        stroke="hsl(168, 76%, 42%)"
                                        strokeWidth={2}
                                        dot={{ fill: "hsl(168, 76%, 42%)" }}
                                        name="Received"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Transactions per Day */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Daily Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.transactionsPerDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                    />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} name="Transactions" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Wallet Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Wallet Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.walletDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.walletDistribution.map((_, index) => (
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
                                {analyticsData.walletDistribution.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: CHART_COLORS[index] }}
                                        />
                                        <span className="text-xs text-muted-foreground">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Enterprises */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Top Enterprises by Volume</CardTitle>
                            <Link to="/admin/enterprises">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analyticsData.topEnterprisesByVolume.map((enterprise, index) => (
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
                                                        width: `${(enterprise.volume / analyticsData.topEnterprisesByVolume[0].volume) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
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
                            {transactions.slice(0, 5).map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit"
                                                    ? "bg-mint/10"
                                                    : "bg-primary/10"
                                                }`}
                                        >
                                            {tx.type === "credit" ? (
                                                <ArrowDownLeft className="w-5 h-5 text-mint" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {tx.senderName} → {tx.receiverName}
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
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AdminLayout>
    );
};

export default AdminDashboard;