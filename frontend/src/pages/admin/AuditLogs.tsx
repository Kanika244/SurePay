import { motion } from "framer-motion";
import { FileText, Building2, Users, User, Wallet, Settings } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/admin/DataTable";
import { useAdmin } from "@/contexts/AdminContext";
import { AuditLog } from "@/data/adminMockData";

const AuditLogs = () => {
    const { auditLogs } = useAdmin();

    const getTargetIcon = (targetType: AuditLog["targetType"]) => {
        switch (targetType) {
            case "enterprise":
                return <Building2 size={14} className="text-primary" />;
            case "employee":
                return <Users size={14} className="text-accent" />;
            case "individual":
                return <User size={14} className="text-mint" />;
            case "wallet":
                return <Wallet size={14} className="text-amber-500" />;
            case "system":
                return <Settings size={14} className="text-muted-foreground" />;
            default:
                return <FileText size={14} className="text-muted-foreground" />;
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes("DELETE") || action.includes("SUSPEND") || action.includes("FROZEN") || action.includes("DEBIT")) {
            return "text-destructive";
        }
        if (action.includes("CREATE") || action.includes("ACTIVATE") || action.includes("CREDIT") || action.includes("UNFROZEN")) {
            return "text-mint";
        }
        return "text-foreground";
    };

    const columns = [
        {
            key: "timestamp",
            header: "Date & Time",
            sortable: true,
            render: (item: AuditLog) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString("en-IN")}
                </span>
            ),
        },
        {
            key: "adminEmail",
            header: "Admin",
            render: (item: AuditLog) => (
                <span className="text-sm font-medium">{item.adminEmail}</span>
            ),
        },
        {
            key: "action",
            header: "Action",
            render: (item: AuditLog) => (
                <span className={`text-sm font-medium ${getActionColor(item.action)}`}>
                    {item.action.replace(/_/g, " ")}
                </span>
            ),
        },
        {
            key: "targetType",
            header: "Target Type",
            render: (item: AuditLog) => (
                <div className="flex items-center gap-2">
                    {getTargetIcon(item.targetType)}
                    <span className="text-sm capitalize">{item.targetType}</span>
                </div>
            ),
        },
        {
            key: "details",
            header: "Details",
            render: (item: AuditLog) => (
                <span className="text-sm text-muted-foreground">{item.details}</span>
            ),
        },
    ];

    return (
        <AdminLayout title="Audit Logs" subtitle="Track all administrative actions on the platform">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <DataTable
                    data={auditLogs}
                    columns={columns}
                    searchPlaceholder="Search audit logs..."
                    searchKeys={["adminEmail", "action", "details"]}
                    pageSize={15}
                />
            </motion.div>
        </AdminLayout>
    );
};

export default AuditLogs;