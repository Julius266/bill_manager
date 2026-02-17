import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { Stats } from "@/components/stats";
import { Features } from "@/components/features";
import { Security } from "@/components/security";
import { Testimonials } from "@/components/testimonial";
import { Cta } from "@/components/cta";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="fixed top-0 left-0 w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/80 backdrop-blur-sm z-50">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>ExpenseManager</Link>
            </div>
              <Suspense>
                <AuthButton />
              </Suspense>
          </div>
        </nav>
        <div className="flex-1 flex flex-col w-full pt-16">
          <Hero />
          <Stats />
          <Features />
          <Security />
          <Testimonials />
          <Cta />
        </div>


      </div>
    <Footer />
    </main>
  );
}
