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

interface IncomeByCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryIncome {
  category_id: string;
  category_name: string;
  total: number;
}

export function IncomeByCategoryModal({ isOpen, onClose }: IncomeByCategoryModalProps) {
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
        .rpc('report_income_by_category', {
          p_year: year,
          p_month: month
        });

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setError("No se encontraron ingresos para el período seleccionado");
        return;
      }

      const incomes: CategoryIncome[] = data;
      
      // Generar PDF
      generatePDF(incomes, year, month);
      
      // Cerrar modal después de generar
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      setError("Error al generar el reporte. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (data: CategoryIncome[], year: number, month: number) => {
    const doc = new jsPDF();
    
    // Colores de la paleta - Verde para ingresos
    const primaryColor: [number, number, number] = [0, 0, 0];
    const greenColor: [number, number, number] = [22, 163, 74];
    const lightGreenBg: [number, number, number] = [220, 252, 231];
    const grayColor: [number, number, number] = [100, 100, 100];
    
    // Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('ExpenseManager', 20, 20);
    
    doc.setFontSize(16);
    doc.text('Ingresos por Categoría', 20, 32);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    doc.text(`Período: ${monthNames[month - 1]} ${year}`, 20, 50);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 56);
    
    // Línea divisora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 62, 190, 62);
    
    // Calcular total general
    const totalGeneral = data.reduce((sum, item) => sum + Number(item.total), 0);
    
    // Total general destacado
    doc.setFillColor(...lightGreenBg);
    doc.roundedRect(20, 70, 170, 18, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Total General:', 30, 79);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...greenColor);
    doc.text(
      `$${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      30,
      86
    );
    
    // Encabezado de tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    
    let y = 100;
    doc.text('Categoría', 25, y);
    doc.text('Monto', 135, y);
    doc.text('%', 175, y);
    
    // Línea debajo del encabezado
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 2, 190, y + 2);
    
    y += 10;
    
    // Datos de categorías
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Color alternado para filas
    let isAlternate = false;
    
    data.forEach((item, index) => {
      // Verificar si necesitamos nueva página
      if (y > 260) {
        doc.addPage();
        y = 20;
        
        // Re-dibujar encabezado de tabla en nueva página
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('Categoría', 25, y);
        doc.text('Monto', 135, y);
        doc.text('%', 175, y);
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
      
      // Categoría
      doc.setTextColor(...primaryColor);
      const categoryName = item.category_name.length > 35 
        ? item.category_name.substring(0, 32) + '...' 
        : item.category_name;
      doc.text(categoryName, 25, y);
      
      // Monto
      doc.setTextColor(...greenColor);
      const amount = `$${Number(item.total).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(amount, 135, y);
      
      // Porcentaje
      const percentage = ((Number(item.total) / totalGeneral) * 100).toFixed(1);
      doc.setTextColor(...grayColor);
      doc.text(`${percentage}%`, 175, y);
      
      y += 10;
    });
    
    // Footer en la última página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este reporte fue generado automáticamente por ExpenseManager', 105, 280, { align: 'center' });
    doc.text('Para más información visita expensemanager.com', 105, 285, { align: 'center' });
    
    // Gráfico de barras simple
    if (data.length > 0 && data.length <= 10) {
      // Solo si hay pocas categorías para que se vea bien
      const startY = y + 15;
      if (startY < 240) { // Solo si hay espacio
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text('Distribución Visual', 25, startY);
        
        const barStartY = startY + 8;
        const maxBarWidth = 140;
        const barHeight = 6;
        
        data.slice(0, 5).forEach((item, index) => {
          const percentage = (Number(item.total) / totalGeneral);
          const barWidth = maxBarWidth * percentage;
          const barY = barStartY + (index * (barHeight + 6));
          
          // Barra
          doc.setFillColor(...lightGreenBg);
          doc.roundedRect(25, barY, maxBarWidth, barHeight, 2, 2, 'F');
          doc.setFillColor(...greenColor);
          doc.roundedRect(25, barY, barWidth, barHeight, 2, 2, 'F');
          
          // Label
          doc.setFontSize(8);
          doc.setTextColor(...primaryColor);
          const label = item.category_name.length > 20 
            ? item.category_name.substring(0, 17) + '...' 
            : item.category_name;
          doc.text(label, 25, barY - 2);
        });
      }
    }
    
    // Descargar
    doc.save(`ingresos-por-categoria-${year}-${month.toString().padStart(2, '0')}.pdf`);
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
            Ingresos por Categoría
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona el período para generar el desglose de ingresos por categoría
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
