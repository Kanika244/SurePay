import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthIndividual from "./pages/AuthIndividual";
import AuthEnterprise from "./pages/AuthEnterprise";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/IndividualOnboarding";
import KYCFlow from "./pages/EnterpriseOnboarding";
import EnterpriseOnboarding from "./pages/EnterpriseOnboarding";
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

// Enterprise Panel imports
import { EnterpriseProvider } from "./contexts/EnterpriseContext";
import { CouponProvider } from "./contexts/CouponContext";
import EnterpriseDashboardHome from "./pages/enterprise/EnterpriseDashboardHome";
import EnterpriseEmployeeList from "./pages/enterprise/EnterpriseEmployeeList";
import AddEmployee from "./pages/enterprise/AddEmployee";
import EnterpriseEmployeeProfile from "./pages/enterprise/EnterpriseEmployeeProfile";
import BulkOnboarding from "./pages/enterprise/BulkOnboarding";
import EnterpriseWallet from "./pages/enterprise/EnterpriseWallet";
import EnterpriseTransactions from "./pages/enterprise/EnterpriseTransactions";
import EnterpriseAnalytics from "./pages/enterprise/EnterpriseAnalytics";
import EnterpriseProfilePage from "./pages/enterprise/EnterpriseProfilePage";
import EnterpriseSettings from "./pages/enterprise/EnterpriseSettings";

// Coupon imports
import CouponTemplates from "./pages/enterprise/coupons/CouponTemplates";
import CouponsHub from "./pages/enterprise/coupons/CouponsHub";
import CreateCouponTemplate from "./pages/enterprise/coupons/CreateCouponTemplate";
import IssuedCoupons from "./pages/enterprise/coupons/IssuedCoupons";
import RedeemedCoupons from "./pages/enterprise/coupons/RedeemedCoupons";
import ExpiredCoupons from "./pages/enterprise/coupons/ExpiredCoupons";
import MerchantManagement from "./pages/enterprise/coupons/MerchantManagement";
import CouponAnalytics from "./pages/enterprise/coupons/CouponAnalytics";
import CouponDetail from "./pages/enterprise/coupons/CouponDetail";

// Individual PWA imports
import { IndividualProvider } from "./contexts/IndividualContext";
import MobileLayout from "./components/pwa/MobileLayout";
import PWAHome from "./pages/pwa/PWAHome";
import PWASend from "./pages/pwa/PWASend";
import PWAReceive from "./pages/pwa/PWAReceive";
import PWAScan from "./pages/pwa/PWAScan";
import PWATransactions from "./pages/pwa/PWATransactions";
import PWAWallet from "./pages/pwa/PWAWallet";
import PWAAddMoney from "./pages/pwa/PWAAddMoney";
import PWAProfile from "./pages/pwa/PWAProfile";
import PWANotifications from "./pages/pwa/PWANotifications";
import PWACoupons from "./pages/pwa/PWACoupons";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <EnterpriseProvider>
          <CouponProvider>
          <IndividualProvider>
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
                
                {/* Individual PWA Routes */}
                <Route path="/app" element={<MobileLayout />}>
                  <Route index element={<PWAHome />} />
                  <Route path="send" element={<PWASend />} />
                  <Route path="receive" element={<PWAReceive />} />
                  <Route path="scan" element={<PWAScan />} />
                  <Route path="transactions" element={<PWATransactions />} />
                  <Route path="wallet" element={<PWAWallet />} />
                  <Route path="add-money" element={<PWAAddMoney />} />
                  <Route path="profile" element={<PWAProfile />} />
                  <Route path="notifications" element={<PWANotifications />} />
                  <Route path="coupons" element={<PWACoupons />} />
                </Route>
                
                {/* Enterprise Panel Routes */}
                <Route path="/enterprise/dashboard" element={<EnterpriseDashboardHome />} />
                <Route path="/enterprise/employees" element={<EnterpriseEmployeeList />} />
                <Route path="/enterprise/employees/add" element={<AddEmployee />} />
                <Route path="/enterprise/employees/:id" element={<EnterpriseEmployeeProfile />} />
                <Route path="/enterprise/bulk-onboarding" element={<BulkOnboarding />} />
                <Route path="/enterprise/wallet" element={<EnterpriseWallet />} />
                <Route path="/enterprise/transactions" element={<EnterpriseTransactions />} />
                <Route path="/enterprise/analytics" element={<EnterpriseAnalytics />} />
                <Route path="/enterprise/profile" element={<EnterpriseProfilePage />} />
                <Route path="/enterprise/settings" element={<EnterpriseSettings />} />
                
                {/* Coupon Routes */}
                <Route path="/enterprise/coupons" element={<CouponsHub />} />
                <Route path="/enterprise/coupons/templates" element={<CouponTemplates />} />
                <Route path="/enterprise/coupons/templates/create" element={<CreateCouponTemplate />} />
                <Route path="/enterprise/coupons/templates/:id" element={<CouponDetail />} />
                <Route path="/enterprise/coupons/issued" element={<IssuedCoupons />} />
                <Route path="/enterprise/coupons/issued/:id" element={<CouponDetail />} />
                <Route path="/enterprise/coupons/redeemed" element={<RedeemedCoupons />} />
                <Route path="/enterprise/coupons/expired" element={<ExpiredCoupons />} />
                <Route path="/enterprise/coupons/merchants" element={<MerchantManagement />} />
                <Route path="/enterprise/coupons/analytics" element={<CouponAnalytics />} />
                
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
          </IndividualProvider>
          </CouponProvider>
        </EnterpriseProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
