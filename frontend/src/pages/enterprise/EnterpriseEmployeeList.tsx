import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { departments } from "@/data/enterpriseMockData";
import { Link } from "react-router-dom";

const EnterpriseEmployeeList = () => {
    const navigate = useNavigate();
    const { employees, toggleEmployeeStatus, deleteEmployee } = useEnterprise();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deptFilter, setDeptFilter] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtered = employees.filter(e => {
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        if (deptFilter !== "all" && e.department !== deptFilter) return false;
        return true;
    });

    const columns = [
        { key: "employeeId", header: "ID", sortable: true },
        { key: "name", header: "Name", sortable: true, render: (e: typeof employees[0]) => <span className="font-medium">{e.firstName} {e.lastName}</span> },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        { key: "department", header: "Department", sortable: true },
        { key: "role", header: "Role" },
        { key: "walletBalance", header: "Wallet", sortable: true, render: (e: typeof employees[0]) => `₹${e.walletBalance.toLocaleString()}` },
        { key: "status", header: "Status", render: (e: typeof employees[0]) => <StatusBadge status={e.status} /> },
        { key: "createdAt", header: "Joined", sortable: true },
        {
            key: "actions", header: "Actions", render: (e: typeof employees[0]) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={(ev) => { ev.stopPropagation(); navigate(`/enterprise/employees/${e.id}`); }}>View</Button>
                    <Button variant="ghost" size="sm" onClick={(ev) => { ev.stopPropagation(); toggleEmployeeStatus(e.id); toast({ title: `Employee ${e.status === 'active' ? 'suspended' : 'activated'}` }); }}>
                        {e.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={(ev) => { ev.stopPropagation(); setDeleteId(e.id); }}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <EnterpriseLayout title="Employees" subtitle={`${employees.length} employees in your organization`}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <Link to="/enterprise/employees/add">
                    <Button className="gap-2"><UserPlus size={16} /> Add Employee</Button>
                </Link>
                <Link to="/enterprise/bulk-onboarding">
                    <Button variant="outline" className="gap-2"><Plus size={16} /> Bulk Onboarding</Button>
                </Link>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                data={filtered}
                columns={columns}
                searchPlaceholder="Search by name, email, ID..."
                searchKeys={["firstName", "lastName", "email", "employeeId"] as any}
                pageSize={10}
                onRowClick={(e) => navigate(`/enterprise/employees/${e.id}`)}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Employee"
                description="This action cannot be undone. The employee's wallet will be deactivated."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => {
                    if (deleteId) {
                        deleteEmployee(deleteId);
                        toast({ title: "Employee deleted" });
                        setDeleteId(null);
                    }
                }}
            />
        </EnterpriseLayout>
    );
};

export default EnterpriseEmployeeList;