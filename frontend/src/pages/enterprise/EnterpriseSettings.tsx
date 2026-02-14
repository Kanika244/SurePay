import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Bell, Lock, Users, Wallet, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnterpriseLayout from "@/components/enterprise/EnterpriseLayout";
import { toast } from "@/hooks/use-toast";

const EnterpriseSettings = () => {
    const [settings, setSettings] = useState({
        defaultWalletLimit: "50000",
        defaultSpendingLimit: "30000",
        approvalWorkflow: false,
        emailNotifications: true,
        transactionAlerts: true,
        lowBalanceAlert: true,
        lowBalanceThreshold: "10000",
        twoFactorRequired: false,
        sessionTimeout: "30",
        ipWhitelist: "",
    });

    const set = (k: string, v: any) => setSettings(p => ({ ...p, [k]: v }));

    const handleSave = () => {
        toast({ title: "Settings saved", description: "Your enterprise settings have been updated." });
    };

    return (
        <EnterpriseLayout title="Settings" subtitle="Configure enterprise policies and preferences">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Users size={18} /> Role Management</CardTitle>
                        <CardDescription>Define roles and permissions for your team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { role: 'Enterprise Admin', desc: 'Full access to all features', permissions: 'All' },
                                { role: 'Finance', desc: 'Wallet and transaction management', permissions: 'Wallet, Transactions, Reports' },
                                { role: 'HR', desc: 'Employee management and onboarding', permissions: 'Employees, Onboarding, Profile' },
                                { role: 'Manager', desc: 'Team oversight and approvals', permissions: 'Team View, Approvals' },
                            ].map(r => (
                                <div key={r.role} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{r.role}</p>
                                            <p className="text-xs text-muted-foreground">{r.desc}</p>
                                        </div>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{r.permissions}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Spending Policies */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Wallet size={18} /> Spending Policies</CardTitle>
                        <CardDescription>Set default wallet and spending limits</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Default Wallet Limit (₹)</Label>
                            <Input type="number" value={settings.defaultWalletLimit} onChange={e => set('defaultWalletLimit', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Spending Limit (₹)</Label>
                            <Input type="number" value={settings.defaultSpendingLimit} onChange={e => set('defaultSpendingLimit', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Approval Workflow</p>
                                <p className="text-xs text-muted-foreground">Require approval for large transactions</p>
                            </div>
                            <Switch checked={settings.approvalWorkflow} onCheckedChange={v => set('approvalWorkflow', v)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Bell size={18} /> Notifications</CardTitle>
                        <CardDescription>Manage notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                            { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Alert on every transaction' },
                            { key: 'lowBalanceAlert', label: 'Low Balance Alert', desc: 'Alert when balance is low' },
                        ].map(n => (
                            <div key={n.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">{n.label}</p>
                                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                                </div>
                                <Switch checked={(settings as any)[n.key]} onCheckedChange={v => set(n.key, v)} />
                            </div>
                        ))}
                        {settings.lowBalanceAlert && (
                            <div className="space-y-2">
                                <Label>Low Balance Threshold (₹)</Label>
                                <Input type="number" value={settings.lowBalanceThreshold} onChange={e => set('lowBalanceThreshold', e.target.value)} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><Shield size={18} /> Security</CardTitle>
                        <CardDescription>Enhance your enterprise security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Mandatory 2FA</p>
                                <p className="text-xs text-muted-foreground">Require 2FA for all employees</p>
                            </div>
                            <Switch checked={settings.twoFactorRequired} onCheckedChange={v => set('twoFactorRequired', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Session Timeout (minutes)</Label>
                            <Select value={settings.sessionTimeout} onValueChange={v => set('sessionTimeout', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>IP Whitelist</Label>
                            <Input value={settings.ipWhitelist} onChange={e => set('ipWhitelist', e.target.value)} placeholder="e.g. 192.168.1.0/24" />
                            <p className="text-xs text-muted-foreground">Comma-separated IP ranges (leave empty to allow all)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Button size="lg" onClick={handleSave}>Save Settings</Button>
            </div>
        </EnterpriseLayout>
    );
};

export default EnterpriseSettings;