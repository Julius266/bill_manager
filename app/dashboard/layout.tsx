import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch accounts and categories for the transaction dialog
  const supabase = await createClient();
  
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Fetch user profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar fullName={profile?.full_name || null} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Navbar */}
        <DashboardNavbar 
          accounts={accounts || []} 
          categories={categories || []}
          fullName={profile?.full_name || null}
        />
        
        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
