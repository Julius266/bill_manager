"use client";

import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";

export function Stats() {
	const language = useLanguage();
	const t = translations[language].stats;

  return (
    <section className="bg-card/50 py-12 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">50k+</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              {t.activeUsers}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">99.9%</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              {t.trustScore}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">10M+</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              {t.tracked}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">24/7</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mt-1">
              {t.security}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}