import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, Info, CircleCheck, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000/api/enterprise-panel";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "alert";
    read: boolean;
    createdAt: string;
}

const typeConfig = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    success: { icon: CircleCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
    alert: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const companyId = localStorage.getItem("company_id");
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchNotifications = useCallback(async () => {
        if (!companyId) return;
        try {
            const res = await fetch(`${API}/notifications/${companyId}`, { headers });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    }, [companyId]);

    // Poll every 15 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Key fix: position dropdown using fixed so it escapes header overflow ──
    const handleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen(o => !o);
        if (!open) fetchNotifications();
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${API}/notifications/${id}/read`, { method: "PATCH", headers });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!companyId) return;
        try {
            await fetch(`${API}/notifications/${companyId}/read-all`, { method: "PATCH", headers });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    return (
        <>
            {/* Bell Button */}
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleOpen}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown — rendered via fixed position so it escapes header clipping */}
            {open && (
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="w-96 max-h-[480px] bg-card border border-border rounded-xl shadow-xl z-[999] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                onClick={markAllAsRead}
                            >
                                <CheckCheck size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => {
                                const cfg = typeConfig[n.type] || typeConfig.info;
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={n.id}
                                        className={`flex gap-3 px-4 py-3 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? cfg.bg : ""}`}
                                        onClick={() => { if (!n.read) markAsRead(n.id); }}
                                    >
                                        <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm truncate ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                                                    {n.title}
                                                </p>
                                                {!n.read && (
                                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationDropdown;