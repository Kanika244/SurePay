import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Building2,
    Calendar,
    FileText,
    ArrowLeft,
    Pencil,
    Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import WalletControls from "@/components/admin/WalletControls";
import { useAdmin } from "@/contexts/AdminContext";

const EmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        employees,
        enterprises,
        transactions,
        creditWallet,
        debitWallet,
        freezeWallet,
        unfreezeWallet,
    } = useAdmin();

    const employee = employees.find((e) => e.id === id);
    const enterprise = employee ? enterprises.find((e) => e.id === employee.enterpriseId) : null;
    const employeeTransactions = transactions.filter(
        (t) => t.senderId === id || t.receiverId === id
    );

    if (!employee) {
        return (
            <AdminLayout title="Employee Not Found">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Employee not found</p>
                    <Link to="/admin/employees">
                        <Button>Back to Employees</Button>
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="" subtitle="">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/employees")}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{employee.name}</h1>
                        <StatusBadge status={employee.status} />
                    </div>
                    <p className="text-muted-foreground">{employee.role} • {employee.department}</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => navigate(`/admin/employees/${id}/edit`)}>
                    <Pencil size={16} />
                    Edit
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User size={18} />
                                    Personal Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Mail size={14} className="text-muted-foreground" />
                                            {employee.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone size={14} className="text-muted-foreground" />
                                            {employee.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Role</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Briefcase size={14} className="text-muted-foreground" />
                                            {employee.role}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <p className="font-medium">{employee.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Joined</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            {new Date(employee.createdAt).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Enterprise Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 size={18} />
                                    Enterprise
                                </CardTitle>
                                {enterprise && (
                                    <Link to={`/admin/enterprises/${enterprise.id}`}>
                                        <Button variant="ghost" size="sm">View Enterprise</Button>
                                    </Link>
                                )}
                            </CardHeader>
                            <CardContent>
                                {enterprise ? (
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{enterprise.name}</p>
                                            <p className="text-sm text-muted-foreground">{enterprise.industry}</p>
                                        </div>
                                        <StatusBadge status={enterprise.status} />
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Enterprise not found</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Transaction History */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Transaction History</CardTitle>
                                <Link to={`/admin/transactions?entity=${id}`}>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {employeeTransactions.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No transactions found</p>
                                ) : (
                                    <div className="space-y-3">
                                        {employeeTransactions.slice(0, 5).map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {tx.senderId === id ? `To: ${tx.receiverName}` : `From: ${tx.senderName}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${tx.receiverId === id ? "text-mint" : ""}`}>
                                                        {tx.receiverId === id ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                                    </p>
                                                    <StatusBadge status={tx.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Wallet */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Wallet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="text-3xl font-bold">₹{employee.walletBalance.toLocaleString()}</p>
                                </div>
                                <WalletControls
                                    entityType="employee"
                                    entityId={employee.id}
                                    entityName={employee.name}
                                    currentBalance={employee.walletBalance}
                                    isFrozen={employee.status === "suspended"}
                                    onCredit={(amount) => creditWallet("employee", employee.id, amount)}
                                    onDebit={(amount) => debitWallet("employee", employee.id, amount)}
                                    onFreeze={() => freezeWallet("employee", employee.id)}
                                    onUnfreeze={() => unfreezeWallet("employee", employee.id)}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Documents */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText size={18} />
                                    Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {employee.documents.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
                                ) : (
                                    <div className="space-y-2">
                                        {employee.documents.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText size={16} className="text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EmployeeProfile;