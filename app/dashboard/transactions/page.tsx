import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
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

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

// Helper function para formatear montos
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default async function TransactionsPage() {
  // Crear cliente de Supabase en el servidor
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch de todas las transacciones con joins a accounts y categories
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(`
      *,
      account:accounts(name, type),
      category:categories(name, icon, color, type)
    `)
    .order("transaction_date", { ascending: false });

  // Manejo de errores
  if (error) {
    console.error("Error fetching transactions:", error);
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-destructive font-semibold">
              Error loading transactions: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Separar transacciones por tipo
  const incomeTransactions = transactions?.filter((t) => t.type === 'income') || [];
  const expenseTransactions = transactions?.filter((t) => t.type === 'expense') || [];

  // Calcular totales
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            Track all your financial transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Income
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {incomeTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {expenseTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${
                netBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(netBalance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions?.length || 0} total transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        {!transactions || transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your income and expenses to see them here
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete history of your financial activity
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {transaction.description || 'No description'}
                            </p>
                            <Badge
                              variant={isIncome ? 'default' : 'secondary'}
                              className={`text-xs ${
                                isIncome
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {isIncome ? 'Income' : 'Expense'}
                            </Badge>
                          </div>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
