"use client";

import { Button } from "./ui/button";
import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";
import Link from "next/link";

export function Hero() {
  const language = useLanguage();
  const t = translations[language].hero;
  return (
    <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
                <span className="material-symbols-outlined text-sm mr-1">verified_user</span>
                {t.badge}
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {t.title} <span className="text-primary">{t.titleHighlight}</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t.description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg" 
                className="px-8 py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
              >
                <Link href="/auth/login">
                  {t.ctaPrimary}
                  <span className="material-symbols-outlined ml-2">arrow_forward</span>
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-base font-bold rounded-xl"
              >
                <Link href="https://www.youtube.com/watch?v=RjrAdDGGkAE" target="_blank">
                  <span className="material-symbols-outlined mr-2">play_circle</span>
                  {t.ctaSecondary}
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-background bg-muted bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=1')" }}
                  aria-label="User avatar 1"
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-background bg-muted bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=2')" }}
                  aria-label="User avatar 2"
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-background bg-muted bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=3')" }}
                  aria-label="User avatar 3"
                />
                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                  +50k
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex text-yellow-400 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p>{t.reviews}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="mt-12 lg:mt-0 lg:col-span-6 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border">
              {/* Browser Chrome */}
              <div className="bg-card p-2 border-b border-border flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-yellow-400" />
                <div className="size-2.5 rounded-full bg-green-400" />
              </div>
              
              {/* Dashboard Mockup */}
              <div className="bg-muted aspect-[4/3] flex items-center justify-center p-8">
                <div className="w-full h-full bg-card rounded-lg p-6 flex flex-col gap-6 shadow-sm border border-border">
                  {/* Header Section */}
                  <div className="flex justify-between items-center">
                    <span className="material-symbols-outlined text-primary">dashboard</span>
                    <div className="flex gap-2">
                      <div className="w-20 h-2 bg-muted rounded" />
                      <div className="w-20 h-2 bg-muted rounded" />
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-muted rounded-lg p-3 space-y-2">
                        <div className="w-12 h-2 bg-background/50 rounded" />
                        <div className="w-16 h-3 bg-primary/20 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1 bg-muted rounded-lg p-4 flex items-end gap-1 justify-between">
                    {[40, 70, 50, 80, 60, 90, 75, 65].map((height, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-primary/30 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>

                  {/* Bottom List Items */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="w-3/4 h-2 bg-muted rounded" />
                          <div className="w-1/2 h-2 bg-muted/50 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
