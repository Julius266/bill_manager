'use client';

import { useState } from "react";
import { Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/sidebar";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

interface DashboardNavbarProps {
  accounts: Account[];
  categories: Category[];
  fullName: string | null;
}

export function DashboardNavbar({ accounts, categories, fullName }: DashboardNavbarProps) {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Mobile menu button */}
          <div className="flex-1 flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <SidebarContent fullName={fullName} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Add Transaction Button */}
            <Button 
              onClick={() => setTransactionDialogOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}
