import { Link } from "react-router-dom";
import { Github, FileText, Info } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: "About", href: "#about", icon: Info },
    { label: "Docs", href: "/docs", icon: FileText },
    { label: "GitHub", href: "https://github.com", icon: Github, external: true },
  ];

  return (
    <footer className="py-12 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="SurePay Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg font-semibold">SurePay</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <link.icon size={16} />
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <link.icon size={16} />
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-primary-foreground/50">
            © {currentYear} SurePay
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-primary-foreground/10">
          <p className="text-xs text-primary-foreground/40 text-center max-w-2xl mx-auto">
            CBDC interactions shown here are simulated for demonstration purposes.
            SurePay is a conceptual product designed to illustrate digital payment capabilities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
