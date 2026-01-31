import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Briefcase,
    ArrowLeft,
    Pencil,
    FileText,
    Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdmin } from "@/contexts/AdminContext";

const EnterprisePOC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enterprises } = useAdmin();

    const enterprise = enterprises.find((e) => e.id === id);

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

    const poc = enterprise.poc;

    return (
        <AdminLayout title="" subtitle="">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/enterprises/${id}`)}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Point of Contact</h1>
                        <StatusBadge status={poc.status} />
                    </div>
                    <p className="text-muted-foreground">{enterprise.name}</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Pencil size={16} />
                    Edit POC
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* POC Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User size={18} />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User size={28} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{poc.name}</p>
                                    <p className="text-muted-foreground">{poc.designation}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                                    <Mail size={18} className="text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="font-medium">{poc.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                                    <Phone size={18} className="text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="font-medium">{poc.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                                    <Briefcase size={18} className="text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Designation</p>
                                        <p className="font-medium">{poc.designation}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Verification & Documents */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield size={18} />
                                    Verification Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`flex items-center gap-4 p-4 rounded-lg ${poc.status === "verified" ? "bg-mint/10" : "bg-amber-500/10"
                                    }`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${poc.status === "verified" ? "bg-mint/20" : "bg-amber-500/20"
                                        }`}>
                                        <Shield size={24} className={poc.status === "verified" ? "text-mint" : "text-amber-500"} />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {poc.status === "verified" ? "Identity Verified" : "Pending Verification"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {poc.status === "verified"
                                                ? "POC identity has been verified"
                                                : "Awaiting document verification"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText size={18} />
                                    Uploaded Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {enterprise.documents.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
                                ) : (
                                    <div className="space-y-2">
                                        {enterprise.documents.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium text-sm">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {doc.type} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">View</Button>
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

export default EnterprisePOC;