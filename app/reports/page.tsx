"use client";

import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  const reports = [
    {
      id: "account-statement",
      icon: "receipt_long",
      title: "Estado de Cuenta",
      description: "Movimientos de una cuenta específica",
      color: "text-blue-500"
    },
    {
      id: "daily-spending",
      icon: "show_chart",
      title: "Tendencia de Gasto Diario",
      description: "Visualiza tus gastos en gráficos",
      color: "text-green-500"
    },
    {
      id: "balance-per-account",
      icon: "account_balance",
      title: "Balance por Cuenta",
      description: "Saldo actual de cada cuenta",
      color: "text-purple-500"
    },
    {
      id: "income-by-category",
      icon: "trending_up",
      title: "Ingresos por Categoría",
      description: "Ingresos del mes por categoría",
      color: "text-emerald-500"
    },
    {
      id: "expenses-by-category",
      icon: "trending_down",
      title: "Gastos por Categoría",
      description: "Gastos del mes por categoría",
      color: "text-red-500"
    },
    {
      id: "monthly-summary",
      icon: "pie_chart",
      title: "Resumen Mensual",
      description: "Comparación de ingresos vs gastos",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Reportes
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecciona el tipo de reporte que deseas generar
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border bg-card"
          >
            <div className="space-y-4">
              {/* Icon */}
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-3xl ${report.color}`}>
                    {report.icon}
                  </span>
                </div>
                <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">
                  arrow_forward
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
