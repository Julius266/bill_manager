'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";

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
}

export function DashboardNavbar({ accounts, categories }: DashboardNavbarProps) {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Empty for now, could add breadcrumbs or search */}
          <div className="flex-1">
            {/* Placeholder for future features like search or breadcrumbs */}
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
