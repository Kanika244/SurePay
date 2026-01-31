import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MoreHorizontal, Eye, Pencil, Trash2, Power } from "lucide-react";
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
import { Individual } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const IndividualList = () => {
    const navigate = useNavigate();
    const { individuals, deleteIndividual, toggleIndividualStatus } = useAdmin();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);

    const handleDelete = () => {
        if (selectedIndividual) {
            deleteIndividual(selectedIndividual.id);
            toast({
                title: "Individual deleted",
                description: `${selectedIndividual.name} has been deleted`,
            });
            setDeleteDialogOpen(false);
            setSelectedIndividual(null);
        }
    };

    const handleToggleStatus = (individual: Individual) => {
        toggleIndividualStatus(individual.id);
        toast({
            title: individual.status === "active" ? "Individual suspended" : "Individual activated",
            description: `${individual.name} has been ${individual.status === "active" ? "suspended" : "activated"}`,
        });
    };

    const columns = [
        {
            key: "name",
            header: "Individual",
            sortable: true,
            render: (item: Individual) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center">
                        <User size={18} className="text-mint" />
                    </div>
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "phone",
            header: "Phone",
            render: (item: Individual) => (
                <span className="text-sm">{item.phone}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (item: Individual) => <StatusBadge status={item.status} />,
        },
        {
            key: "kycStatus",
            header: "KYC Status",
            render: (item: Individual) => <StatusBadge status={item.kycStatus} />,
        },
        {
            key: "walletBalance",
            header: "Wallet Balance",
            sortable: true,
            render: (item: Individual) => (
                <span className="font-medium">₹{item.walletBalance.toLocaleString()}</span>
            ),
        },
        {
            key: "createdAt",
            header: "Created At",
            sortable: true,
            render: (item: Individual) => (
                <span className="text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item: Individual) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/individuals/${item.id}`)}>
                            <Eye size={14} className="mr-2" />
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/individuals/${item.id}/edit`)}>
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
                                setSelectedIndividual(item);
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
            title="Individuals"
            subtitle={`Manage ${individuals.length} individual users`}
        >
            <DataTable
                data={individuals}
                columns={columns}
                searchPlaceholder="Search individuals..."
                searchKeys={["name", "email", "phone"]}
                onRowClick={(item) => navigate(`/admin/individuals/${item.id}`)}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Individual"
                description={`Are you sure you want to delete "${selectedIndividual?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </AdminLayout>
    );
};

export default IndividualList;