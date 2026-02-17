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

interface DailyExpenseTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyExpense {
  day: string;
  total: number;
}

export function DailyExpenseTrendModal({ isOpen, onClose }: DailyExpenseTrendModalProps) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    // Validaciones
    if (new Date(fromDate) > new Date(toDate)) {
      setError("La fecha inicial no puede ser mayor a la fecha final");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Llamar al stored procedure
      const { data, error: dbError } = await supabase
        .rpc('report_daily_expense_trend', {
          p_from: fromDate,
          p_to: toDate
        });

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setError("No se encontraron gastos para el período seleccionado");
        return;
      }

      const expenses: DailyExpense[] = data;
      
      // Generar PDF
      generatePDF(expenses, fromDate, toDate);
      
      // Cerrar modal después de generar
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      setError("Error al generar el reporte. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (data: DailyExpense[], fromDate: string, toDate: string) => {
    const doc = new jsPDF();
    
    // Colores de la paleta - Verde para tendencias
    const primaryColor: [number, number, number] = [0, 0, 0];
    const greenColor: [number, number, number] = [34, 197, 94];
    const lightGreenBg: [number, number, number] = [220, 252, 231];
    const grayColor: [number, number, number] = [100, 100, 100];
    const redColor: [number, number, number] = [220, 38, 38];
    
    // Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('ExpenseManager', 20, 20);
    
    doc.setFontSize(16);
    doc.text('Tendencia de Gasto Diario', 20, 32);
    
    // Fecha del reporte
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    const formattedFromDate = new Date(fromDate + 'T00:00:00').toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedToDate = new Date(toDate + 'T00:00:00').toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Período: ${formattedFromDate} - ${formattedToDate}`, 20, 50);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 56);
    
    // Línea divisora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 62, 190, 62);
    
    // Calcular estadísticas
    const totalGastos = data.reduce((sum, item) => sum + Number(item.total), 0);
    const diasConGastos = data.length;
    const promedioGasto = totalGastos / diasConGastos;
    const gastoMaximo = Math.max(...data.map(item => Number(item.total)));
    const gastoMinimo = Math.min(...data.map(item => Number(item.total)));
    
    // Resumen de estadísticas
    doc.setFillColor(...lightGreenBg);
    doc.rect(20, 70, 170, 45, 'F');
    
    // Total
    doc.setFontSize(11);
    doc.setTextColor(...grayColor);
    doc.text('Total del Período:', 30, 79);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...redColor);
    doc.text(
      `$${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      30,
      88
    );
    
    // Estadísticas adicionales
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(`Días con gastos: ${diasConGastos}`, 30, 98);
    doc.text(`Promedio diario: $${promedioGasto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 30, 104);
    doc.text(`Gasto máximo: $${gastoMaximo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 30, 110);
    doc.text(`Gasto mínimo: $${gastoMinimo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 110, 110);
    
    // Nueva página para gráficos
    doc.addPage();
    
    // Título de la página de gráficos
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Análisis Gráfico', 105, 20, { align: 'center' });
    
    // ===== GRÁFICO DE LÍNEA =====
    const lineChartStartY = 35;
    const lineChartHeight = 80;
    const lineChartWidth = 170;
    const lineChartX = 20;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Tendencia de Gasto Diario', lineChartX, lineChartStartY - 5);
    
    // Fondo del gráfico
    doc.setFillColor(250, 250, 250);
    doc.rect(lineChartX, lineChartStartY, lineChartWidth, lineChartHeight, 'F');
    
    // Calcular valores para el gráfico
    const maxValue = Math.ceil(gastoMaximo * 1.1); // 10% más para espacio
    const minValue = 0;
    const range = maxValue - minValue;
    
    // Líneas de referencia horizontal con etiquetas
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (maxValue / 5) * i;
      const y = lineChartStartY + (lineChartHeight / 5) * i;
      doc.line(lineChartX + 15, y, lineChartX + lineChartWidth, y);
      doc.text(`$${Math.round(value).toLocaleString('es-MX')}`, lineChartX + 2, y + 2);
    }
    
    // Área debajo de la línea (gradiente simulado con transparencia)
    doc.setFillColor(34, 197, 94, 0.1);
    const areaPoints: number[] = [];
    
    // Punto inicial
    const firstX = lineChartX + 15;
    const lastX = lineChartX + lineChartWidth;
    const bottomY = lineChartStartY + lineChartHeight;
    
    // Dibujar línea de tendencia principal
    doc.setDrawColor(...greenColor);
    doc.setLineWidth(2.5);
    
    if (data.length > 1) {
      for (let i = 0; i < data.length - 1; i++) {
        const x1 = lineChartX + 15 + ((lineChartWidth - 15) / (data.length - 1)) * i;
        const x2 = lineChartX + 15 + ((lineChartWidth - 15) / (data.length - 1)) * (i + 1);
        const y1 = lineChartStartY + lineChartHeight - ((Number(data[i].total) - minValue) / range) * lineChartHeight;
        const y2 = lineChartStartY + lineChartHeight - ((Number(data[i + 1].total) - minValue) / range) * lineChartHeight;
        
        doc.line(x1, y1, x2, y2);
      }
    } else if (data.length === 1) {
      // Solo un dato, mostrar un punto en el centro
      const x = lineChartX + lineChartWidth / 2;
      const y = lineChartStartY + lineChartHeight - ((Number(data[0].total) - minValue) / range) * lineChartHeight;
      doc.setFillColor(...greenColor);
      doc.rect(x - 3, y - 3, 6, 6, 'F');
    }
    
    // Línea de promedio (línea punteada manual)
    const avgY = lineChartStartY + lineChartHeight - ((promedioGasto - minValue) / range) * lineChartHeight;
    doc.setDrawColor(...redColor);
    doc.setLineWidth(1);
    
    // Dibujar línea punteada manualmente
    const dashLength = 3;
    const gapLength = 3;
    let currentX = lineChartX + 15;
    const endX = lineChartX + lineChartWidth;
    
    while (currentX < endX) {
      const nextX = Math.min(currentX + dashLength, endX);
      doc.line(currentX, avgY, nextX, avgY);
      currentX = nextX + gapLength;
    }
    
    // Etiqueta de promedio
    doc.setFontSize(8);
    doc.setTextColor(...redColor);
    doc.text('Promedio', lineChartX + lineChartWidth + 2, avgY + 2);
    
    // Borde del gráfico
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(lineChartX, lineChartStartY, lineChartWidth, lineChartHeight);
    
    // Etiquetas del eje X (fechas)
    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    const numLabels = Math.min(data.length, 7);
    
    if (numLabels > 1) {
      for (let i = 0; i < numLabels; i++) {
        const dataIndex = Math.floor((data.length - 1) * i / (numLabels - 1));
        if (dataIndex < data.length && data[dataIndex]) {
          const item = data[dataIndex];
          const x = lineChartX + 15 + ((lineChartWidth - 15) / (data.length - 1)) * dataIndex;
          const date = new Date(item.day + 'T00:00:00');
          const label = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          doc.text(label, x, lineChartStartY + lineChartHeight + 5, { align: 'center' });
        }
      }
    } else if (data.length === 1) {
      // Solo un dato, mostrar en el centro
      const item = data[0];
      const x = lineChartX + lineChartWidth / 2;
      const date = new Date(item.day + 'T00:00:00');
      const label = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      doc.text(label, x, lineChartStartY + lineChartHeight + 5, { align: 'center' });
    }
    
    doc.setLineWidth(0.2);
    
    // ===== GRÁFICO DE BARRAS =====
    if (data.length <= 31) {
      const barChartStartY = lineChartStartY + lineChartHeight + 25;
      const barChartHeight = 70;
      const barChartWidth = 170;
      const barChartX = 20;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('Gastos por Día (Barras)', barChartX, barChartStartY - 5);
      
      // Fondo del gráfico
      doc.setFillColor(250, 250, 250);
      doc.rect(barChartX, barChartStartY, barChartWidth, barChartHeight, 'F');
      
      // Líneas de referencia
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.setFont('helvetica', 'normal');
      
      for (let i = 0; i <= 4; i++) {
        const value = maxValue - (maxValue / 4) * i;
        const y = barChartStartY + (barChartHeight / 4) * i;
        doc.line(barChartX + 12, y, barChartX + barChartWidth, y);
        doc.text(`$${Math.round(value).toLocaleString('es-MX')}`, barChartX + 1, y + 2);
      }
      
      // Dibujar barras
      const barWidth = Math.max(2, (barChartWidth - 12) / data.length * 0.7);
      const barSpacing = (barChartWidth - 12) / data.length;
      
      data.forEach((item, index) => {
        const x = barChartX + 12 + barSpacing * index + (barSpacing - barWidth) / 2;
        const barHeight = ((Number(item.total) - minValue) / range) * barChartHeight;
        const y = barChartStartY + barChartHeight - barHeight;
        
        // Color según si es gasto alto o normal
        const isHighValue = Number(item.total) > promedioGasto;
        
        if (isHighValue) {
          // Rojo para valores altos
          doc.setFillColor(239, 68, 68);
        } else {
          // Naranja para valores normales
          doc.setFillColor(251, 146, 60);
        }
        
        // Usar rectángulo simple
        doc.setDrawColor(0, 0, 0, 0);
        doc.rect(x, y, barWidth, barHeight, 'F');
      });
      
      // Borde del gráfico de barras
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(barChartX, barChartStartY, barChartWidth, barChartHeight);
      
      // Leyenda
      const legendY = barChartStartY + barChartHeight + 12;
      doc.setFontSize(8);
      
      doc.setFillColor(251, 146, 60);
      doc.rect(barChartX + 20, legendY - 2, 4, 4, 'F');
      doc.setTextColor(...grayColor);
      doc.text('Gasto normal', barChartX + 26, legendY + 2);
      
      doc.setFillColor(239, 68, 68);
      doc.rect(barChartX + 70, legendY - 2, 4, 4, 'F');
      doc.text('Gasto alto (sobre promedio)', barChartX + 76, legendY + 2);
    }
    
    doc.setLineWidth(0.2);
    
    // Nueva página para la tabla de datos
    doc.addPage();
    
    // Tabla de datos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    
    let y = 20;
    doc.text('Desglose Diario Detallado', 20, y);
    y += 10;
    
    // Encabezado de tabla
    doc.setFontSize(10);
    doc.text('Fecha', 25, y);
    doc.text('Día', 70, y);
    doc.text('Gasto', 150, y);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 2, 190, y + 2);
    
    y += 8;
    
    // Datos diarios
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    let isAlternate = false;
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    data.forEach((item, index) => {
      // Verificar si necesitamos nueva página
      if (y > 270) {
        doc.addPage();
        y = 20;
        
        // Re-dibujar encabezado
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text('Fecha', 25, y);
        doc.text('Día', 70, y);
        doc.text('Gasto', 150, y);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 2, 190, y + 2);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }
      
      // Fondo alternado
      if (isAlternate) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, y - 5, 170, 8, 'F');
      }
      isAlternate = !isAlternate;
      
      // Fecha
      doc.setTextColor(...primaryColor);
      const date = new Date(item.day + 'T00:00:00');
      const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.text(formattedDate, 25, y);
      
      // Día de la semana
      const dayName = diasSemana[date.getDay()];
      doc.setTextColor(...grayColor);
      doc.text(dayName, 70, y);
      
      // Gasto
      doc.setTextColor(...redColor);
      const amount = `$${Number(item.total).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(amount, 150, y);
      
      y += 8;
    });
    
    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este reporte fue generado automáticamente por ExpenseManager', 105, 280, { align: 'center' });
    doc.text('Para más información visita expensemanager.com', 105, 285, { align: 'center' });
    
    // Descargar
    doc.save(`tendencia-gasto-diario-${fromDate}_${toDate}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Tendencia de Gasto Diario
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona el rango de fechas para analizar tus gastos día a día
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* From Date */}
          <div className="space-y-2">
            <Label htmlFor="fromDate" className="text-foreground">
              Desde
            </Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label htmlFor="toDate" className="text-foreground">
              Hasta
            </Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          {/* Info Box */}
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg mt-0.5">
                lightbulb
              </span>
              <p className="text-xs text-green-700 dark:text-green-200">
                Se recomienda un rango no mayor a 90 días para una mejor visualización del gráfico de tendencia.
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
