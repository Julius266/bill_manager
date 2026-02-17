"use client";

import { Button } from "./ui/button";
import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";
import Link from "next/link";
import { ContactModal } from "./contact-modal";

export function Cta() {
  const language = useLanguage();
  const t = translations[language].cta;
  
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden">
          {/* Content */}
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              {t.title}
            </h2>
            <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
              {t.description}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button 
                asChild
                size="lg"
                className="px-8 py-6 bg-background text-foreground font-bold rounded-xl hover:bg-background/90 shadow-lg"
              >
                <Link href="/auth/login">
                  {t.primaryButton}
                </Link>
              </Button>
              
              <ContactModal>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 bg-transparent border-2 border-primary-foreground/30 text-primary-foreground font-bold rounded-xl hover:bg-primary-foreground/10"
                >
                  {t.secondaryButton}
                </Button>
              </ContactModal>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </section>
  );
}