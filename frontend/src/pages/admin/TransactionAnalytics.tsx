import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
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
} from "recharts";
import { Transaction } from "@/data/adminMockData";

const TransactionAnalytics = () => {
    const { transactions } = useAdmin();
    const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredTransactions = transactions.filter((tx) => {
        if (userTypeFilter !== "all" && tx.senderType !== userTypeFilter) return false;
        if (statusFilter !== "all" && tx.status !== statusFilter) return false;
        return true;
    });

    const totalSent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const completedCount = transactions.filter((tx) => tx.status === "completed").length;
    const pendingCount = transactions.filter((tx) => tx.status === "pending").length;
    const failedCount = transactions.filter((tx) => tx.status === "failed").length;

    const columns = [
        {
            key: "sender",
            header: "Sender",
            render: (item: Transaction) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowUpRight size={14} className="text-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{item.senderName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.senderType}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "receiver",
            header: "Receiver",
            render: (item: Transaction) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-mint/10 flex items-center justify-center">
                        <ArrowDownLeft size={14} className="text-mint" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{item.receiverName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.receiverType}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "amount",
            header: "Amount",
            sortable: true,
            render: (item: Transaction) => (
                <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (item: Transaction) => (
                <span className="text-sm text-muted-foreground">{item.description}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (item: Transaction) => <StatusBadge status={item.status} />,
        },
        {
            key: "timestamp",
            header: "Date & Time",
            sortable: true,
            render: (item: Transaction) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString("en-IN")}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout title="Transactions & Analytics" subtitle="Monitor and analyze all platform transactions">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Volume</p>
                            <p className="text-2xl font-bold">₹{totalSent.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-mint">{completedCount}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Failed</p>
                            <p className="text-2xl font-bold text-destructive">{failedCount}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Money Sent vs Received</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
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
                                    <Line type="monotone" dataKey="sent" stroke="hsl(234, 89%, 54%)" strokeWidth={2} name="Sent" />
                                    <Line type="monotone" dataKey="received" stroke="hsl(168, 76%, 42%)" strokeWidth={2} name="Received" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Daily Transaction Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
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
                                    <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} name="Transactions" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-6"
            >
                <div className="space-y-1">
                    <Label className="text-xs">User Type</Label>
                    <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <DataTable
                    data={filteredTransactions}
                    columns={columns}
                    searchPlaceholder="Search transactions..."
                    searchKeys={["senderName", "receiverName", "description"]}
                    pageSize={10}
                />
            </motion.div>
        </AdminLayout>
    );
};

export default TransactionAnalytics;