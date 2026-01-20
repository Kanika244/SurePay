import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 animated-grid" />
      
      {/* Glowing Orbs */}
      <div className="glow-orb w-[600px] h-[600px] -top-64 -right-64 bg-primary/20" />
      <div className="glow-orb w-[500px] h-[500px] -bottom-32 -left-32 bg-accent/20 animation-delay-2000" />
      <div className="glow-orb w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-mint/15" />

      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-sm font-medium text-foreground">Powered by Digital Currency</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4"
            >
              Digital money,{" "}
              <span className="text-gradient">made simple.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Pay anyone, anywhere—instantly. No bank account required. 
              SurePay brings secure digital payments to individuals, merchants, and enterprises.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth/individual" className="gap-2">
                  <User size={20} />
                  Get started as Individual
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth/enterprise" className="gap-2">
                  <Building2 size={20} />
                  Get started as Enterprise
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center">
                  <span className="text-mint text-sm font-bold">✓</span>
                </div>
                <span className="text-sm text-muted-foreground">No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center">
                  <span className="text-mint text-sm font-bold">✓</span>
                </div>
                <span className="text-sm text-muted-foreground">Instant settlement</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative">
              {/* Main Illustration */}
              <img
                src={heroIllustration}
                alt="Digital wallet payments illustration"
                className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl"
              />
              
              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 glass-card px-4 py-3 hidden md:flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center">
                  <span className="text-mint font-bold">₹</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Received</p>
                  <p className="text-sm font-semibold text-foreground">₹2,500.00</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -top-4 -right-4 glass-card px-4 py-3 hidden md:flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">⚡</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Speed</p>
                  <p className="text-sm font-semibold text-foreground">Instant</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
