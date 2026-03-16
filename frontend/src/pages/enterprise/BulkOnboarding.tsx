import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Download, AlertTriangle, CheckCircle2, XCircle, Key, Globe, Copy, Trash2, RefreshCw, Webhook, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import { sampleCSVData, csvTemplateHeaders, departments } from "@/data/enterpriseMockData";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/admin/StatusBadge";
import { API_BASE_URL } from "@/services/config";

const API = `${API_BASE_URL}/api/enterprise-panel`;

const AVAILABLE_EVENTS = [
    { id: "employee.created", label: "Employee Created", desc: "When a new employee is onboarded" },
    { id: "employee.deactivated", label: "Employee Deactivated", desc: "When an employee is deactivated" },
    { id: "kyc.completed", label: "KYC Completed", desc: "When an employee completes KYC" },
    { id: "wallet.created", label: "Wallet Created", desc: "When a wallet is created" },
    { id: "wallet.funded", label: "Wallet Funded", desc: "When funds are added to a wallet" },
];

interface ParsedRow {
    data: Record<string, string>;
    errors: string[];
    status: 'valid' | 'error';
}

const BulkOnboarding = () => {
    const { addEmployees, employees } = useEnterprise();
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [uploaded, setUploaded] = useState(false);
    const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // ERP Integration state
    const companyId = localStorage.getItem("company_id") || "";
    const [hasKey, setHasKey] = useState(false);
    const [keyCreatedAt, setKeyCreatedAt] = useState<string | null>(null);
    const [newApiKey, setNewApiKey] = useState<string | null>(null);
    const [hasWebhook, setHasWebhook] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
    const [intLoading, setIntLoading] = useState(false);

    // Load integration status on mount
    useEffect(() => {
        if (!companyId) return;
        fetchKeyStatus();
        fetchWebhookStatus();
    }, [companyId]);

    const fetchKeyStatus = async () => {
        try {
            const res = await fetch(`${API}/integration/${companyId}/key-status`);
            const data = await res.json();
            setHasKey(data.has_key);
            setKeyCreatedAt(data.created_at || null);
        } catch { /* ignore */ }
    };

    const fetchWebhookStatus = async () => {
        try {
            const res = await fetch(`${API}/integration/${companyId}/webhook-status`);
            const data = await res.json();
            setHasWebhook(data.has_webhook || false);
            setWebhookUrl(data.url || "");
            setWebhookEvents(data.events || []);
        } catch { /* ignore */ }
    };

    const generateKey = async () => {
        setIntLoading(true);
        try {
            const res = await fetch(`${API}/integration/${companyId}/generate-key`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setNewApiKey(data.api_key);
                setHasKey(true);
                setKeyCreatedAt(new Date().toISOString());
                toast({ title: "API Key Generated", description: "Save this key securely — it won't be shown again!" });
            } else {
                toast({ title: "Error", description: data.detail || "Failed to generate key", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to generate key", variant: "destructive" });
        } finally { setIntLoading(false); }
    };

    const revokeKey = async () => {
        setIntLoading(true);
        try {
            const res = await fetch(`${API}/integration/${companyId}/revoke-key`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setHasKey(false);
                setNewApiKey(null);
                setKeyCreatedAt(null);
                toast({ title: "API Key Revoked", description: "Your ERP integration key has been revoked." });
            }
        } catch {
            toast({ title: "Error", description: "Failed to revoke key", variant: "destructive" });
        } finally { setIntLoading(false); }
    };

    const copyKey = () => {
        if (newApiKey) {
            navigator.clipboard.writeText(newApiKey);
            toast({ title: "Copied!", description: "API key copied to clipboard" });
        }
    };

    const toggleEvent = (eventId: string) => {
        setWebhookEvents(prev =>
            prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
        );
    };

    const saveWebhook = async () => {
        if (!webhookUrl) {
            toast({ title: "Error", description: "Webhook URL is required", variant: "destructive" });
            return;
        }
        setIntLoading(true);
        try {
            const res = await fetch(`${API}/integration/${companyId}/webhook`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: webhookUrl, events: webhookEvents }),
            });
            const data = await res.json();
            if (data.success) {
                setHasWebhook(true);
                toast({ title: "Webhook Saved", description: "Your webhook has been registered." });
            }
        } catch {
            toast({ title: "Error", description: "Failed to save webhook", variant: "destructive" });
        } finally { setIntLoading(false); }
    };

    const removeWebhook = async () => {
        setIntLoading(true);
        try {
            await fetch(`${API}/integration/${companyId}/webhook`, { method: "DELETE" });
            setHasWebhook(false);
            setWebhookUrl("");
            setWebhookEvents([]);
            toast({ title: "Webhook Removed" });
        } catch {
            toast({ title: "Error", description: "Failed to remove webhook", variant: "destructive" });
        } finally { setIntLoading(false); }
    };

    const downloadTemplate = () => {
        const blob = new Blob([sampleCSVData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'employee_template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const parseCSV = (text: string) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map(h => h.trim());
        const rows: ParsedRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const data: Record<string, string> = {};
            headers.forEach((h, idx) => { data[h] = values[idx] || ''; });
            const errors: string[] = [];

            if (!data['First Name']) errors.push('First Name is required');
            if (!data['Last Name']) errors.push('Last Name is required');
            if (!data['Email']) errors.push('Email is required');
            else if (employees.some(e => e.email === data['Email'])) errors.push('Email already exists');
            if (!data['Phone']) errors.push('Phone is required');
            if (!data['Department']) errors.push('Department is required');

            rows.push({ data, errors, status: errors.length > 0 ? 'error' : 'valid' });
        }
        setParsedRows(rows);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setResults(null);
        setUploaded(false);
        const reader = new FileReader();
        reader.onload = (ev) => parseCSV(ev.target?.result as string);
        reader.readAsText(f);
    };

    const handleSubmit = () => {
        const validRows = parsedRows.filter(r => r.status === 'valid');
        if (validRows.length === 0) {
            toast({ title: "No valid rows", description: "Please fix errors and re-upload", variant: "destructive" });
            return;
        }

        const newEmps = validRows.map(r => ({
            employeeId: r.data['Employee ID'] || `ACM-${String(employees.length + Math.random() * 100).padStart(3, '0')}`,
            firstName: r.data['First Name'], lastName: r.data['Last Name'],
            email: r.data['Email'], phone: r.data['Phone'],
            dateOfBirth: '', gender: 'Male' as const, department: r.data['Department'],
            designation: r.data['Designation'] || 'Employee', role: (r.data['Role'] || 'Employee') as any,
            dateOfJoining: r.data['Date of Joining'] || new Date().toISOString().split('T')[0],
            employmentType: 'Full-time' as const, govIdType: (r.data['Government ID Type'] || 'Aadhaar') as any,
            govIdNumber: r.data['Government ID Number'], documents: [],
            walletBalance: parseInt(r.data['Initial Wallet Credit']) || 0,
            spendingLimit: parseInt(r.data['Spending Limit']) || 50000,
            status: 'active' as const, twoFactorEnabled: false,
            kycVerified: false
        }));

        addEmployees(newEmps);
        setResults({ success: validRows.length, failed: parsedRows.length - validRows.length });
        setUploaded(true);
        toast({ title: "Bulk onboarding complete", description: `${validRows.length} employees added successfully` });
    };

    return (
        <EnterpriseLayout title="Bulk Employee Onboarding" subtitle="Upload a CSV file to onboard multiple employees at once">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-base">Upload CSV File</CardTitle></CardHeader>
                    <CardContent>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                            <p className="text-sm font-medium">{file ? file.name : "Click to upload CSV file"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Supports .csv files</p>
                            <input ref={fileRef} type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Download the CSV template with the required column headers.</p>
                        <Button variant="outline" className="w-full gap-2" onClick={downloadTemplate}>
                            <Download size={16} /> Download Template
                        </Button>
                        <div className="mt-4 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Required Columns:</p>
                            {csvTemplateHeaders.slice(0, 7).map(h => <p key={h} className="text-xs text-muted-foreground">• {h}</p>)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview */}
            {parsedRows.length > 0 && !uploaded && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Preview ({parsedRows.length} rows)</CardTitle>
                            <div className="flex gap-2">
                                <span className="text-xs text-mint flex items-center gap-1"><CheckCircle2 size={12} /> {parsedRows.filter(r => r.status === 'valid').length} valid</span>
                                {parsedRows.some(r => r.status === 'error') && (
                                    <span className="text-xs text-destructive flex items-center gap-1"><XCircle size={12} /> {parsedRows.filter(r => r.status === 'error').length} errors</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-border overflow-auto max-h-96">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Row</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Issues</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedRows.map((row, i) => (
                                            <TableRow key={i} className={row.status === 'error' ? 'bg-destructive/5' : ''}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>{row.data['First Name']} {row.data['Last Name']}</TableCell>
                                                <TableCell>{row.data['Email']}</TableCell>
                                                <TableCell>{row.data['Department']}</TableCell>
                                                <TableCell><StatusBadge status={row.status === 'valid' ? 'active' : 'failed'} /></TableCell>
                                                <TableCell>
                                                    {row.errors.length > 0 && (
                                                        <div className="flex items-start gap-1">
                                                            <AlertTriangle size={12} className="text-destructive mt-0.5" />
                                                            <span className="text-xs text-destructive">{row.errors.join('; ')}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button onClick={handleSubmit}>Submit {parsedRows.filter(r => r.status === 'valid').length} Valid Employees</Button>
                                <Button variant="outline" onClick={() => { setParsedRows([]); setFile(null); }}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Results */}
            {results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="mb-6">
                        <CardHeader><CardTitle className="text-base">Upload Report</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-mint/10 rounded-lg text-center">
                                    <CheckCircle2 className="mx-auto mb-2 text-mint" size={24} />
                                    <p className="text-2xl font-bold text-mint">{results.success}</p>
                                    <p className="text-sm text-muted-foreground">Successfully Onboarded</p>
                                </div>
                                <div className="p-4 bg-destructive/10 rounded-lg text-center">
                                    <XCircle className="mx-auto mb-2 text-destructive" size={24} />
                                    <p className="text-2xl font-bold text-destructive">{results.failed}</p>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                </div>
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => { setParsedRows([]); setFile(null); setResults(null); setUploaded(false); }}>Upload Another File</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ─── ERP Integration Section ─── */}
            <div className="mt-10 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Webhook size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">ERP Integration</h2>
                        <p className="text-xs text-muted-foreground">Connect your ERP system to auto-sync employees via API &amp; webhooks</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* API Key Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key size={18} className="text-indigo-500" />
                            <CardTitle className="text-base">API Key</CardTitle>
                        </div>
                        <CardDescription>
                            Generate an API key for your ERP system to authenticate with SurePay.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {newApiKey && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
                            >
                                <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                                    <Shield size={12} /> Save this key now — it won't be shown again!
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-background p-2 rounded border border-border break-all font-mono">
                                        {newApiKey}
                                    </code>
                                    <Button size="icon" variant="outline" className="shrink-0 h-8 w-8" onClick={copyKey}>
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {hasKey ? (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-mint/5 border border-mint/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                                    <span className="text-sm font-medium">Key Active</span>
                                    {keyCreatedAt && (
                                        <span className="text-xs text-muted-foreground">
                                            · Created {new Date(keyCreatedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={revokeKey} disabled={intLoading}>
                                    <Trash2 size={12} /> Revoke
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full gap-2" onClick={generateKey} disabled={intLoading}>
                                {intLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                                Generate API Key
                            </Button>
                        )}

                        <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">Usage</p>
                            <code className="block text-[11px] text-muted-foreground font-mono">
                                Header: X-SurePay-API-Key: sp_live_xxx...
                            </code>
                            <code className="block text-[11px] text-muted-foreground font-mono">
                                Base URL: /api/v1/integrate/
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* Webhook Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe size={18} className="text-purple-500" />
                            <CardTitle className="text-base">Webhook</CardTitle>
                        </div>
                        <CardDescription>
                            Receive real-time notifications when events happen in SurePay.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Callback URL</label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={e => setWebhookUrl(e.target.value)}
                                placeholder="https://your-erp.com/webhooks/surepay"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Subscribe to Events</label>
                            <div className="space-y-2">
                                {AVAILABLE_EVENTS.map(evt => (
                                    <label key={evt.id}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition ${webhookEvents.includes(evt.id)
                                            ? "border-indigo-500/40 bg-indigo-500/5"
                                            : "border-border hover:bg-muted/50"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={webhookEvents.includes(evt.id)}
                                            onChange={() => toggleEvent(evt.id)}
                                            className="rounded border-border accent-indigo-500"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{evt.label}</p>
                                            <p className="text-[11px] text-muted-foreground">{evt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1 gap-2" onClick={saveWebhook} disabled={intLoading || !webhookUrl}>
                                {intLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                {hasWebhook ? "Update Webhook" : "Register Webhook"}
                            </Button>
                            {hasWebhook && (
                                <Button variant="destructive" size="icon" onClick={removeWebhook} disabled={intLoading}>
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </EnterpriseLayout>
    );
};

export default BulkOnboarding;