"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

type Language = "en" | "es";

const LanguageSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    setMounted(true);
    // Cargar idioma guardado del localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  if (!mounted) {
    return null;
  }

  const languages = {
    en: { name: "English", flag: "🇺🇸" },
    es: { name: "Español", flag: "🇪🇸" },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="material-symbols-outlined text-base">language</span>
          <span className="text-sm hidden sm:inline">{languages[language].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="end">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(e) => handleLanguageChange(e as Language)}
        >
          {Object.entries(languages).map(([code, { name, flag }]) => (
            <DropdownMenuRadioItem
              key={code}
              className="flex gap-2"
              value={code}
            >
              <span className="text-lg">{flag}</span>
              <span>{name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Hook personalizado para usar el idioma en componentes
const useLanguage = () => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Cargar idioma inicial
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Escuchar cambios de idioma
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem("language") as Language;
      if (newLanguage) {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Polling para detectar cambios en la misma pestaña
    const interval = setInterval(() => {
      const currentLanguage = localStorage.getItem("language") as Language;
      if (currentLanguage && currentLanguage !== language) {
        setLanguage(currentLanguage);
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [language]);

  return language;
};

// Componente de ejemplo que usa traducciones
const LanguageExample = () => {
  const language = useLanguage();

  const translations = {
    en: {
      title: "Welcome to ExpenseManager",
      description: "Track expenses, set budgets, and achieve your financial goals with our intuitive manager.",
      button: "Get Started Free",
    },
    es: {
      title: "Bienvenido a ExpenseManager",
      description: "Rastrea gastos, establece presupuestos y alcanza tus metas financieras con nuestro gestor intuitivo.",
      button: "Comenzar Gratis",
    },
  };

  const t = translations[language];

  return (
    <div className="p-6 bg-card border border-border rounded-lg space-y-4">
      <h3 className="text-2xl font-bold text-foreground">{t.title}</h3>
      <p className="text-muted-foreground">{t.description}</p>
      <Button className="w-full sm:w-auto">{t.button}</Button>
    </div>
  );
};

export { LanguageSwitcher, LanguageExample, useLanguage };
