import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Building2,
    Mail,
    MapPin,
    Calendar,
    FileText,
    Users,
    ArrowLeft,
    Pencil,
    User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import WalletControls from "@/components/admin/WalletControls";
import { useAdmin } from "@/contexts/AdminContext";

const EnterpriseProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        enterprises,
        employees,
        transactions,
        creditWallet,
        debitWallet,
        freezeWallet,
        unfreezeWallet,
    } = useAdmin();

    const enterprise = enterprises.find((e) => e.id === id);
    const enterpriseEmployees = employees.filter((e) => e.enterpriseId === id);
    const enterpriseTransactions = transactions.filter(
        (t) => t.senderId === id || t.receiverId === id
    );

    if (!enterprise) {
        return (
            <AdminLayout title="Enterprise Not Found">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Enterprise not found</p>
                    <Link to="/admin/enterprises">
                        <Button>Back to Enterprises</Button>
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="" subtitle="">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/enterprises")}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{enterprise.name}</h1>
                        <StatusBadge status={enterprise.status} />
                    </div>
                    <p className="text-muted-foreground">{enterprise.industry} • {enterprise.companyType}</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => navigate(`/admin/enterprises/${id}/edit`)}>
                    <Pencil size={16} />
                    Edit
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 size={18} />
                                    Company Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Mail size={14} className="text-muted-foreground" />
                                            {enterprise.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Country</p>
                                        <p className="font-medium">{enterprise.country}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <MapPin size={14} className="text-muted-foreground" />
                                            {enterprise.address}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            {new Date(enterprise.createdAt).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* POC Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User size={18} />
                                    Point of Contact
                                </CardTitle>
                                <Link to={`/admin/enterprises/${id}/poc`}>
                                    <Button variant="ghost" size="sm">View Details</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{enterprise.poc.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Designation</p>
                                        <p className="font-medium">{enterprise.poc.designation}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{enterprise.poc.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{enterprise.poc.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <StatusBadge status={enterprise.poc.status} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Employees */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users size={18} />
                                    Employees ({enterpriseEmployees.length})
                                </CardTitle>
                                <Link to={`/admin/employees?enterprise=${id}`}>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {enterpriseEmployees.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">No employees found</p>
                                ) : (
                                    <div className="space-y-3">
                                        {enterpriseEmployees.slice(0, 5).map((emp) => (
                                            <Link
                                                key={emp.id}
                                                to={`/admin/employees/${emp.id}`}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User size={14} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{emp.name}</p>
                                                        <p className="text-xs text-muted-foreground">{emp.role}</p>
                                                    </div>
                                                </div>
                                                <StatusBadge status={emp.status} />
                                            </Link>
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
                                    <p className="text-3xl font-bold">₹{enterprise.walletBalance.toLocaleString()}</p>
                                </div>
                                <WalletControls
                                    entityType="enterprise"
                                    entityId={enterprise.id}
                                    entityName={enterprise.name}
                                    currentBalance={enterprise.walletBalance}
                                    isFrozen={enterprise.status === "suspended"}
                                    onCredit={(amount) => creditWallet("enterprise", enterprise.id, amount)}
                                    onDebit={(amount) => debitWallet("enterprise", enterprise.id, amount)}
                                    onFreeze={() => freezeWallet("enterprise", enterprise.id)}
                                    onUnfreeze={() => unfreezeWallet("enterprise", enterprise.id)}
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
                                {enterprise.documents.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
                                ) : (
                                    <div className="space-y-2">
                                        {enterprise.documents.map((doc, index) => (
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

                    {/* Recent Transactions */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                                <Link to={`/admin/transactions?entity=${id}`}>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {enterpriseTransactions.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">No transactions</p>
                                ) : (
                                    <div className="space-y-2">
                                        {enterpriseTransactions.slice(0, 5).map((tx) => (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-2 text-sm"
                                            >
                                                <div>
                                                    <p className="font-medium">{tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(tx.timestamp).toLocaleDateString("en-IN")}
                                                    </p>
                                                </div>
                                                <span className={tx.receiverId === id ? "text-mint" : ""}>
                                                    {tx.receiverId === id ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                                </span>
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

export default EnterpriseProfile;