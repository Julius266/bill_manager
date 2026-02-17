'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CategoryType = 'income' | 'expense';

export type CategoryFormData = {
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
};

export async function createCategory(data: CategoryFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Crear categoría
  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      color: data.color || null,
      icon: data.icon || null,
      is_active: data.is_active,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { error: error.message };
  }

  // Revalidar la página para mostrar los cambios
  revalidatePath("/dashboard/categories");

  return { success: true, data: category };
}

export async function updateCategory(id: string, data: CategoryFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Actualizar categoría
  const { data: category, error } = await supabase
    .from("categories")
    .update({
      name: data.name,
      type: data.type,
      color: data.color || null,
      icon: data.icon || null,
      is_active: data.is_active,
    })
    .eq("id", id)
    .eq("user_id", user.id) // Asegurar que solo actualice sus propias categorías
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return { error: error.message };
  }

  // Revalidar la página
  revalidatePath("/dashboard/categories");

  return { success: true, data: category };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verificar que no sea una categoría del sistema
  const { data: category } = await supabase
    .from("categories")
    .select("is_system")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (category?.is_system) {
    return { error: "Cannot delete system categories" };
  }

  // Eliminar categoría
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }

  // Revalidar la página
  revalidatePath("/dashboard/categories");

  return { success: true };
}
