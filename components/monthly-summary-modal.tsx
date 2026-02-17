"use client";

import { useState } from "react";
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

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SummaryData {
  total_income: number;
  total_expense: number;
  net: number;
}

export function MonthlySummaryModal({ isOpen, onClose }: MonthlySummaryModalProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Llamar al stored procedure
      const { data, error: dbError } = await supabase
        .rpc('report_monthly_summary', {
          p_year: year,
          p_month: month
        });

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setError("No se encontraron datos para el período seleccionado");
        return;
      }

      const summary: SummaryData = data[0];
      
      // Generar PDF
      generatePDF(summary, year, month);
      
      // Cerrar modal después de generar
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      setError("Error al generar el reporte. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (data: SummaryData, year: number, month: number) => {
    const doc = new jsPDF();
    
    // Colores de la paleta
    const primaryColor: [number, number, number] = [0, 0, 0]; // Negro (primary en light mode)
    const accentColor: [number, number, number] = [59, 130, 246]; // Azul
    
    // Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('ExpenseManager', 20, 20);
    
    doc.setFontSize(16);
    doc.text('Resumen Mensual', 20, 32);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    doc.text(`Período: ${monthNames[month - 1]} ${year}`, 20, 50);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 56);
    
    // Línea divisora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 62, 190, 62);
    
    // Datos del resumen
    const startY = 75;
    const lineHeight = 15;
    
    // Ingresos
    doc.setFillColor(220, 252, 231); // Verde claro
    doc.roundedRect(20, startY, 170, 20, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74); // Verde oscuro
    doc.text('Total Ingresos:', 30, startY + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${Number(data.total_income).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 30, startY + 15);
    
    // Gastos
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(254, 226, 226); // Rojo claro
    doc.roundedRect(20, startY + 30, 170, 20, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38); // Rojo oscuro
    doc.text('Total Gastos:', 30, startY + 38);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${Number(data.total_expense).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 30, startY + 45);
    
    // Balance neto
    doc.setFont('helvetica', 'normal');
    const isPositive = Number(data.net) >= 0;
    const fillColor: [number, number, number] = isPositive ? [219, 234, 254] : [254, 226, 226];
    doc.setFillColor(...fillColor); // Azul o rojo claro
    doc.roundedRect(20, startY + 60, 170, 25, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('Balance Neto:', 30, startY + 70);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const textColor: [number, number, number] = isPositive ? [59, 130, 246] : [220, 38, 38];
    doc.setTextColor(...textColor);
    doc.text(
      `${isPositive ? '+' : ''}$${Number(data.net).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      30,
      startY + 80
    );
    
    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este reporte fue generado automáticamente por ExpenseManager', 105, 280, { align: 'center' });
    doc.text('Para más información visita expensemanager.com', 105, 285, { align: 'center' });
    
    // Descargar
    doc.save(`resumen-mensual-${year}-${month.toString().padStart(2, '0')}.pdf`);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Resumen Mensual
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona el período para generar el reporte de ingresos vs gastos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="year" className="text-foreground">
              Año
            </Label>
            <Input
              id="year"
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-background border-border"
            />
          </div>

          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month" className="text-foreground">
              Mes
            </Label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
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
