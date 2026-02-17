"use client";

import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";

export function Security() {
  const language = useLanguage();
  const t = translations[language].security;
  
  const securityFeatures = [
    {
      icon: "encrypted",
      label: t.sslSecure
    },
    {
      icon: "security",
      label: t.twoFactor
    }
  ];

  return (
    <section className="py-16 bg-security-bg" id="security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Security Content */}
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-3xl font-bold mb-4 text-foreground">{t.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Security Badges */}
          <div className="grid grid-cols-2 gap-8 md:gap-16">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">
                  {feature.icon}
                </span>
                <span className="font-bold text-sm tracking-widest uppercase text-foreground">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}