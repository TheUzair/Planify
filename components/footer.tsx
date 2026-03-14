"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Changelog", href: "/#changelog" },
    { name: "Documentation", href: "/#docs" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/#blog" },
    { name: "Careers", href: "/#careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/#privacy" },
    { name: "Terms of Service", href: "/#terms" },
    { name: "Cookie Policy", href: "/#cookies" },
    { name: "Security", href: "/#security" },
  ],
  social: [
    { name: "Twitter", href: "https://twitter.com", icon: "𝕏" },
    { name: "GitHub", href: "https://github.com", icon: "GitHub" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "in" },
    { name: "Discord", href: "https://discord.com", icon: "Discord" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Don't show footer on auth pages or dashboard
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
            <ul className="space-y-3">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span className="font-medium">{link.icon}</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="text-sm font-semibold">TaskManager Pro</span>
            </div>

            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} All Rights Reserved — Made with ❤️ by <span className="font-semibold text-foreground">Uzair</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
