import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, FileText, Download, Edit2, Save, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";

const EnterpriseProfilePage = () => {
    const { profile, updateProfile, updatePOC } = useEnterprise();
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingPOC, setEditingPOC] = useState(false);
    const [profileForm, setProfileForm] = useState({ ...profile });
    const [pocForm, setPocForm] = useState({ ...profile.poc });

    const saveProfile = () => {
        updateProfile({
            companyName: profileForm.companyName, registrationNumber: profileForm.registrationNumber,
            gstNumber: profileForm.gstNumber, businessType: profileForm.businessType,
            industry: profileForm.industry, website: profileForm.website,
            registeredAddress: profileForm.registeredAddress,
        });
        setEditingProfile(false);
        toast({ title: "Profile updated" });
    };

    const savePOC = () => {
        updatePOC({ name: pocForm.name, email: pocForm.email, phone: pocForm.phone, designation: pocForm.designation });
        setEditingPOC(false);
        toast({ title: "POC updated" });
    };

    return (
        <EnterpriseLayout title="Enterprise Profile" subtitle="Manage your organization details and compliance documents">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Details */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2"><Building2 size={18} /> Organization Details</CardTitle>
                        {!editingProfile ? (
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditingProfile(true)}><Edit2 size={14} /> Edit</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button size="sm" className="gap-1" onClick={saveProfile}><Save size={14} /> Save</Button>
                                <Button variant="ghost" size="sm" onClick={() => { setEditingProfile(false); setProfileForm({ ...profile }); }}><X size={14} /></Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {editingProfile ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    ['Company Name', 'companyName'], ['Registration Number', 'registrationNumber'],
                                    ['GST Number', 'gstNumber'], ['Business Type', 'businessType'],
                                    ['Industry', 'industry'], ['Website', 'website'],
                                ].map(([label, key]) => (
                                    <div key={key} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Input value={(profileForm as any)[key]} onChange={e => setProfileForm(p => ({ ...p, [key]: e.target.value }))} />
                                    </div>
                                ))}
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Registered Address</Label>
                                    <Input value={profileForm.registeredAddress} onChange={e => setProfileForm(p => ({ ...p, registeredAddress: e.target.value }))} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    ['Company Name', profile.companyName], ['Registration', profile.registrationNumber],
                                    ['GST', profile.gstNumber], ['Business Type', profile.businessType],
                                    ['Industry', profile.industry], ['Website', profile.website],
                                    ['Address', profile.registeredAddress],
                                ].map(([label, val]) => (
                                    <div key={label as string}>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                        <p className="text-sm font-medium">{val}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Compliance Documents */}
                <Card>
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText size={18} /> Compliance Documents</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {profile.documents.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-primary" />
                                        <div>
                                            <p className="text-sm font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">{doc.type} · {doc.uploadedAt}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={doc.status} />
                                        <Button variant="ghost" size="sm"><Download size={14} /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* POC */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2"><User size={18} /> Point of Contact</CardTitle>
                        {!editingPOC ? (
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setEditingPOC(true)}><Edit2 size={14} /> Edit</Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button size="sm" className="gap-1" onClick={savePOC}><Save size={14} /> Save</Button>
                                <Button variant="ghost" size="sm" onClick={() => { setEditingPOC(false); setPocForm({ ...profile.poc }); }}><X size={14} /></Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {editingPOC ? (
                            <div className="space-y-4">
                                {[['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Designation', 'designation']].map(([label, key]) => (
                                    <div key={key} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Input value={(pocForm as any)[key]} onChange={e => setPocForm(p => ({ ...p, [key]: e.target.value }))} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {[['Name', profile.poc.name], ['Email', profile.poc.email], ['Phone', profile.poc.phone], ['Designation', profile.poc.designation]].map(([label, val]) => (
                                        <div key={label as string}>
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="text-sm font-medium">{val}</p>
                                        </div>
                                    ))}
                                </div>
                                <StatusBadge status={profile.poc.status} />
                                {profile.poc.kycDocuments.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">KYC Documents</p>
                                        {profile.poc.kycDocuments.map((doc, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg mb-1">
                                                <FileText size={14} className="text-primary" />
                                                <span className="text-sm">{doc.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </EnterpriseLayout>
    );
};

export default EnterpriseProfilePage;