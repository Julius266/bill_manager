'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionType = 'income' | 'expense';

export type TransactionFormData = {
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description?: string | null;
  transaction_date: string;
};

export async function createTransaction(data: TransactionFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Crear transacción
  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      account_id: data.account_id,
      category_id: data.category_id,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      transaction_date: data.transaction_date,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    return { error: error.message };
  }

  // Actualizar el balance de la cuenta
  const { data: account } = await supabase
    .from("accounts")
    .select("current_balance")
    .eq("id", data.account_id)
    .single();

  if (account) {
    const newBalance = data.type === 'income' 
      ? Number(account.current_balance) + data.amount
      : Number(account.current_balance) - data.amount;

    await supabase
      .from("accounts")
      .update({ current_balance: newBalance })
      .eq("id", data.account_id);
  }

  // Revalidar las páginas
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");

  return { success: true, data: transaction };
}

export async function updateTransaction(id: string, data: TransactionFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Obtener la transacción anterior para revertir el balance
  const { data: oldTransaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!oldTransaction) {
    return { error: "Transaction not found" };
  }

  // Revertir el balance de la cuenta anterior
  const { data: oldAccount } = await supabase
    .from("accounts")
    .select("current_balance")
    .eq("id", oldTransaction.account_id)
    .single();

  if (oldAccount) {
    const revertedBalance = oldTransaction.type === 'income'
      ? Number(oldAccount.current_balance) - Number(oldTransaction.amount)
      : Number(oldAccount.current_balance) + Number(oldTransaction.amount);

    await supabase
      .from("accounts")
      .update({ current_balance: revertedBalance })
      .eq("id", oldTransaction.account_id);
  }

  // Actualizar transacción
  const { data: transaction, error } = await supabase
    .from("transactions")
    .update({
      account_id: data.account_id,
      category_id: data.category_id,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      transaction_date: data.transaction_date,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    return { error: error.message };
  }

  // Aplicar el nuevo balance
  const { data: newAccount } = await supabase
    .from("accounts")
    .select("current_balance")
    .eq("id", data.account_id)
    .single();

  if (newAccount) {
    const newBalance = data.type === 'income'
      ? Number(newAccount.current_balance) + data.amount
      : Number(newAccount.current_balance) - data.amount;

    await supabase
      .from("accounts")
      .update({ current_balance: newBalance })
      .eq("id", data.account_id);
  }

  // Revalidar las páginas
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");

  return { success: true, data: transaction };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Obtener la transacción para revertir el balance
  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!transaction) {
    return { error: "Transaction not found" };
  }

  // Revertir el balance de la cuenta
  const { data: account } = await supabase
    .from("accounts")
    .select("current_balance")
    .eq("id", transaction.account_id)
    .single();

  if (account) {
    const revertedBalance = transaction.type === 'income'
      ? Number(account.current_balance) - Number(transaction.amount)
      : Number(account.current_balance) + Number(transaction.amount);

    await supabase
      .from("accounts")
      .update({ current_balance: revertedBalance })
      .eq("id", transaction.account_id);
  }

  // Eliminar transacción
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return { error: error.message };
  }

  // Revalidar las páginas
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");

  return { success: true };
}
