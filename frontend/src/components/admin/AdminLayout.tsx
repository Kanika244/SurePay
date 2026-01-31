import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/contexts/AdminContext";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const { globalSearch } = useAdmin();

    const searchResults = searchQuery.length > 2 ? globalSearch(searchQuery) : null;
    const hasResults = searchResults && (
        searchResults.enterprises.length > 0 ||
        searchResults.employees.length > 0 ||
        searchResults.individuals.length > 0
    );

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />

            {/* Main Content */}
            <div className="pl-20 md:pl-72 transition-all duration-200">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="flex-1 max-w-xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search enterprises, employees, individuals..."
                            className="pl-10 bg-muted/50"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchResults(e.target.value.length > 2);
                            }}
                            onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                        />

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {showSearchResults && hasResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-border shadow-lg max-h-96 overflow-y-auto z-50"
                                >
                                    <div className="p-2">
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-xs font-medium text-muted-foreground">Search Results</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setShowSearchResults(false);
                                                }}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>

                                        {searchResults.enterprises.length > 0 && (
                                            <div className="mb-2">
                                                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground">Enterprises</p>
                                                {searchResults.enterprises.slice(0, 3).map(e => (
                                                    <Link
                                                        key={e.id}
                                                        to={`/admin/enterprises/${e.id}`}
                                                        className="block px-3 py-2 hover:bg-muted rounded-md"
                                                        onClick={() => setShowSearchResults(false)}
                                                    >
                                                        <p className="text-sm font-medium">{e.name}</p>
                                                        <p className="text-xs text-muted-foreground">{e.email}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {searchResults.employees.length > 0 && (
                                            <div className="mb-2">
                                                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground">Employees</p>
                                                {searchResults.employees.slice(0, 3).map(e => (
                                                    <Link
                                                        key={e.id}
                                                        to={`/admin/employees/${e.id}`}
                                                        className="block px-3 py-2 hover:bg-muted rounded-md"
                                                        onClick={() => setShowSearchResults(false)}
                                                    >
                                                        <p className="text-sm font-medium">{e.name}</p>
                                                        <p className="text-xs text-muted-foreground">{e.enterpriseName}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {searchResults.individuals.length > 0 && (
                                            <div>
                                                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground">Individuals</p>
                                                {searchResults.individuals.slice(0, 3).map(i => (
                                                    <Link
                                                        key={i.id}
                                                        to={`/admin/individuals/${i.id}`}
                                                        className="block px-3 py-2 hover:bg-muted rounded-md"
                                                        onClick={() => setShowSearchResults(false)}
                                                    >
                                                        <p className="text-sm font-medium">{i.name}</p>
                                                        <p className="text-xs text-muted-foreground">{i.email}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User size={16} className="text-primary" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
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

export default AdminLayout;