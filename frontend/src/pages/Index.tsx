import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import OfflineSection from "@/components/landing/OfflineSection";
import EnterpriseSection from "@/components/landing/EnterpriseSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import PWAInstallPrompt from "@/components/landing/PWAInstallPrompt";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative pb-16 md:pb-0">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <UseCasesSection />
        <OfflineSection />
        <EnterpriseSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
