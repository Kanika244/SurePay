import { motion } from "framer-motion";
import {
    Users,
    UserCheck,
    UserX,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import KPICard from "@/components/admin/KPICard";
import StatusBadge from "@/components/admin/StatusBadge";
import { Link } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const monthlyData = [
    { month: "Jan", sent: 320000, received: 180000 },
    { month: "Feb", sent: 450000, received: 250000 },
    { month: "Mar", sent: 380000, received: 420000 },
    { month: "Apr", sent: 520000, received: 350000 },
];

const txnVolumeData = [
    { month: "Jan", transactions: 45 },
    { month: "Feb", transactions: 62 },
    { month: "Mar", transactions: 58 },
    { month: "Apr", transactions: 74 },
];

const COLORS = ["hsl(234, 89%, 54%)", "hsl(262, 83%, 58%)", "hsl(168, 76%, 42%)", "hsl(217, 91%, 60%)"];

const EnterpriseHomeDashboard = () => {
    const { employees, transactions, walletBalance, profile } = useEnterprise();

    const activeEmps = employees.filter(e => e.status === "active").length;
    const suspendedEmps = employees.filter(e => e.status === "suspended").length;
    const totalEmpBalance = employees.reduce((s, e) => s + e.walletBalance, 0);
    const monthlySent = transactions.filter(t => t.senderId === "enterprise" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
    const monthlyReceived = transactions.filter(t => t.receiverId === "enterprise" && t.status === "completed").reduce((s, t) => s + t.amount, 0);

    const walletDistribution = [
        ...employees.slice(0, 4).map(e => ({ name: `${e.firstName} ${e.lastName.charAt(0)}.`, value: e.walletBalance })),
    ];

    const recentTxns = transactions.slice(0, 5);

    return (
        <EnterpriseLayout title="Dashboard" subtitle={`Welcome back, ${profile.companyName || "your company"}`}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <KPICard title="Total Employees" value={employees.length} icon={Users} change={`+${employees.length}`} trend="up" delay={0} />
                <KPICard title="Active" value={activeEmps} icon={UserCheck} trend="up" delay={0.05} />
                <KPICard title="Suspended" value={suspendedEmps} icon={UserX} trend={suspendedEmps > 0 ? "down" : "neutral"} delay={0.1} />
                <KPICard title="Wallet Balance" value={`₹${walletBalance.toLocaleString()}`} icon={Wallet} change="+12.5%" trend="up" delay={0.15} />
                <KPICard title="Monthly Sent" value={`₹${monthlySent.toLocaleString()}`} icon={ArrowUpRight} delay={0.2} />
                <KPICard title="Monthly Received" value={`₹${monthlyReceived.toLocaleString()}`} icon={ArrowDownLeft} delay={0.25} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle className="text-base">Money Sent vs Received</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                                <Line type="monotone" dataKey="sent" stroke="hsl(234, 89%, 54%)" strokeWidth={2} name="Sent" />
                                <Line type="monotone" dataKey="received" stroke="hsl(168, 76%, 42%)" strokeWidth={2} name="Received" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Transactions / Month</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={txnVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="transactions" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Employee Wallet Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={walletDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                                    {walletDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <Link to="/enterprise/transactions">
                        <Button variant="ghost" size="sm" className="text-primary">View All</Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentTxns.map(txn => (
                            <div key={txn.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === 'credit' || txn.receiverId === 'enterprise' ? 'bg-mint/10' : 'bg-destructive/10'}`}>
                                        {txn.type === 'credit' || txn.receiverId === 'enterprise' ? (
                                            <ArrowDownLeft className="w-4 h-4 text-mint" />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4 text-destructive" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{txn.description}</p>
                                        <p className="text-xs text-muted-foreground">{txn.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={txn.status} />
                                    <p className={`font-semibold text-sm ${txn.receiverId === 'enterprise' ? 'text-mint' : 'text-foreground'}`}>
                                        {txn.receiverId === 'enterprise' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </EnterpriseLayout>
    );
};

export default EnterpriseHomeDashboard;