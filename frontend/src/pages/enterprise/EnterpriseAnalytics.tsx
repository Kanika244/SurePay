import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import KPICard from "@/components/admin/KPICard";
import { Users, Wallet, TrendingUp, CreditCard } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const monthlyData = [
    { month: "Jan", sent: 320000, received: 180000, txnCount: 45 },
    { month: "Feb", sent: 450000, received: 250000, txnCount: 62 },
    { month: "Mar", sent: 380000, received: 420000, txnCount: 58 },
    { month: "Apr", sent: 520000, received: 350000, txnCount: 74 },
];

const COLORS = ["hsl(234, 89%, 54%)", "hsl(262, 83%, 58%)", "hsl(168, 76%, 42%)", "hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)"];

const EnterpriseAnalytics = () => {
    const { employees, transactions, walletBalance } = useEnterprise();

    const totalSent = transactions.filter(t => t.senderId === 'enterprise' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalReceived = transactions.filter(t => t.receiverId === 'enterprise' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);

    const deptDistribution = employees.reduce((acc, e) => {
        acc[e.department] = (acc[e.department] || 0) + e.walletBalance;
        return acc;
    }, {} as Record<string, number>);

    const deptData = Object.entries(deptDistribution).map(([name, value]) => ({ name, value }));

    return (
        <EnterpriseLayout title="Analytics" subtitle="Insights into your enterprise operations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KPICard title="Total Employees" value={employees.length} icon={Users} />
                <KPICard title="Enterprise Balance" value={`₹${walletBalance.toLocaleString()}`} icon={Wallet} delay={0.05} />
                <KPICard title="Total Sent" value={`₹${totalSent.toLocaleString()}`} icon={TrendingUp} delay={0.1} />
                <KPICard title="Total Received" value={`₹${totalReceived.toLocaleString()}`} icon={CreditCard} delay={0.15} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader><CardTitle className="text-base">Money Sent vs Received</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
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
                    <CardHeader><CardTitle className="text-base">Monthly Transaction Volume</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="txnCount" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} name="Transactions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Wallet Balance by Department</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}k`}>
                                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </EnterpriseLayout>
    );
};

export default EnterpriseAnalytics;