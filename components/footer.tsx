"use client";

import Link from "next/link";
import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";

export function Footer() {
  const language = useLanguage();
  const t = translations[language].footer;
  
  const footerLinks = {
    product: [
      { label: t.links.features, href: "#features" },
      { label: t.links.security, href: "#security" },
      { label: t.links.pricing, href: "#pricing" },
      { label: t.links.updates, href: "#updates" }
    ],
    company: [
      { label: t.links.about, href: "#about" },
      { label: t.links.careers, href: "#careers" },
      { label: t.links.blog, href: "#blog" },
      { label: t.links.contact, href: "#contact" }
    ],
    legal: [
      { label: t.links.privacy, href: "#privacy" },
      { label: t.links.terms, href: "#terms" },
      { label: t.links.cookies, href: "#cookies" }
    ]
  };

  const socialLinks = [
    { icon: "share", href: "#", label: "Share" },
    { icon: "public", href: "#", label: "Website" },
    { icon: "mail", href: "#", label: "Email" }
  ];

  return (
    <footer className="bg-card pt-16 pb-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">
                  account_balance_wallet
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                ExpenseManager
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              {t.description}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <Link 
                  key={index}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <span className="material-symbols-outlined">{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h5 className="font-bold text-foreground mb-6">{t.product}</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="font-bold text-foreground mb-6">{t.company}</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h5 className="font-bold text-foreground mb-6">{t.legal}</h5>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t.copyright}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-sm">language</span>
            <span>{t.language}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}