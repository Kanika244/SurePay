import { motion } from "framer-motion";
import { Wallet, Building2, Users, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import WalletControls from "@/components/admin/WalletControls";
import { useAdmin } from "@/contexts/AdminContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const WalletManagement = () => {
    const {
        enterprises,
        employees,
        individuals,
        creditWallet,
        debitWallet,
        freezeWallet,
        unfreezeWallet,
    } = useAdmin();

    const totalEnterpriseBalance = enterprises.reduce((sum, e) => sum + e.walletBalance, 0);
    const totalEmployeeBalance = employees.reduce((sum, e) => sum + e.walletBalance, 0);
    const totalIndividualBalance = individuals.reduce((sum, i) => sum + i.walletBalance, 0);

    return (
        <AdminLayout title="Wallet Management" subtitle="Manage all wallets across the platform">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Building2 className="text-primary" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Enterprise Wallets</p>
                                    <p className="text-2xl font-bold">₹{totalEnterpriseBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Users className="text-accent" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Employee Wallets</p>
                                    <p className="text-2xl font-bold">₹{totalEmployeeBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center">
                                    <User className="text-mint" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Individual Wallets</p>
                                    <p className="text-2xl font-bold">₹{totalIndividualBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Wallet Tabs */}
            <Tabs defaultValue="enterprises" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="enterprises" className="gap-2">
                        <Building2 size={16} />
                        Enterprises ({enterprises.length})
                    </TabsTrigger>
                    <TabsTrigger value="employees" className="gap-2">
                        <Users size={16} />
                        Employees ({employees.length})
                    </TabsTrigger>
                    <TabsTrigger value="individuals" className="gap-2">
                        <User size={16} />
                        Individuals ({individuals.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="enterprises">
                    <div className="space-y-4">
                        {enterprises.map((enterprise, index) => (
                            <motion.div
                                key={enterprise.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <Link to={`/admin/enterprises/${enterprise.id}`} className="flex items-center gap-4 hover:opacity-80">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Building2 size={18} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{enterprise.name}</p>
                                                    <p className="text-sm text-muted-foreground">{enterprise.email}</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Balance</p>
                                                    <p className="text-xl font-bold">₹{enterprise.walletBalance.toLocaleString()}</p>
                                                </div>
                                                <StatusBadge status={enterprise.status} />
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="employees">
                    <div className="space-y-4">
                        {employees.map((employee, index) => (
                            <motion.div
                                key={employee.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <Link to={`/admin/employees/${employee.id}`} className="flex items-center gap-4 hover:opacity-80">
                                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                                    <Users size={18} className="text-accent" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{employee.name}</p>
                                                    <p className="text-sm text-muted-foreground">{employee.enterpriseName}</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Balance</p>
                                                    <p className="text-xl font-bold">₹{employee.walletBalance.toLocaleString()}</p>
                                                </div>
                                                <StatusBadge status={employee.status} />
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="individuals">
                    <div className="space-y-4">
                        {individuals.map((individual, index) => (
                            <motion.div
                                key={individual.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <Link to={`/admin/individuals/${individual.id}`} className="flex items-center gap-4 hover:opacity-80">
                                                <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center">
                                                    <User size={18} className="text-mint" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{individual.name}</p>
                                                    <p className="text-sm text-muted-foreground">{individual.email}</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">Balance</p>
                                                    <p className="text-xl font-bold">₹{individual.walletBalance.toLocaleString()}</p>
                                                </div>
                                                <StatusBadge status={individual.status} />
                                                <WalletControls
                                                    entityType="individual"
                                                    entityId={individual.id}
                                                    entityName={individual.name}
                                                    currentBalance={individual.walletBalance}
                                                    isFrozen={individual.status === "suspended"}
                                                    onCredit={(amount) => creditWallet("individual", individual.id, amount)}
                                                    onDebit={(amount) => debitWallet("individual", individual.id, amount)}
                                                    onFreeze={() => freezeWallet("individual", individual.id)}
                                                    onUnfreeze={() => unfreezeWallet("individual", individual.id)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
};

export default WalletManagement;