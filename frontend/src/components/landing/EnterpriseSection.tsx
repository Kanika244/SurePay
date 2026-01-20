import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Building2, Users, Wallet, FileCheck, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import enterpriseDashboard from "@/assets/enterprise-dashboard.png";

const features = [
  {
    icon: Building2,
    title: "Corporate Onboarding",
    description: "Streamlined setup for enterprises of any size",
  },
  {
    icon: Users,
    title: "Automatic Wallet Creation",
    description: "Create wallets for all employees in bulk",
  },
  {
    icon: Settings,
    title: "Programmable Payouts",
    description: "Automate travel, food, and allowance disbursals",
  },
  {
    icon: FileCheck,
    title: "Audit-Ready Records",
    description: "Complete transparency with detailed transaction logs",
  },
];

const EnterpriseSection = () => {
  return (
    <section
      id="enterprise"
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(222 47% 8%) 0%, hsl(224 47% 12%) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 animated-grid opacity-30" />
      <div className="glow-orb w-[600px] h-[600px] top-1/2 -right-64 bg-primary/10" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
              <Building2 size={14} />
              Enterprise Solutions
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mt-3 mb-6">
              Powerful Tools for{" "}
              <span className="text-accent">Business</span>
            </h2>
            <p className="text-lg text-primary-foreground/70 mb-8 leading-relaxed">
              From employee payouts to vendor settlements, SurePay Enterprise gives you 
              complete control over your organization's digital payments with programmable 
              policies and audit-ready records.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <feature.icon className="text-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-foreground text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-primary-foreground/60 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Button variant="enterprise" size="lg" asChild>
              <Link to="/auth/enterprise" className="gap-2">
                Get started as Enterprise
                <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative">
              {/* Dashboard Image */}
              <div className="rounded-2xl overflow-hidden border border-primary-foreground/10 shadow-2xl">
                <img
                  src={enterpriseDashboard}
                  alt="SurePay Enterprise Dashboard"
                  className="w-full"
                />
              </div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee Wallets</p>
                    <p className="text-2xl font-bold text-foreground">12,847</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-mint text-mint-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg hidden md:block"
              >
                99.9% Uptime
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSection;
