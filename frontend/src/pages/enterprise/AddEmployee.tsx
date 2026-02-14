import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import { departments } from "@/data/enterpriseMockData";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const AddEmployee = () => {
    const navigate = useNavigate();
    const { addEmployee, employees } = useEnterprise();
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", gender: "Male" as const,
        department: "", designation: "", role: "Employee" as const, dateOfJoining: "",
        employmentType: "Full-time" as const, govIdType: "Aadhaar" as const, govIdNumber: "",
        walletCredit: "", salaryBand: "", spendingLimit: "", twoFactor: false,
    });
    const [idDoc, setIdDoc] = useState<File | null>(null);
    const [addressDoc, setAddressDoc] = useState<File | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    const empId = `ACM-${String(employees.length + 1).padStart(3, '0')}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.department || !form.designation || !form.dateOfJoining || !form.govIdNumber) {
            toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
            return;
        }
        if (employees.some(emp => emp.email === form.email)) {
            toast({ title: "Duplicate Email", description: "An employee with this email already exists", variant: "destructive" });
            return;
        }

        const docs = [];
        if (idDoc) docs.push({ name: idDoc.name, type: form.govIdType, uploadedAt: new Date().toISOString().split('T')[0] });
        if (addressDoc) docs.push({ name: addressDoc.name, type: 'Address', uploadedAt: new Date().toISOString().split('T')[0] });

        addEmployee({
            employeeId: empId,
            firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
            dateOfBirth: form.dateOfBirth, gender: form.gender, department: form.department,
            designation: form.designation, role: form.role, dateOfJoining: form.dateOfJoining,
            employmentType: form.employmentType, govIdType: form.govIdType, govIdNumber: form.govIdNumber,
            documents: docs, walletBalance: parseInt(form.walletCredit) || 0,
            spendingLimit: parseInt(form.spendingLimit) || 50000, salaryBand: form.salaryBand || undefined,
            status: 'active', twoFactorEnabled: form.twoFactor,
        });

        toast({ title: "Employee Added", description: `${form.firstName} ${form.lastName} has been onboarded successfully.` });
        navigate("/enterprise/employees");
    };

    return (
        <EnterpriseLayout title="Add Employee" subtitle="Onboard a new team member">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>First Name *</Label><Input value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Last Name *</Label><Input value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
                            </div>
                            <div className="space-y-2"><Label>Employee ID</Label><Input value={empId} disabled className="bg-muted" /></div>
                            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} /></div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select value={form.gender} onValueChange={v => set('gender', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Department *</Label>
                                <Select value={form.department} onValueChange={v => set('department', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                    <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Designation *</Label><Input value={form.designation} onChange={e => set('designation', e.target.value)} /></div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={form.role} onValueChange={v => set('role', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Employee">Employee</SelectItem><SelectItem value="Manager">Manager</SelectItem><SelectItem value="Finance">Finance</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Date of Joining *</Label><Input type="date" value={form.dateOfJoining} onChange={e => set('dateOfJoining', e.target.value)} /></div>
                            <div className="space-y-2">
                                <Label>Employment Type</Label>
                                <Select value={form.employmentType} onValueChange={v => set('employmentType', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Intern">Intern</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identity */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Identity / Compliance</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Government ID Type</Label>
                                <Select value={form.govIdType} onValueChange={v => set('govIdType', v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Aadhaar">Aadhaar</SelectItem><SelectItem value="PAN">PAN</SelectItem><SelectItem value="Passport">Passport</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Government ID Number *</Label><Input value={form.govIdNumber} onChange={e => set('govIdNumber', e.target.value)} /></div>
                            <div className="space-y-2">
                                <Label>Upload ID Document</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition" onClick={() => document.getElementById('id-doc')?.click()}>
                                    <Upload className="mx-auto mb-2 text-muted-foreground" size={20} />
                                    <p className="text-sm text-muted-foreground">{idDoc ? idDoc.name : "Click to upload"}</p>
                                    <input id="id-doc" type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => setIdDoc(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Upload Address Proof</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition" onClick={() => document.getElementById('addr-doc')?.click()}>
                                    <Upload className="mx-auto mb-2 text-muted-foreground" size={20} />
                                    <p className="text-sm text-muted-foreground">{addressDoc ? addressDoc.name : "Click to upload"}</p>
                                    <input id="addr-doc" type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => setAddressDoc(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Upload Profile Photo</Label>
                                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition" onClick={() => document.getElementById('photo')?.click()}>
                                    <Upload className="mx-auto mb-2 text-muted-foreground" size={20} />
                                    <p className="text-sm text-muted-foreground">{photo ? photo.name : "Click to upload"}</p>
                                    <input id="photo" type="file" className="hidden" accept=".jpg,.png,.jpeg" onChange={e => setPhoto(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial & Settings */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Financial Details & Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Initial Wallet Credit (₹)</Label><Input type="number" value={form.walletCredit} onChange={e => set('walletCredit', e.target.value)} placeholder="0" /></div>
                            <div className="space-y-2"><Label>Salary Band</Label><Input value={form.salaryBand} onChange={e => set('salaryBand', e.target.value)} placeholder="e.g. ₹6L-10L" /></div>
                            <div className="space-y-2"><Label>Spending Limit (₹)</Label><Input type="number" value={form.spendingLimit} onChange={e => set('spendingLimit', e.target.value)} placeholder="50000" /></div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                                    <p className="text-xs text-muted-foreground">Enable 2FA for this employee</p>
                                </div>
                                <Switch checked={form.twoFactor} onCheckedChange={v => set('twoFactor', v)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button type="submit" size="lg">Create Employee</Button>
                    <Button type="button" variant="outline" size="lg" onClick={() => navigate("/enterprise/employees")}>Cancel</Button>
                </div>
            </form>
        </EnterpriseLayout>
    );
};

export default AddEmployee;