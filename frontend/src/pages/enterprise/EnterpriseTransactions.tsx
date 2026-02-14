import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

const EnterpriseTransactions = () => {
    const { transactions, employees } = useEnterprise();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [empFilter, setEmpFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    let filtered = [...transactions];
    if (dateFrom) filtered = filtered.filter(t => t.timestamp >= dateFrom);
    if (dateTo) filtered = filtered.filter(t => t.timestamp <= dateTo + ' 23:59:59');
    if (empFilter !== 'all') filtered = filtered.filter(t => t.senderId === empFilter || t.receiverId === empFilter);
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);

    const columns = [
        { key: "id", header: "Transaction ID" },
        { key: "senderName", header: "Sender" },
        { key: "receiverName", header: "Receiver" },
        { key: "amount", header: "Amount", sortable: true, render: (t: typeof transactions[0]) => `₹${t.amount.toLocaleString()}` },
        { key: "type", header: "Type", render: (t: typeof transactions[0]) => <StatusBadge status={t.type} /> },
        { key: "status", header: "Status", render: (t: typeof transactions[0]) => <StatusBadge status={t.status} /> },
        { key: "timestamp", header: "Date", sortable: true },
    ];

    return (
        <EnterpriseLayout title="Transactions" subtitle="View and filter all enterprise transactions">
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Employee</Label>
                    <Select value={empFilter} onValueChange={setEmpFilter}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <DataTable data={filtered} columns={columns} searchPlaceholder="Search transactions..." searchKeys={["description", "senderName", "receiverName"] as any} pageSize={10} />
                </CardContent>
            </Card>
        </EnterpriseLayout>
    );
};

export default EnterpriseTransactions;