import { motion } from "framer-motion";
import { Users, Store, Package, QrCode, Clock, Zap } from "lucide-react";

const useCases = [
  {
    icon: Users,
    title: "Peer-to-Peer Payments",
    description: "Split bills, send gifts, or pay friends back instantly—no matter where they are.",
    gradient: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/20 text-primary",
  },
  {
    icon: Store,
    title: "Pay at Local Shops",
    description: "Scan and pay at your favorite stores. Quick, secure, and completely cashless.",
    gradient: "from-accent/10 to-mint/10",
    iconBg: "bg-accent/20 text-accent",
  },
  {
    icon: Package,
    title: "Vendor-to-Vendor Payments",
    description: "Streamline B2B transactions with instant settlements and complete transparency.",
    gradient: "from-mint/10 to-secondary/10",
    iconBg: "bg-mint/20 text-mint",
  },
  {
    icon: QrCode,
    title: "QR-Based Payments",
    description: "Accept payments anywhere with just a QR code. No expensive hardware needed.",
    gradient: "from-secondary/10 to-primary/10",
    iconBg: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Zap,
    title: "No Bank Dependency",
    description: "Your money stays in your wallet. No bank account needed to get started.",
    gradient: "from-primary/10 to-mint/10",
    iconBg: "bg-primary/20 text-primary",
  },
  {
    icon: Clock,
    title: "Instant Final Settlement",
    description: "Merchants receive funds immediately. No waiting days for settlement.",
    gradient: "from-accent/10 to-primary/10",
    iconBg: "bg-accent/20 text-accent",
  },
];

const UseCasesSection = () => {
  return (
    <section id="use-cases" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

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
            For Everyone
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Built for Individuals & Merchants
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're sending money to a friend or accepting payments at your shop, 
            SurePay has you covered.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group cursor-pointer"
            >
              <div
                className={`h-full p-6 rounded-2xl bg-gradient-to-br ${useCase.gradient} border border-border/50 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/30`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${useCase.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <useCase.icon size={24} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
