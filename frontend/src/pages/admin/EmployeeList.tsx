import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MoreHorizontal, Eye, Pencil, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdmin } from "@/contexts/AdminContext";
import { Employee } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const EmployeeList = () => {
    const navigate = useNavigate();
    const { employees, deleteEmployee, toggleEmployeeStatus } = useAdmin();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const handleDelete = () => {
        if (selectedEmployee) {
            deleteEmployee(selectedEmployee.id);
            toast({
                title: "Employee deleted",
                description: `${selectedEmployee.name} has been deleted`,
            });
            setDeleteDialogOpen(false);
            setSelectedEmployee(null);
        }
    };

    const handleToggleStatus = (employee: Employee) => {
        toggleEmployeeStatus(employee.id);
        toast({
            title: employee.status === "active" ? "Employee deactivated" : "Employee activated",
            description: `${employee.name} has been ${employee.status === "active" ? "deactivated" : "activated"}`,
        });
    };

    const columns = [
        {
            key: "name",
            header: "Employee",
            sortable: true,
            render: (item: Employee) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Users size={18} className="text-accent" />
                    </div>
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "enterpriseName",
            header: "Enterprise",
            sortable: true,
            render: (item: Employee) => (
                <span className="text-sm">{item.enterpriseName}</span>
            ),
        },
        {
            key: "role",
            header: "Role",
            sortable: true,
        },
        {
            key: "department",
            header: "Department",
            sortable: true,
        },
        {
            key: "status",
            header: "Status",
            render: (item: Employee) => <StatusBadge status={item.status} />,
        },
        {
            key: "walletBalance",
            header: "Wallet Balance",
            sortable: true,
            render: (item: Employee) => (
                <span className="font-medium">₹{item.walletBalance.toLocaleString()}</span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item: Employee) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/employees/${item.id}`)}>
                            <Eye size={14} className="mr-2" />
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/employees/${item.id}/edit`)}>
                            <Pencil size={14} className="mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                            <Power size={14} className="mr-2" />
                            {item.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                setSelectedEmployee(item);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Employees"
            subtitle={`Manage ${employees.length} employees across all enterprises`}
        >
            <DataTable
                data={employees}
                columns={columns}
                searchPlaceholder="Search employees..."
                searchKeys={["name", "email", "enterpriseName"]}
                onRowClick={(item) => navigate(`/admin/employees/${item.id}`)}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Employee"
                description={`Are you sure you want to delete "${selectedEmployee?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </AdminLayout>
    );
};

export default EmployeeList;