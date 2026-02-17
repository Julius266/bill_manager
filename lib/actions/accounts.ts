'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AccountType } from "@/lib/types/database.types";

export type AccountFormData = {
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance?: number; // Opcional - solo para actualización
  is_active: boolean;
};

export async function createAccount(data: AccountFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Crear cuenta
  // No enviamos current_balance porque el trigger lo establece automáticamente
  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      initial_balance: data.initial_balance,
      is_active: data.is_active,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating account:", error);
    return { error: error.message };
  }

  // Revalidar la página para mostrar los cambios
  revalidatePath("/dashboard/accounts");

  return { success: true, data: account };
}

export async function updateAccount(id: string, data: AccountFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Actualizar cuenta
  // No actualizamos initial_balance, solo current_balance y otros campos
  const { data: account, error } = await supabase
    .from("accounts")
    .update({
      name: data.name,
      type: data.type,
      current_balance: data.current_balance,
      is_active: data.is_active,
    })
    .eq("id", id)
    .eq("user_id", user.id) // Asegurar que solo actualice sus propias cuentas
    .select()
    .single();

  if (error) {
    console.error("Error updating account:", error);
    return { error: error.message };
  }

  // Revalidar la página
  revalidatePath("/dashboard/accounts");

  return { success: true, data: account };
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verificar que no sea una cuenta del sistema
  const { data: account } = await supabase
    .from("accounts")
    .select("is_system")
    .eq("id", id)
    .single();

  if (account?.is_system) {
    return { error: "Cannot delete system accounts" };
  }

  // Eliminar cuenta
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Asegurar que solo elimine sus propias cuentas

  if (error) {
    console.error("Error deleting account:", error);
    return { error: error.message };
  }

  // Revalidar la página
  revalidatePath("/dashboard/accounts");

  return { success: true };
}
