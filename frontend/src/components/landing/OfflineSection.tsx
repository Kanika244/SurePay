import { motion } from "framer-motion";
import { WifiOff, Smartphone, Users2, MapPin } from "lucide-react";
import offlinePaymentsImg from "@/assets/offline-payments.png";

const features = [
  {
    icon: WifiOff,
    title: "Works Offline",
    description: "Complete transactions even without internet connectivity",
  },
  {
    icon: Users2,
    title: "For Gig Workers",
    description: "Perfect for daily wage earners and migrant workers",
  },
  {
    icon: Smartphone,
    title: "Any Phone Works",
    description: "No expensive smartphone required—works on basic devices",
  },
  {
    icon: MapPin,
    title: "Rural Friendly",
    description: "Designed for areas with limited banking infrastructure",
  },
];

const OfflineSection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              <img
                src={offlinePaymentsImg}
                alt="Offline payments in rural areas"
                className="w-full rounded-3xl shadow-xl"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-3xl" />
              
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 glass-card px-4 py-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center">
                  <WifiOff className="text-mint" size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Network Status</p>
                  <p className="text-sm font-semibold text-foreground">Works Offline ✓</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <span className="text-sm font-semibold text-mint uppercase tracking-wider">
              Financial Inclusion
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
              Digital Payments for{" "}
              <span className="text-gradient">Everyone</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              SurePay bridges the digital divide. Our offline-capable transactions ensure 
              that everyone—from gig workers to rural merchants—can participate in the 
              digital economy. No bank account, no problem.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center shrink-0">
                    <feature.icon className="text-mint" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OfflineSection;
