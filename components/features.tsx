'use client'
import { useLanguage } from "./language-switcher";
import translations from "@/lib/translations.json";

export function Features() {
  const language = useLanguage();
  const t = translations[language].features
  const features = [
    {
      icon: "sync",
      title: t.feature1.title,
      description: t.feature1.description
    },
    {
      icon: "category",
      title: t.feature2.title,
      description: t.feature2.description
    },
    {
      icon: "insights",
      title: t.feature3.title,
      description: t.feature3.description
    }
  ];

  return (
    <section className="py-24" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm">
            {t.badge}
          </h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
            {t.title}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">
                {feature.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}