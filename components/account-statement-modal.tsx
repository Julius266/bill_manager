"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";

interface AccountStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Account {
  id: string;
  name: string;
  current_balance: number;
}

interface Transaction {
  tx_id: string;
  tx_date: string;
  type: string;
  category: string;
  amount: number;
  description: string;
}

export function AccountStatementModal({ isOpen, onClose }: AccountStatementModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [limit, setLimit] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar cuentas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('accounts')
        .select('id, name, current_balance')
        .eq('is_active', true)
        .order('name');

      if (dbError) throw dbError;

      setAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar las cuentas");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedAccount) {
      setError("Por favor selecciona una cuenta");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Obtener información de la cuenta seleccionada
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (!account) throw new Error("Cuenta no encontrada");

      // Llamar al stored procedure
      const { data, error: dbError } = await supabase
        .rpc('report_account_statement', {
          p_account: selectedAccount,
          p_limit: limit
        });

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setError("No se encontraron transacciones para esta cuenta");
        return;
      }

      const transactions: Transaction[] = data;
      
      // Generar PDF
      generatePDF(account, transactions);
      
      // Cerrar modal después de generar
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      setError("Error al generar el reporte. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (account: Account, data: Transaction[]) => {
    const doc = new jsPDF();
    
    // Colores de la paleta - Azul para estado de cuenta
    const primaryColor: [number, number, number] = [0, 0, 0];
    const blueColor: [number, number, number] = [59, 130, 246];
    const lightBlueBg: [number, number, number] = [219, 234, 254];
    const grayColor: [number, number, number] = [100, 100, 100];
    const greenColor: [number, number, number] = [22, 163, 74];
    const redColor: [number, number, number] = [220, 38, 38];
    
    // Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('ExpenseManager', 20, 20);
    
    doc.setFontSize(16);
    doc.text('Estado de Cuenta', 20, 32);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 50);
    
    // Línea divisora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 56, 190, 56);
    
    // Información de la cuenta
    doc.setFillColor(...lightBlueBg);
    doc.rect(20, 64, 170, 30, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(...grayColor);
    doc.text('Cuenta:', 30, 73);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(account.name, 30, 81);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...grayColor);
    doc.text('Balance actual:', 30, 89);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const isPositiveBalance = Number(account.current_balance) >= 0;
    const balanceColor: [number, number, number] = isPositiveBalance ? greenColor : redColor;
    doc.setTextColor(...balanceColor);
    doc.text(
      `${isPositiveBalance ? '+' : ''}$${Number(account.current_balance).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      120,
      89
    );
    
    // Resumen de transacciones
    const totalIngresos = data.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalGastos = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(`Total de transacciones: ${data.length}`, 30, 102);
    doc.setTextColor(...greenColor);
    doc.text(`Ingresos: $${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 90, 102);
    doc.setTextColor(...redColor);
    doc.text(`Gastos: $${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 140, 102);
    
    // Encabezado de tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    
    let y = 115;
    doc.text('Fecha', 22, y);
    doc.text('Categoría', 50, y);
    doc.text('Descripción', 85, y);
    doc.text('Monto', 165, y, { align: 'right' });
    
    // Línea debajo del encabezado
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 2, 190, y + 2);
    
    y += 8;
    
    // Datos de transacciones
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    let isAlternate = false;
    
    data.forEach((item, index) => {
      // Verificar si necesitamos nueva página
      if (y > 270) {
        doc.addPage();
        y = 20;
        
        // Re-dibujar encabezado de tabla en nueva página
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text('Fecha', 22, y);
        doc.text('Categoría', 50, y);
        doc.text('Descripción', 85, y);
        doc.text('Monto', 165, y, { align: 'right' });
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 2, 190, y + 2);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }
      
      // Fondo alternado
      if (isAlternate) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, y - 5, 170, 8, 'F');
      }
      isAlternate = !isAlternate;
      
      // Fecha
      doc.setTextColor(...grayColor);
      const date = new Date(item.tx_date);
      const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
      doc.text(formattedDate, 22, y);
      
      // Categoría
      doc.setTextColor(...primaryColor);
      const category = item.category || 'Sin categoría';
      const truncatedCategory = category.length > 15 ? category.substring(0, 12) + '...' : category;
      doc.text(truncatedCategory, 50, y);
      
      // Descripción
      doc.setTextColor(...grayColor);
      const description = item.description || '-';
      const truncatedDesc = description.length > 30 ? description.substring(0, 27) + '...' : description;
      doc.text(truncatedDesc, 85, y);
      
      // Monto con color según tipo
      const isIncome = item.type === 'income';
      const amountColor: [number, number, number] = isIncome ? greenColor : redColor;
      doc.setTextColor(...amountColor);
      doc.setFont('helvetica', 'bold');
      const amountText = `${isIncome ? '+' : '-'}$${Number(item.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(amountText, 188, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      y += 8;
    });
    
    // Footer en la última página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este reporte fue generado automáticamente por ExpenseManager', 105, 280, { align: 'center' });
    doc.text('Para más información visita expensemanager.com', 105, 285, { align: 'center' });
    
    // Descargar
    const timestamp = new Date().toISOString().split('T')[0];
    const accountNameSafe = account.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    doc.save(`estado-cuenta-${accountNameSafe}-${timestamp}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Estado de Cuenta
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Genera un reporte detallado de las transacciones de una cuenta específica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account" className="text-foreground">
              Cuenta
            </Label>
            {isLoadingAccounts ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
                Cargando cuentas...
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                No se encontraron cuentas activas
              </p>
            ) : (
              <select
                id="account"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ${Number(account.current_balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Limit Selection */}
          <div className="space-y-2">
            <Label htmlFor="limit" className="text-foreground">
              Límite de transacciones
            </Label>
            <Input
              id="limit"
              type="number"
              min="10"
              max="500"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Cantidad máxima de transacciones a mostrar (10-500)
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg mt-0.5">
                info
              </span>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                El reporte mostrará las transacciones más recientes de la cuenta seleccionada, ordenadas por fecha descendente.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading || isLoadingAccounts}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading || isLoadingAccounts || accounts.length === 0}
              className="flex-1 font-bold"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin mr-2">
                    progress_activity
                  </span>
                  Generando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">download</span>
                  Generar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
