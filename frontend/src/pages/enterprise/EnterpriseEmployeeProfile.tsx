import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import WalletControls from "@/components/admin/WalletControls";
import { toast } from "@/hooks/use-toast";

const EnterpriseEmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { employees, transactions, creditEmployeeWallet, debitEmployeeWallet, freezeEmployeeWallet, unfreezeEmployeeWallet, toggleEmployeeStatus } = useEnterprise();

    const emp = employees.find(e => e.id === id);
    if (!emp) return <EnterpriseLayout title="Employee Not Found"><p className="text-muted-foreground">Employee not found.</p><Link to="/enterprise/employees"><Button variant="outline" className="mt-4">Back</Button></Link></EnterpriseLayout>;

    const empTxns = transactions.filter(t => t.senderId === id || t.receiverId === id);

    return (
        <EnterpriseLayout title={`${emp.firstName} ${emp.lastName}`} subtitle={`${emp.designation} · ${emp.department}`}>
            <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate("/enterprise/employees")}><ArrowLeft size={16} /> Back to Employees</Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Info */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Personal Information</CardTitle>
                        <StatusBadge status={emp.status} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                ["Employee ID", emp.employeeId], ["Email", emp.email], ["Phone", emp.phone],
                                ["DOB", emp.dateOfBirth], ["Gender", emp.gender], ["Role", emp.role],
                                ["Employment Type", emp.employmentType], ["Joined", emp.dateOfJoining],
                                ["Gov ID", `${emp.govIdType}: ${emp.govIdNumber}`],
                            ].map(([label, val]) => (
                                <div key={label as string}>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium">{val}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button variant="outline" size="sm" onClick={() => { toggleEmployeeStatus(emp.id); toast({ title: `Employee ${emp.status === 'active' ? 'suspended' : 'activated'}` }); }}>
                                {emp.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Wallet</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mb-1">₹{emp.walletBalance.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mb-4">Spending Limit: ₹{emp.spendingLimit.toLocaleString()}</p>
                        <WalletControls
                            entityType="employee" entityId={emp.id} entityName={`${emp.firstName} ${emp.lastName}`}
                            currentBalance={emp.walletBalance} isFrozen={emp.status === 'suspended'}
                            onCredit={(amt) => creditEmployeeWallet(emp.id, amt)}
                            onDebit={(amt) => debitEmployeeWallet(emp.id, amt)}
                            onFreeze={() => freezeEmployeeWallet(emp.id)}
                            onUnfreeze={() => unfreezeEmployeeWallet(emp.id)}
                        />
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
                    <CardContent>
                        {emp.documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No documents uploaded</p>
                        ) : (
                            <div className="space-y-2">
                                {emp.documents.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-primary" />
                                            <div><p className="text-sm font-medium">{doc.name}</p><p className="text-xs text-muted-foreground">{doc.uploadedAt}</p></div>
                                        </div>
                                        <Button variant="ghost" size="sm"><Download size={14} /></Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-base">Activity Log</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div><p className="text-xs text-muted-foreground">Onboarded</p><p className="text-sm font-medium">{emp.createdAt}</p></div>
                            <div><p className="text-xs text-muted-foreground">Last Login</p><p className="text-sm font-medium">{emp.lastLogin}</p></div>
                            <div><p className="text-xs text-muted-foreground">2FA</p><p className="text-sm font-medium">{emp.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p></div>
                        </div>
                        <p className="text-sm font-medium mb-3">Recent Transactions</p>
                        {empTxns.length === 0 ? <p className="text-sm text-muted-foreground">No transactions yet</p> : (
                            <div className="space-y-2">
                                {empTxns.slice(0, 5).map(txn => (
                                    <div key={txn.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                        <div><p className="text-sm">{txn.description}</p><p className="text-xs text-muted-foreground">{txn.timestamp}</p></div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${txn.receiverId === id ? 'text-mint' : ''}`}>{txn.receiverId === id ? '+' : '-'}₹{txn.amount.toLocaleString()}</p>
                                            <StatusBadge status={txn.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </EnterpriseLayout>
    );
};

export default EnterpriseEmployeeProfile;