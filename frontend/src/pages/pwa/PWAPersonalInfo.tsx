import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Users, Pencil, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useIndividual } from "@/contexts/IndividualContext";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const PWAPersonalInfo = () => {
    const { user, updateEmail } = useIndividual();
    const { toast } = useToast();

    const [editingEmail, setEditingEmail] = useState(false);
    const [emailDraft, setEmailDraft] = useState(user.email || "");
    const [saving, setSaving] = useState(false);

    const handleSaveEmail = async () => {
        if (!emailDraft.trim()) return;
        setSaving(true);
        const result = await updateEmail(emailDraft.trim());
        setSaving(false);
        if (result.success) {
            setEditingEmail(false);
            toast({ title: "Email saved!", description: "Your email has been updated successfully." });
        } else {
            toast({ title: "Failed", description: result.error || "Could not save email.", variant: "destructive" });
        }
    };

    const handleCancelEmail = () => {
        setEmailDraft(user.email || "");
        setEditingEmail(false);
    };

    const readOnlyFields = [
        { icon: User, label: "Full Name", value: `${user.firstName} ${user.lastName}`.trim() || "—" },
        { icon: Phone, label: "Phone", value: user.phone || "—" },
        { icon: Calendar, label: "Date of Birth", value: user.dob || "—" },
        { icon: Users, label: "Gender", value: user.gender || "—" },
        { icon: MapPin, label: "Address", value: "Linked via KYC" },
    ];

    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-5">
                <Link to="/app/profile"><ArrowLeft size={20} className="text-muted-foreground" /></Link>
                <h1 className="text-lg font-bold text-foreground">Personal Information</h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Avatar */}
                <div className="flex justify-center py-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">

                    {/* Email — editable */}
                    <div>
                        <div className="flex items-center gap-3 p-4">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <Mail size={16} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Email</p>
                                {editingEmail ? (
                                    <input
                                        type="email"
                                        autoFocus
                                        value={emailDraft}
                                        onChange={e => setEmailDraft(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handleSaveEmail(); if (e.key === "Escape") handleCancelEmail(); }}
                                        className="w-full text-sm font-medium bg-transparent border-b border-primary outline-none py-0.5 text-foreground"
                                        placeholder="your@email.com"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user.email || <span className="text-muted-foreground italic">Not set — required for 2FA</span>}
                                    </p>
                                )}
                            </div>
                            {editingEmail ? (
                                <div className="flex gap-1.5 shrink-0">
                                    <button
                                        onClick={handleSaveEmail}
                                        disabled={saving || !emailDraft.trim()}
                                        className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    </button>
                                    <button
                                        onClick={handleCancelEmail}
                                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setEmailDraft(user.email || ""); setEditingEmail(true); }}
                                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                                >
                                    <Pencil size={13} />
                                </button>
                            )}
                        </div>
                        <Separator />
                    </div>

                    {/* Read-only fields */}
                    {readOnlyFields.map((field, idx) => (
                        <div key={field.label}>
                            {idx > 0 && <Separator />}
                            <div className="flex items-center gap-3 p-4">
                                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <field.icon size={16} className="text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">{field.label}</p>
                                    <p className="text-sm font-medium text-foreground truncate">{field.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground text-center px-4">
                    Email can be edited here. Other details are from KYC and cannot be changed directly.
                </p>
            </motion.div>
        </div>
    );
};

export default PWAPersonalInfo;