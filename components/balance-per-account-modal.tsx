"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";

interface BalancePerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountBalance {
  account_id: string;
  account_name: string;
  balance: number;
}

export function BalancePerAccountModal({ isOpen, onClose }: BalancePerAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Llamar al stored procedure
      const { data, error: dbError } = await supabase
        .rpc('report_balance_per_account');

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setError("No se encontraron cuentas activas");
        return;
      }

      const accounts: AccountBalance[] = data;
      
      // Generar PDF
      generatePDF(accounts);
      
      // Cerrar modal después de generar
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      setError("Error al generar el reporte. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (data: AccountBalance[]) => {
    const doc = new jsPDF();
    
    // Colores de la paleta - Púrpura para balance de cuentas
    const primaryColor: [number, number, number] = [0, 0, 0];
    const purpleColor: [number, number, number] = [147, 51, 234];
    const lightPurpleBg: [number, number, number] = [243, 232, 255];
    const grayColor: [number, number, number] = [100, 100, 100];
    const blueColor: [number, number, number] = [59, 130, 246];
    const redColor: [number, number, number] = [220, 38, 38];
    
    // Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('ExpenseManager', 20, 20);
    
    doc.setFontSize(16);
    doc.text('Balance por Cuenta', 20, 32);
    
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
    
    // Calcular total general
    const totalGeneral = data.reduce((sum, item) => sum + Number(item.balance), 0);
    const cuentasPositivas = data.filter(item => Number(item.balance) >= 0).length;
    const cuentasNegativas = data.filter(item => Number(item.balance) < 0).length;
    
    // Información general
    doc.setFillColor(...lightPurpleBg);
    doc.roundedRect(20, 64, 170, 35, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(...grayColor);
    doc.text('Balance Total:', 30, 73);
    doc.text(`Total de Cuentas: ${data.length}`, 30, 88);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const isPositiveTotal = totalGeneral >= 0;
    const totalColor: [number, number, number] = isPositiveTotal ? blueColor : redColor;
    doc.setTextColor(...totalColor);
    doc.text(
      `${isPositiveTotal ? '+' : ''}$${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      30,
      82
    );
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(`Positivas: ${cuentasPositivas} | Negativas: ${cuentasNegativas}`, 30, 95);
    
    // Encabezado de tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    
    let y = 112;
    doc.text('Cuenta', 25, y);
    doc.text('Balance', 150, y);
    
    // Línea debajo del encabezado
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 2, 190, y + 2);
    
    y += 10;
    
    // Datos de cuentas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Color alternado para filas
    let isAlternate = false;
    
    data.forEach((item, index) => {
      // Verificar si necesitamos nueva página
      if (y > 265) {
        doc.addPage();
        y = 20;
        
        // Re-dibujar encabezado de tabla en nueva página
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('Cuenta', 25, y);
        doc.text('Balance', 150, y);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 2, 190, y + 2);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      }
      
      // Fondo alternado
      if (isAlternate) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, y - 6, 170, 10, 'F');
      }
      isAlternate = !isAlternate;
      
      // Nombre de cuenta
      doc.setTextColor(...primaryColor);
      const accountName = item.account_name.length > 45 
        ? item.account_name.substring(0, 42) + '...' 
        : item.account_name;
      doc.text(accountName, 25, y);
      
      // Balance con color según sea positivo o negativo
      const balance = Number(item.balance);
      const isPositive = balance >= 0;
      const balanceColor: [number, number, number] = isPositive ? blueColor : redColor;
      doc.setTextColor(...balanceColor);
      doc.setFont('helvetica', 'bold');
      const balanceText = `${isPositive ? '+' : ''}$${balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(balanceText, 150, y);
      doc.setFont('helvetica', 'normal');
      
      y += 10;
    });
    
    // Resumen visual si hay espacio
    if (data.length > 0 && y < 240) {
      y += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y, 190, y);
      y += 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text('Resumen por Estado', 25, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Barra de cuentas positivas vs negativas
      const totalCuentas = data.length;
      const porcentajePositivas = (cuentasPositivas / totalCuentas) * 100;
      const porcentajeNegativas = (cuentasNegativas / totalCuentas) * 100;
      
      // Barra visual
      const barWidth = 150;
      const barHeight = 12;
      const positivasWidth = (barWidth * porcentajePositivas) / 100;
      
      doc.setFillColor(...lightPurpleBg);
      doc.roundedRect(25, y, barWidth, barHeight, 2, 2, 'F');
      
      if (positivasWidth > 0) {
        doc.setFillColor(59, 130, 246);
        doc.roundedRect(25, y, positivasWidth, barHeight, 2, 2, 'F');
      }
      
      // Labels
      y += barHeight + 6;
      doc.setFontSize(9);
      doc.setTextColor(...blueColor);
      doc.text(`● Positivas: ${cuentasPositivas} (${porcentajePositivas.toFixed(1)}%)`, 25, y);
      
      doc.setTextColor(...grayColor);
      doc.text(`● Negativas: ${cuentasNegativas} (${porcentajeNegativas.toFixed(1)}%)`, 95, y);
    }
    
    // Footer en la última página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este reporte fue generado automáticamente por ExpenseManager', 105, 280, { align: 'center' });
    doc.text('Para más información visita expensemanager.com', 105, 285, { align: 'center' });
    
    // Descargar
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`balance-por-cuenta-${timestamp}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Balance por Cuenta
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Genera un reporte con el balance actual de todas tus cuentas activas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Box */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 mt-0.5">
                info
              </span>
              <div className="flex-1">
                <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
                  Reporte Instantáneo
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-200 mt-1">
                  Este reporte muestra el balance actual de todas tus cuentas activas al momento de generarlo.
                </p>
              </div>
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
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
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
