import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Account } from "@/lib/types/database.types";
import { 
  Wallet, 
  Banknote, 
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddAccountButton } from "@/components/add-account-button";
import { AccountMenu } from "@/components/account-menu";

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

// Helper function para obtener el icono según el tipo de cuenta
function getAccountIcon(type: string) {
  switch (type) {
    case 'bank':
      return <CreditCard className="h-5 w-5" />;
    case 'cash':
      return <Banknote className="h-5 w-5" />;
    case 'wallet':
      return <Wallet className="h-5 w-5" />;
    default:
      return <Wallet className="h-5 w-5" />;
  }
}

// Helper function para formatear el tipo de cuenta
function formatAccountType(type: string): string {
  const types: Record<string, string> = {
    bank: 'Bank Account',
    cash: 'Cash',
    wallet: 'Wallet',
  };
  return types[type] || type;
}

// Helper function para formatear montos
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default async function AccountsPage() {
  // Crear cliente de Supabase en el servidor
  const supabase = await createClient();

  // Verificar autenticación - Si no hay usuario, redirigir a login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch de las cuentas del usuario desde Supabase
  // RLS (Row Level Security) automáticamente filtra por user_id = auth.uid()
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  // Manejo de errores
  if (error) {
    console.error("Error fetching accounts:", error);
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-destructive font-semibold">
              Error loading accounts: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular el balance total de todas las cuentas activas
  const totalBalance = accounts
    ?.filter((acc) => acc.is_active)
    .reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground mt-2">
              Manage your financial accounts
            </p>
          </div>
          <AddAccountButton />
        </div>

        {/* Total Balance Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Combined balance across all active accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        {!accounts || accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first account to start tracking your finances
                </p>
                <AddAccountButton />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account: Account) => (
              <Card key={account.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>
                          {formatAccountType(account.type)}
                        </CardDescription>
                      </div>
                    </div>
                    <AccountMenu account={account} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Current Balance */}
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(Number(account.current_balance))}
                      </p>
                    </div>

                    {/* Initial Balance */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Initial Balance</span>
                      <span className="font-medium">
                        {formatCurrency(Number(account.initial_balance))}
                      </span>
                    </div>

                    {/* Status and System badges */}
                    <div className="flex gap-2">
                      {account.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      )}
                      {account.is_system && (
                        <Badge variant="outline">
                          System
                        </Badge>
                      )}
                    </div>

                    {/* Created date */}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
