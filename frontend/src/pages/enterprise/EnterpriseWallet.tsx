import { useState } from "react";
import { Wallet, Plus, Minus, ArrowUpRight, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import KPICard from "@/components/admin/KPICard";
import { toast } from "@/hooks/use-toast";

const EnterpriseWallet = () => {
    const { walletBalance, employees, transactions, addFunds, withdrawFunds, allocateFunds } = useEnterprise();
    const [dialogType, setDialogType] = useState<'add' | 'withdraw' | 'allocate' | null>(null);
    const [amount, setAmount] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const totalEmpBalance = employees.reduce((s, e) => s + e.walletBalance, 0);
    const walletTxns = transactions.filter(t => t.senderId === 'enterprise' || t.receiverId === 'enterprise' || t.senderId === 'external');

    const handleConfirm = () => {
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) { toast({ title: "Invalid amount", variant: "destructive" }); return; }

        if (dialogType === 'add') { addFunds(num); toast({ title: `₹${num.toLocaleString()} added to wallet` }); }
        else if (dialogType === 'withdraw') {
            if (num > walletBalance) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
            withdrawFunds(num); toast({ title: `₹${num.toLocaleString()} withdrawn` });
        }
        else if (dialogType === 'allocate') {
            if (!selectedEmployee) { toast({ title: "Select an employee", variant: "destructive" }); return; }
            if (num > walletBalance) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
            allocateFunds(selectedEmployee, num);
            const emp = employees.find(e => e.id === selectedEmployee);
            toast({ title: `₹${num.toLocaleString()} allocated to ${emp?.firstName} ${emp?.lastName}` });
        }
        setDialogType(null); setAmount(""); setSelectedEmployee("");
    };

    const columns = [
        { key: "id", header: "ID" },
        { key: "description", header: "Description" },
        { key: "senderName", header: "From" },
        { key: "receiverName", header: "To" },
        { key: "amount", header: "Amount", sortable: true, render: (t: typeof walletTxns[0]) => `₹${t.amount.toLocaleString()}` },
        { key: "type", header: "Type", render: (t: typeof walletTxns[0]) => <StatusBadge status={t.type} /> },
        { key: "status", header: "Status", render: (t: typeof walletTxns[0]) => <StatusBadge status={t.status} /> },
        { key: "timestamp", header: "Date", sortable: true },
    ];

    return (
        <EnterpriseLayout title="Wallet Management" subtitle="Manage enterprise funds and allocations">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <KPICard title="Enterprise Balance" value={`₹${walletBalance.toLocaleString()}`} icon={Wallet} change="+12.5%" trend="up" />
                <KPICard title="Employee Wallets Total" value={`₹${totalEmpBalance.toLocaleString()}`} icon={Users} delay={0.1} />
                <KPICard title="Total Transactions" value={walletTxns.length} icon={CreditCard} delay={0.2} />
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <Button className="gap-2" onClick={() => setDialogType('add')}><Plus size={16} /> Add Funds</Button>
                <Button variant="outline" className="gap-2" onClick={() => setDialogType('withdraw')}><Minus size={16} /> Withdraw</Button>
                <Button variant="outline" className="gap-2" onClick={() => setDialogType('allocate')}><ArrowUpRight size={16} /> Allocate to Employee</Button>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
                <CardContent>
                    <DataTable data={walletTxns} columns={columns} searchPlaceholder="Search transactions..." searchKeys={["description", "senderName", "receiverName"] as (keyof typeof walletTxns[0])[]} pageSize={10} />
                </CardContent>
            </Card>

            <Dialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogType === 'add' ? 'Add Funds' : dialogType === 'withdraw' ? 'Withdraw Funds' : 'Allocate to Employee'}</DialogTitle>
                        <DialogDescription>Current balance: ₹{walletBalance.toLocaleString()}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {dialogType === 'allocate' && (
                            <div className="space-y-2">
                                <Label>Employee</Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                                    <SelectContent>
                                        {employees.filter(e => e.status === 'active').map(e => (
                                            <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} (₹{e.walletBalance.toLocaleString()})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
                        <Button onClick={handleConfirm}>{dialogType === 'add' ? 'Add' : dialogType === 'withdraw' ? 'Withdraw' : 'Allocate'} ₹{amount || '0'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </EnterpriseLayout>
    );
};

export default EnterpriseWallet;