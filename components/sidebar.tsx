'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  FolderKanban,
  Receipt,
  BarChart3
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";

interface SidebarProps {
  fullName: string | null;
}

// Componente reutilizable con el contenido del sidebar
export function SidebarContent({ fullName }: SidebarProps) {
  const pathname = usePathname();

  // Helper function para determinar si un link está activo
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  // Helper function para obtener las clases del link
  const getLinkClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors";
    const activeClasses = "bg-primary text-primary-foreground font-semibold";
    const inactiveClasses = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-primary-foreground">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">FinanceManager</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Personal Wealth
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
        <Link
          href="/dashboard"
          className={getLinkClasses("/dashboard")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        
        <Link
          href="/dashboard/accounts"
          className={getLinkClasses("/dashboard/accounts")}
        >
          <Wallet className="h-5 w-5" />
          <span>Accounts</span>
        </Link>
        
        <Link
          href="/dashboard/categories"
          className={getLinkClasses("/dashboard/categories")}
        >
          <FolderKanban className="h-5 w-5" />
          <span>Categories</span>
        </Link>
        
        <Link
          href="/dashboard/transactions"
          className={getLinkClasses("/dashboard/transactions")}
        >
          <Receipt className="h-5 w-5" />
          <span>Transactions</span>
        </Link>
        
        <Link
          href="/dashboard/reports"
          className={getLinkClasses("/dashboard/reports")}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Reports</span>
        </Link>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <UserMenu fullName={fullName} />
      </div>
    </>
  );
}

// Sidebar para desktop
export function Sidebar({ fullName }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col sticky top-0 h-screen">
      <SidebarContent fullName={fullName} />
    </aside>
  );
}