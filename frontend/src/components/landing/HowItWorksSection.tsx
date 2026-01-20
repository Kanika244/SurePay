import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Wallet, Send, Shield, Building } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Create a wallet",
    description: "Sign up in seconds. No bank account required—just your phone number or email.",
    color: "primary",
  },
  {
    icon: Send,
    title: "Pay people or merchants instantly",
    description: "Send money to friends, family, or pay at local shops with a simple scan or tap.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Receive or send money securely",
    description: "Every transaction is encrypted and verified. Your digital money is always safe.",
    color: "mint",
  },
  {
    icon: Building,
    title: "Link your bank (optional)",
    description: "Connect your bank account anytime to top-up your wallet or withdraw funds.",
    color: "secondary",
  },
];

const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-24 md:py-32 bg-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-glow opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            How SurePay Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started is easy. Follow these simple steps to start making digital payments today.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="feature-card h-full relative">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
                    step.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : step.color === "accent"
                      ? "bg-accent/10 text-accent"
                      : step.color === "mint"
                      ? "bg-mint/10 text-mint"
                      : "bg-secondary/50 text-secondary-foreground"
                  }`}
                >
                  <step.icon size={28} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
