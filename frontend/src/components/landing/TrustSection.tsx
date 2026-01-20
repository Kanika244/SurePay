import { motion } from "framer-motion";
import { Shield, Wallet, Settings, FileText, Server } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Final Settlement",
    description: "Money moves instantly and permanently—no reversals or holds.",
  },
  {
    icon: Wallet,
    title: "Secure Wallets",
    description: "Bank-grade encryption protects every transaction you make.",
  },
  {
    icon: Settings,
    title: "Policy-Controlled",
    description: "Set spending limits, approval workflows, and usage rules.",
  },
  {
    icon: FileText,
    title: "Transparent Records",
    description: "Complete audit trails for every rupee that moves.",
  },
  {
    icon: Server,
    title: "Scalable Architecture",
    description: "Built to handle millions of transactions per second.",
  },
];

const TrustSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Built on Trust
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Platform Principles
          </h2>
          <p className="text-lg text-muted-foreground">
            SurePay is designed with security, transparency, and reliability at its core.
          </p>
        </motion.div>

        {/* Principles Cards - Horizontal Scroll on Mobile */}
        <div className="flex gap-4 overflow-x-auto pb-4 lg:overflow-visible lg:grid lg:grid-cols-5 lg:gap-6">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-64 lg:w-auto"
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <principle.icon className="text-primary" size={28} />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {principle.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
