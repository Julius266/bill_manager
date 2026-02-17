import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Account, Category, Transaction } from "@/lib/types/database.types";
import {
  Wallet,
  Banknote,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowRight,
  Receipt
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

// Helper function para obtener el icono según el tipo de cuenta
function getAccountIcon(type: string) {
  switch (type) {
    case 'bank':
      return <CreditCard className="h-4 w-4" />;
    case 'cash':
      return <Banknote className="h-4 w-4" />;
    case 'wallet':
      return <Wallet className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
}

// Helper function para obtener el icono según el tipo de categoría
function getCategoryIcon(type: string) {
  return type === 'income' ? (
    <TrendingUp className="h-4 w-4" />
  ) : (
    <TrendingDown className="h-4 w-4" />
  );
}

// Helper function para formatear montos
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default async function DashboardPage() {
  // Crear cliente de Supabase en el servidor
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch de las cuentas activas
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6); // Limitar para aplicar ley de Gestalt

  // Fetch de las categorías activas
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6); // Limitar para aplicar ley de Gestalt

  // Fetch de las transacciones recientes con joins a accounts y categories
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      account:accounts(name, type),
      category:categories(name, icon, color, type)
    `)
    .order("transaction_date", { ascending: false })
    .limit(10); // Mostrar las últimas 10 transacciones

  // Calcular el balance total de todas las cuentas activas
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;

  // TODO: Estos valores deberían calcularse desde transacciones reales
  const monthlyIncome = 0;
  const monthlyExpenses = 0;
  const savings = totalBalance;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your finances.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">All active accounts</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Income</p>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Expenses</p>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Savings</p>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{formatCurrency(savings)}</p>
              <p className="text-xs text-muted-foreground mt-1">Current balance</p>
            </div>
          </div>
        </div>

        {/* Accounts and Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Accounts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Accounts</CardTitle>
                  <CardDescription>Quick view of your accounts</CardDescription>
                </div>
                <Link href="/dashboard/accounts">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!accounts || accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No accounts yet</p>
                  <Link href="/dashboard/accounts">
                    <Button variant="link" size="sm" className="mt-2">
                      Create your first account
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {accounts.map((account: Account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {account.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {formatCurrency(Number(account.current_balance))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Categories</CardTitle>
                  <CardDescription>Organized spending & income</CardDescription>
                </div>
                <Link href="/dashboard/categories">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!categories || categories.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No categories yet</p>
                  <Link href="/dashboard/categories">
                    <Button variant="link" size="sm" className="mt-2">
                      Create your first category
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {categories.map((category: Category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg text-white ${
                            category.color ? '' : category.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={category.color ? { backgroundColor: category.color } : {}}
                        >
                          {category.icon ? (
                            <span className="text-base">{category.icon}</span>
                          ) : (
                            getCategoryIcon(category.type)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={category.type === 'income' ? 'default' : 'secondary'}
                              className={`text-xs ${
                                category.type === 'income'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {category.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-muted-foreground">
                          $0.00
                        </p>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Link href="/dashboard/transactions">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your income and expenses
                </p>
                <Link href="/dashboard/transactions">
                  <Button>
                    <Receipt className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => {
                  const isIncome = transaction.type === 'income';
                  const category = transaction.category;
                  const account = transaction.account;
                  
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Category Icon */}
                        <div
                          className={`p-3 rounded-lg text-white ${
                            category?.color 
                              ? '' 
                              : isIncome ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={category?.color ? { backgroundColor: category.color } : {}}
                        >
                          {category?.icon ? (
                            <span className="text-lg">{category.icon}</span>
                          ) : isIncome ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                        </div>
                        
                        {/* Transaction Info */}
                        <div>
                          <p className="font-medium">
                            {transaction.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {category?.name || 'Uncategorized'}
                            </p>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">
                              {account?.name || 'Unknown account'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount and Date */}
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(Number(transaction.amount)))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
