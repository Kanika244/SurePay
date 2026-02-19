/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnterprise } from "@/contexts/EnterpriseContext";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import { sampleCSVData, csvTemplateHeaders, departments } from "@/data/enterpriseMockData";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/admin/StatusBadge";

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
            else if (!departments.includes(data['Department'])) errors.push('Invalid department');
            if (!data['Government ID Number']) errors.push('Gov ID is required');

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
                    <Card>
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
        </EnterpriseLayout>
    );
};

export default BulkOnboarding;