import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MoreHorizontal, Eye, Pencil, Trash2, Power } from "lucide-react";
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
import { Enterprise } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const EnterpriseList = () => {
    const navigate = useNavigate();
    const { enterprises, deleteEnterprise, toggleEnterpriseStatus } = useAdmin();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

    const handleDelete = () => {
        if (selectedEnterprise) {
            deleteEnterprise(selectedEnterprise.id);
            toast({
                title: "Enterprise deleted",
                description: `${selectedEnterprise.name} has been deleted`,
            });
            setDeleteDialogOpen(false);
            setSelectedEnterprise(null);
        }
    };

    const handleToggleStatus = (enterprise: Enterprise) => {
        toggleEnterpriseStatus(enterprise.id);
        toast({
            title: enterprise.status === "active" ? "Enterprise suspended" : "Enterprise activated",
            description: `${enterprise.name} has been ${enterprise.status === "active" ? "suspended" : "activated"}`,
        });
    };

    const columns = [
        {
            key: "name",
            header: "Enterprise Name",
            sortable: true,
            render: (item: Enterprise) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 size={18} className="text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.industry}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "email",
            header: "Email",
            sortable: true,
        },
        {
            key: "status",
            header: "Status",
            render: (item: Enterprise) => <StatusBadge status={item.status} />,
        },
        {
            key: "walletBalance",
            header: "Wallet Balance",
            sortable: true,
            render: (item: Enterprise) => (
                <span className="font-medium">₹{item.walletBalance.toLocaleString()}</span>
            ),
        },
        {
            key: "createdAt",
            header: "Created At",
            sortable: true,
            render: (item: Enterprise) => (
                <span className="text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item: Enterprise) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/enterprises/${item.id}`)}>
                            <Eye size={14} className="mr-2" />
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/enterprises/${item.id}/edit`)}>
                            <Pencil size={14} className="mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                            <Power size={14} className="mr-2" />
                            {item.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                setSelectedEnterprise(item);
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
            title="Enterprises"
            subtitle={`Manage ${enterprises.length} registered enterprises`}
        >
            <DataTable
                data={enterprises}
                columns={columns}
                searchPlaceholder="Search enterprises..."
                searchKeys={["name", "email"]}
                onRowClick={(item) => navigate(`/admin/enterprises/${item.id}`)}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Enterprise"
                description={`Are you sure you want to delete "${selectedEnterprise?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </AdminLayout>
    );
};

export default EnterpriseList;