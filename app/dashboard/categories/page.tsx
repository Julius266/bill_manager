import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Category } from "@/lib/types/database.types";
import { 
  TrendingUp,
  TrendingDown,
  Tag
} from "lucide-react";

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCategoryButton } from "@/components/add-category-button";
import { CategoryMenu } from "@/components/category-menu";

// Helper function para obtener el color de fondo según el tipo
function getCategoryBgColor(type: string, color: string | null): string {
  if (color) {
    return color;
  }
  return type === 'income' ? 'bg-green-500' : 'bg-red-500';
}

// Helper function para obtener el icono según el tipo
function getCategoryIcon(type: string) {
  return type === 'income' ? (
    <TrendingUp className="h-5 w-5" />
  ) : (
    <TrendingDown className="h-5 w-5" />
  );
}

// Helper function para formatear el tipo
function formatCategoryType(type: string): string {
  return type === 'income' ? 'Income' : 'Expense';
}

export default async function CategoriesPage() {
  // Crear cliente de Supabase en el servidor
  const supabase = await createClient();

  // Verificar autenticación - Si no hay usuario, redirigir a login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch de las categorías
  // RLS automáticamente permite ver categorías del usuario Y categorías del sistema (is_system = true)
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  // Manejo de errores
  if (error) {
    console.error("Error fetching categories:", error);
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-destructive font-semibold">
              Error loading categories: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Separar categorías por tipo
  const incomeCategories = categories?.filter((cat) => cat.type === 'income') || [];
  const expenseCategories = categories?.filter((cat) => cat.type === 'expense') || [];

  // Separar categorías de usuario vs sistema
  const userCategories = categories?.filter((cat) => !cat.is_system) || [];
  const systemCategories = categories?.filter((cat) => cat.is_system) || [];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-2">
              Organize your income and expenses
            </p>
          </div>
          <AddCategoryButton />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{categories?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Income Categories
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {incomeCategories.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expense Categories
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {expenseCategories.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        {!categories || categories.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first category to organize your transactions
                </p>
                <AddCategoryButton />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Income Categories Section */}
            {incomeCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Income Categories</h2>
                  <Badge variant="secondary">{incomeCategories.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {incomeCategories.map((category: Category) => (
                    <Card key={category.id} className="relative hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className={`p-2 rounded-lg text-white ${
                                category.color 
                                  ? '' 
                                  : 'bg-green-500'
                              }`}
                              style={category.color ? { backgroundColor: category.color } : {}}
                            >
                              {category.icon ? (
                                <span className="text-lg">{category.icon}</span>
                              ) : (
                                getCategoryIcon(category.type)
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{category.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {formatCategoryType(category.type)}
                              </CardDescription>
                            </div>
                          </div>
                          <CategoryMenu category={category} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {category.is_active ? (
                            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                          {category.is_system && (
                            <Badge variant="outline" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Created: {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Expense Categories Section */}
            {expenseCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <h2 className="text-xl font-semibold">Expense Categories</h2>
                  <Badge variant="secondary">{expenseCategories.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {expenseCategories.map((category: Category) => (
                    <Card key={category.id} className="relative hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className={`p-2 rounded-lg text-white ${
                                category.color 
                                  ? '' 
                                  : 'bg-red-500'
                              }`}
                              style={category.color ? { backgroundColor: category.color } : {}}
                            >
                              {category.icon ? (
                                <span className="text-lg">{category.icon}</span>
                              ) : (
                                getCategoryIcon(category.type)
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{category.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {formatCategoryType(category.type)}
                              </CardDescription>
                            </div>
                          </div>
                          <CategoryMenu category={category} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {category.is_active ? (
                            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                          {category.is_system && (
                            <Badge variant="outline" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Created: {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
