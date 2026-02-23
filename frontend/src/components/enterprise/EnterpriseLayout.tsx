import { useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EnterpriseSidebar from "./EnterpriseSidebar";
import NotificationDropdown from "@/components/enterprise/NotificationDropdown";

interface EnterpriseLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

const EnterpriseLayout = ({ children, title, subtitle }: EnterpriseLayoutProps) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-background">
            <EnterpriseSidebar />
            <div className="pl-20 md:pl-72 transition-all duration-200">
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
                    <div />
                    <div className="flex items-center gap-4">

                        {/* Real notification bell with dropdown */}
                        <NotificationDropdown />

                        {/* Profile dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User size={16} className="text-primary" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onSelect={() => navigate("/enterprise/profile")}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => navigate("/enterprise/settings")}>
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={handleSignOut}
                                >
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default EnterpriseLayout;