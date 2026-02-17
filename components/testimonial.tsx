"use client";

import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";

export function Testimonials() {
  const language = useLanguage();
  const t = translations[language].testimonials;
  
  const testimonials = [
    {
      quote: t.testimonial1.quote,
      name: t.testimonial1.name,
      role: t.testimonial1.role,
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      quote: t.testimonial2.quote,
      name: t.testimonial2.name,
      role: t.testimonial2.role,
      avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
      quote: t.testimonial3.quote,
      name: t.testimonial3.name,
      role: t.testimonial3.role,
      avatar: "https://i.pravatar.cc/150?img=9"
    }
  ];

  return (
    <section className="py-24 bg-muted/30" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground">
            {t.title}
          </h3>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card p-8 rounded-2xl shadow-sm border border-border flex flex-col justify-between"
            >
              {/* Quote */}
              <p className="text-muted-foreground italic mb-8">
                "{testimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div 
                  className="size-12 rounded-full bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url('${testimonial.avatar}')` }}
                  aria-label={`${testimonial.name} avatar`}
                />
                <div>
                  <p className="font-bold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}