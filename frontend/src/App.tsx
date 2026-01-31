import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthIndividual from "./pages/AuthIndividual";
import AuthEnterprise from "./pages/AuthEnterprise";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/IndividualDashboard";
import KYCFlow from "./pages/IndividualOnboarding";
import EnterpriseOnboarding from "./pages/EnterpriseOnboarding";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import NotFound from "./pages/NotFound";

// Admin imports
import { AdminProvider } from "./contexts/AdminContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EnterpriseList from "./pages/admin/EnterpriseList";
import EnterpriseProfile from "./pages/admin/EnterpriseProfile";
import EnterprisePOC from "./pages/admin/EnterprisePOC";
import EmployeeList from "./pages/admin/EmployeeList";
import EmployeeProfile from "./pages/admin/EmployeeProfile";
import IndividualList from "./pages/admin/IndividualList";
import IndividualProfile from "./pages/admin/IndividualProfile";
import WalletManagement from "./pages/admin/WalletManagement";
import TransactionAnalytics from "./pages/admin/TransactionAnalytics";
import AuditLogs from "./pages/admin/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/individual" element={<AuthIndividual />} />
            <Route path="/auth/enterprise" element={<AuthEnterprise />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kyc" element={<KYCFlow />} />
            <Route path="/enterprise/onboarding" element={<EnterpriseOnboarding />} />
            <Route path="/enterprise/dashboard" element={<EnterpriseDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/enterprises" element={<EnterpriseList />} />
            <Route path="/admin/enterprises/:id" element={<EnterpriseProfile />} />
            <Route path="/admin/enterprises/:id/poc" element={<EnterprisePOC />} />
            <Route path="/admin/employees" element={<EmployeeList />} />
            <Route path="/admin/employees/:id" element={<EmployeeProfile />} />
            <Route path="/admin/individuals" element={<IndividualList />} />
            <Route path="/admin/individuals/:id" element={<IndividualProfile />} />
            <Route path="/admin/wallets" element={<WalletManagement />} />
            <Route path="/admin/transactions" element={<TransactionAnalytics />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;