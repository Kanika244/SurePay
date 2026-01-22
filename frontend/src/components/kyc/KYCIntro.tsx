import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Lock } from "lucide-react";

interface KYCIntroProps {
  onStart: () => void;
}

const KYCIntro = ({ onStart }: KYCIntroProps) => {
  const features = [
    {
      icon: Clock,
      text: "Takes only 2–3 minutes",
    },
    {
      icon: Shield,
      text: "Required by RBI guidelines",
    },
    {
      icon: Lock,
      text: "Your data is encrypted & secure",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center px-6 py-8"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
      >
        <Shield className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-bold text-foreground mb-3"
      >
        Verify your identity
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8 max-w-sm"
      >
        KYC is mandatory to enable payments and unlock all features
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-4 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-5 h-5 text-mint" />
            </div>
            <span className="text-sm text-foreground text-left">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={onStart}
          className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
        >
          Start KYC
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default KYCIntro;
